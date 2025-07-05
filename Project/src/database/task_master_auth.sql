-- Task Master Permissions Schema for Supabase
-- To be executed in Supabase SQL Editor

-- Task Permissions Table
CREATE TABLE IF NOT EXISTS task_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  can_create BOOLEAN NOT NULL DEFAULT true,
  can_update BOOLEAN NOT NULL DEFAULT true,
  can_delete BOOLEAN NOT NULL DEFAULT false,
  can_assign BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_permissions_user_id ON task_permissions(user_id);

-- Create or replace function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user_task_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default task permissions for new user
  INSERT INTO public.task_permissions (user_id, can_create, can_update, can_delete, can_assign)
  VALUES (NEW.id, TRUE, TRUE, FALSE, FALSE);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_set_task_permissions'
  ) THEN
    CREATE TRIGGER on_auth_user_created_set_task_permissions
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_task_permissions();
  END IF;
END
$$;

-- Task Master Tasks Table
CREATE TABLE IF NOT EXISTS task_master_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  CONSTRAINT unique_external_id UNIQUE (external_id)
);

-- Task Master Subtasks Table
CREATE TABLE IF NOT EXISTS task_master_subtasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_task_id UUID NOT NULL REFERENCES task_master_tasks(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  CONSTRAINT unique_subtask_external_id UNIQUE (external_id)
);

-- Set up RLS policies

-- Enable RLS on the tables
ALTER TABLE task_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_master_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_master_subtasks ENABLE ROW LEVEL SECURITY;

-- Task permissions policies
CREATE POLICY "Users can view their own permissions" 
  ON task_permissions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all permissions" 
  ON task_permissions FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can update permissions" 
  ON task_permissions FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Task policies
CREATE POLICY "Users can view all tasks" 
  ON task_master_tasks FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can create tasks if they have permission" 
  ON task_master_tasks FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM task_permissions 
      WHERE user_id = auth.uid() AND can_create = true
    )
  );

CREATE POLICY "Users can update tasks if they have permission or are the owner" 
  ON task_master_tasks FOR UPDATE 
  TO authenticated 
  USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM task_permissions 
      WHERE user_id = auth.uid() AND can_update = true
    )
  );

CREATE POLICY "Users can delete tasks if they have permission" 
  ON task_master_tasks FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM task_permissions 
      WHERE user_id = auth.uid() AND can_delete = true
    )
  );

-- Subtask policies
CREATE POLICY "Users can view all subtasks" 
  ON task_master_subtasks FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can create subtasks if they have permission" 
  ON task_master_subtasks FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM task_permissions 
      WHERE user_id = auth.uid() AND can_create = true
    )
  );

CREATE POLICY "Users can update subtasks if they have permission or are the owner" 
  ON task_master_subtasks FOR UPDATE 
  TO authenticated 
  USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM task_permissions 
      WHERE user_id = auth.uid() AND can_update = true
    )
  );

CREATE POLICY "Users can delete subtasks if they have permission" 
  ON task_master_subtasks FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM task_permissions 
      WHERE user_id = auth.uid() AND can_delete = true
    )
  );
