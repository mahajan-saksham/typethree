#!/bin/bash

# Task Master Local Setup Script for Type 3 Solar Platform

# Set project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TASK_MANAGER_PATH="$PROJECT_ROOT/task-manager-local"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check for required tools
echo -e "${YELLOW}Checking prerequisites...${NC}"
command -v npm >/dev/null 2>&1 || { echo >&2 "npm is required but not installed. Aborting."; exit 1; }
command -v git >/dev/null 2>&1 || { echo >&2 "git is required but not installed. Aborting."; exit 1; }

# Install local Task Manager
echo -e "${YELLOW}Installing local Task Manager...${NC}"
cd "$TASK_MANAGER_PATH"
npm install
npm link

# Return to project root and link Task Manager
cd "$PROJECT_ROOT"
npm link mcp-shrimp-task-manager

# Initialize Task Master project
echo -e "${YELLOW}Initializing Task Master project...${NC}"
npx mcp-shrimp-task-manager init

# Create Task Master configuration
echo -e "${YELLOW}Creating Task Master configuration...${NC}"
cat > .taskmaster.json << EOL
{
  "projectName": "Type 3 Solar Platform",
  "defaultBranch": "main",
  "branches": ["develop", "feature", "hotfix"],
  "taskCategories": [
    "Development",
    "Design", 
    "Product Management",
    "Operations",
    "Marketing",
    "Sales"
  ],
  "integrations": {
    "supabase": {
      "enabled": true,
      "projectId": "type-3-solar"
    },
    "git": {
      "enabled": true,
      "autoCommit": false
    }
  }
}
EOL

# Add Project Scripts
echo -e "${YELLOW}Adding npm scripts...${NC}"
npm pkg set scripts.tasks="mcp-shrimp-task-manager"
npm pkg set scripts.add-task="mcp-shrimp-task-manager add"
npm pkg set scripts.list-tasks="mcp-shrimp-task-manager list"

echo -e "${GREEN}Task Master setup complete!${NC}"
echo -e "${YELLOW}Use 'npm run tasks' to manage tasks${NC}"
