// src/components/TaskMasterWebGUI/TaskBoard.tsx
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { usePersistentTasks } from '../../hooks/usePersistentTasks';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { PersistentTask, TaskStatus } from '../../services/TaskPersistenceService';

// Task status columns
const statusColumns = [
  { id: 'pending', title: 'Pending' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
  { id: 'deferred', title: 'Deferred' },
  { id: 'cancelled', title: 'Cancelled' }
];

/**
 * Task Board component for the Web GUI
 * Provides a Kanban-style board for task management
 */
const TaskBoard: React.FC = () => {
  const { user } = useSupabaseAuth();
  const {
    tasks,
    isLoading,
    error,
    loadTasks,
    updateTaskStatus
  } = usePersistentTasks();
  const [columns, setColumns] = useState<Record<string, PersistentTask[]>>({});

  // Group tasks by status when tasks change
  useEffect(() => {
    if (!tasks) return;

    // Initialize columns with empty arrays
    const newColumns: Record<string, PersistentTask[]> = {};
    statusColumns.forEach(column => {
      newColumns[column.id] = [];
    });

    // Group tasks by status
    tasks.forEach(task => {
      if (newColumns[task.status]) {
        newColumns[task.status].push(task);
      } else {
        // Handle tasks with unknown status by putting them in pending
        newColumns.pending.push(task);
      }
    });

    setColumns(newColumns);
  }, [tasks]);

  // Handle drag end
  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    // If there's no destination or the item was dropped back into its original position
    if (!destination ||
        (destination.droppableId === source.droppableId &&
         destination.index === source.index)) {
      return;
    }

    // Get the task being moved
    const task = tasks.find(t => t.id === draggableId);
    if (!task || !user) return;

    // Update task status
    const newStatus = destination.droppableId as TaskStatus;
    updateTaskStatus(draggableId, newStatus);

    // Optimistically update the UI
    const sourceColumn = [...columns[source.droppableId]];
    const destColumn = [...columns[destination.droppableId]];
    
    // Remove from source column
    const [removed] = sourceColumn.splice(source.index, 1);
    
    // Add to destination column
    destColumn.splice(destination.index, 0, { ...removed, status: newStatus });

    // Update columns state
    setColumns({
      ...columns,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn
    });
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-2"></div>
          <p className="text-light">Loading tasks...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-error text-xl mb-2">Error</div>
          <p className="text-light/60">{error}</p>
          <button
            onClick={() => loadTasks()}
            className="mt-4 px-4 py-2 bg-primary text-dark rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render task board
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Task Board</h1>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statusColumns.map(column => (
            <div 
              key={column.id}
              className="bg-dark-200 rounded-lg overflow-hidden flex flex-col h-[calc(100vh-180px)]"
            >
              <div className="p-4 bg-dark-300 border-b border-dark-400">
                <h2 className="font-bold">
                  {column.title} ({columns[column.id]?.length || 0})
                </h2>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex-1 overflow-y-auto p-2"
                  >
                    {columns[column.id]?.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id || ''}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-dark-100 p-3 rounded-lg mb-2 border border-dark-400 hover:border-primary transition-colors"
                          >
                            <div className="font-medium mb-1 truncate">
                              {task.title}
                            </div>
                            <div className="text-sm text-light/60 truncate">
                              {task.description}
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <div className={`text-xs px-2 py-1 rounded-full ${
                                task.priority === 'high' ? 'bg-error/20 text-error' :
                                task.priority === 'medium' ? 'bg-warning/20 text-warning' :
                                'bg-info/20 text-info'
                              }`}>
                                {task.priority}
                              </div>
                              {task.owner_id && (
                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                                  {task.owner_id.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              
              <div className="p-3 border-t border-dark-400">
                <button className="w-full p-2 text-center rounded-lg border border-dashed border-light/20 text-light/40 hover:border-primary hover:text-primary transition-colors text-sm">
                  + Add Task
                </button>
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default TaskBoard;
