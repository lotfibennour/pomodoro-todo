// app/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
// Import icons from lucide-react, which is common with shadcn/ui
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

/* --- Types --- */
interface Task {
  id: number;
  name: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  isComplete: boolean;
  priority: 'low' | 'medium' | 'high';
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

/* --- Mock Data --- */
const mockTasks: Task[] = [
  { id: 1, name: 'Finalize project report', estimatedPomodoros: 4, completedPomodoros: 2, isComplete: false, priority: 'high' },
  { id: 2, name: 'Draft weekly update email', estimatedPomodoros: 2, completedPomodoros: 1, isComplete: false, priority: 'medium' },
  { id: 3, name: 'Review Q3 financial statements', estimatedPomodoros: 3, completedPomodoros: 3, isComplete: true, priority: 'high' },
  { id: 4, name: 'Water the plants', estimatedPomodoros: 1, completedPomodoros: 1, isComplete: true, priority: 'low' },
];

const mockPrayerTimes: PrayerTimes = {
  Fajr: '05:30',
  Dhuhr: '12:15',
  Asr: '15:45',
  Maghrib: '18:00',
  Isha: '19:30',
};

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
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes>(mockPrayerTimes);
  const [nextPrayer, setNextPrayer] = useState<NextPrayer>({ name: 'Dhuhr', time: '12:15' });

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

  // Timer Countdown Logic
  useEffect(() => {
    if (!isTimerRunning || !isTimerModalOpen) return;

    if (timeLeft <= 0) {
      setIsTimerRunning(false);
      // Handle timer completion
      if (timerMode === 'focus' && selectedTask) {
        const updatedTasks = tasks.map(task =>
          task.id === selectedTask.id
            ? { ...task, completedPomodoros: task.completedPomodoros + 1 }
            : task
        );
        setTasks(updatedTasks);
        
        // Check if task is now complete
        const currentTask = updatedTasks.find(t => t.id === selectedTask.id);
        if (currentTask && currentTask.completedPomodoros >= currentTask.estimatedPomodoros) {
          const finalUpdatedTasks = updatedTasks.map(task =>
            task.id === selectedTask.id ? { ...task, isComplete: true } : task
          );
          setTasks(finalUpdatedTasks);
        }
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, isTimerModalOpen, timerMode, selectedTask, tasks]);

  // Prayer Time API Fetching Logic
  useEffect(() => {
    // Mock prayer alert
    const alertTimeout = setTimeout(() => {
      // Pause timer if running
      if (isTimerRunning) {
        setWasTimerRunningBeforePrayer(true);
        setIsTimerRunning(false);
      }
      setIsPrayerAlertOpen(true);
    }, 10000); // Show prayer alert after 10 seconds for demo

    return () => clearTimeout(alertTimeout);
  }, [isTimerRunning]);

  // --- Event Handlers ---

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    const newTask: Task = {
      id: Math.max(0, ...tasks.map(t => t.id)) + 1,
      name: newTaskName,
      estimatedPomodoros: 1,
      completedPomodoros: 0,
      isComplete: false,
      priority: 'medium',
    };
    setTasks([...tasks, newTask]);
    setNewTaskName("");
    setIsTaskModalOpen(false);
  };

  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    setTasks(tasks.map(t => t.id === editingTask.id ? editingTask : t));
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };
  
  const handleDeleteTask = () => {
    if (!editingTask) return;
    setTasks(tasks.filter(t => t.id !== editingTask.id));
    setIsDeleteModalOpen(false);
    setEditingTask(null);
  };

  const handleToggleTaskComplete = (taskId: number) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, isComplete: !t.isComplete } : t
    ));
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

  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark font-display text-text-primary dark:text-slate-200">
      
      {/* --- Sidebar --- */}
      <nav className="flex h-screen min-h-[700px] w-64 flex-col justify-between bg-white p-4 dark:bg-[#192730] border-r border-slate-200 dark:border-slate-700">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3 p-2">
            <div className="text-primary flex items-center justify-center rounded-lg bg-primary/20 p-2">
              <Icon name="hourglass_top" className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-white">PrayerFlow</h1>
          </div>
          
          {/* Navigation Links */}
          <div className="flex flex-col gap-2">
            <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/5" href="#">
              <Icon name="grid_view" />
              <p className="text-sm font-medium">Dashboard</p>
            </a>
            <a className="flex items-center gap-3 rounded-lg bg-primary/20 px-3 py-2 text-primary dark:bg-primary/30" href="#">
              <Icon name="check_circle" />
              <p className="text-sm font-medium">Tasks</p>
            </a>
            <button 
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/5 w-full"
              onClick={() => setIsSettingsModalOpen(true)}
            >
              <Icon name="settings" />
              <p className="text-sm font-medium">Settings</p>
            </button>
          </div>
          
          {/* Prayer Times */}
          <div className="flex flex-col gap-4 border-t border-slate-200 dark:border-slate-700 pt-4">
            <h1 className="text-base font-medium leading-normal text-gray-900 dark:text-white">Prayer Times</h1>
            <div className="flex flex-col gap-2">
              {Object.entries(prayerTimes).map(([prayer, time]) => (
                <div 
                  key={prayer}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                    nextPrayer.name === prayer 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-gray-700 dark:text-slate-300'
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
                  <span className={`text-xs ${nextPrayer.name === prayer ? 'font-semibold' : 'text-gray-500 dark:text-slate-400'}`}>
                    {time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="flex flex-col gap-1 border-t border-slate-200 dark:border-slate-700 pt-2">
          <div className="flex items-center gap-3 p-3">
            <img className="size-10 rounded-full" src="https://placehold.co/100x100/E2E8F0/4A5568?text=A" alt="User avatar" />
            <div className="flex flex-col">
              <h1 className="text-base font-medium text-slate-800 dark:text-white">Aisha Khan</h1>
              <p className="text-sm font-normal text-slate-500 dark:text-slate-400">aisha.k@email.com</p>
            </div>
          </div>
          <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/5" href="#">
            <Icon name="help" />
            <p className="text-sm font-medium">Help</p>
          </a>
          <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/5" href="#">
            <Icon name="logout" />
            <p className="text-sm font-medium">Logout</p>
          </a>
        </div>
      </nav>
      
      {/* --- Main Content --- */}
      <main className="grid flex-1 grid-cols-12 gap-6 p-6 overflow-y-auto">
        
        {/* Task List Section */}
        <section className="col-span-12 flex flex-col gap-4 md:col-span-12 lg:col-span-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-4xl font-black tracking-tight dark:text-white">Today's Focus</h1>
            <button 
              className="flex min-w-[84px] items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary/90"
              onClick={openAddTaskModal}
            >
              <Icon name="add_circle" />
              <span className="truncate">Add New Task</span>
            </button>
          </div>

          {/* Task Table */}
          <div className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#192730] overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-black/5 dark:bg-white/5">
                <tr>
                  <th className="p-4 text-sm font-medium w-12"></th>
                  <th className="p-4 text-sm font-medium">Task Name</th>
                  <th className="p-4 text-sm font-medium text-center">Pomodoros</th>
                  <th className="p-4 text-sm font-medium text-center">Priority</th>
                  <th className="p-4 text-sm font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr 
                    key={task.id} 
                    className="border-t border-slate-200 dark:border-slate-700 hover:bg-primary/10 dark:hover:bg-primary/20"
                  >
                    <td className="p-4 text-center">
                      <input 
                        className="h-5 w-5 rounded-md border-slate-300 dark:border-slate-600 bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-0 focus:ring-offset-0 dark:ring-offset-background-dark" 
                        type="checkbox"
                        checked={task.isComplete}
                        onChange={() => handleToggleTaskComplete(task.id)}
                      />
                    </td>
                    <td 
                      className={`p-4 text-sm font-medium ${task.isComplete ? 'text-text-secondary dark:text-slate-500 line-through' : ''}`}
                    >
                      {task.name}
                    </td>
                    <td className="p-4 text-center text-sm text-text-secondary dark:text-slate-400">
                      <span className="font-semibold text-text-primary dark:text-slate-200">{task.completedPomodoros}</span> / {task.estimatedPomodoros} 🍅
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.priority === 'high' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                          : task.priority === 'medium'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        {!task.isComplete && (
                          <button 
                            className="flex h-8 cursor-pointer items-center justify-center overflow-hidden rounded-md bg-gray-100 px-3 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                            onClick={() => handleStartPomodoro(task)}
                          >
                            Start
                          </button>
                        )}
                        <button 
                          className="flex h-8 cursor-pointer items-center justify-center overflow-hidden rounded-md bg-blue-100 px-3 text-xs font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                          onClick={() => handleEditTask(task)}
                        >
                          Edit
                        </button>
                        <button 
                          className="flex h-8 cursor-pointer items-center justify-center overflow-hidden rounded-md bg-red-100 px-3 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                          onClick={() => openDeleteModal(task)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      {/* --- Modals / Popups --- */}

      {/* Add/Edit Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#192730] shadow-2xl ring-1 ring-gray-900/5">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold dark:text-white">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h2>
              <button 
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 dark:text-slate-300 dark:hover:bg-slate-700"
                onClick={() => setIsTaskModalOpen(false)}
              >
                <Icon name="close" />
              </button>
            </div>
            
            <form 
              className="flex flex-col gap-5 p-6" 
              onSubmit={editingTask ? handleUpdateTask : handleAddTask}
            >
              <div>
                <label className="mb-2 block text-sm font-medium dark:text-slate-300" htmlFor="task-name">
                  Task Name
                </label>
                <input 
                  className="w-full rounded-lg border-slate-300 bg-background-light focus:border-primary focus:ring-primary text-sm dark:bg-[#101c22] dark:border-slate-600 dark:text-white" 
                  id="task-name" 
                  type="text" 
                  value={editingTask ? editingTask.name : newTaskName}
                  onChange={(e) => editingTask 
                    ? setEditingTask({...editingTask, name: e.target.value})
                    : setNewTaskName(e.target.value)
                  }
                  required
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium dark:text-slate-300" htmlFor="pomodoro-est">
                  Estimate Pomodoros 🍅
                </label>
                <div className="flex items-center gap-2">
                  <button 
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-background-light hover:bg-black/5 dark:bg-[#101c22] dark:border-slate-600 dark:hover:bg-white/5" 
                    type="button"
                    onClick={() => editingTask && setEditingTask({
                      ...editingTask, 
                      estimatedPomodoros: Math.max(1, editingTask.estimatedPomodoros - 1)
                    })}
                  >
                    <Icon name="minus" />
                  </button>
                  <input 
                    className="w-full rounded-lg border-slate-300 bg-background-light text-center font-bold focus:border-primary focus:ring-primary text-sm dark:bg-[#101c22] dark:border-slate-600 dark:text-white" 
                    id="pomodoro-est" 
                    type="number" 
                    min="1"
                    value={editingTask ? editingTask.estimatedPomodoros : 1}
                    readOnly
                  />
                  <button 
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-background-light hover:bg-black/5 dark:bg-[#101c22] dark:border-slate-600 dark:hover:bg-white/5" 
                    type="button"
                    onClick={() => editingTask && setEditingTask({
                      ...editingTask, 
                      estimatedPomodoros: editingTask.estimatedPomodoros + 1
                    })}
                  >
                    <Icon name="plus" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium dark:text-slate-300">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map(priority => (
                    <button 
                      key={priority}
                      type="button"
                      className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold border-2 ${
                        (editingTask ? editingTask.priority : 'medium') === priority 
                          ? priority === 'low' 
                            ? 'border-green-500 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : priority === 'medium'
                            ? 'border-amber-500 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                            : 'border-red-500 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'border-slate-300 bg-slate-50 text-slate-600 opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                      onClick={() => editingTask && setEditingTask({...editingTask, priority})}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-700 pt-5 mt-2">
                {editingTask && (
                  <button 
                    className="flex min-w-[84px] items-center justify-center gap-2 rounded-lg h-10 px-4 bg-transparent text-red-500 text-sm font-bold hover:bg-red-500/10" 
                    type="button"
                    onClick={() => openDeleteModal(editingTask)}
                  >
                    <Icon name="delete" />
                    <span>Delete</span>
                  </button>
                )}
                <div className={`flex gap-3 ${editingTask ? 'ml-auto' : 'w-full justify-end'}`}>
                  <button 
                    className="flex min-w-[84px] items-center justify-center gap-2 rounded-lg h-10 px-4 bg-transparent text-slate-600 text-sm font-bold hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700" 
                    type="button"
                    onClick={() => setIsTaskModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="flex min-w-[84px] items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary/90" 
                    type="submit"
                  >
                    <span className="truncate">{editingTask ? 'Update Task' : 'Add Task'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#192730] shadow-2xl ring-1 ring-gray-900/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200">
                <Icon name="delete" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Delete Task</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Are you sure you want to delete "{editingTask.name}"? This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button 
                className="flex items-center justify-center rounded-lg h-10 px-4 bg-transparent text-slate-600 text-sm font-bold hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700" 
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-red-600 text-white text-sm font-bold shadow-sm hover:bg-red-700" 
                type="button"
                onClick={handleDeleteTask}
              >
                <Icon name="delete" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pomodoro Timer Modal */}
      {isTimerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex w-full max-w-sm flex-col items-center rounded-xl bg-white dark:bg-[#192730] shadow-2xl ring-1 ring-gray-900/5">
            <div className="flex w-full cursor-grab items-center justify-between p-4 active:cursor-grabbing border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Pomodoro Timer</h3>
              <button 
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 dark:text-slate-300 dark:hover:bg-slate-700"
                onClick={() => setIsTimerModalOpen(false)}
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="relative flex h-64 w-64 items-center justify-center p-4">
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
                <circle className="stroke-current text-gray-200 dark:text-slate-700" cx="50" cy="50" fill="none" r="45" strokeWidth="4"></circle>
                <circle 
                  className="stroke-current text-primary -rotate-90 origin-center transform transition-all duration-300" 
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
                <h1 className="text-6xl font-bold text-gray-800 dark:text-white" style={{fontVariantNumeric: 'tabular-nums'}}>
                  {formatTime(timeLeft)}
                </h1>
                <p className="mt-1 text-base text-gray-600 dark:text-slate-300 truncate max-w-full px-2">
                  {selectedTask?.name || 'No task selected'}
                </p>
              </div>
            </div>
            <div className="flex w-full items-center justify-center gap-4 px-8 py-6">
              <button 
                className="flex h-12 w-12 items-center justify-center rounded-full text-gray-600 hover:bg-gray-200 dark:text-slate-300 dark:hover:bg-slate-700"
                onClick={() => handlePomodoroControl('reset')}
              >
                <Icon name="restart_alt" className="w-7 h-7" />
              </button>
              <button 
                className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105"
                onClick={() => handlePomodoroControl('toggle')}
              >
                {isTimerRunning ? <Icon name="pause" className="w-8 h-8" /> : <Icon name="play" className="w-8 h-8" />}
              </button>
              <button 
                className="flex h-12 w-12 items-center justify-center rounded-full text-gray-600 hover:bg-gray-200 dark:text-slate-300 dark:hover:bg-slate-700"
                onClick={() => handlePomodoroControl('skip')}
              >
                <Icon name="skip_next" className="w-7 h-7" />
              </button>
            </div>
            <div className="w-full border-t border-gray-200 dark:border-slate-700 p-4">
              <div className="flex items-center justify-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon name="mosque" />
                </div>
                <p className="flex-1 truncate text-base font-normal text-gray-700 dark:text-slate-300">
                  Next: {nextPrayer.name} - {nextPrayer.time}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prayer Alert Modal */}
      {isPrayerAlertOpen && (
         <div className="fixed bottom-6 right-6 w-full max-w-sm z-50">
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white dark:bg-[#192730] p-5 shadow-2xl shadow-slate-400/10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <Icon name="mosque" className="text-xl" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-base font-semibold text-slate-800 dark:text-white">{nextPrayer.name} Time</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">It's time to pray.</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Timer was {wasTimerRunningBeforePrayer ? 'paused' : 'already stopped'}
                  </p>
                </div>
              </div>
              <button 
                className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700"
                onClick={() => setIsPrayerAlertOpen(false)}
              >
                <Icon name="close" className="text-lg" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-primary text-white text-sm font-medium leading-normal transition-opacity hover:opacity-90"
                onClick={handleResumeAfterPrayer}
              >
                <span className="truncate">Resume Timer</span>
              </button>
              <button 
                className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-transparent text-slate-600 text-sm font-medium border border-slate-300 hover:bg-slate-50 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700"
                onClick={() => setIsPrayerAlertOpen(false)}
              >
                <span className="truncate">Dismiss</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div 
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-[#192730] shadow-2xl p-8"
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 dark:text-slate-300 dark:hover:bg-slate-700"
              onClick={() => setIsSettingsModalOpen(false)}
            >
              <Icon name="close" />
            </button>
            
            <header className="flex flex-wrap justify-between gap-3 pb-8">
              <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-[-0.033em] text-slate-900 dark:text-white">Settings</h1>
                <p className="text-base font-normal text-slate-500 dark:text-slate-400">Configure your location, prayer times, and notification preferences.</p>
              </div>
            </header>
            
            <div className="flex flex-col gap-10">
              {/* Section 1: Geoposition */}
              <section>
                <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
                  <h2 className="text-[22px] font-bold tracking-[-0.015em] text-slate-900 dark:text-white">Set Your Location</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 pt-1">Provide your location for accurate prayer time calculations.</p>
                </div>
                <div className="mt-6 flex flex-col gap-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="city">City</label>
                      <input className="w-full rounded-md border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-[#101c22] dark:text-slate-100 dark:placeholder:text-slate-500" id="city" placeholder="e.g. New York" type="text"/>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="country">Country</label>
                      <input className="w-full rounded-md border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-[#101c22] dark:text-slate-100 dark:placeholder:text-slate-500" id="country" placeholder="e.g. United States" type="text"/>
                    </div>
                  </div>
                </div>
              </section>
              
              {/* Section 2: Prayer Time Preferences */}
              <section>
                 <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
                  <h2 className="text-[22px] font-bold tracking-[-0.015em] text-slate-900 dark:text-white">Calculation & Time Zone</h2>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="calculation-method">Calculation Method</label>
                    <select className="w-full rounded-md border-slate-300 bg-white text-slate-900 focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-[#101c22] dark:text-slate-100" id="calculation-method">
                      <option>Islamic Society of North America (ISNA)</option>
                      <option>Muslim World League</option>
                      <option>Egyptian General Authority of Survey</option>
                      <option>Umm Al-Qura University, Makkah</option>
                      <option>University of Islamic Sciences, Karachi</option>
                      <option>Institute of Geophysics, University of Tehran</option>
                      <option>Shia Ithna-Ashari, Leva Research Institute, Qum</option>
                      <option>Gulf Region</option>
                      <option>Kuwait</option>
                      <option>Qatar</option>
                      <option>Majlis Ugama Islam Singapura, Singapore</option>
                      <option>Union Organization islamic de France</option>
                      <option>Diyanet İşleri Başkanlığı, Turkey</option>
                      <option>Spiritual Administration of Muslims of Russia</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="timezone">Time Zone</label>
                    <select className="w-full rounded-md border-slate-300 bg-white text-slate-900 focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-[#101c22] dark:text-slate-100" id="timezone">
                      <option>(GMT-05:00) Eastern Time (US & Canada)</option>
                      <option>(GMT-06:00) Central Time (US & Canada)</option>
                      <option>(GMT-07:00) Mountain Time (US & Canada)</option>
                      <option>(GMT-08:00) Pacific Time (US & Canada)</option>
                      <option>(GMT+00:00) Greenwich Mean Time</option>
                      <option>(GMT+01:00) Central European Time</option>
                      <option>(GMT+03:00) Arabian Standard Time</option>
                      <option>(GMT+05:00) Pakistan Standard Time</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Save Button */}
              <footer className="mt-4 flex justify-end border-t border-slate-200 pt-6 dark:border-slate-700">
                <button 
                  type="button"
                  className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-background-dark"
                  onClick={() => setIsSettingsModalOpen(false)}
                >
                  <Icon name="check" />
                  Save Changes
                </button>
              </footer>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}