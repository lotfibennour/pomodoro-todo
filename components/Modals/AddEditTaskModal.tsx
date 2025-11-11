import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Icon } from '../Icons';
import { Task } from '@/types';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('tasks');
  const tCommon = useTranslations('common');

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

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return t('low');
      case 'medium': return t('medium');
      case 'high': return t('high');
      default: return priority;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingTask ? t('editTask') : t('addNewTask')}</DialogTitle>
          <DialogDescription>
            {editingTask ? t('updateTask') : t('createTask')}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-name">{t('taskName')}</Label>
            <Input 
              id="task-name"
              value={editingTask ? editingTask.name : newTaskName}
              onChange={(e) => editingTask 
                ? onSetEditingTask({...editingTask, name: e.target.value})
                : onSetNewTaskName(e.target.value)
              }
              placeholder={t('taskName')}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pomodoro-est">{t('estimatedPomodoros')} 🍅</Label>
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
            <Label>{t('priority')}</Label>
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
                  {getPriorityText(priority)}
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
                {tCommon('delete')}
              </Button>
            )}
            <div className={`flex gap-2 ${editingTask ? 'ml-auto' : 'w-full justify-end'}`}>
              <Button 
                type="button"
                variant="outline" 
                onClick={onClose}
              >
                {tCommon('cancel')}
              </Button>
              <Button type="submit">
                {editingTask ? tCommon('save') : tCommon('add')}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};