-- Migration: Task Workflow Configuration
-- Create custom task categories and templates for Type 3 Solar platform development workflow

-- Task Categories Table
CREATE TABLE IF NOT EXISTS public.task_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT unique_category_name UNIQUE (name)
);

-- Task Templates Table
CREATE TABLE IF NOT EXISTS public.task_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.task_categories(id) ON DELETE SET NULL,
  template_data JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT unique_template_name UNIQUE (name)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_task_templates_category_id ON public.task_templates(category_id);
CREATE INDEX IF NOT EXISTS idx_task_templates_is_default ON public.task_templates(is_default);

-- RLS Policies
ALTER TABLE public.task_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

-- Admin can manage categories and templates
CREATE POLICY "Admins can manage task categories"
  ON public.task_categories
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage task templates"
  ON public.task_templates
  USING (public.is_admin(auth.uid()));

-- All authenticated users can view categories and templates
CREATE POLICY "All authenticated users can view task categories"
  ON public.task_categories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "All authenticated users can view task templates"
  ON public.task_templates
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default categories for Type 3 Solar platform
INSERT INTO public.task_categories (name, description, color, icon)
VALUES
  ('Development', 'Software development and coding tasks', '#3B82F6', 'code'),
  ('Design', 'UI/UX design tasks', '#EC4899', 'palette'),
  ('Testing', 'QA and testing tasks', '#10B981', 'bug'),
  ('Infrastructure', 'DevOps and infrastructure tasks', '#6366F1', 'server'),
  ('Documentation', 'Documentation and knowledge base tasks', '#F59E0B', 'book'),
  ('Research', 'Market research and analysis tasks', '#8B5CF6', 'search'),
  ('Security', 'Security and compliance tasks', '#EF4444', 'shield'),
  ('Solar', 'Solar-specific industry tasks', '#F97316', 'sun');

-- Insert default templates for each category
INSERT INTO public.task_templates (name, description, category_id, template_data, is_default)
VALUES
  -- Development template
  (
    'Feature Development',
    'Template for new feature development',
    (SELECT id FROM public.task_categories WHERE name = 'Development'),
    '{
      "title": "[Feature Name]",
      "description": "Implement [feature] to enable [value proposition]",
      "details": "# Requirements\n- Requirement 1\n- Requirement 2\n\n# Technical Approach\n- Step 1\n- Step 2\n\n# Acceptance Criteria\n- Criteria 1\n- Criteria 2",
      "test_strategy": "# Unit Tests\n- Test case 1\n- Test case 2\n\n# Integration Tests\n- Test scenario 1\n- Test scenario 2",
      "priority": "medium",
      "estimated_hours": 8
    }'::jsonb,
    true
  ),
  
  -- Bug Fix template
  (
    'Bug Fix',
    'Template for bug fixes',
    (SELECT id FROM public.task_categories WHERE name = 'Development'),
    '{
      "title": "Fix: [Bug Summary]",
      "description": "Fix bug where [issue description]",
      "details": "# Bug Description\n[Detailed description]\n\n# Steps to Reproduce\n1. Step 1\n2. Step 2\n\n# Root Cause Analysis\n[Analysis]\n\n# Fix Approach\n[Approach]",
      "test_strategy": "# Verification Steps\n1. Step 1\n2. Step 2\n\n# Regression Tests\n[Tests to ensure no regression]",
      "priority": "high",
      "estimated_hours": 3
    }'::jsonb,
    false
  ),
  
  -- Design template
  (
    'UI Component Design',
    'Template for UI component design tasks',
    (SELECT id FROM public.task_categories WHERE name = 'Design'),
    '{
      "title": "Design: [Component Name]",
      "description": "Design the UI for [component] to achieve [goal]",
      "details": "# Design Requirements\n- Requirement 1\n- Requirement 2\n\n# User Personas\n- Persona 1\n- Persona 2\n\n# Design Deliverables\n- Wireframes\n- High-fidelity mockups\n- Design specs",
      "test_strategy": "# Usability Testing\n- Test scenario 1\n- Test scenario 2\n\n# Design Review\n- Review criteria 1\n- Review criteria 2",
      "priority": "medium",
      "estimated_hours": 6
    }'::jsonb,
    true
  ),
  
  -- Testing template
  (
    'Test Plan',
    'Template for creating test plans',
    (SELECT id FROM public.task_categories WHERE name = 'Testing'),
    '{
      "title": "Test Plan: [Feature/Area]",
      "description": "Create comprehensive test plan for [feature/area]",
      "details": "# Scope\n[Define scope]\n\n# Test Objectives\n- Objective 1\n- Objective 2\n\n# Test Strategy\n[Strategy details]\n\n# Test Cases\n- Test case 1\n- Test case 2",
      "priority": "medium",
      "estimated_hours": 4
    }'::jsonb,
    true
  ),
  
  -- Infrastructure template
  (
    'DevOps Implementation',
    'Template for DevOps and infrastructure tasks',
    (SELECT id FROM public.task_categories WHERE name = 'Infrastructure'),
    '{
      "title": "DevOps: [Implementation Name]",
      "description": "Implement [infrastructure component] to support [requirement]",
      "details": "# Infrastructure Requirements\n- Requirement 1\n- Requirement 2\n\n# Implementation Steps\n1. Step 1\n2. Step 2\n\n# Configuration Details\n[Details]\n\n# Rollback Plan\n[Rollback steps]",
      "test_strategy": "# Validation Tests\n- Test 1\n- Test 2\n\n# Performance Tests\n- Test 1\n- Test 2",
      "priority": "high",
      "estimated_hours": 8
    }'::jsonb,
    true
  ),
  
  -- Solar-specific template
  (
    'Solar Installation Workflow',
    'Template for solar installation process tasks',
    (SELECT id FROM public.task_categories WHERE name = 'Solar'),
    '{
      "title": "Solar: [Workflow Name]",
      "description": "Implement [workflow] for solar installations",
      "details": "# Workflow Overview\n[Overview]\n\n# Process Steps\n1. Step 1\n2. Step 2\n\n# Regulatory Requirements\n- Requirement 1\n- Requirement 2\n\n# Integration Points\n- Integration 1\n- Integration 2",
      "test_strategy": "# Validation Approach\n[Approach]\n\n# Test Scenarios\n- Scenario 1\n- Scenario 2",
      "priority": "high",
      "estimated_hours": 12
    }'::jsonb,
    true
  ),
  
  -- Security template
  (
    'Security Implementation',
    'Template for security implementation tasks',
    (SELECT id FROM public.task_categories WHERE name = 'Security'),
    '{
      "title": "Security: [Implementation Name]",
      "description": "Implement [security feature] to protect against [threat]",
      "details": "# Security Requirements\n- Requirement 1\n- Requirement 2\n\n# Threat Model\n[Threat details]\n\n# Implementation Approach\n- Approach 1\n- Approach 2\n\n# Compliance Requirements\n- Requirement 1\n- Requirement 2",
      "test_strategy": "# Security Testing\n- Test 1\n- Test 2\n\n# Penetration Testing\n- Test 1\n- Test 2",
      "priority": "high",
      "estimated_hours": 10
    }'::jsonb,
    true
  );
