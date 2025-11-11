// components/tasks/task-list.tsx
'use client';

import { useState } from 'react';
import { Task } from '@/types';
import { TaskItem } from './task-item';
import { NewTaskForm } from './new-task-form';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onTaskDelete: (taskId: string) => void;
}

export function TaskList({ tasks, onTaskUpdate, onTaskCreate, onTaskDelete }: TaskListProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black tracking-tight">Today's Focuss</h1>
        <NewTaskForm onSubmit={onTaskCreate} />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'active', 'completed'] as const).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`flex h-8 shrink-0 items-center justify-center rounded-lg border px-3 text-sm font-medium ${
              filter === filterType
                ? 'bg-primary text-white border-primary'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onUpdate={onTaskUpdate}
            onDelete={onTaskDelete}
          />
        ))}
      </div>
    </div>
  );
}