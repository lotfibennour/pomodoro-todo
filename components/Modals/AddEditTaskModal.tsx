import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Icon } from '../Icons';
import { Task } from '@/types';

interface AddEditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTask: Task | null;
  newTaskName: string;
  newTaskPriority: string;
  newTaskEstimatedPomodoros: number;
  onSetEditingTask: (task: Task | null) => void;
  onSetNewTaskName: (name: string) => void;
  onSetNewTaskPriority: (priority: string) => void;
  onSetNewTaskEstimatedPomodoros: (pomodoros: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete: (task: Task) => void;
}

export const AddEditTaskModal: React.FC<AddEditTaskModalProps> = ({
  isOpen,
  onClose,
  editingTask,
  newTaskName,
  newTaskPriority,
  newTaskEstimatedPomodoros,
  onSetEditingTask,
  onSetNewTaskName,
  onSetNewTaskPriority,
  onSetNewTaskEstimatedPomodoros,
  onSubmit,
  onDelete
}) => {
  const currentEstimatedPomodoros = editingTask ? editingTask.estimatedPomodoros : newTaskEstimatedPomodoros;

  const handleDecreasePomodoros = () => {
    if (editingTask) {
      onSetEditingTask({
        ...editingTask,
        estimatedPomodoros: Math.max(1, editingTask.estimatedPomodoros - 1)
      });
    } else {
      onSetNewTaskEstimatedPomodoros(Math.max(1, newTaskEstimatedPomodoros - 1));
    }
  };

  const handleIncreasePomodoros = () => {
    if (editingTask) {
      onSetEditingTask({
        ...editingTask,
        estimatedPomodoros: editingTask.estimatedPomodoros + 1
      });
    } else {
      onSetNewTaskEstimatedPomodoros(newTaskEstimatedPomodoros + 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          <DialogDescription>
            {editingTask ? 'Update your task details.' : 'Create a new task to focus on.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-name">Task Name</Label>
            <Input 
              id="task-name"
              value={editingTask ? editingTask.name : newTaskName}
              onChange={(e) => editingTask 
                ? onSetEditingTask({...editingTask, name: e.target.value})
                : onSetNewTaskName(e.target.value)
              }
              placeholder="Enter task name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pomodoro-est">Estimate Pomodoros 🍅</Label>
            <div className="flex items-center gap-2">
              <Button 
                type="button"
                variant="outline" 
                size="icon"
                onClick={handleDecreasePomodoros}
              >
                <Icon name="minus" />
              </Button>
              <Input 
                id="pomodoro-est"
                type="number" 
                min="1"
                value={currentEstimatedPomodoros}
                readOnly
                className="text-center font-bold"
              />
              <Button 
                type="button"
                variant="outline" 
                size="icon"
                onClick={handleIncreasePomodoros}
              >
                <Icon name="plus" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map(priority => (
                <Button 
                  key={priority}
                  type="button"
                  variant={(editingTask?.priority || newTaskPriority) === priority ? 'default' : 'outline'}
                  className={
                    (editingTask?.priority || newTaskPriority) === priority 
                      ? priority === 'low' 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : priority === 'medium'
                        ? 'bg-amber-500 hover:bg-amber-600'
                        : 'bg-red-500 hover:bg-red-600'
                      : ''
                  }
                  onClick={() => editingTask 
                    ? onSetEditingTask({...editingTask, priority})
                    : onSetNewTaskPriority(priority)
                  }
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            {editingTask && (
              <Button 
                type="button"
                variant="destructive" 
                onClick={() => onDelete(editingTask)}
              >
                <Icon name="delete" className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
            <div className={`flex gap-2 ${editingTask ? 'ml-auto' : 'w-full justify-end'}`}>
              <Button 
                type="button"
                variant="outline" 
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingTask ? 'Update Task' : 'Add Task'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};