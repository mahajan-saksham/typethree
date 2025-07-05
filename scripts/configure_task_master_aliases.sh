#!/bin/bash

# Type 3 Solar Platform - Task Master Shell Aliases Configuration

# Set project root directory
PROJECT_ROOT="/Users/sakshammahajan/Documents/type 3"

# Color codes for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Configuring Task Master shell aliases...${NC}"

# Determine shell configuration file
if [ -n "$ZSH_VERSION" ]; then
    SHELL_TYPE="zsh"
    CONFIG_FILE="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_TYPE="bash"
    CONFIG_FILE="$HOME/.bashrc"
    # On macOS, use .bash_profile instead
    if [[ "$(uname)" == "Darwin" ]]; then
        CONFIG_FILE="$HOME/.bash_profile"
        if [ ! -f "$CONFIG_FILE" ]; then
            CONFIG_FILE="$HOME/.profile"
        fi
    fi
else
    echo -e "${RED}Unsupported shell. Please manually add aliases to your shell config.${NC}"
    exit 1
fi

echo -e "${YELLOW}Detected ${SHELL_TYPE} shell, using config file: ${CONFIG_FILE}${NC}"

# Check if aliases already exist
if grep -q "# Type 3 Solar Platform - Task Master Aliases" "$CONFIG_FILE"; then
    echo -e "${YELLOW}Task Master aliases already exist in ${CONFIG_FILE}${NC}"
else
    echo -e "${YELLOW}Adding Task Master aliases to ${CONFIG_FILE}${NC}"
    
    # Add aliases to shell config
    cat >> "$CONFIG_FILE" << EOL

# Type 3 Solar Platform - Task Master Aliases
alias tm="cd $PROJECT_ROOT && npm run tasks"
alias tm-add="cd $PROJECT_ROOT && npm run add-task"
alias tm-list="cd $PROJECT_ROOT && npm run list-tasks"
alias tm-plan="cd $PROJECT_ROOT && mcp-shrimp-task-manager plan"
alias tm-execute="cd $PROJECT_ROOT && mcp-shrimp-task-manager execute"
alias tm-status="cd $PROJECT_ROOT && mcp-shrimp-task-manager status"
EOL

    echo -e "${GREEN}✅ Task Master aliases added successfully${NC}"
    echo -e "${YELLOW}Please restart your shell or run 'source ${CONFIG_FILE}' to apply changes${NC}"
fi

# Create a taskmaster script in the project bin directory
BIN_DIR="$PROJECT_ROOT/bin"
mkdir -p "$BIN_DIR"

echo -e "${YELLOW}Creating taskmaster script in ${BIN_DIR}${NC}"

cat > "$BIN_DIR/taskmaster" << EOL
#!/bin/bash

# Type 3 Solar Platform - Task Master CLI helper script

# Set project root directory
PROJECT_ROOT="$PROJECT_ROOT"

# Change to project directory
cd "\$PROJECT_ROOT"

# Call Task Master CLI with all arguments passed to this script
npx mcp-shrimp-task-manager "\$@"
EOL

# Make the script executable
chmod +x "$BIN_DIR/taskmaster"

echo -e "\n${GREEN}✅ Task Master shell configuration completed successfully${NC}"
echo -e "${YELLOW}You can now use the following commands:${NC}"
echo -e "  ${GREEN}tm${NC}           - Run Task Master"
echo -e "  ${GREEN}tm-add${NC}       - Add a new task"
echo -e "  ${GREEN}tm-list${NC}      - List all tasks"
echo -e "  ${GREEN}tm-plan${NC}      - Plan a task"
echo -e "  ${GREEN}tm-execute${NC}   - Execute a task"
echo -e "  ${GREEN}tm-status${NC}    - Check task status"
echo -e "  ${GREEN}${BIN_DIR}/taskmaster${NC}  - Run Task Master with custom commands"
echo -e "\nTo update the current shell session, run: ${GREEN}source ${CONFIG_FILE}${NC}"
