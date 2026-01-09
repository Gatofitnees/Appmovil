-- Add SELECT policies for admin_program_videos
CREATE POLICY "Clients can view assigned program videos"
ON admin_program_videos FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_assigned_programs
    WHERE user_assigned_programs.program_id = admin_program_videos.program_id
    AND user_assigned_programs.user_id = auth.uid()
    AND user_assigned_programs.is_active = true
  )
);

-- Add SELECT policies for admin_program_documents
CREATE POLICY "Clients can view assigned program documents"
ON admin_program_documents FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_assigned_programs
    WHERE user_assigned_programs.program_id = admin_program_documents.program_id
    AND user_assigned_programs.user_id = auth.uid()
    AND user_assigned_programs.is_active = true
  )
);

-- Add SELECT policies for admin_program_surveys
CREATE POLICY "Clients can view assigned program surveys"
ON admin_program_surveys FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_assigned_programs
    WHERE user_assigned_programs.program_id = admin_program_surveys.program_id
    AND user_assigned_programs.user_id = auth.uid()
    AND user_assigned_programs.is_active = true
  )
);
