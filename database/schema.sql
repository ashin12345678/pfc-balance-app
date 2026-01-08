-- ============================================
-- PFCバランス管理アプリ - データベーススキーマ
-- Supabase (PostgreSQL) 用
-- ============================================

-- 拡張機能の有効化
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
    height_cm DECIMAL(5, 2) NOT NULL DEFAULT 172.0,        -- 身長 (cm)
    weight_kg DECIMAL(5, 2) NOT NULL DEFAULT 76.0,         -- 体重 (kg)
    age INTEGER NOT NULL DEFAULT 30,                        -- 年齢
    gender TEXT NOT NULL DEFAULT 'male' CHECK (gender IN ('male', 'female')),
    
    -- 活動レベル (1.2: 座りがち, 1.375: 軽い運動, 1.55: 中程度, 1.725: 活発, 1.9: 非常に活発)
    activity_level DECIMAL(4, 3) NOT NULL DEFAULT 1.55,
    
    -- 目標設定
    goal_type TEXT NOT NULL DEFAULT 'diet' CHECK (goal_type IN ('diet', 'maintain', 'bulk')),
    calorie_adjustment INTEGER NOT NULL DEFAULT -500,       -- カロリー調整値 (減量時はマイナス)
    
    -- PFC目標比率 (合計100%)
    target_protein_ratio INTEGER NOT NULL DEFAULT 30,       -- タンパク質比率 %
    target_fat_ratio INTEGER NOT NULL DEFAULT 25,           -- 脂質比率 %
    target_carb_ratio INTEGER NOT NULL DEFAULT 45,          -- 炭水化物比率 %
    
    -- 計算値 (トリガーで自動更新)
    bmr DECIMAL(8, 2),                                      -- 基礎代謝量
    tdee DECIMAL(8, 2),                                     -- 総消費カロリー
    target_calories DECIMAL(8, 2),                          -- 目標摂取カロリー
    target_protein_g DECIMAL(6, 2),                         -- 目標タンパク質 (g)
    target_fat_g DECIMAL(6, 2),                             -- 目標脂質 (g)
    target_carb_g DECIMAL(6, 2),                            -- 目標炭水化物 (g)
    
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
    
    -- 食事情報
    meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    
    -- 入力データ
    input_type TEXT NOT NULL CHECK (input_type IN ('text', 'barcode', 'manual', 'ocr')),
    input_text TEXT,                                        -- ユーザー入力テキスト
    barcode TEXT,                                           -- JANコード
    
    -- AI解析結果
    food_name TEXT NOT NULL,                                -- 料理名/商品名
    calories DECIMAL(8, 2) NOT NULL DEFAULT 0,              -- カロリー (kcal)
    protein_g DECIMAL(6, 2) NOT NULL DEFAULT 0,             -- タンパク質 (g)
    fat_g DECIMAL(6, 2) NOT NULL DEFAULT 0,                 -- 脂質 (g)
    carb_g DECIMAL(6, 2) NOT NULL DEFAULT 0,                -- 炭水化物 (g)
    
    -- 詳細情報 (オプション)
    fiber_g DECIMAL(6, 2),                                  -- 食物繊維 (g)
    sodium_mg DECIMAL(8, 2),                                -- ナトリウム (mg)
    serving_size TEXT,                                      -- 1食分の量
    
    -- AI解析生データ (JSON)
    ai_response JSONB,                                      -- AIからの完全なレスポンス
    confidence_score DECIMAL(3, 2),                         -- 解析信頼度 (0.00-1.00)
    
    -- メタデータ
    notes TEXT,                                             -- ユーザーメモ
    image_url TEXT,                                         -- 食事画像URL (オプション)
    
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
    
    -- 合計摂取量
    total_calories DECIMAL(8, 2) NOT NULL DEFAULT 0,
    total_protein_g DECIMAL(6, 2) NOT NULL DEFAULT 0,
    total_fat_g DECIMAL(6, 2) NOT NULL DEFAULT 0,
    total_carb_g DECIMAL(6, 2) NOT NULL DEFAULT 0,
    
    -- 目標達成率 (%)
    calorie_achievement DECIMAL(5, 2),
    protein_achievement DECIMAL(5, 2),
    fat_achievement DECIMAL(5, 2),
    carb_achievement DECIMAL(5, 2),
    
    -- その日の目標値 (スナップショット)
    target_calories DECIMAL(8, 2),
    target_protein_g DECIMAL(6, 2),
    target_fat_g DECIMAL(6, 2),
    target_carb_g DECIMAL(6, 2),
    
    -- AIアドバイス
    ai_advice JSONB,                                        -- 不足栄養素に基づくアドバイス
    
    meal_count INTEGER NOT NULL DEFAULT 0,                  -- 食事回数
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, summary_date)
);

-- ============================================
-- 4. food_database テーブル (オプション)
-- よく使う食品のローカルキャッシュ
-- ============================================
CREATE TABLE food_database (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- 食品識別
    barcode TEXT UNIQUE,
    food_name TEXT NOT NULL,
    brand TEXT,
    category TEXT,
    
    -- 栄養情報 (100gあたり)
    calories_per_100g DECIMAL(8, 2),
    protein_per_100g DECIMAL(6, 2),
    fat_per_100g DECIMAL(6, 2),
    carb_per_100g DECIMAL(6, 2),
    
    -- 1食あたりの標準量
    default_serving_g DECIMAL(6, 2),
    
    -- データソース
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
CREATE INDEX idx_food_database_name ON food_database USING gin(to_tsvector('simple', food_name));

-- ============================================
-- 関数: BMRと目標値の自動計算
-- Mifflin-St Jeor式を使用
-- ============================================
CREATE OR REPLACE FUNCTION calculate_nutrition_targets()
RETURNS TRIGGER AS $$
DECLARE
    gender_modifier INTEGER;
BEGIN
    -- 性別による補正値
    IF NEW.gender = 'male' THEN
        gender_modifier := 5;
    ELSE
        gender_modifier := -161;
    END IF;
    
    -- BMR計算 (Mifflin-St Jeor式)
    NEW.bmr := (10 * NEW.weight_kg) + (6.25 * NEW.height_cm) - (5 * NEW.age) + gender_modifier;
    
    -- TDEE計算 (Total Daily Energy Expenditure)
    NEW.tdee := NEW.bmr * NEW.activity_level;
    
    -- 目標カロリー
    NEW.target_calories := NEW.tdee + NEW.calorie_adjustment;
    
    -- 目標PFC (g) を計算
    -- タンパク質: 1g = 4kcal, 脂質: 1g = 9kcal, 炭水化物: 1g = 4kcal
    NEW.target_protein_g := (NEW.target_calories * NEW.target_protein_ratio / 100) / 4;
    NEW.target_fat_g := (NEW.target_calories * NEW.target_fat_ratio / 100) / 9;
    NEW.target_carb_g := (NEW.target_calories * NEW.target_carb_ratio / 100) / 4;
    
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- トリガー: profiles更新時に自動計算
-- ============================================
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
BEGIN
    -- ユーザーの目標値を取得
    SELECT target_calories, target_protein_g, target_fat_g, target_carb_g
    INTO target_record
    FROM profiles
    WHERE id = COALESCE(NEW.user_id, OLD.user_id);
    
    -- daily_summaries を更新または作成
    INSERT INTO daily_summaries (
        user_id,
        summary_date,
        total_calories,
        total_protein_g,
        total_fat_g,
        total_carb_g,
        target_calories,
        target_protein_g,
        target_fat_g,
        target_carb_g,
        meal_count
    )
    SELECT
        COALESCE(NEW.user_id, OLD.user_id),
        COALESCE(NEW.meal_date, OLD.meal_date),
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
    WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
      AND meal_date = COALESCE(NEW.meal_date, OLD.meal_date)
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
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- トリガー: meal_logs変更時にdaily_summariesを更新
-- ============================================
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

-- food_database ポリシー (全ユーザー閲覧可能)
CREATE POLICY "Anyone can view food database"
    ON food_database FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- 初期データ: 塚田さんのプロフィール (サンプル)
-- 実際にはauth.usersのIDを使用
-- ============================================
-- INSERT INTO profiles (id, display_name, height_cm, weight_kg, age, gender, goal_type)
-- VALUES ('your-user-uuid', '塚田', 172.0, 76.0, 30, 'male', 'diet');
