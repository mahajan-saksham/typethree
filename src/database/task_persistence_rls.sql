-- Row Level Security Policies for Task Persistence
-- To be executed in Supabase SQL Editor after schema creation

-- Enable RLS on all tables
ALTER TABLE public.persistent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persistent_task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persistent_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persistent_subtask_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persistent_task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persistent_task_history ENABLE ROW LEVEL SECURITY;

-- Create policies for Tasks table

-- 1. Read access for all authenticated users
CREATE POLICY "Allow authenticated users to read all tasks"
ON public.persistent_tasks
FOR SELECT
TO authenticated
USING (true);

-- 2. Insert access based on task_permissions
CREATE POLICY "Allow users to create tasks if they have permission"
ON public.persistent_tasks
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM task_permissions
    WHERE user_id = auth.uid() AND can_create = true
  )
);

-- 3. Update access for tasks (owner or has permission)
CREATE POLICY "Allow users to update tasks if they are owner or have permission"
ON public.persistent_tasks
FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM task_permissions
    WHERE user_id = auth.uid() AND can_update = true
  )
);

-- 4. Delete access for tasks (requires delete permission)
CREATE POLICY "Allow users to delete tasks if they have permission"
ON public.persistent_tasks
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM task_permissions
    WHERE user_id = auth.uid() AND can_delete = true
  )
);

-- Create policies for Task Dependencies table

-- 1. Read access for all authenticated users
CREATE POLICY "Allow authenticated users to read all task dependencies"
ON public.persistent_task_dependencies
FOR SELECT
TO authenticated
USING (true);

-- 2. Insert/Update/Delete access based on related task permissions
CREATE POLICY "Allow users to manage task dependencies if they can update the task"
ON public.persistent_task_dependencies
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM persistent_tasks t
    JOIN task_permissions p ON p.user_id = auth.uid()
    WHERE t.id = task_id AND 
    (t.owner_id = auth.uid() OR p.can_update = true)
  )
);

-- Create policies for Subtasks table

-- 1. Read access for all authenticated users
CREATE POLICY "Allow authenticated users to read all subtasks"
ON public.persistent_subtasks
FOR SELECT
TO authenticated
USING (true);

-- 2. Insert access based on parent task permissions
CREATE POLICY "Allow users to create subtasks if they can update the parent task"
ON public.persistent_subtasks
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM persistent_tasks t
    JOIN task_permissions p ON p.user_id = auth.uid()
    WHERE t.id = parent_task_id AND 
    (t.owner_id = auth.uid() OR p.can_update = true)
  )
);

-- 3. Update access for subtasks (owner or has permission on parent)
CREATE POLICY "Allow users to update subtasks if they are owner or have permission on parent"
ON public.persistent_subtasks
FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM persistent_tasks t
    JOIN task_permissions p ON p.user_id = auth.uid()
    WHERE t.id = parent_task_id AND 
    (t.owner_id = auth.uid() OR p.can_update = true)
  )
);

-- 4. Delete access for subtasks (requires permission on parent)
CREATE POLICY "Allow users to delete subtasks if they can update the parent task"
ON public.persistent_subtasks
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM persistent_tasks t
    JOIN task_permissions p ON p.user_id = auth.uid()
    WHERE t.id = parent_task_id AND 
    (t.owner_id = auth.uid() OR p.can_update = true)
  )
);

-- Create policies for Subtask Dependencies table

-- 1. Read access for all authenticated users
CREATE POLICY "Allow authenticated users to read all subtask dependencies"
ON public.persistent_subtask_dependencies
FOR SELECT
TO authenticated
USING (true);

-- 2. Insert/Update/Delete access based on related subtask permissions
CREATE POLICY "Allow users to manage subtask dependencies if they can update the parent task"
ON public.persistent_subtask_dependencies
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM persistent_subtasks s
    JOIN persistent_tasks t ON t.id = s.parent_task_id
    JOIN task_permissions p ON p.user_id = auth.uid()
    WHERE s.id = subtask_id AND 
    (t.owner_id = auth.uid() OR p.can_update = true)
  )
);

-- Create policies for Task Comments table

-- 1. Read access for all authenticated users
CREATE POLICY "Allow authenticated users to read all task comments"
ON public.persistent_task_comments
FOR SELECT
TO authenticated
USING (true);

-- 2. Insert access for authenticated users (anyone can comment)
CREATE POLICY "Allow authenticated users to create comments"
ON public.persistent_task_comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Update access only for comment owner
CREATE POLICY "Allow users to update their own comments"
ON public.persistent_task_comments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- 4. Delete access for comment owner or admin
CREATE POLICY "Allow users to delete their own comments or admin"
ON public.persistent_task_comments
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create policies for Task History table

-- 1. Read access for all authenticated users
CREATE POLICY "Allow authenticated users to read task history"
ON public.persistent_task_history
FOR SELECT
TO authenticated
USING (true);

-- 2. Insert access system-only (handled via triggers)
-- No direct insert/update/delete policies needed as history is managed by triggers
