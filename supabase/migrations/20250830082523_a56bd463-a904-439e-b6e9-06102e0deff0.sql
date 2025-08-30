-- Create storage bucket for student documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'student-documents', 
  'student-documents', 
  false, 
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Create RLS policies for student documents bucket
CREATE POLICY "Students can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'student-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Students can view their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'student-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Institutions can view student documents for their scholarship applications"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'student-documents' 
  AND EXISTS (
    SELECT 1 FROM scholarship_applications sa
    JOIN scholarships s ON sa.scholarship_id = s.id
    JOIN institutions i ON s.institution_id = i.id
    JOIN profiles p ON i.profile_id = p.id
    WHERE p.user_id = auth.uid()
    AND (storage.foldername(name))[2] = sa.id::text
  )
);

-- Add uploaded_documents column to scholarship_applications
ALTER TABLE scholarship_applications 
ADD COLUMN uploaded_documents TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Update the notification trigger to include proper function logic
CREATE OR REPLACE FUNCTION public.notify_application_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only notify if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.notifications (user_id, title, message, type, related_application_id)
    SELECT 
      p.user_id,
      CASE 
        WHEN NEW.status = 'approved' THEN 'Scholarship Approved!'
        WHEN NEW.status = 'rejected' THEN 'Application Update'
        WHEN NEW.status = 'under_review' THEN 'Application Under Review'
        ELSE 'Application Status Update'
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN 'Congratulations! Your scholarship application has been approved.'
        WHEN NEW.status = 'rejected' THEN 'Your scholarship application was not approved this time.'
        WHEN NEW.status = 'under_review' THEN 'Your scholarship application is currently under review.'
        ELSE 'Your scholarship application status has been updated to: ' || NEW.status
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN 'success'
        WHEN NEW.status = 'rejected' THEN 'error'
        ELSE 'info'
      END,
      NEW.id
    FROM public.profiles p
    WHERE p.id = NEW.student_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for application status changes
DROP TRIGGER IF EXISTS on_application_status_change ON scholarship_applications;
CREATE TRIGGER on_application_status_change
  AFTER UPDATE ON scholarship_applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_application_status_change();