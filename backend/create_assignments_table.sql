-- Create issue assignments table for team assignment tracking
-- Run this in your Supabase SQL Editor

-- Create the issue_assignments table
CREATE TABLE IF NOT EXISTS public.issue_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  assigned_to_name TEXT NOT NULL,
  assigned_to_phone TEXT NOT NULL,
  assigned_to_email TEXT NOT NULL,
  assignment_message TEXT NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'in-progress', 'completed', 'rejected')),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_issue_assignments_issue_id ON public.issue_assignments(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_assignments_status ON public.issue_assignments(status);
CREATE INDEX IF NOT EXISTS idx_issue_assignments_assigned_at ON public.issue_assignments(assigned_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.issue_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Admins can do everything
CREATE POLICY "Admins can manage all assignments" ON public.issue_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Regular users can only view assignments for their own issues
CREATE POLICY "Users can view assignments for their issues" ON public.issue_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.issues 
      WHERE issues.id = issue_assignments.issue_id 
      AND issues.user_id = auth.uid()
    )
  );

-- Verify the table was created
SELECT 'Issue assignments table created successfully' as status;
SELECT COUNT(*) as existing_assignments FROM public.issue_assignments;
