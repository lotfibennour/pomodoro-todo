// app/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
// Corrected the import for Mosque (it should be PascalCase 'Mosque')
import {
  Bell,
  Check,
  CheckCircle,
  Circle,
  Cog,
  Hourglass,
  LayoutGrid,
  LogOut,
  HelpCircle,
  Minus,
  Moon,
  Mosque, // Corrected import
  Pause,
  Play,
  Plus,
  RefreshCw,
  Settings,
  SkipForward,
  Sun,
  Sunrise,
  Sunset,
  Trash2,
  Timer,
  Waypoints,
  X
} from 'lucide-react';

/* --- Mock Data & Types --- */
// Using TypeScript concepts in comments for eventual Next.js/TS integration
/*
type Task = {
  id: number;
  name: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  isComplete: boolean;
  priority: 'low' | 'medium' | 'high';
};

type PrayerTimes = {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};
*/

const mockTasks = [
  { id: 1, name: 'Finalize project report', estimatedPomodoros: 4, completedPomodoros: 2, isComplete: false, priority: 'high' },
  { id: 2, name: 'Draft weekly update email', estimatedPomodoros: 2, completedPomodoros: 1, isComplete: false, priority: 'medium' },
  { id: 3, name: 'Review Q3 financial statements', estimatedPomodoros: 3, completedPomodoros: 3, isComplete: true, priority: 'high' },
  { id: 4, name: 'Water the plants', estimatedPomodoros: 1, completedPomodoros: 1, isComplete: true, priority: 'low' },
];

const mockPrayerTimes = {
  Fajr: '05:30',
  Dhuhr: '12:15',
  Asr: '15:45',
  Maghrib: '18:00',
  Isha: '19:30',
};

// A helper component for icons to map string names to imported components
const Icon = ({ name, className = "w-5 h-5" }) => {
  const icons = {
    grid_view: <LayoutGrid className={className} />,
    check_circle: <CheckCircle className={className} />,
    timer: <Timer className={className} />,
    settings: <Settings className={className} />,
    help: <HelpCircle className={className} />,
    logout: <LogOut className={className} />,
    hourglass_top: <Hourglass className={className} />,
    mosque: <Mosque className={className} />, // Now uses the corrected import
    close: <X className={className} />,
    restart_alt: <RefreshCw className={className} />,
    pause: <Pause className={className} />,
    play: <Play className={className} />,
    skip_next: <SkipForward className={className} />,
    add_circle: <Plus className={className} />,
    delete: <Trash2 className={className} />,
    minus: <Minus className="w-4 h-4" />,
    plus: <Plus className="w-4 h-4" />,
    sun: <Sun className={className} />,
    moon: <Moon className={className} />,
    sunrise: <Sunrise className={className} />,
    sunset: <Sunset className={className} />,
    waypoint: <Waypoints className={className} />,
    check: <Check className={className} />,
  };
  return icons[name] || <Circle className={className} />;
};


/* --- Main App Component --- */
export default function App() {
  const [tasks, setTasks] = useState(mockTasks);
  const [selectedTask, setSelectedTask] = useState(mockTasks[1]);
  const [prayerTimes, setPrayerTimes] = useState(mockPrayerTimes);
  const [nextPrayer, setNextPrayer] = useState({ name: 'Dhuhr', time: '12:15' });

  // Timer State
  const [timerMode, setTimerMode] = useState('focus'); // focus | shortBreak | longBreak
  // 25 minutes in seconds for a focus session
  const [timeLeft, setTimeLeft] = useState(25 * 60); 
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  // Modal State
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [isPrayerAlertOpen, setIsPrayerAlertOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  const [newTaskName, setNewTaskName] = useState("");

  // --- Logic Functions (to be implemented) ---

  // Timer Countdown Logic
  useEffect(() => {
    // Only run if the timer is supposed to be running AND the modal is visible
    if (!isTimerRunning || !isTimerModalOpen) return;

    if (timeLeft <= 0) {
      setIsTimerRunning(false);
      // In a real app, you would play a sound, increment the pomodoro count,
      // and automatically switch to the next mode (e.g., shortBreak) here.
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, isTimerModalOpen]);

  // Prayer Time Alert Mock Logic
  useEffect(() => {
    // This is where real API fetching and scheduling would go.
    // We'll mock an alert appearing after 10 seconds.
    const alertTimeout = setTimeout(() => {
      setIsPrayerAlertOpen(true);
    }, 10000); 

    return () => clearTimeout(alertTimeout);
  }, []);

  
  // --- Event Handlers ---

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    const newTask = {
      id: tasks.length + 1,
      name: newTaskName,
      estimatedPomodoros: 1,
      completedPomodoros: 0,
      isComplete: false,
      priority: 'medium',
    };
    setTasks([...tasks, newTask]);
    setNewTaskName("");
  };

  const handleUpdateTask = (e) => {
    e.preventDefault();
    // Save the changes made in the edit panel
    setTasks(tasks.map(t => t.id === selectedTask.id ? selectedTask : t));
  };
  
  const handleDeleteTask = () => {
    setTasks(tasks.filter(t => t.id !== selectedTask.id));
    setSelectedTask(tasks.length > 1 ? tasks[0] : null);
  };

  const handleToggleTaskComplete = (taskId) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, isComplete: !t.isComplete } : t
    ));
  };

  const handleSelectTask = (task) => {
    setSelectedTask(task);
  };
  
  const handleStartPomodoro = (task) => {
    setSelectedTask(task);
    setTimeLeft(25 * 60); // Reset to 25 mins
    setTimerMode('focus');
    setIsTimerModalOpen(true);
    setIsTimerRunning(true);
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  const handlePomodoroControl = (action) => {
    const focusDuration = 25 * 60;
    const shortBreakDuration = 5 * 60;

    switch (action) {
      case 'toggle':
        setIsTimerRunning(!isTimerRunning);
        break;
      case 'reset':
        setTimeLeft(timerMode === 'focus' ? focusDuration : shortBreakDuration);
        setIsTimerRunning(false);
        break;
      case 'skip':
        // Skip current session and move to the next logical mode
        if (timerMode === 'focus') {
          setTimerMode('shortBreak');
          setTimeLeft(shortBreakDuration);
        } else {
          setTimerMode('focus');
          setTimeLeft(focusDuration);
        }
        setIsTimerRunning(true);
        break;
      default:
        break;
    }
  };

  // --- Render ---
  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark font-display text-text-primary dark:text-slate-200">
      
      {/* --- Sidebar (based on mockups) --- */}
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
          
          {/* Prayer Times Section */}
          <div className="flex flex-col gap-4 border-t border-slate-200 dark:border-slate-700 pt-4">
            <h1 className="text-base font-medium leading-normal text-gray-900 dark:text-white">Prayer Times</h1>
            <div className="flex flex-col gap-2">
              {Object.entries(prayerTimes).map(([name, time]) => (
                <div 
                  key={name}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 ${nextPrayer.name === name ? 'bg-primary/10 text-primary' : 'text-gray-700 dark:text-slate-300'}`}
                >
                  <Icon name={name === 'Fajr' || name === 'Sunrise' ? 'sunrise' : name === 'Maghrib' || name === 'Sunset' ? 'sunset' : name === 'Isha' ? 'moon' : 'sun'} className="text-xl" />
                  <p className="flex-1 text-sm font-bold">{name}</p>
                  <span className={`text-xs ${nextPrayer.name === name ? 'font-semibold' : 'text-gray-500 dark:text-slate-400'}`}>{time}</span>
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
        <section className="col-span-12 flex flex-col gap-4 md:col-span-12 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-4xl font-black tracking-tight dark:text-white">Today's Focus</h1>
            {/* The "Add New Task" button is redundant here since we have an input below, keeping it as per mockup logic */}
            <button 
              className="flex min-w-[84px] items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary/90"
              onClick={handleAddTask}
            >
              <Icon name="add_circle" />
              <span className="truncate">Add New Task</span>
            </button>
          </div>
          
          {/* Add Task Input */}
          <form onSubmit={handleAddTask} className="flex items-center gap-2">
            <input 
              className="w-full rounded-lg border-slate-300 bg-white px-4 py-2 text-sm focus:border-primary focus:ring-primary dark:bg-[#192730] dark:border-slate-600 dark:text-white" 
              placeholder="Add a new task..." 
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
            />
            <button type="submit" className="flex h-9 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-4 text-sm font-medium text-white">Add</button>
          </form>

          {/* Task Table */}
          <div className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#192730] overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-black/5 dark:bg-white/5">
                <tr>
                  <th className="p-4 text-sm font-medium w-12"></th>
                  <th className="p-4 text-sm font-medium">Task Name</th>
                  <th className="p-4 text-sm font-medium text-center">Pomodoros</th>
                  <th className="p-4 text-sm font-medium text-center">Start</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr 
                    key={task.id} 
                    className={`border-t border-slate-200 dark:border-slate-700 hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer ${selectedTask?.id === task.id ? 'bg-primary/10 dark:bg-primary/30' : ''}`}
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
                      onClick={() => handleSelectTask(task)}
                    >
                      {task.name}
                    </td>
                    <td 
                      className="p-4 text-center text-sm text-text-secondary dark:text-slate-400"
                      onClick={() => handleSelectTask(task)}
                    >
                      <span className="font-semibold text-text-primary dark:text-slate-200">{task.completedPomodoros}</span> / {task.estimatedPomodoros} 🍅
                    </td>
                    <td className="p-4 text-center">
                      {!task.isComplete && (
                        <button 
                          className="flex h-8 cursor-pointer items-center justify-center overflow-hidden rounded-md bg-gray-100 px-3 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                          onClick={() => handleStartPomodoro(task)}
                        >
                          Start
                        </button>
                      )}
                      {task.isComplete && (
                         <span className="flex h-8 cursor-default items-center justify-center overflow-hidden rounded-md bg-green-100 px-3 text-xs font-medium text-green-700">
                          Done
                         </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        
        {/* Edit Task Panel */}
        <aside className="col-span-12 flex flex-col gap-6 lg:col-span-5">
          {selectedTask && (
            <div className="sticky top-6 flex h-fit flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#192730] p-6">
              <h3 className="text-xl font-bold dark:text-white">Edit Task Details</h3>
              <form className="flex flex-col gap-5" onSubmit={handleUpdateTask}>
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-slate-300" htmlFor="task-name">Task Name</label>
                  <input 
                    className="w-full rounded-lg border-slate-300 bg-background-light focus:border-primary focus:ring-primary text-sm dark:bg-[#101c22] dark:border-slate-600 dark:text-white" 
                    id="task-name" 
                    type="text" 
                    value={selectedTask.name}
                    onChange={(e) => setSelectedTask({...selectedTask, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-slate-300" htmlFor="pomodoro-est">Estimate Pomodoros 🍅</label>
                  <div className="flex items-center gap-2">
                    <button 
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-background-light hover:bg-black/5 dark:bg-[#101c22] dark:border-slate-600 dark:hover:bg-white/5" 
                      type="button"
                      onClick={() => setSelectedTask({...selectedTask, estimatedPomodoros: Math.max(1, selectedTask.estimatedPomodoros - 1)})}
                    >
                      <Icon name="minus" />
                    </button>
                    <input 
                      className="w-full rounded-lg border-slate-300 bg-background-light text-center font-bold focus:border-primary focus:ring-primary text-sm dark:bg-[#101c22] dark:border-slate-600 dark:text-white" 
                      id="pomodoro-est" 
                      type="number" 
                      value={selectedTask.estimatedPomodoros}
                      onChange={(e) => setSelectedTask({...selectedTask, estimatedPomodoros: Number(e.target.value)})}
                    />
                    <button 
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-background-light hover:bg-black/5 dark:bg-[#101c22] dark:border-slate-600 dark:hover:bg-white/5" 
                      type="button"
                      onClick={() => setSelectedTask({...selectedTask, estimatedPomodoros: selectedTask.estimatedPomodoros + 1})}
                    >
                      <Icon name="plus" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-slate-300">Priority</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold border-2 ${selectedTask.priority === 'low' ? 'border-green-500 bg-green-100 text-green-800' : 'border-slate-300 bg-green-50 text-green-800 opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300'}`} 
                      type="button"
                      onClick={() => setSelectedTask({...selectedTask, priority: 'low'})}
                    >
                      Low
                    </button>
                    <button 
                      className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold border-2 ${selectedTask.priority === 'medium' ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-300 bg-amber-50 text-amber-800 opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300'}`} 
                      type="button"
                      onClick={() => setSelectedTask({...selectedTask, priority: 'medium'})}
                    >
                      Medium
                    </button>
                     <button 
                      className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold border-2 ${selectedTask.priority === 'high' ? 'border-red-500 bg-red-100 text-red-800' : 'border-slate-300 bg-red-50 text-red-800 opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300'}`} 
                      type="button"
                      onClick={() => setSelectedTask({...selectedTask, priority: 'high'})}
                    >
                      High
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-700 pt-5 mt-2">
                  <button 
                    className="flex min-w-[84px] items-center justify-center gap-2 rounded-lg h-10 px-4 bg-transparent text-red-500 text-sm font-bold hover:bg-red-500/10" 
                    type="button"
                    onClick={handleDeleteTask}
                  >
                    <Icon name="delete" />
                    <span>Delete</span>
                  </button>
                  <button 
                    className="flex min-w-[84px] items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary/90" 
                    type="submit"
                  >
                    <span className="truncate">Update Task</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </aside>

      </main>

      {/* --- Modals / Popups --- */}

      {/* Pomodoro Timer Modal */}
      {isTimerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex w-full max-w-sm flex-col items-center rounded-xl bg-white/90 dark:bg-background-dark/90 shadow-2xl ring-1 ring-gray-900/5 backdrop-blur-lg">
            <div className="flex w-full cursor-grab items-center justify-end p-2 active:cursor-grabbing">
              <button 
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 dark:text-slate-300 dark:hover:bg-slate-700"
                onClick={() => setIsTimerModalOpen(false)}
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="relative flex h-64 w-64 items-center justify-center p-4">
              {/* SVG Timer Ring */}
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
                <circle className="stroke-current text-gray-200 dark:text-slate-700" cx="50" cy="50" fill="none" r="45" strokeWidth="4"></circle>
                <circle 
                  className="stroke-current text-primary -rotate-90 origin-center transform transition-all duration-300" 
                  cx="50" cy="50" fill="none" r="45" 
                  strokeDasharray="283" 
                  // Calculate stroke offset based on time left
                  strokeDashoffset={283 - (timeLeft / (timerMode === 'focus' ? 25 * 60 : 5 * 60)) * 283} 
                  strokeLinecap="round" 
                  strokeWidth="4"
                ></circle> 
              </svg>
              {/* Timer Display */}
              <div className="z-10 flex flex-col items-center justify-center text-center">
                <p className="text-sm font-medium uppercase tracking-widest text-primary capitalize">{timerMode === 'focus' ? 'Focus' : 'Break'}</p>
                <h1 className="text-6xl font-bold text-gray-800 dark:text-white" style={{fontVariantNumeric: 'tabular-nums'}}>
                  {formatTime(timeLeft)}
                </h1>
                <p className="mt-1 text-base text-gray-600 dark:text-slate-300 truncate max-w-full px-2">{selectedTask?.name}</p>
              </div>
            </div>
            {/* Timer Controls */}
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
                {isTimerRunning ? <Icon name="pause" className="w-8 h-8 fill-white" /> : <Icon name="play" className="w-8 h-8 fill-white" />}
              </button>
              <button 
                className="flex h-12 w-12 items-center justify-center rounded-full text-gray-600 hover:bg-gray-200 dark:text-slate-300 dark:hover:bg-slate-700"
                onClick={() => handlePomodoroControl('skip')}
              >
                <Icon name="skip_next" className="w-7 h-7" />
              </button>
            </div>
            {/* Next Prayer Info */}
            <div className="w-full border-t border-gray-200 dark:border-slate-700 p-4">
              <div className="flex items-center justify-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon name="mosque" />
                </div>
                <p className="flex-1 truncate text-base font-normal text-gray-700 dark:text-slate-300">
                  Next: **{nextPrayer.name}** - {nextPrayer.time}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prayer Alert Modal */}
      {isPrayerAlertOpen && (
         <div className="absolute bottom-6 right-6 w-full max-w-sm z-50">
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white/80 p-5 shadow-2xl shadow-slate-400/10 backdrop-blur-md dark:bg-background-dark/80 dark:border-slate-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <Icon name="mosque" className="text-xl" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-base font-semibold text-slate-800 dark:text-white">{nextPrayer.name} Time</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">It's time to pray.</p>
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
                onClick={() => {
                  setIsPrayerAlertOpen(false);
                  // Find next incomplete task to start a new pomodoro session
                  handleStartPomodoro(tasks.find(t => !t.isComplete) || tasks[0]); 
                }}
              >
                <span className="truncate">Start Next Focus Session</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setIsSettingsModalOpen(false)}>
          <div 
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-background-light dark:bg-background-dark shadow-2xl p-8"
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
                      <input className="w-full rounded-md border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-[#192730] dark:text-slate-100 dark:placeholder:text-slate-500" id="city" placeholder="e.g. New York" type="text"/>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="country">Country</label>
                      <input className="w-full rounded-md border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-[#192730] dark:text-slate-100 dark:placeholder:text-slate-500" id="country" placeholder="e.g. United States" type="text"/>
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
                    <select className="w-full rounded-md border-slate-300 bg-white text-slate-900 focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-[#192730] dark:text-slate-100" id="calculation-method">
                      <option>Islamic Society of North America (ISNA)</option>
                      <option>University of Islamic Sciences, Karachi</option>
                      <option>Egyptian General Authority of Survey</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="timezone">Time Zone</label>
                    <select className="w-full rounded-md border-slate-300 bg-white text-slate-900 focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-[#192730] dark:text-slate-100" id="timezone">
                      <option>(GMT-05:00) Eastern Time (US & Canada)</option>
                      <option>(GMT) Coordinated Universal Time</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Save Button */}
              <footer className="mt-4 flex justify-end border-t border-slate-200 pt-6 dark:border-slate-700">
                <button className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-background-dark">
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
