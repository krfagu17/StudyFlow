"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Subject {
  id: string;
  title: string;
  progress: number;
  info: string;
  tags: string[];
  icon: string;
  colorClass: string;
  borderColorClass: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  subject: string;
  status: string;
  estimatedTime?: string;
  dueDate?: string;
}

export default function Dashboard() {
  const [userName, setUserName] = useState("Student");
  const [greeting, setGreeting] = useState("Good Morning");
  const [stats, setStats] = useState({
    currentStreak: 12,
    xpProgress: 8450,
    flowLevel: 24,
    totalHours: 148.5,
  });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [ringProgress, setRingProgress] = useState(0);

  useEffect(() => {
    // 1. Fetch User Info
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUserName(data.user.name);
          setStats({
            currentStreak: data.user.currentStreak,
            xpProgress: data.user.xpProgress,
            flowLevel: data.user.flowLevel,
            totalHours: data.user.totalHours,
          });
        }
      })
      .catch((err) => console.error("Error fetching user stats:", err));

    // 2. Fetch Subjects
    fetch("/api/subjects")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.subjects) {
          setSubjects(data.subjects);
        }
      })
      .catch((err) => console.error("Error fetching subjects:", err));

    // 3. Fetch Tasks
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.tasks) {
          setTasks(data.tasks);
          
          // Select an active in-progress task if available, otherwise latest task
          const inProgress = data.tasks.find((t: any) => t.status === "in-progress");
          const notStarted = data.tasks.find((t: any) => t.status === "not-started");
          setActiveTask(inProgress || notStarted || null);
        }
      })
      .catch((err) => console.error("Error fetching tasks:", err));

    // 4. Compute greeting based on time of day
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Good Morning");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("Good Afternoon");
    } else if (hour >= 17 && hour < 22) {
      setGreeting("Good Evening");
    } else {
      setGreeting("Good Night");
    }
  }, []);

  useEffect(() => {
    const computedHours = parseFloat((stats.totalHours % 6).toFixed(1));
    const computedPct = Math.min(Math.round((computedHours / 6) * 100), 100);
    const timer = setTimeout(() => setRingProgress(computedPct), 300);
    return () => clearTimeout(timer);
  }, [stats.totalHours]);

  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (ringProgress / 100) * circumference;

  const handleAddSubject = async () => {
    const title = prompt("Enter subject title (e.g. Neuroscience):");
    if (!title) return;

    const info = prompt("Enter progress summary (e.g. 5/12 Modules Completed):") || "0 Topics Remaining";
    const tagsInput = prompt("Enter tags separated by commas (e.g. Graphs, DP):") || "";
    const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);

    // Pick a random style class set for the subject
    const colors = [
      { colorClass: "text-orange-400 bg-orange-500/10", borderColorClass: "stroke-orange-400", icon: "code" },
      { colorClass: "text-primary bg-primary/10", borderColorClass: "stroke-primary", icon: "account_tree" },
      { colorClass: "text-secondary bg-secondary/10", borderColorClass: "stroke-secondary", icon: "calculate" },
      { colorClass: "text-tertiary bg-tertiary/10", borderColorClass: "stroke-tertiary", icon: "psychology" },
      { colorClass: "text-blue-300 bg-blue-400/10", borderColorClass: "stroke-blue-300", icon: "menu_book" }
    ];
    const pickedStyle = colors[Math.floor(Math.random() * colors.length)];

    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          progress: 0,
          info,
          tags,
          ...pickedStyle
        })
      });
      const data = await res.json();
      if (data.success && data.subject) {
        setSubjects(prev => [...prev, data.subject]);
      }
    } catch (err) {
      console.error("Failed to add subject:", err);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1440px] mx-auto">
      {/* Hero Bento Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Greeting Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-8 glass-card rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative group"
        >
          <div className="relative z-10">
            <h2 className="font-bold text-3xl mb-2 text-on-surface">
              {greeting}, <span className="gradient-text">{userName}</span>
            </h2>
            <p className="text-on-surface-variant max-w-md italic font-light leading-relaxed">
              &quot;Success is the sum of small efforts, repeated day in and day out.&quot; — Robert Collier
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-4 relative z-10">
            <Link href="/timer">
              <button className="bg-gradient-to-r from-primary to-secondary text-on-primary font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-primary/25 hover:brightness-105 active:scale-95 transition-all duration-300 cursor-pointer">
                Resume Focus Session
              </button>
            </Link>
            <Link href="/planner">
              <button className="glass-card px-6 py-3 rounded-xl font-bold hover:bg-white/10 active:scale-95 transition-all duration-300 cursor-pointer">
                View Goals
              </button>
            </Link>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none select-none">
            <span className="material-symbols-outlined text-[200px] translate-y-1/4 translate-x-1/4 select-none">
              school
            </span>
          </div>
        </motion.div>

        {/* Daily Goal Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-4 glass-card rounded-3xl p-6 flex flex-col items-center justify-center text-center"
        >
          <h3 className="font-semibold text-lg mb-6 text-on-surface">Today&apos;s Progress</h3>
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle
                className="text-white/5"
                cx="96"
                cy="96"
                fill="transparent"
                r="80"
                stroke="currentColor"
                strokeWidth="12"
              />
              <motion.circle
                className="text-secondary"
                cx="96"
                cy="96"
                fill="transparent"
                r="80"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-on-surface">{ringProgress}%</span>
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-0.5">
                Goal: 6h
              </span>
            </div>
          </div>
          <p className="mt-6 text-sm text-on-surface-variant font-medium">
            {parseFloat((stats.totalHours % 6).toFixed(1))}h completed • {parseFloat((Math.max(0, 6 - (stats.totalHours % 6))).toFixed(1))}h to go
          </p>
        </motion.div>
      </section>

      {/* Stats Quick View grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Total Hours", val: `${stats.totalHours}h`, icon: "schedule", color: "text-primary bg-primary/10" },
          { label: "Current Streak", val: `${stats.currentStreak} Days`, icon: "local_fire_department", color: "text-secondary bg-secondary/10" },
          { label: "Tasks Done", val: tasks.filter(t => t.status === "completed").length || 0, icon: "task_alt", color: "text-tertiary bg-tertiary/10" },
          { label: "Remaining Tasks", val: tasks.filter(t => t.status !== "completed").length || 0, icon: "event_upcoming", color: "text-error bg-error/10" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 * i }}
            className="glass-card rounded-2xl p-5 flex items-center gap-4 hover:translate-y-[-2px] transition-transform duration-300"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              <span className="material-symbols-outlined text-[24px] select-none">{stat.icon}</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-semibold tracking-wide">{stat.label}</p>
              <p className="font-bold text-xl text-on-surface mt-0.5">{stat.val}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Main Dashboard layout split grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Today's Plan */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-lg text-on-surface">Today&apos;s Plan</h3>
            <Link href="/planner" className="text-primary text-sm font-semibold hover:underline">
              Edit Plan
            </Link>
          </div>

          {/* Active session card */}
          {activeTask ? (
            <motion.div
              whileHover={{ y: -2 }}
              className="glass-card rounded-3xl p-6 border-l-4 border-secondary flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-lg text-on-surface line-clamp-1">{activeTask.title}</h4>
                    <p className="text-sm text-on-surface-variant mt-0.5">{activeTask.subject}</p>
                  </div>
                  <span className="bg-secondary/20 text-secondary text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                    {activeTask.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-6 font-medium">
                  <span className="material-symbols-outlined text-sm select-none">timer</span>
                  <span>{activeTask.estimatedTime || "2h"} estimated</span>
                </div>
                
                {/* Session Progress Bar */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-on-surface-variant">Task Progress</span>
                    <span className="text-secondary">40%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-secondary to-tertiary w-[40%] rounded-full shadow-[0_0_10px_rgba(252,170,255,0.4)]" />
                  </div>
                </div>
              </div>
              
              <Link href="/timer">
                <button className="w-full bg-secondary-container text-on-secondary-container font-bold py-3.5 rounded-xl hover:bg-secondary-container/85 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.98]">
                  <span className="material-symbols-outlined group-hover:scale-105 transition-transform select-none">
                    play_circle
                  </span>
                  Start Session
                </button>
              </Link>
            </motion.div>
          ) : (
            <div className="glass-card rounded-3xl p-6 text-center text-xs text-on-surface-variant/40 italic py-12">
              No tasks scheduled for today.
            </div>
          )}

          {/* Up Next List */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1">
              Up Next
            </p>
            <div className="space-y-2">
              {tasks.filter(t => t.status !== "completed").slice(1, 3).map((item) => (
                <Link
                  href="/tasks"
                  key={item.id}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors duration-200 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px] select-none">event_upcoming</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-on-surface line-clamp-1">{item.title}</p>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase mt-0.5">{item.subject}</p>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant text-sm group-hover:translate-x-0.5 transition-transform select-none">
                    chevron_right
                  </span>
                </Link>
              ))}
              {tasks.filter(t => t.status !== "completed").length <= 1 && (
                <div className="text-xs text-on-surface-variant/40 italic text-center py-4 select-none">
                  No upcoming tasks.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Subjects list grid */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-lg text-on-surface">My Subjects</h3>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-full glass-card flex items-center justify-center cursor-pointer">
                <span className="material-symbols-outlined text-sm select-none">grid_view</span>
              </button>
              <button className="w-8 h-8 rounded-full glass-card flex items-center justify-center opacity-50 cursor-pointer">
                <span className="material-symbols-outlined text-sm select-none">list</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {subjects.map((sub, i) => {
              const subCircumference = 2 * Math.PI * 20;
              const subOffset = subCircumference - (sub.progress / 100) * subCircumference;
              
              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  whileHover={{ y: -3 }}
                  className="glass-card rounded-3xl p-6 flex flex-col justify-between group relative min-h-[190px]"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${sub.colorClass || "text-primary bg-primary/10"}`}>
                      <span className="material-symbols-outlined font-bold select-none">{sub.icon || "menu_book"}</span>
                    </div>
                    {/* Ring progress widget */}
                    <div className="relative w-12 h-12">
                      <svg className="w-full h-full -rotate-90">
                        <circle
                          className="text-white/5"
                          cx="24"
                          cy="24"
                          fill="transparent"
                          r="20"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                        <circle
                          className={sub.borderColorClass || "stroke-primary"}
                          cx="24"
                          cy="24"
                          fill="transparent"
                          r="20"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeDasharray={subCircumference}
                          strokeDashoffset={subOffset}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-on-surface">
                        {sub.progress}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-on-surface mb-0.5 leading-tight">
                      {sub.title}
                    </h4>
                    <p className="text-xs text-on-surface-variant font-medium mb-4">
                      {sub.info}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {sub.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] bg-white/5 text-on-surface-variant border border-white/5 px-2.5 py-0.5 rounded-full font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Add Subject placeholder */}
            <motion.button
              whileHover={{ scale: 0.98 }}
              onClick={handleAddSubject}
              className="rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center p-6 min-h-[190px] hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 text-on-surface-variant hover:text-primary cursor-pointer"
            >
              <span className="material-symbols-outlined text-4xl mb-2 select-none">add_circle</span>
              <span className="font-bold text-sm tracking-wide">Add Subject</span>
            </motion.button>
          </div>
        </div>
      </section>
    </div>
  );
}
