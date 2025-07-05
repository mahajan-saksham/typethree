# Task Master CLI for Type 3 Solar Platform

This document provides instructions for installing and using the Task Master CLI for the Type 3 Solar Platform.

## Installation

You can install Task Master using the provided setup scripts:

```bash
# Run the complete setup script (recommended)
./setup_task_master_complete.sh

# Or run the individual scripts separately:
./scripts/install_task_master.sh
./scripts/configure_task_master.sh
./scripts/configure_task_master_aliases.sh
```

## Web GUI

The Task Master CLI includes an optional web-based graphical user interface for task management. To enable it:

1. Set `ENABLE_GUI=true` in your `.env` file
2. Run `./launch_web_gui.sh` to start the Web GUI server

When enabled, a `WebGUI.md` file containing the access address will be created in your `DATA_DIR`. The Web GUI provides:

- A Kanban-style task board with drag-and-drop functionality
- Task list view with sorting and filtering
- Analytics dashboard with metrics and charts
- User management for team collaboration

For more information, see `/Project/docs/web_gui_guide.md`.

## Available Commands

After installation, you can use the following commands:

- `tm` - Run Task Master
- `tm-add` - Add a new task
- `tm-list` - List all tasks
- `tm-plan` - Plan a task
- `tm-execute` - Execute a task
- `tm-status` - Check task status

You can also use npm scripts:

```bash
# Run Task Master
npm run tasks

# Add a new task
npm run add-task

# List all tasks
npm run list-tasks
```

## Project Configuration

Task Master is configured with the following settings:

- Project Root: `/Users/sakshammahajan/Documents/type 3`
- Data Directory: `/Users/sakshammahajan/Documents/type 3/.task-manager-data`
- Configuration File: `/Users/sakshammahajan/Documents/type 3/.taskmaster.json`

## Task Management Workflow

1. **Planning Tasks**
   ```bash
   tm-plan "Implement authentication system"
   ```

2. **Listing Tasks**
   ```bash
   tm-list
   ```

3. **Executing Tasks**
   ```bash
   tm-execute --id=42
   ```

4. **Updating Task Status**
   ```bash
   tm-status --id=42 --status=done
   ```

## Using with Supabase Authentication

Task Master integrates with Supabase authentication to ensure secure access and role-based permissions. More details can be found in the Authentication Integration task.

## Troubleshooting

If you encounter issues with Task Master:

1. Ensure the Task Master CLI is installed globally (`npm list -g mcp-shrimp-task-manager`)
2. Check your environment variables in `.env`
3. Verify configuration in `.taskmaster.json`
4. Restart your terminal to ensure aliases are loaded
