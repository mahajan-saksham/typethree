#!/bin/bash

# Type 3 Solar Platform - Task Master Setup

# Project Paths
PROJECT_ROOT="/Users/sakshammahajan/Documents/type 3"
TASK_DATA_DIR="$PROJECT_ROOT/.task-manager-data"
CONFIG_FILE="$PROJECT_ROOT/.taskmaster.json"

# Color Codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Ensure data directory exists
mkdir -p "$TASK_DATA_DIR"

# Install Smithery CLI and Task Manager
npx -y @smithery/cli install @cjo4m06/mcp-shrimp-task-manager --client claude --data-dir "$TASK_DATA_DIR"

# Create Task Master Configuration
cat > "$CONFIG_FILE" << EOL
{
  "projectName": "Type 3 Solar Platform",
  "dataDirectory": "$TASK_DATA_DIR",
  "branches": ["main", "develop", "feature"],
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

# Add npm scripts for task management
npm pkg set scripts.tasks="npx @cjo4m06/mcp-shrimp-task-manager"
npm pkg set scripts.add-task="npx @cjo4m06/mcp-shrimp-task-manager add"
npm pkg set scripts.list-tasks="npx @cjo4m06/mcp-shrimp-task-manager list"

echo -e "${GREEN}✅ Task Master Setup Complete${NC}"
echo -e "${YELLOW}Data Directory:${NC} $TASK_DATA_DIR"
echo -e "${YELLOW}Configuration:${NC} $CONFIG_FILE"
