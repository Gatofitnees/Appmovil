CREATE OR REPLACE FUNCTION public.update_user_streak_v2(p_user_id uuid, p_client_date date DEFAULT CURRENT_DATE)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  last_activity DATE;
  current_streak_count INTEGER;
  has_food_today BOOLEAN := FALSE;
  has_workout_today BOOLEAN := FALSE;
  current_xp INTEGER;
  current_lvl INTEGER;
  xp_today INTEGER;
  workouts_today_count INTEGER := 0; -- Initialized to 0 to prevent NULL errors
  foods_today_count INTEGER := 0;    -- Initialized to 0 to prevent NULL errors
  last_xp_date_val DATE;
  new_xp INTEGER := 0;
  foods_logged_today INTEGER;
  
  -- Streak Freeze variables
  current_freezes INTEGER;
  max_freezes INTEGER;
  days_missed INTEGER;
  freezes_to_consume INTEGER;
  freeze_consumed BOOLEAN := FALSE;
BEGIN
  -- Check if user has food entries for the client date
  SELECT EXISTS(
    SELECT 1 FROM daily_food_log_entries 
    WHERE user_id = p_user_id AND log_date = p_client_date
  ) INTO has_food_today;
  
  -- Check if user has workout entries for the client date
  SELECT EXISTS(
    SELECT 1 FROM workout_logs 
    WHERE user_id = p_user_id AND DATE(workout_date) = p_client_date
  ) INTO has_workout_today;
  
  -- If no activity today, don't update
  IF NOT (has_food_today OR has_workout_today) THEN
    RETURN;
  END IF;
  
  -- Get current streak data including freezes
  SELECT last_activity_date, current_streak, total_experience, current_level, 
         experience_today, workouts_today, foods_today, last_xp_date,
         streak_freezes, max_freezes_capacity
  INTO last_activity, current_streak_count, current_xp, current_lvl,
       xp_today, workouts_today_count, foods_today_count, last_xp_date_val,
       current_freezes, max_freezes
  FROM user_streaks 
  WHERE user_id = p_user_id;
  
  -- Handle NULLs for new columns if they exist but were null
  current_freezes := COALESCE(current_freezes, 0);
  max_freezes := COALESCE(max_freezes, 3);
  
  -- Use coalesce for counts if selecting gives null (e.g. should not happen if row exists but being safe)
  workouts_today_count := COALESCE(workouts_today_count, 0);
  foods_today_count := COALESCE(foods_today_count, 0);
  
  -- If no record exists, create one
  IF NOT FOUND THEN
    -- Reset to 0 for new record explicitly
    workouts_today_count := 0;
    foods_today_count := 0;

    -- Calculate initial XP for today
    IF has_workout_today THEN
      new_xp := new_xp + 25;
      workouts_today_count := 1;
    END IF;
    
    IF has_food_today THEN
      SELECT COUNT(*) INTO foods_logged_today
      FROM daily_food_log_entries 
      WHERE user_id = p_user_id AND log_date = p_client_date;
      
      foods_logged_today := LEAST(foods_logged_today, 3);
      new_xp := new_xp + (foods_logged_today * 10);
      foods_today_count := foods_logged_today;
    END IF;
    
    INSERT INTO user_streaks (
      user_id, current_streak, last_activity_date, total_points, 
      total_experience, current_level, experience_today, workouts_today, 
      foods_today, last_xp_date, streak_freezes, max_freezes_capacity
    )
    VALUES (
      p_user_id, 1, p_client_date, 1, 
      new_xp, ((new_xp / 100) + 1), new_xp, workouts_today_count, 
      foods_today_count, p_client_date, 0, 3
    );
    RETURN;
  END IF;
  
  -- STREAK PROTECTION LOGIC
  IF last_activity < p_client_date - INTERVAL '1 day' THEN
    days_missed := (p_client_date - last_activity) - 1;
    
    IF days_missed > 0 THEN
      -- Check if we have enough freezes
      IF current_freezes >= days_missed THEN
        -- Consume freezes and save the streak!
        current_freezes := current_freezes - days_missed;
        
        -- We pretend last activity was yesterday to maintain continuity logic below
        last_activity := p_client_date - INTERVAL '1 day'; 
        freeze_consumed := TRUE;
      ELSE
        -- Not enough freezes, streak will reset in the logic below
      END IF;
    END IF;
  END IF;
  
  -- Reset daily counters if it's a new day (compared to last XP update)
  IF last_xp_date_val != p_client_date THEN
    xp_today := 0;
    workouts_today_count := 0;
    foods_today_count := 0;
  END IF;
  
  -- Calculate XP to add
  IF has_workout_today AND workouts_today_count = 0 THEN
    new_xp := new_xp + 25;
    workouts_today_count := 1;
  END IF;
  
  IF has_food_today THEN
    SELECT COUNT(*) INTO foods_logged_today
    FROM daily_food_log_entries 
    WHERE user_id = p_user_id AND log_date = p_client_date;
    
    foods_logged_today := LEAST(foods_logged_today, 3);
    IF foods_logged_today > foods_today_count THEN
      new_xp := new_xp + ((foods_logged_today - foods_today_count) * 10);
      foods_today_count := foods_logged_today;
    END IF;
  END IF;
  
  -- Update experience and calculate new level
  current_xp := current_xp + new_xp;
  current_lvl := (current_xp / 100) + 1;
  xp_today := xp_today + new_xp;
  
  -- Update streak logic
  IF last_activity = p_client_date THEN
    -- Already counted today, just update XP
    UPDATE user_streaks 
    SET total_experience = current_xp,
        current_level = current_lvl,
        experience_today = xp_today,
        workouts_today = workouts_today_count,
        foods_today = foods_today_count,
        last_xp_date = p_client_date,
        updated_at = now()
    WHERE user_id = p_user_id;
    
  ELSIF last_activity = p_client_date - INTERVAL '1 day' THEN
    -- Continue streak (Either natural or saved by freeze)
    
    -- Check for EARNING a new freeze (Every 7 days)
    IF ((current_streak_count + 1) % 7 = 0) AND (current_freezes < max_freezes) THEN
      current_freezes := current_freezes + 1;
    END IF;

    UPDATE user_streaks 
    SET current_streak = current_streak + 1,
        total_points = total_points + 1,
        last_activity_date = p_client_date,
        total_experience = current_xp,
        current_level = current_lvl,
        experience_today = xp_today,
        workouts_today = workouts_today_count,
        foods_today = foods_today_count,
        last_xp_date = p_client_date,
        streak_freezes = current_freezes,
        last_freeze_date = CASE WHEN freeze_consumed THEN p_client_date ELSE last_freeze_date END,
        updated_at = now()
    WHERE user_id = p_user_id;
    
  ELSIF last_activity < p_client_date - INTERVAL '1 day' THEN
    -- Reset streak
    UPDATE user_streaks 
    SET current_streak = 1,
        total_points = total_points + 1,
        last_activity_date = p_client_date,
        total_experience = current_xp,
        current_level = current_lvl,
        experience_today = xp_today,
        workouts_today = workouts_today_count,
        foods_today = foods_today_count,
        last_xp_date = p_client_date,
        updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
END;
$function$;
