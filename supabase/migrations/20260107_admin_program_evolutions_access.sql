-- Enable RLS on the table (ensure it's on)
ALTER TABLE admin_program_evolutions ENABLE ROW LEVEL SECURITY;

-- Add SELECT policies for admin_program_evolutions
CREATE POLICY "Clients can view assigned program evolutions"
ON admin_program_evolutions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_assigned_programs
    WHERE user_assigned_programs.program_id = admin_program_evolutions.program_id
    AND user_assigned_programs.user_id = auth.uid()
    AND user_assigned_programs.is_active = true
  )
);
