-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('student', 'institution', 'admin');

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'student',
  wallet_address TEXT,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Institutions can view student profiles" ON public.profiles
  FOR SELECT USING (
    role = 'student' AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'institution')
  );

-- Create institutions table for additional institution details
CREATE TABLE public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  institution_name TEXT NOT NULL,
  institution_type TEXT,
  accreditation TEXT,
  website_url TEXT,
  established_year INTEGER,
  location TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(profile_id)
);

-- Enable RLS on institutions
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

-- Create institutions policies
CREATE POLICY "Institution can manage their own data" ON public.institutions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid())
  );

-- Create scholarships table
CREATE TABLE public.scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  max_recipients INTEGER DEFAULT 1,
  application_deadline DATE NOT NULL,
  requirements TEXT[],
  eligibility_criteria TEXT,
  academic_level TEXT,
  field_of_study TEXT,
  is_active BOOLEAN DEFAULT true,
  contract_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on scholarships
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

-- Create scholarships policies
CREATE POLICY "Anyone can view active scholarships" ON public.scholarships
  FOR SELECT USING (is_active = true);

CREATE POLICY "Institutions can manage their scholarships" ON public.scholarships
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.institutions WHERE id = institution_id AND profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    ))
  );

-- Create scholarship applications table
CREATE TABLE public.scholarship_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scholarship_id UUID REFERENCES public.scholarships(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  academic_records JSONB,
  personal_statement TEXT,
  additional_documents TEXT[],
  gpa DECIMAL(3,2),
  graduation_year INTEGER,
  field_of_study TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id),
  review_notes TEXT,
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(scholarship_id, student_id)
);

-- Enable RLS on scholarship applications
ALTER TABLE public.scholarship_applications ENABLE ROW LEVEL SECURITY;

-- Create scholarship applications policies
CREATE POLICY "Students can view their own applications" ON public.scholarship_applications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = student_id AND user_id = auth.uid())
  );

CREATE POLICY "Students can insert their own applications" ON public.scholarship_applications
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = student_id AND user_id = auth.uid())
  );

CREATE POLICY "Institutions can view applications for their scholarships" ON public.scholarship_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.scholarships s
      JOIN public.institutions i ON s.institution_id = i.id
      JOIN public.profiles p ON i.profile_id = p.id
      WHERE s.id = scholarship_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Institutions can update applications for their scholarships" ON public.scholarship_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.scholarships s
      JOIN public.institutions i ON s.institution_id = i.id
      JOIN public.profiles p ON i.profile_id = p.id
      WHERE s.id = scholarship_id AND p.user_id = auth.uid()
    )
  );

-- Create notifications table for toast alerts
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT false,
  related_application_id UUID REFERENCES public.scholarship_applications(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to create notification when application status changes
CREATE OR REPLACE FUNCTION public.notify_application_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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
CREATE TRIGGER on_application_status_change
  AFTER UPDATE ON public.scholarship_applications
  FOR EACH ROW EXECUTE FUNCTION public.notify_application_status_change();

-- Create updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_institutions_updated_at
  BEFORE UPDATE ON public.institutions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scholarships_updated_at
  BEFORE UPDATE ON public.scholarships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scholarship_applications_updated_at
  BEFORE UPDATE ON public.scholarship_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_institutions_profile_id ON public.institutions(profile_id);
CREATE INDEX idx_scholarships_institution_id ON public.scholarships(institution_id);
CREATE INDEX idx_scholarships_active ON public.scholarships(is_active);
CREATE INDEX idx_scholarship_applications_scholarship_id ON public.scholarship_applications(scholarship_id);
CREATE INDEX idx_scholarship_applications_student_id ON public.scholarship_applications(student_id);
CREATE INDEX idx_scholarship_applications_status ON public.scholarship_applications(status);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read);