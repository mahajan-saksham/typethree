#!/bin/bash

# Type 3 Solar Platform - Task Master Complete Setup

# Set project root directory
PROJECT_ROOT="/Users/sakshammahajan/Documents/type 3"
SCRIPTS_DIR="$PROJECT_ROOT/scripts"

# Color codes for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Ensure scripts directory exists
mkdir -p "$SCRIPTS_DIR"

echo -e "${YELLOW}Starting Task Master complete setup...${NC}"

# Step 1: Install Task Master CLI
echo -e "\n${YELLOW}Step 1: Installing Task Master CLI${NC}"
"$SCRIPTS_DIR/install_task_master.sh"

# Check if Step 1 succeeded
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Task Master CLI installation failed. Setup aborted.${NC}"
    exit 1
fi

# Step 2: Configure Task Master Project
echo -e "\n${YELLOW}Step 2: Configuring Task Master project settings${NC}"
"$SCRIPTS_DIR/configure_task_master.sh"

# Check if Step 2 succeeded
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Task Master project configuration failed. Setup aborted.${NC}"
    exit 1
fi

# Step 3: Configure Shell Aliases
echo -e "\n${YELLOW}Step 3: Configuring Task Master shell aliases${NC}"
"$SCRIPTS_DIR/configure_task_master_aliases.sh"

# Check if Step 3 succeeded
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Task Master shell aliases configuration failed. Setup aborted.${NC}"
    exit 1
fi

echo -e "\n${GREEN}✅ Task Master complete setup finished successfully!${NC}"
echo -e "${YELLOW}You can now use Task Master to manage your Type 3 Solar Platform project.${NC}"
echo -e "${YELLOW}To ensure all aliases are available, please restart your terminal or run:${NC}"
echo -e "${GREEN}source ~/.bashrc${NC} or ${GREEN}source ~/.zshrc${NC} (depending on your shell)"

# Initialize Task Master
echo -e "\n${YELLOW}Initializing Task Master project...${NC}"
cd "$PROJECT_ROOT"
npx mcp-shrimp-task-manager init

echo -e "\n${GREEN}✅ Task Master installation and configuration complete!${NC}"
echo -e "${YELLOW}Happy task managing!${NC}"
