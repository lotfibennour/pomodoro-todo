// components/tasks/new-task-form.tsx
'use client';

import { useState } from 'react';
import { Task } from '@/types';

interface NewTaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

export function NewTaskForm({ onSubmit }: NewTaskFormProps) {
  const [title, setTitle] = useState('');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [category, setCategory] = useState('Work');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit({
        title: title.trim(),
        completed: false,
        estimatedPomodoros,
        completedPomodoros: 0,
        priority,
        category,
      });
      setTitle('');
      setEstimatedPomodoros(1);
      setPriority('medium');
      setCategory('Work');
      setIsExpanded(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {!isExpanded ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a new task..."
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-primary focus:ring-primary"
            onFocus={() => setIsExpanded(true)}
          />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title..."
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-primary focus:ring-primary"
            autoFocus
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pomodoros 🍅
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEstimatedPomodoros(Math.max(1, estimatedPomodoros - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
                >
                  -
                </button>
                <input
                  type="number"
                  value={estimatedPomodoros}
                  onChange={(e) => setEstimatedPomodoros(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 rounded-lg border border-gray-200 bg-white px-2 py-1 text-center text-sm focus:border-primary focus:ring-primary"
                  min="1"
                />
                <button
                  type="button"
                  onClick={() => setEstimatedPomodoros(estimatedPomodoros + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Task['priority'])}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:ring-primary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category"
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-primary text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary/90"
            >
              Add Task
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}