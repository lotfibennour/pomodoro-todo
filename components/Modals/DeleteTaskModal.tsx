import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Icon } from '../Icons';
import { Task } from '@/types';
import { useTranslations } from 'next-intl';


interface DeleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTask: Task | null;
  onDelete: () => void;
}

export const DeleteTaskModal: React.FC<DeleteTaskModalProps> = ({
  isOpen,
  onClose,
  editingTask,
  onDelete
}) => {
  const t = useTranslations('tasks');
  const tCommon = useTranslations('common');
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{tCommon('delete')} {t('taskName').toLowerCase()}</DialogTitle>
          <DialogDescription>
            {t('deleteConfirm', { taskName: editingTask?.name || '' })}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            {tCommon('cancel')}
          </Button>
          <Button 
            variant="destructive"
            onClick={onDelete}
          >
            <Icon name="delete" className="w-4 h-4 mr-2" />
            {tCommon('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};