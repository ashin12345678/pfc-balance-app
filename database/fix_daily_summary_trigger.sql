-- ============================================
-- 修正: daily_summaries の自動更新トリガー
-- 問題: 食事記録が0件になった場合にサマリーが削除されない
-- ============================================

-- 既存のトリガーを削除
DROP TRIGGER IF EXISTS trigger_update_daily_summary ON meal_logs;

-- 修正された関数を作成
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

-- トリガーを再作成
CREATE TRIGGER trigger_update_daily_summary
    AFTER INSERT OR UPDATE OR DELETE ON meal_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_summary();

-- ============================================
-- 既存の不整合データをクリーンアップ
-- 食事記録がない日のサマリーを削除
-- ============================================
DELETE FROM daily_summaries ds
WHERE NOT EXISTS (
    SELECT 1 FROM meal_logs ml
    WHERE ml.user_id = ds.user_id
      AND ml.meal_date = ds.summary_date
);
