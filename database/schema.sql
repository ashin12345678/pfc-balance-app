-- ============================================
-- PFCバランス管理アプリ - データベーススキーマ
-- Supabase (PostgreSQL) 用
-- ============================================
-- 使用方法: Supabase Dashboard > SQL Editor で実行

-- ============================================
-- 0. 既存オブジェクトの削除 (再実行可能にする)
-- ============================================
DROP TRIGGER IF EXISTS trigger_update_daily_summary ON meal_logs;
DROP TRIGGER IF EXISTS trigger_calculate_nutrition_targets ON profiles;
DROP FUNCTION IF EXISTS update_daily_summary();
DROP FUNCTION IF EXISTS calculate_nutrition_targets();
DROP TABLE IF EXISTS food_database CASCADE;
DROP TABLE IF EXISTS daily_summaries CASCADE;
DROP TABLE IF EXISTS meal_logs CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- 0.1 未確認ユーザーを確認済みにする
-- ============================================
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- ============================================
-- 拡張機能の有効化
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. profiles テーブル
-- ユーザーの身体情報と目標値を管理
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT,
    
    -- 身体情報
    birth_date DATE,
    height_cm DECIMAL(5, 2) NOT NULL DEFAULT 170.0,
    weight_kg DECIMAL(5, 2) NOT NULL DEFAULT 60.0,
    target_weight_kg DECIMAL(5, 2),
    age INTEGER NOT NULL DEFAULT 25,
    gender TEXT NOT NULL DEFAULT 'male' CHECK (gender IN ('male', 'female')),
    
    -- 活動レベル (文字列または数値で保存可能)
    activity_level TEXT NOT NULL DEFAULT 'moderately_active',
    
    -- 目標設定
    -- [DEPRECATED] goalカラムは非推奨です。goal_typeを使用してください。
    -- 将来のバージョンで削除予定
    goal TEXT DEFAULT 'maintain' CHECK (goal IN ('lose', 'maintain', 'gain')),
    goal_type TEXT NOT NULL DEFAULT 'maintain' CHECK (goal_type IN ('diet', 'maintain', 'bulk')),
    calorie_adjustment INTEGER NOT NULL DEFAULT 0,
    
    -- PFC目標比率 (合計100%)
    target_protein_ratio INTEGER NOT NULL DEFAULT 30,
    target_fat_ratio INTEGER NOT NULL DEFAULT 25,
    target_carb_ratio INTEGER NOT NULL DEFAULT 45,
    
    -- 計算値 (トリガーで自動更新)
    bmr DECIMAL(8, 2),
    tdee DECIMAL(8, 2),
    target_calories DECIMAL(8, 2),
    target_protein_g DECIMAL(6, 2),
    target_fat_g DECIMAL(6, 2),
    target_carb_g DECIMAL(6, 2),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_pfc_ratio CHECK (
        target_protein_ratio + target_fat_ratio + target_carb_ratio = 100
    )
);

-- ============================================
-- 2. meal_logs テーブル
-- 個別の食事明細（AI解析結果含む）
-- ============================================
CREATE TABLE meal_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    
    input_type TEXT NOT NULL CHECK (input_type IN ('text', 'barcode', 'manual', 'ocr')),
    input_text TEXT,
    barcode TEXT,
    
    food_name TEXT NOT NULL,
    calories DECIMAL(8, 2) NOT NULL DEFAULT 0,
    protein_g DECIMAL(6, 2) NOT NULL DEFAULT 0,
    fat_g DECIMAL(6, 2) NOT NULL DEFAULT 0,
    carb_g DECIMAL(6, 2) NOT NULL DEFAULT 0,
    
    fiber_g DECIMAL(6, 2),
    sodium_mg DECIMAL(8, 2),
    serving_size TEXT,
    
    ai_response JSONB,
    confidence_score DECIMAL(3, 2),
    
    notes TEXT,
    image_url TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 3. daily_summaries テーブル
-- 1日ごとのPFC合計値と達成度
-- ============================================
CREATE TABLE daily_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    summary_date DATE NOT NULL,
    
    total_calories DECIMAL(8, 2) NOT NULL DEFAULT 0,
    total_protein_g DECIMAL(6, 2) NOT NULL DEFAULT 0,
    total_fat_g DECIMAL(6, 2) NOT NULL DEFAULT 0,
    total_carb_g DECIMAL(6, 2) NOT NULL DEFAULT 0,
    
    calorie_achievement DECIMAL(5, 2),
    protein_achievement DECIMAL(5, 2),
    fat_achievement DECIMAL(5, 2),
    carb_achievement DECIMAL(5, 2),
    
    target_calories DECIMAL(8, 2),
    target_protein_g DECIMAL(6, 2),
    target_fat_g DECIMAL(6, 2),
    target_carb_g DECIMAL(6, 2),
    
    ai_advice JSONB,
    meal_count INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, summary_date)
);

-- ============================================
-- 4. food_database テーブル
-- よく使う食品のローカルキャッシュ
-- ============================================
CREATE TABLE food_database (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    barcode TEXT UNIQUE,
    food_name TEXT NOT NULL,
    brand TEXT,
    category TEXT,
    
    calories_per_100g DECIMAL(8, 2),
    protein_per_100g DECIMAL(6, 2),
    fat_per_100g DECIMAL(6, 2),
    carb_per_100g DECIMAL(6, 2),
    
    default_serving_g DECIMAL(6, 2),
    
    source TEXT CHECK (source IN ('open_food_facts', 'ai_estimated', 'user_input')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- インデックス
-- ============================================
CREATE INDEX idx_meal_logs_user_date ON meal_logs(user_id, meal_date);
CREATE INDEX idx_meal_logs_barcode ON meal_logs(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_daily_summaries_user_date ON daily_summaries(user_id, summary_date);
CREATE INDEX idx_food_database_barcode ON food_database(barcode) WHERE barcode IS NOT NULL;

-- ============================================
-- 関数: BMRと目標値の自動計算
-- Mifflin-St Jeor式を使用
-- ============================================
CREATE OR REPLACE FUNCTION calculate_nutrition_targets()
RETURNS TRIGGER AS $$
DECLARE
    gender_modifier INTEGER;
    activity_multiplier DECIMAL(4, 3);
BEGIN
    -- 性別による補正値
    IF NEW.gender = 'male' THEN
        gender_modifier := 5;
    ELSE
        gender_modifier := -161;
    END IF;
    
    -- 活動レベルの変換
    CASE NEW.activity_level
        WHEN 'sedentary' THEN activity_multiplier := 1.2;
        WHEN 'lightly_active' THEN activity_multiplier := 1.375;
        WHEN 'moderately_active' THEN activity_multiplier := 1.55;
        WHEN 'very_active' THEN activity_multiplier := 1.725;
        ELSE activity_multiplier := 1.55;
    END CASE;
    
    -- BMR計算 (Mifflin-St Jeor式)
    NEW.bmr := (10 * NEW.weight_kg) + (6.25 * NEW.height_cm) - (5 * NEW.age) + gender_modifier;
    
    -- TDEE計算 (Total Daily Energy Expenditure)
    NEW.tdee := NEW.bmr * activity_multiplier;
    
    -- 目標カロリー
    NEW.target_calories := NEW.tdee + NEW.calorie_adjustment;
    
    -- 目標PFC (g) を計算
    NEW.target_protein_g := (NEW.target_calories * NEW.target_protein_ratio / 100) / 4;
    NEW.target_fat_g := (NEW.target_calories * NEW.target_fat_ratio / 100) / 9;
    NEW.target_carb_g := (NEW.target_calories * NEW.target_carb_ratio / 100) / 4;
    
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_nutrition_targets
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION calculate_nutrition_targets();

-- ============================================
-- 関数: daily_summaries の自動更新
-- ============================================
CREATE OR REPLACE FUNCTION update_daily_summary()
RETURNS TRIGGER AS $$
DECLARE
    target_record RECORD;
    v_user_id UUID;
    v_meal_date DATE;
    v_meal_count INT;
BEGIN
    -- DELETEの場合はOLDを使用、それ以外はNEWを使用
    v_user_id := COALESCE(NEW.user_id, OLD.user_id);
    v_meal_date := COALESCE(NEW.meal_date, OLD.meal_date);
    
    -- プロフィールから目標値を取得
    SELECT target_calories, target_protein_g, target_fat_g, target_carb_g
    INTO target_record
    FROM profiles
    WHERE id = v_user_id;
    
    -- 該当日の食事記録数を確認
    SELECT COUNT(*) INTO v_meal_count
    FROM meal_logs
    WHERE user_id = v_user_id AND meal_date = v_meal_date;
    
    -- 食事記録が0件の場合はサマリーを削除
    IF v_meal_count = 0 THEN
        DELETE FROM daily_summaries
        WHERE user_id = v_user_id AND summary_date = v_meal_date;
    ELSE
        -- 食事記録がある場合はサマリーを更新
        INSERT INTO daily_summaries (
            user_id, summary_date, total_calories, total_protein_g,
            total_fat_g, total_carb_g, target_calories, target_protein_g,
            target_fat_g, target_carb_g, meal_count
        )
        SELECT
            v_user_id,
            v_meal_date,
            COALESCE(SUM(calories), 0),
            COALESCE(SUM(protein_g), 0),
            COALESCE(SUM(fat_g), 0),
            COALESCE(SUM(carb_g), 0),
            target_record.target_calories,
            target_record.target_protein_g,
            target_record.target_fat_g,
            target_record.target_carb_g,
            COUNT(*)
        FROM meal_logs
        WHERE user_id = v_user_id
          AND meal_date = v_meal_date
        GROUP BY user_id, meal_date
        ON CONFLICT (user_id, summary_date)
        DO UPDATE SET
            total_calories = EXCLUDED.total_calories,
            total_protein_g = EXCLUDED.total_protein_g,
            total_fat_g = EXCLUDED.total_fat_g,
            total_carb_g = EXCLUDED.total_carb_g,
            meal_count = EXCLUDED.meal_count,
            calorie_achievement = CASE 
                WHEN EXCLUDED.target_calories > 0 
                THEN (EXCLUDED.total_calories / EXCLUDED.target_calories) * 100 
                ELSE 0 
            END,
            protein_achievement = CASE 
                WHEN EXCLUDED.target_protein_g > 0 
                THEN (EXCLUDED.total_protein_g / EXCLUDED.target_protein_g) * 100 
                ELSE 0 
            END,
            fat_achievement = CASE 
                WHEN EXCLUDED.target_fat_g > 0 
                THEN (EXCLUDED.total_fat_g / EXCLUDED.target_fat_g) * 100 
                ELSE 0 
            END,
            carb_achievement = CASE 
                WHEN EXCLUDED.target_carb_g > 0 
                THEN (EXCLUDED.total_carb_g / EXCLUDED.target_carb_g) * 100 
                ELSE 0 
            END,
            updated_at = NOW();
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_daily_summary
    AFTER INSERT OR UPDATE OR DELETE ON meal_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_summary();

-- ============================================
-- Row Level Security (RLS) ポリシー
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_database ENABLE ROW LEVEL SECURITY;

-- profiles ポリシー
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- meal_logs ポリシー
CREATE POLICY "Users can view own meal logs"
    ON meal_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal logs"
    ON meal_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal logs"
    ON meal_logs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal logs"
    ON meal_logs FOR DELETE
    USING (auth.uid() = user_id);

-- daily_summaries ポリシー
CREATE POLICY "Users can view own daily summaries"
    ON daily_summaries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily summaries"
    ON daily_summaries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily summaries"
    ON daily_summaries FOR UPDATE
    USING (auth.uid() = user_id);

-- food_database ポリシー (全ユーザー閲覧可能)
CREATE POLICY "Anyone can view food database"
    ON food_database FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- 既存ユーザーのプロフィール自動作成
-- ============================================
INSERT INTO profiles (id, email, display_name, height_cm, weight_kg, age, gender, goal_type)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'display_name', '名前未設定'),
    170.0,
    60.0,
    25,
    'male',
    'maintain'
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 完了メッセージ
-- ============================================
DO $$
BEGIN
    RAISE NOTICE 'スキーマの作成が完了しました！';
    RAISE NOTICE '既存ユーザーのプロフィールも作成されました。';
END $$;
