# Task Master Web GUI

The Task Master Web GUI provides a visual interface for managing tasks in the Type 3 Solar Platform. This document explains how to enable and use the Web GUI.

## Enabling the Web GUI

To enable the Web GUI, follow these steps:

1. Ensure Task Master CLI is installed (run `./setup_task_master_complete.sh` if not already done)
2. Set `ENABLE_GUI=true` in your `.env` file or use the provided `.env.web-gui` file
3. Run the launch script: `./launch_web_gui.sh`

Once enabled, a `WebGUI.md` file will be created in your `DATA_DIR` containing the access address (typically http://localhost:3050).

## Web GUI Features

The Task Master Web GUI provides the following features:

### Task Board View

The Task Board provides a Kanban-style view of tasks, organized by status:

- **Pending**: Tasks that have not yet been started
- **In Progress**: Tasks currently being worked on
- **Review**: Tasks awaiting review
- **Done**: Completed tasks
- **Deferred**: Tasks that have been postponed
- **Cancelled**: Tasks that have been cancelled

You can drag and drop tasks between columns to update their status.

### Task List View

The Task List view provides a tabular view of all tasks with sortable columns:

- **ID**: The task identifier
- **Title**: The task title
- **Status**: The current status of the task
- **Priority**: The task priority (high, medium, low)
- **Owner**: The assigned owner of the task
- **Due Date**: The due date for the task (if set)

You can click on column headers to sort the tasks.

### Task Details

Clicking on any task opens a detailed view where you can:

- View and edit task details
- Add or remove subtasks
- Manage dependencies
- View task history
- Add comments

### Analytics Dashboard

The Analytics Dashboard provides insights into your tasks:

- **Completion Metrics**: Charts showing task completion over time
- **Status Distribution**: Breakdown of tasks by status
- **Burndown Chart**: Visualization of task completion trajectory
- **Dependencies Graph**: Visual representation of task dependencies

### User Management

Admin users can access the User Management section to:

- View all users
- Assign roles and permissions
- Manage team assignments

## Configuration Options

The Web GUI can be configured through the `.taskmaster.web-gui.json` file:

- **port**: The port to serve the Web GUI on (default: 3050)
- **title**: The title shown in the browser tab
- **theme**: The visual theme ('dark' or 'light')
- **autoLaunch**: Whether to automatically open the GUI in the browser
- **features**: Enable/disable specific features
- **layout**: Configure the GUI layout

## Authentication

The Web GUI uses the same authentication system as the Task Master CLI, based on Supabase Authentication:

1. Sign in using your Supabase credentials
2. Access is controlled by the role-based permissions system
3. Session timeout can be configured in the `.env` file

## Troubleshooting

If you encounter issues with the Web GUI:

- Check that the Task Master CLI is properly installed
- Verify that `ENABLE_GUI=true` is set in your `.env` file
- Ensure the port (default: 3050) is not in use by another application
- Check the task master logs for any error messages

## Command Line Access

Even with the Web GUI enabled, you can still use the command-line interface for task management:

```bash
# Using the shell aliases
tm-add "New task"
tm-list
tm-plan "Task plan"
tm-execute "Task execution"

# Or using the npm scripts
npm run tasks -- add "New task"
npm run tasks -- list
```

## Further Resources

For more information on using the Task Master Web GUI, refer to:

- The Task Master CLI documentation
- The Supabase Authentication documentation
- The Task Persistence Backend documentation
