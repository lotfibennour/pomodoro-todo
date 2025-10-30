// app/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCircle,
  ChevronDown,
  Circle,
  Clock,
  Cog,
  Flag,
  ListTodo,
  Minus,
  Mosque,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Settings,
  SkipForward,
  Trash2,
  X,
  Hourglass,
  LayoutGrid,
  Timer,
  LogOut,
  HelpCircle,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Waypoints
} from 'lucide-react';

// Shadcn components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PrayTime } from 'praytime';

/* --- Types --- */
interface Task {
  id: number;
  name: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  isComplete: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt?: string;
  updatedAt?: string;
}

interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface NextPrayer {
  name: string;
  time: string;
}

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

type IconName = 
  | 'grid_view' | 'check_circle' | 'timer' | 'settings' | 'help' | 'logout'
  | 'hourglass_top' | 'mosque' | 'close' | 'restart_alt' | 'pause' | 'play'
  | 'skip_next' | 'list_alt' | 'add_circle' | 'delete' | 'minus' | 'plus'
  | 'sun' | 'moon' | 'sunrise' | 'sunset' | 'waypoint' | 'bell' | 'check';

/* --- Prayer Time Utilities --- */
const praytime = new PrayTime();
const times = praytime.method('France').location([50.531036, 2.639260]).timezone('Europe/Paris').format('24h').getTimes();

const mockPrayerTimes: PrayerTimes = {
  Fajr: times.fajr,
  Dhuhr: times.dhuhr,
  Asr: times.asr,
  Maghrib: times.maghrib,
  Isha: times.isha,
};

/**
 * Finds the next prayer time based on the current time.
 */
function getNextPrayerTime(prayerTimes: PrayerTimes): NextPrayer | null {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  for (const prayerName of prayerOrder) {
    const timeString = prayerTimes[prayerName];
    
    if (!timeString || !timeString.match(/^\d{2}:\d{2}$/)) {
      continue;
    }
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const prayerMinutes = hours * 60 + minutes;

    if (prayerMinutes > currentMinutes) {
      return { 
        name: prayerName, 
        time: timeString 
      };
    }
  }

  if (prayerTimes.Fajr) {
    return { 
        name: 'Fajr (Tomorrow)', 
        time: prayerTimes.Fajr
    };
  }

  return null;
}

const nextPrayerTime = getNextPrayerTime(mockPrayerTimes);

// Icon component with proper typing
const Icon = ({ name, className = "w-5 h-5" }: { name: IconName; className?: string }) => {
  const icons = {
    grid_view: <LayoutGrid className={className} />,
    check_circle: <CheckCircle className={className} />,
    timer: <Timer className={className} />,
    settings: <Settings className={className} />,
    help: <HelpCircle className={className} />,
    logout: <LogOut className={className} />,
    hourglass_top: <Hourglass className={className} />,
    mosque: <Timer className={className} />,
    close: <X className={className} />,
    restart_alt: <RefreshCw className={className} />,
    pause: <Pause className={className} />,
    play: <Play className={className} />,
    skip_next: <SkipForward className={className} />,
    list_alt: <ListTodo className={className} />,
    add_circle: <Plus className={className} />,
    delete: <Trash2 className={className} />,
    minus: <Minus className="w-4 h-4" />,
    plus: <Plus className="w-4 h-4" />,
    sun: <Sun className={className} />,
    moon: <Moon className={className} />,
    sunrise: <Sunrise className={className} />,
    sunset: <Sunset className={className} />,
    waypoint: <Waypoints className={className} />,
    bell: <Bell className={className} />,
    check: <Check className={className} />,
  };
  return icons[name] || <Circle className={className} />;
};

/* --- Main App Component --- */
export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes>(mockPrayerTimes);
  const [nextPrayer, setNextPrayer] = useState<NextPrayer>({ 
    name: nextPrayerTime?.name || 'Fajr', 
    time: nextPrayerTime?.time || '06:00' 
  });
  const [isLoading, setIsLoading] = useState(true);

  // Timer State
  const [timerMode, setTimerMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [wasTimerRunningBeforePrayer, setWasTimerRunningBeforePrayer] = useState(false);
  
  // Modal State
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [isPrayerAlertOpen, setIsPrayerAlertOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [newTaskName, setNewTaskName] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const tasksData = await response.json();
        setTasks(tasksData);
      } else {
        console.error('Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Timer Countdown Logic
  useEffect(() => {
    if (!isTimerRunning || !isTimerModalOpen) return;

    if (timeLeft <= 0) {
      setIsTimerRunning(false);
      // Handle timer completion - update task in database
      if (timerMode === 'focus' && selectedTask) {
        const updateTaskPomodoros = async () => {
          const updatedTask = {
            ...selectedTask,
            completedPomodoros: selectedTask.completedPomodoros + 1,
          };

          // Check if task is now complete
          if (updatedTask.completedPomodoros >= updatedTask.estimatedPomodoros) {
            updatedTask.isComplete = true;
          }

          try {
            const response = await fetch(`/api/tasks/${selectedTask.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updatedTask),
            });

            if (response.ok) {
              const result = await response.json();
              setTasks(prev => prev.map(t => t.id === selectedTask.id ? result : t));
              // Update selected task if it's still the same
              if (selectedTask && selectedTask.id === result.id) {
                setSelectedTask(result);
              }
            } else {
              console.error('Failed to update task pomodoros');
            }
          } catch (error) {
            console.error('Error updating task pomodoros:', error);
          }
        };

        updateTaskPomodoros();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, isTimerModalOpen, timerMode, selectedTask]);

  // Prayer Time API Fetching Logic
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

  // --- Event Handlers ---

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTaskName,
          estimatedPomodoros: 1,
          completedPomodoros: 0,
          isComplete: false,
          priority: 'medium',
        }),
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks(prev => [newTask, ...prev]);
        setNewTaskName("");
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
        headers: {
          'Content-Type': 'application/json',
        },
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

    const updatedTask = { ...task, isComplete: !task.isComplete };
    
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
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

  const handleResumeAfterPrayer = () => {
    setIsPrayerAlertOpen(false);
    if (wasTimerRunningBeforePrayer) {
      setIsTimerRunning(true);
      setWasTimerRunningBeforePrayer(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
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

  const getTotalTime = () => {
    switch (timerMode) {
      case 'focus': return 25 * 60;
      case 'shortBreak': return 5 * 60;
      case 'longBreak': return 15 * 60;
      default: return 25 * 60;
    }
  };

  // Get next available task for prayer alert
  const getNextAvailableTask = (): Task | null => {
    const incompleteTasks = tasks.filter(t => !t.isComplete);
    return incompleteTasks.length > 0 ? incompleteTasks[0] : tasks[0] || null;
  };

  const openAddTaskModal = () => {
    setEditingTask(null);
    setNewTaskName("");
    setIsTaskModalOpen(true);
  };

  const openDeleteModal = (task: Task) => {
    setEditingTask(task);
    setIsDeleteModalOpen(true);
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  // Add loading state
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
      
      {/* --- Sidebar --- */}
      <Sheet>
        <Card className="flex h-screen min-h-[700px] w-64 flex-col justify-between rounded-none border-r">
          <div className="flex flex-col gap-8 p-4">
            <div className="flex items-center gap-3 p-2">
              <div className="text-primary flex items-center justify-center rounded-lg bg-primary/20 p-2">
                <Icon name="hourglass_top" className="w-6 h-6" />
              </div>
              <h1 className="text-lg font-bold">PrayerFlow</h1>
            </div>
            
            {/* Navigation Links */}
            <div className="flex flex-col gap-2">
              <Button variant="secondary" className="justify-start">
                <Icon name="check_circle" />
                <span className="ml-2">Home</span>
              </Button>
              <Button variant="ghost" className="justify-start" onClick={() => setIsSettingsModalOpen(true)}>
                <Icon name="settings" />
                <span className="ml-2">Settings</span>
              </Button>
            </div>
            
            {/* Prayer Times */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Prayer Times</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {Object.entries(prayerTimes).map(([prayer, time]) => (
                  <div 
                    key={prayer}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                      nextPrayer.name === prayer 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    <Icon 
                      name={
                        prayer === 'Fajr' ? 'sunrise' :
                        prayer === 'Dhuhr' ? 'sun' :
                        prayer === 'Asr' ? 'sun' :
                        prayer === 'Maghrib' ? 'sunset' : 'moon'
                      } 
                      className="text-xl" 
                    />
                    <p className="flex-1 text-sm font-medium">{prayer}</p>
                    <span className={`text-xs ${nextPrayer.name === prayer ? 'font-semibold' : 'text-muted-foreground'}`}>
                      {time}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* User Profile Section */}
          <CardFooter className="flex flex-col gap-1 border-t p-4">
            <div className="flex items-center gap-3 p-3">
              <img className="size-10 rounded-full" src="https://placehold.co/100x100/E2E8F0/4A5568?text=A" alt="User avatar" />
              <div className="flex flex-col">
                <h1 className="text-base font-medium">Aisha Khan</h1>
                <p className="text-sm font-normal text-muted-foreground">aisha.k@email.com</p>
              </div>
            </div>
          </CardFooter>
        </Card>
      </Sheet>
      
      {/* --- Main Content --- */}
      <main className="grid flex-1 grid-cols-12 gap-6 p-6 overflow-y-auto">
        
        {/* Task List Section */}
        <section className="col-span-12 flex flex-col gap-4 md:col-span-12 lg:col-span-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-4xl font-black tracking-tight">Today&apos;s Focus</h1>
            <Button onClick={openAddTaskModal}>
              <Icon name="add_circle" />
              <span className="ml-2">Add New Task</span>
            </Button>
          </div>

          {/* Task Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Task Name</TableHead>
                    <TableHead className="text-center">Pomodoros</TableHead>
                    <TableHead className="text-center">Priority</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No tasks yet. Add your first task to get started!
                      </TableCell>
                    </TableRow>
                  ) : (
                    tasks.map(task => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <input 
                            className="h-5 w-5 rounded-md border-primary text-primary focus:ring-primary" 
                            type="checkbox"
                            checked={task.isComplete}
                            onChange={() => handleToggleTaskComplete(task.id)}
                          />
                        </TableCell>
                        <TableCell 
                          className={`font-medium ${task.isComplete ? 'text-muted-foreground line-through' : ''}`}
                        >
                          {task.name}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          <span className="font-semibold text-foreground">{task.completedPomodoros}</span> / {task.estimatedPomodoros} 🍅
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getPriorityBadgeVariant(task.priority)}>
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            {!task.isComplete && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleStartPomodoro(task)}
                              >
                                Start
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditTask(task)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openDeleteModal(task)}
                            >
                              <Icon name="delete" className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

      </main>

      {/* --- Modals / Popups --- */}

      {/* Add/Edit Task Modal */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            <DialogDescription>
              {editingTask ? 'Update your task details.' : 'Create a new task to focus on.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={editingTask ? handleUpdateTask : handleAddTask} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-name">Task Name</Label>
              <Input 
                id="task-name"
                value={editingTask ? editingTask.name : newTaskName}
                onChange={(e) => editingTask 
                  ? setEditingTask({...editingTask, name: e.target.value})
                  : setNewTaskName(e.target.value)
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
                  onClick={() => editingTask && setEditingTask({
                    ...editingTask, 
                    estimatedPomodoros: Math.max(1, editingTask.estimatedPomodoros - 1)
                  })}
                >
                  <Icon name="minus" />
                </Button>
                <Input 
                  id="pomodoro-est"
                  type="number" 
                  min="1"
                  value={editingTask ? editingTask.estimatedPomodoros : 1}
                  readOnly
                  className="text-center font-bold"
                />
                <Button 
                  type="button"
                  variant="outline" 
                  size="icon"
                  onClick={() => editingTask && setEditingTask({
                    ...editingTask, 
                    estimatedPomodoros: editingTask.estimatedPomodoros + 1
                  })}
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
                    variant={editingTask?.priority === priority ? 'default' : 'outline'}
                    className={
                      editingTask?.priority === priority 
                        ? priority === 'low' 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : priority === 'medium'
                          ? 'bg-amber-500 hover:bg-amber-600'
                          : 'bg-red-500 hover:bg-red-600'
                        : ''
                    }
                    onClick={() => editingTask && setEditingTask({...editingTask, priority})}
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
                  onClick={() => openDeleteModal(editingTask)}
                >
                  <Icon name="delete" className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
              <div className={`flex gap-2 ${editingTask ? 'ml-auto' : 'w-full justify-end'}`}>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setIsTaskModalOpen(false)}
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

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{editingTask?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteTask}
            >
              <Icon name="delete" className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pomodoro Timer Modal */}
      <Dialog open={isTimerModalOpen} onOpenChange={setIsTimerModalOpen}>
        <DialogContent className="sm:max-w-sm  bg-background/80 backdrop-blur-md" 
        onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-center">Pomodoro Timer</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-6">
            <div className="relative flex h-64 w-64 items-center justify-center">
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
                <circle className="stroke-muted" cx="50" cy="50" fill="none" r="45" strokeWidth="4"></circle>
                <circle 
                  className="stroke-primary -rotate-90 origin-center transform transition-all duration-300" 
                  cx="50" cy="50" fill="none" r="45" 
                  strokeDasharray="283" 
                  strokeDashoffset={283 - (timeLeft / getTotalTime()) * 283} 
                  strokeLinecap="round" 
                  strokeWidth="4"
                ></circle> 
              </svg>
              <div className="z-10 flex flex-col items-center justify-center text-center">
                <p className="text-sm font-medium uppercase tracking-widest text-primary capitalize">
                  {timerMode === 'focus' ? 'Focus' : timerMode === 'shortBreak' ? 'Short Break' : 'Long Break'}
                </p>
                <h1 className="text-6xl font-bold" style={{fontVariantNumeric: 'tabular-nums'}}>
                  {formatTime(timeLeft)}
                </h1>
                <p className="mt-1 text-base text-muted-foreground truncate max-w-full px-2">
                  {selectedTask?.name || 'No task selected'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handlePomodoroControl('reset')}
              >
                <Icon name="restart_alt" className="w-5 h-5" />
              </Button>
              <Button 
                size="lg"
                className="h-16 w-16 rounded-full"
                onClick={() => handlePomodoroControl('toggle')}
              >
                {isTimerRunning ? <Icon name="pause" className="w-6 h-6" /> : <Icon name="play" className="w-6 h-6" />}
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handlePomodoroControl('skip')}
              >
                <Icon name="skip_next" className="w-5 h-5" />
              </Button>
            </div>
            
            <Card className="w-full">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon name="mosque" />
                </div>
                <p className="flex-1 truncate text-sm">
                  Next: {nextPrayer.name} - {nextPrayer.time}
                </p>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Prayer Alert Modal */}
      <Dialog open={isPrayerAlertOpen} onOpenChange={setIsPrayerAlertOpen}>
        <DialogContent className="sm:max-w-md  bg-background/80 backdrop-blur-md" 
        onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="mosque" className="text-primary" />
              {nextPrayer.name} Time
            </DialogTitle>
            <DialogDescription>
              It's time to pray. Timer was {wasTimerRunningBeforePrayer ? 'paused' : 'already stopped'}.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button 
              variant="outline" 
              onClick={() => setIsPrayerAlertOpen(false)}
              className="w-full sm:w-auto"
            >
              Dismiss
            </Button>
            <Button 
              onClick={handleResumeAfterPrayer}
              className="w-full sm:w-auto"
            >
              Resume Timer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl">Settings</DialogTitle>
            <DialogDescription>
              Configure your location, prayer times, and notification preferences.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="location" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="calculation">Calculation</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="location" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Set Your Location</h3>
                <p className="text-sm text-muted-foreground">
                  Provide your location for accurate prayer time calculations.
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="e.g. New York" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="e.g. United States" />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="auto-detect" />
                <Label htmlFor="auto-detect">Auto-detect location</Label>
              </div>
            </TabsContent>
            
            <TabsContent value="calculation" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Calculation & Time Zone</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="calculation-method">Calculation Method</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="isna">Islamic Society of North America (ISNA)</SelectItem>
                      <SelectItem value="mwl">Muslim World League</SelectItem>
                      <SelectItem value="egypt">Egyptian General Authority of Survey</SelectItem>
                      <SelectItem value="makkah">Umm Al-Qura University, Makkah</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Time Zone</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="et">(GMT-05:00) Eastern Time (US & Canada)</SelectItem>
                      <SelectItem value="ct">(GMT-06:00) Central Time (US & Canada)</SelectItem>
                      <SelectItem value="mt">(GMT-07:00) Mountain Time (US & Canada)</SelectItem>
                      <SelectItem value="pt">(GMT-08:00) Pacific Time (US & Canada)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Notification Preferences</h3>
                <p className="text-sm text-muted-foreground">
                  Configure how you want to be notified about prayer times.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="prayer-notifications">Prayer Time Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when it's time for prayer
                    </p>
                  </div>
                  <Switch id="prayer-notifications" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="timer-notifications">Timer Completion Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when a pomodoro session completes
                    </p>
                  </div>
                  <Switch id="timer-notifications" defaultChecked />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button 
              onClick={() => setIsSettingsModalOpen(false)}
            >
              <Icon name="check" className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}