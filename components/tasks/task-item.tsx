// components/tasks/task-item.tsx
'use client';

import { useState } from 'react';
import { Task } from '@/types';

interface TaskItemProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStartPomodoro?: (task: Task) => void;
}

export function TaskItem({ task, onUpdate, onDelete, onStartPomodoro }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.name);

  const handleToggleComplete = () => {
    onUpdate({
      ...task,
      isComplete: !task.isComplete,
      completedPomodoros: !task.isComplete ? task.estimatedPomodoros : task.completedPomodoros,
    });
  };

  const handleSaveEdit = () => {
    if (editedTitle.trim()) {
      onUpdate({ ...task, name: editedTitle.trim() });
      setIsEditing(false);
    }
  };

  const handlePomodoroComplete = () => {
    const newCompletedPomodoros = task.completedPomodoros + 1;
    onUpdate({
      ...task,
      completedPomodoros: newCompletedPomodoros,
      isComplete: newCompletedPomodoros >= task.estimatedPomodoros,
    });
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200';
      case 'medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200';
    }
  };

  return (
    <div className={`flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 ${
      task.isComplete ? 'opacity-60' : ''
    }`}>
      <input
        type="checkbox"
        checked={task.isComplete}
        onChange={handleToggleComplete}
        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
      />
      
      <div className="flex-1">
        {isEditing ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
            className="w-full text-sm font-medium text-gray-800 bg-transparent border-b border-gray-300 focus:outline-none focus:border-primary"
            autoFocus
          />
        ) : (
          <span
            className={`text-sm font-medium ${
              task.isComplete ? 'text-gray-500 line-through' : 'text-gray-800'
            } cursor-pointer`}
            onDoubleClick={() => setIsEditing(true)}
          >
            {task.name}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        
        <div className="flex items-center gap-1 text-sm text-red-500">
          <span className="material-symbols-outlined text-base">local_fire_department</span>
          <span>{task.completedPomodoros}/{task.estimatedPomodoros}</span>
        </div>

        {onStartPomodoro && (
          <button
            onClick={() => onStartPomodoro(task)}
            disabled={task.isComplete}
            className={`flex h-8 cursor-pointer items-center justify-center overflow-hidden rounded-md px-3 text-xs font-medium ${
              task.isComplete
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {task.isComplete ? 'Done' : 'Start'}
          </button>
        )}

        <button
          onClick={() => onDelete(String(task.id))}
          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500"
        >
          <span className="material-symbols-outlined text-base">delete</span>
        </button>
      </div>
    </div>
  );
}