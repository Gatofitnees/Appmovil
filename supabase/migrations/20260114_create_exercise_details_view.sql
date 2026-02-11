CREATE OR REPLACE VIEW public.ai_workout_exercise_details_view AS
SELECT 
    d.id,
    d.workout_log_id,
    w.user_id,
    w.workout_date,
    w.routine_name_snapshot as workout_name,
    d.exercise_name_snapshot,
    d.set_number,
    d.reps_completed,
    d.weight_kg_used,
    d.notes
FROM 
    public.workout_log_exercise_details d
JOIN 
    public.workout_logs w ON d.workout_log_id = w.id;

-- Grant access to authenticated users
GRANT SELECT ON public.ai_workout_exercise_details_view TO authenticated;
GRANT SELECT ON public.ai_workout_exercise_details_view TO service_role;

-- Comment on view
COMMENT ON VIEW public.ai_workout_exercise_details_view IS 'View for AI Agent to access exercise details with direct user_id filtering capabilities';
