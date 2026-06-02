"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

type SessionType = "Deep Work" | "Short Break" | "Long Break";

interface Task {
  id: string;
  title: string;
  subject: string;
  status: string;
}

export default function TimerPage() {
  const [sessionType, setSessionType] = useState<SessionType>("Deep Work");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [userStats, setUserStats] = useState({
    currentStreak: 12,
    xpProgress: 8450,
    flowLevel: 24,
    totalHours: 148.5,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mainStageRef = useRef<HTMLDivElement | null>(null);

  const durations = {
    "Deep Work": 25 * 60,
    "Short Break": 5 * 60,
    "Long Break": 15 * 60,
  };

  useEffect(() => {
    // 1. Fetch active tasks for timer selector
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.tasks) {
          const activeTasks = data.tasks.filter((t: Task) => t.status !== "completed");
          setTasks(activeTasks);
          if (activeTasks.length > 0) setSelectedTaskId(activeTasks[0].id);
        }
      })
      .catch((err) => console.error("Error loading tasks for timer:", err));

    // 2. Fetch User Stats
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUserStats({
            currentStreak: data.user.currentStreak,
            xpProgress: data.user.xpProgress,
            flowLevel: data.user.flowLevel,
            totalHours: data.user.totalHours,
          });
        }
      })
      .catch((err) => console.error("Error loading stats for timer:", err));
  }, []);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, sessionType]);

  const handleTimerComplete = async () => {
    alert(`${sessionType} is complete!`);
    
    if (sessionType === "Deep Work") {
      // Add XP (+150) and Hours (+0.4h) to database stats
      const newXp = userStats.xpProgress + 150;
      const newHours = parseFloat((userStats.totalHours + 0.4).toFixed(1));
      
      setUserStats((prev) => ({
        ...prev,
        xpProgress: newXp,
        totalHours: newHours,
      }));

      try {
        await fetch("/api/user/stats", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            xpProgress: newXp,
            totalHours: newHours,
          }),
        });
      } catch (err) {
        console.error("Failed to update completed stats:", err);
      }
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durations[sessionType]);
  };

  const skipSession = () => {
    setIsRunning(false);
    if (sessionType === "Deep Work") {
      setSessionType("Short Break");
      setTimeLeft(durations["Short Break"]);
    } else if (sessionType === "Short Break") {
      setSessionType("Long Break");
      setTimeLeft(durations["Long Break"]);
    } else {
      setSessionType("Deep Work");
      setTimeLeft(durations["Deep Work"]);
    }
  };

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      mainStageRef.current?.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error("Fullscreen error:", err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const totalDuration = durations[sessionType];
  const progressRatio = timeLeft / totalDuration;
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressRatio * circumference);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8" ref={mainStageRef}>
      {/* Focus Timer Stage (8 cols) */}
      <section className={`${isFullscreen ? "fixed inset-0 z-50 bg-background flex flex-col justify-center items-center p-8" : "lg:col-span-8"} space-y-6`}>
        <div className="glass-card rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[520px] w-full">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />

          {/* Current Info Row */}
          <div className="z-10 w-full flex justify-between items-center mb-8">
            <div className="text-left">
              <h2 className="font-bold text-lg text-primary uppercase tracking-wider">Current Session</h2>
              <p className="text-sm text-on-surface-variant font-medium">{sessionType}</p>
            </div>
            <button 
              onClick={handleFullscreenToggle}
              className="p-3 glass-card rounded-full hover:bg-primary/20 hover:text-primary transition-all duration-300 cursor-pointer active:scale-90"
            >
              <span className="material-symbols-outlined text-xl select-none">
                {isFullscreen ? "fullscreen_exit" : "fullscreen"}
              </span>
            </button>
          </div>

          {/* Pomodoro Timer circle */}
          <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                className="text-white/5"
                cx="50%"
                cy="50%"
                fill="transparent"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
              />
              <motion.circle
                className="timer-glow"
                cx="50%"
                cy="50%"
                fill="transparent"
                r={radius}
                stroke="url(#timerGradient)"
                strokeWidth="10"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset }}
                transition={{ duration: isRunning ? 1.05 : 0.4, ease: "linear" }}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="timerGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#d1bcff" />
                  <stop offset="100%" stopColor="#fcaaff" />
                </linearGradient>
              </defs>
            </svg>
            
            <div className="z-10">
              <motion.div 
                layout
                className="font-bold text-7xl md:text-8xl tracking-tight text-on-surface leading-none"
              >
                {timerString}
              </motion.div>
              <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-on-surface-variant mt-3">
                {sessionType}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 mt-8 z-10">
            <button
              onClick={resetTimer}
              className="p-4 glass-card rounded-full text-on-surface-variant hover:text-error transition-all duration-300 active:scale-90 cursor-pointer"
              title="Reset Timer"
            >
              <span className="material-symbols-outlined text-lg select-none">replay</span>
            </button>
            <button
              onClick={toggleTimer}
              className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-secondary text-on-primary flex items-center justify-center shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <span className="material-symbols-outlined text-4xl select-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isRunning ? "pause" : "play_arrow"}
              </span>
            </button>
            <button
              onClick={skipSession}
              className="p-4 glass-card rounded-full text-on-surface-variant hover:text-secondary transition-all duration-300 active:scale-90 cursor-pointer"
              title="Skip Session"
            >
              <span className="material-symbols-outlined text-lg select-none">skip_next</span>
            </button>
          </div>
        </div>

        {/* Dynamic task selector */}
        {!isFullscreen && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-5 flex flex-col gap-2 justify-center">
              <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                Select Study Target
              </label>
              {tasks.length > 0 ? (
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="bg-transparent border-none text-sm text-on-surface focus:ring-0 p-0 font-semibold cursor-pointer w-full"
                >
                  {tasks.map((task) => (
                    <option key={task.id} value={task.id} className="bg-surface-container">
                      {task.title} ({task.subject})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm font-semibold text-on-surface-variant">No active tasks found</p>
              )}
            </div>
            
            <div className="glass-card rounded-2xl p-5 flex items-center gap-4 justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined select-none">music_note</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Soundscape</p>
                  <p className="font-semibold text-sm text-on-surface mt-0.5">Midnight Rain Lo-Fi</p>
                </div>
              </div>
              <span className={`material-symbols-outlined text-primary text-xl select-none ${isRunning ? "animate-pulse" : ""}`}>
                equalizer
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Sidebar stats panel (4 cols) */}
      {!isFullscreen && (
        <aside className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-bold text-base text-on-surface mb-5">Session Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">Daily Goal</p>
                  <p className="font-bold text-2xl text-on-surface mt-1">
                    {userStats.totalHours}<span className="text-sm font-normal text-on-surface-variant"> / 6h</span>
                  </p>
                </div>
                <span className="bg-secondary/10 text-secondary text-[10px] font-bold px-2 py-0.5 rounded-md border border-secondary/20">
                  Level {userStats.flowLevel}
                </span>
              </div>
              <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-secondary to-tertiary rounded-full" 
                  style={{ width: `${Math.min((userStats.xpProgress / 10000) * 100, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
              <div className="p-3 bg-white/5 rounded-xl text-center">
                <p className="text-on-surface-variant text-[11px] font-semibold">Focus Score</p>
                <p className="text-lg font-bold text-tertiary mt-1">92</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl text-center">
                <p className="text-on-surface-variant text-[11px] font-semibold">Distractions</p>
                <p className="text-lg font-bold text-error mt-1">2</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-base text-on-surface">Recent Breaks</h3>
              <button className="text-primary text-xs font-semibold hover:underline cursor-pointer">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {[
                { title: "Caffeine Recharge", time: "15 mins ago", desc: "Short Break", icon: "coffee" },
                { title: "Mindful Breathing", time: "1 hour ago", desc: "Long Break", icon: "self_improvement" },
              ].map((item) => (
                <div key={item.title} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-background text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px] select-none">{item.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{item.title}</p>
                    <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">
                      {item.time} • {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
