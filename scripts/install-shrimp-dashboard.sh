#!/bin/bash

# Script to install and configure Shrimp Task Manager for TaskMaster
# For Type 3 Solar Platform project

echo "Starting Shrimp Task Manager installation..."

# Create directory for Shrimp Task Manager if it doesn't exist
mkdir -p ./taskmaster/extensions

# Install Shrimp Task Manager from GitHub
echo "Cloning Shrimp Task Manager repository..."
git clone https://github.com/cjo4m06/mcp-shrimp-task-manager.git ./taskmaster/extensions/shrimp-manager

# Navigate to the directory
cd ./taskmaster/extensions/shrimp-manager

# Install dependencies
echo "Installing dependencies..."
npm install

# Create configuration file
echo "Creating configuration file..."
cat > .env << EOF
# Shrimp Task Manager Configuration
ENABLE_GUI=true
GUI_PORT=7654
HOST=localhost
NODE_ENV=development
# Additional configurations
TASK_FILE_PATH=../../../tasks/tasks.json
ENABLE_TASK_CATEGORIES=true
CATEGORY_CONFIG_PATH=../../../taskmaster/config/categories.json
EOF

# Create categories configuration
echo "Creating categories configuration..."
mkdir -p ../../../taskmaster/config

cat > ../../../taskmaster/config/categories.json << EOF
{
  "categories": [
    {
      "id": "backend",
      "name": "Backend (Supabase)",
      "color": "#3ECF8E",
      "icon": "database"
    },
    {
      "id": "frontend",
      "name": "Frontend (React/TS)",
      "color": "#61DAFB",
      "icon": "code"
    },
    {
      "id": "api",
      "name": "API Integration",
      "color": "#6C47FF",
      "icon": "api"
    },
    {
      "id": "solar",
      "name": "Solar Features",
      "color": "#F97316",
      "icon": "sun"
    },
    {
      "id": "testing",
      "name": "Testing & QA",
      "color": "#22C55E",
      "icon": "check-circle"
    },
    {
      "id": "dashboard",
      "name": "Dashboard",
      "color": "#3B82F6",
      "icon": "chart-bar"
    }
  ],
  "defaultCategory": "frontend"
}
EOF

# Update MCP configuration to include Shrimp Task Manager
echo "Updating MCP configuration..."

# Check if .cursor directory exists (for Cursor editor)
if [ -d ".cursor" ]; then
  mkdir -p .cursor
  cat > .cursor/mcp.json << EOF
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["./taskmaster/extensions/shrimp-manager/src/index.js"],
      "env": {
        "ENABLE_GUI": "true",
        "GUI_PORT": "7654",
        "HOST": "localhost"
      }
    }
  }
}
EOF
fi

# Create a start script
echo "Creating start script..."
cat > ./start-taskmaster-dashboard.sh << EOF
#!/bin/bash
cd "\$(dirname "\$0")"
cd ./taskmaster/extensions/shrimp-manager
echo "Starting Shrimp Task Manager Dashboard..."
echo "Dashboard will be available at: http://localhost:7654"
node ./src/index.js
EOF

# Make the start script executable
chmod +x ./start-taskmaster-dashboard.sh

echo "Installation complete!"
echo "To start the dashboard, run: ./start-taskmaster-dashboard.sh"
echo "Dashboard will be available at: http://localhost:7654"
