#!/bin/bash

# Type 3 Solar Platform - Task Master CLI Installation

# Set project root directory
PROJECT_ROOT="/Users/sakshammahajan/Documents/type 3"

# Color codes for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Starting Task Master CLI installation...${NC}"

# Step 1: Install Task Master CLI globally
echo -e "${YELLOW}Installing Task Master CLI globally...${NC}"
npm install -g @cjo4m06/mcp-shrimp-task-manager

# Step 2: Install as a project dependency
echo -e "${YELLOW}Installing Task Master CLI as a project dependency...${NC}"
cd "$PROJECT_ROOT"
npm install --save-dev @cjo4m06/mcp-shrimp-task-manager

# Verify installation
if command -v mcp-shrimp-task-manager &> /dev/null; then
    echo -e "${GREEN}✅ Task Master CLI installed successfully!${NC}"
else
    echo -e "${RED}❌ Error: Task Master CLI installation failed. Please check npm logs.${NC}"
    exit 1
fi

echo -e "\n${GREEN}Task Master CLI installation completed successfully.${NC}"
echo -e "${YELLOW}Next step: Configure Task Master project settings.${NC}"
