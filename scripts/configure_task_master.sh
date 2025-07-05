#!/bin/bash

# Type 3 Solar Platform - Task Master Project Configuration

# Set project root directory
PROJECT_ROOT="/Users/sakshammahajan/Documents/type 3"
DATA_DIR="$PROJECT_ROOT/.task-manager-data"
CONFIG_FILE="$PROJECT_ROOT/.taskmaster.json"

# Color codes for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Configuring Task Master project settings...${NC}"

# Create data directory if it doesn't exist
mkdir -p "$DATA_DIR"

# Create Task Master configuration file
echo -e "${YELLOW}Creating Task Master configuration file...${NC}"

cat > "$CONFIG_FILE" << EOL
{
  "projectName": "Type 3 Solar Platform",
  "dataDirectory": "$DATA_DIR",
  "branches": ["main", "develop", "feature"],
  "taskCategories": [
    "Development",
    "Design",
    "Product Management", 
    "Operations",
    "Security",
    "Documentation"
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
  },
  "templates": {
    "task": {
      "defaultStatus": "pending",
      "defaultPriority": "medium",
      "statusOptions": [
        "pending", 
        "in-progress", 
        "review", 
        "done", 
        "deferred", 
        "cancelled"
      ]
    }
  }
}
EOL

# Create .env file with Task Master settings if it doesn't exist
ENV_FILE="$PROJECT_ROOT/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}Creating .env file with Task Master settings...${NC}"
    
    cat > "$ENV_FILE" << EOL
# Task Master Configuration
DATA_DIR=$DATA_DIR
TEMPLATES_USE=en
ENABLE_GUI=false
EOL
else
    # Check if Task Master settings already exist in .env
    if ! grep -q "DATA_DIR" "$ENV_FILE"; then
        echo -e "${YELLOW}Adding Task Master settings to existing .env file...${NC}"
        
        cat >> "$ENV_FILE" << EOL

# Task Master Configuration
DATA_DIR=$DATA_DIR
TEMPLATES_USE=en
ENABLE_GUI=false
EOL
    fi
fi

# Add Task Master commands to package.json scripts
echo -e "${YELLOW}Adding Task Master commands to package.json...${NC}"
cd "$PROJECT_ROOT"

# Update scripts in package.json
if command -v jq &> /dev/null; then
    jq '.scripts.tasks = "mcp-shrimp-task-manager"' package.json > package.json.tmp
    jq '.scripts["add-task"] = "mcp-shrimp-task-manager add"' package.json.tmp > package.json.tmp2
    jq '.scripts["list-tasks"] = "mcp-shrimp-task-manager list"' package.json.tmp2 > package.json.tmp3
    mv package.json.tmp3 package.json
    rm package.json.tmp package.json.tmp2
else
    echo -e "${YELLOW}jq not found, updating package.json with Node.js...${NC}"
    node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
        pkg.scripts = pkg.scripts || {};
        pkg.scripts.tasks = 'mcp-shrimp-task-manager';
        pkg.scripts['add-task'] = 'mcp-shrimp-task-manager add';
        pkg.scripts['list-tasks'] = 'mcp-shrimp-task-manager list';
        fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
    "
fi

echo -e "\n${GREEN}✅ Task Master project configuration completed successfully.${NC}"
echo -e "${YELLOW}Configuration file created at:${NC} $CONFIG_FILE"
echo -e "${YELLOW}Data directory set to:${NC} $DATA_DIR"
echo -e "${YELLOW}Next step: Configure shell aliases for quick access.${NC}"
