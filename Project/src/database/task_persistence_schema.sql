-- Task Persistence Database Schema for Type 3 Solar Platform
-- To be executed in Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tasks Table
CREATE TABLE IF NOT EXISTS public.persistent_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    details TEXT,
    test_strategy TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    priority TEXT NOT NULL DEFAULT 'medium',
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    category TEXT,
    estimated_hours FLOAT,
    actual_hours FLOAT,
    due_date TIMESTAMPTZ,
    CONSTRAINT unique_external_id UNIQUE (external_id)
);

-- Tasks Dependencies Junction Table
CREATE TABLE IF NOT EXISTS public.persistent_task_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.persistent_tasks(id) ON DELETE CASCADE,
    depends_on_id UUID NOT NULL REFERENCES public.persistent_tasks(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_task_dependency UNIQUE (task_id, depends_on_id),
    CONSTRAINT no_self_dependency CHECK (task_id != depends_on_id)
);

-- Subtasks Table
CREATE TABLE IF NOT EXISTS public.persistent_subtasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_task_id UUID NOT NULL REFERENCES public.persistent_tasks(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_index INTEGER DEFAULT 0,
    estimated_hours FLOAT,
    actual_hours FLOAT,
    CONSTRAINT unique_subtask_external_id UNIQUE (external_id)
);

-- Subtask Dependencies Junction Table
CREATE TABLE IF NOT EXISTS public.persistent_subtask_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subtask_id UUID NOT NULL REFERENCES public.persistent_subtasks(id) ON DELETE CASCADE,
    depends_on_id UUID NOT NULL REFERENCES public.persistent_subtasks(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_subtask_dependency UNIQUE (subtask_id, depends_on_id),
    CONSTRAINT no_self_dependency CHECK (subtask_id != depends_on_id)
);

-- Task Comments Table
CREATE TABLE IF NOT EXISTS public.persistent_task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.persistent_tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Task History Table for Audit
CREATE TABLE IF NOT EXISTS public.persistent_task_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.persistent_tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    change_type TEXT NOT NULL, -- 'create', 'update', 'delete'
    field_name TEXT,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Performance

-- Task Indexes
CREATE INDEX IF NOT EXISTS idx_persistent_tasks_external_id ON public.persistent_tasks(external_id);
CREATE INDEX IF NOT EXISTS idx_persistent_tasks_status ON public.persistent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_persistent_tasks_priority ON public.persistent_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_persistent_tasks_owner_id ON public.persistent_tasks(owner_id);
CREATE INDEX IF NOT EXISTS idx_persistent_tasks_category ON public.persistent_tasks(category);
CREATE INDEX IF NOT EXISTS idx_persistent_tasks_due_date ON public.persistent_tasks(due_date);

-- Subtask Indexes
CREATE INDEX IF NOT EXISTS idx_persistent_subtasks_parent_task_id ON public.persistent_subtasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_persistent_subtasks_external_id ON public.persistent_subtasks(external_id);
CREATE INDEX IF NOT EXISTS idx_persistent_subtasks_status ON public.persistent_subtasks(status);
CREATE INDEX IF NOT EXISTS idx_persistent_subtasks_owner_id ON public.persistent_subtasks(owner_id);

-- Dependency Indexes
CREATE INDEX IF NOT EXISTS idx_persistent_task_dependencies_task_id ON public.persistent_task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_persistent_task_dependencies_depends_on_id ON public.persistent_task_dependencies(depends_on_id);
CREATE INDEX IF NOT EXISTS idx_persistent_subtask_dependencies_subtask_id ON public.persistent_subtask_dependencies(subtask_id);
CREATE INDEX IF NOT EXISTS idx_persistent_subtask_dependencies_depends_on_id ON public.persistent_subtask_dependencies(depends_on_id);

-- Comment Indexes
CREATE INDEX IF NOT EXISTS idx_persistent_task_comments_task_id ON public.persistent_task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_persistent_task_comments_user_id ON public.persistent_task_comments(user_id);

-- History Indexes
CREATE INDEX IF NOT EXISTS idx_persistent_task_history_task_id ON public.persistent_task_history(task_id);
CREATE INDEX IF NOT EXISTS idx_persistent_task_history_user_id ON public.persistent_task_history(user_id);
CREATE INDEX IF NOT EXISTS idx_persistent_task_history_change_type ON public.persistent_task_history(change_type);
CREATE INDEX IF NOT EXISTS idx_persistent_task_history_created_at ON public.persistent_task_history(created_at);
