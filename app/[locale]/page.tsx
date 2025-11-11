'use client';
import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

// Shadcn components
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';

// Custom hooks
import { useTasks } from '@/hooks/useTasks';
import { useTimer } from '@/hooks/useTimer';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useGoogleSync } from '@/hooks/useGoogleSync';

// Components
import { Sidebar } from '@/components/Sidebar';
import { TaskTable } from '@/components/TaskTable';
import { AddEditTaskModal } from '@/components/Modals/AddEditTaskModal';
import { DeleteTaskModal } from '@/components/Modals/DeleteTaskModal';
import { TimerModal } from '@/components/Modals/TimerModal';
import { PrayerAlertModal } from '@/components/Modals/PrayerAlertModal';
import { SettingsModal } from '@/components/Modals/SettingsModal';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import QuranPlayer from '@/components/quran-player';

// Types
import { Task, TimerMode } from '@/types';

export default function App() {
  // State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [isPrayerAlertOpen, setIsPrayerAlertOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [newTaskEstimatedPomodoros, setNewTaskEstimatedPomodoros] = useState(1);
  const [wasTimerRunningBeforePrayer, setWasTimerRunningBeforePrayer] = useState(false);

  // Custom Hooks
  const { tasks, setTasks, isLoading, initialLoadComplete, fetchTasks } = useTasks();
  const { 
    timerMode, 
    setTimerMode, 
    timeLeft, 
    setTimeLeft, 
    isTimerRunning, 
    setIsTimerRunning, 
    formatTime, 
    getTotalTime 
  } = useTimer();
  
  const { prayerTimes, nextPrayer } = usePrayerTimes();
  const { 
    accessToken, 
    isSyncing, 
    lastSync, 
    syncStatus, 
    syncStats,
    handleManualSync, 
    handleDisconnect, 
    setAccessToken,
    canSync 
  } = useGoogleSync(tasks, initialLoadComplete);

  // Timer effect
  useEffect(() => {
    if (!isTimerRunning || !isTimerModalOpen) return;

    if (timeLeft <= 0) {
      setIsTimerRunning(false);
      if (timerMode === 'focus' && selectedTask) {
        handlePomodoroComplete(selectedTask.id);
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, isTimerModalOpen, timerMode, selectedTask]);

  // Prayer time effect
  useEffect(() => {
    const checkPrayerMatch = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (currentTime === nextPrayer.time) {
        setIsPrayerAlertOpen(true);
        if (isTimerRunning) {
          setWasTimerRunningBeforePrayer(true);
          setIsTimerRunning(false);
        }
      }
    };
    const interval = setInterval(checkPrayerMatch, 1000 * 30);
    return () => clearInterval(interval);
  }, [nextPrayer, isTimerRunning]);

  // Event Handlers
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTaskName,
          estimatedPomodoros: newTaskEstimatedPomodoros,
          completedPomodoros: 0,
          isComplete: false,
          priority: newTaskPriority as 'low' | 'medium' | 'high',
        }),
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks(prev => [newTask, ...prev]);
        setNewTaskName("");
        setNewTaskEstimatedPomodoros(1);
        setIsTaskModalOpen(false);
      } else {
        console.error('Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    
    try {
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTask),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(prev => prev.map(t => t.id === editingTask.id ? updatedTask : t));
        setIsTaskModalOpen(false);
        setEditingTask(null);
      } else {
        console.error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };
  
  const handleDeleteTask = async () => {
    if (!editingTask) return;
    
    try {
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTasks(prev => prev.filter(t => t.id !== editingTask.id));
        setIsDeleteModalOpen(false);
        setEditingTask(null);
      } else {
        console.error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleToggleTaskComplete = async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask = { 
      ...task, 
      isComplete: !task.isComplete,
      completedPomodoros: !task.isComplete ? task.estimatedPomodoros : 0
    };
    
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });

      if (response.ok) {
        const result = await response.json();
        setTasks(prev => prev.map(t => t.id === taskId ? result : t));
      } else {
        console.error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask({...task});
    setIsTaskModalOpen(true);
  };

  const handleStartPomodoro = (task: Task) => {
    setSelectedTask(task);
    setTimeLeft(25 * 60);
    setTimerMode('focus');
    setIsTimerModalOpen(true);
    setIsTimerRunning(true);
  };

  const handlePomodoroComplete = async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newCompletedPomodoros = task.completedPomodoros + 1;
    const isComplete = newCompletedPomodoros >= task.estimatedPomodoros;

    const updatedTask = { 
      ...task, 
      completedPomodoros: newCompletedPomodoros,
      isComplete: isComplete
    };
    
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });

      if (response.ok) {
        const result = await response.json();
        setTasks(prev => prev.map(t => t.id === taskId ? result : t));
        
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask(result);
        }
      } else {
        console.error('Failed to update task pomodoros');
      }
    } catch (error) {
      console.error('Error updating task pomodoros:', error);
    }
  };

  const handleResumeAfterPrayer = () => {
    setIsPrayerAlertOpen(false);
    if (wasTimerRunningBeforePrayer) {
      setIsTimerRunning(true);
      setWasTimerRunningBeforePrayer(false);
    }
  };

  const handlePomodoroControl = (action: 'toggle' | 'reset' | 'skip') => {
    switch (action) {
      case 'toggle':
        setIsTimerRunning(!isTimerRunning);
        break;
      case 'reset':
        if (timerMode === 'focus') {
          setTimeLeft(25 * 60);
        } else if (timerMode === 'shortBreak') {
          setTimeLeft(5 * 60);
        } else {
          setTimeLeft(15 * 60);
        }
        setIsTimerRunning(false);
        break;
      case 'skip':
        if (timerMode === 'focus') {
          setTimerMode('shortBreak');
          setTimeLeft(5 * 60);
        } else {
          setTimerMode('focus');
          setTimeLeft(25 * 60);
        }
        setIsTimerRunning(true);
        break;
      default:
        break;
    }
  };

  const openAddTaskModal = () => {
    setEditingTask(null);
    setNewTaskName("");
    setNewTaskPriority('medium');
    setNewTaskEstimatedPomodoros(1);
    setIsTaskModalOpen(true);
  };

  const openDeleteModal = (task: Task) => {
    setEditingTask(task);
    setIsDeleteModalOpen(true);
  };

  const handleConnectGoogle = () => {
    window.location.href = '/api/google-tasks/auth';
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background font-sans text-foreground">
      <Sidebar 
        prayerTimes={prayerTimes} 
        nextPrayer={nextPrayer} 
        onSettingsOpen={() => setIsSettingsModalOpen(true)} 
      />
      
      <main className="grid flex-1 grid-cols-12 gap-6 p-6 overflow-y-auto">
        <section className="col-span-12 flex flex-col gap-4 md:col-span-12 lg:col-span-12">
          <TaskTable
            tasks={tasks}
            onToggleComplete={handleToggleTaskComplete}
            onStartPomodoro={handleStartPomodoro}
            onEditTask={handleEditTask}
            onDeleteTask={openDeleteModal}
            onAddTask={openAddTaskModal}
            accessToken={accessToken}
            isSyncing={isSyncing}
            syncStatus={syncStatus}
            lastSync={lastSync}
            syncStats={syncStats}
            onManualSync={handleManualSync}
            onDisconnect={handleDisconnect}
            onConnectGoogle={handleConnectGoogle}
            canSync={canSync}
          />
        </section>
      </main>

      <QuranPlayer />

      {/* Language Switcher
      <div className="fixed left-1/2 transform -translate-x-1/2 z-50">
        <LanguageSwitcher />
      </div> */}

      {/* Modals */}
      <AddEditTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        editingTask={editingTask}
        newTaskName={newTaskName}
        newTaskPriority={newTaskPriority}
        newTaskEstimatedPomodoros={newTaskEstimatedPomodoros}
        onSetEditingTask={setEditingTask}
        onSetNewTaskName={setNewTaskName}
        onSetNewTaskPriority={setNewTaskPriority}
        onSetNewTaskEstimatedPomodoros={setNewTaskEstimatedPomodoros}
        onSubmit={editingTask ? handleUpdateTask : handleAddTask}
        onDelete={openDeleteModal}
      />

      <DeleteTaskModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        editingTask={editingTask}
        onDelete={handleDeleteTask}
      />

      <TimerModal
        isOpen={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
        timerMode={timerMode}
        timeLeft={timeLeft}
        isTimerRunning={isTimerRunning}
        selectedTask={selectedTask}
        nextPrayer={nextPrayer}
        formatTime={formatTime}
        getTotalTime={getTotalTime}
        onTimerControl={handlePomodoroControl}
      />

      <PrayerAlertModal
        isOpen={isPrayerAlertOpen}
        onClose={() => setIsPrayerAlertOpen(false)}
        nextPrayer={nextPrayer}
        wasTimerRunningBeforePrayer={wasTimerRunningBeforePrayer}
        onResumeAfterPrayer={handleResumeAfterPrayer}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}