"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface Task {
  id: string;
  title: string;
  description: string;
  subject: string;
  subjectColor: string;
  priority: string;
  status: "not-started" | "in-progress" | "revision" | "completed";
  estimatedTime?: string;
  dueDate?: string;
  progress?: number;
  statusText?: string;
  score?: string;
}

const columnSchema = [
  { id: "not-started", name: "Not Started", color: "bg-outline/80" },
  { id: "in-progress", name: "In Progress", color: "bg-primary" },
  { id: "revision", name: "Revision", color: "bg-secondary" },
  { id: "completed", name: "Completed", color: "bg-tertiary" },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.tasks) {
          setTasks(data.tasks);
        }
      })
      .catch((err) => console.error("Error fetching tasks:", err))
      .finally(() => setLoading(false));
  }, []);

  const moveTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    let newStatus: Task["status"];
    let newProgress = task.progress;
    let score = task.score;
    let statusText = task.statusText;

    switch (task.status) {
      case "not-started":
        newStatus = "in-progress";
        newProgress = 20;
        break;
      case "in-progress":
        newStatus = "revision";
        statusText = "Waiting for review";
        break;
      case "revision":
        newStatus = "completed";
        newProgress = 100;
        score = "Completed";
        statusText = "";
        break;
      case "completed":
        newStatus = "not-started";
        newProgress = 0;
        score = "";
        statusText = "";
        break;
      default:
        newStatus = "not-started";
    }

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: newStatus, progress: newProgress, score, statusText } : t
      )
    );

    try {
      await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: taskId,
          status: newStatus,
          progress: newProgress,
          score,
          statusText
        }),
      });
    } catch (err) {
      console.error("Failed to sync task move:", err);
    }
  };

  const handleAddNewTask = async () => {
    const title = prompt("Enter task title (e.g. Implement Heap Sort):");
    if (!title) return;

    const subject = prompt("Enter subject (e.g. Computer Science):") || "General";
    const description = prompt("Enter task description:") || "";
    const priority = prompt("Enter priority (high, medium, low):") || "medium";
    const estimatedTime = prompt("Enter estimated time (e.g. 2h):") || "1h";

    // Style helper mapping
    const subjectColor = "bg-primary/20 text-primary border border-primary/30";

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          subject,
          subjectColor,
          priority,
          estimatedTime,
          dueDate: "Soon"
        }),
      });

      const data = await res.json();
      if (data.success && data.task) {
        setTasks((prev) => [data.task, ...prev]);
      }
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <div>
          <h2 className="font-bold text-3xl md:text-4xl text-on-background mb-2">Focus Board</h2>
          <p className="text-on-surface-variant text-sm md:text-base font-medium">
            Organize your academic goals and track your progress through the semester.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl glass-card text-on-surface hover:bg-white/10 active:scale-95 duration-200 cursor-pointer">
            <span className="material-symbols-outlined text-sm select-none">filter_list</span>
            <span className="text-xs uppercase tracking-wider font-bold">Filter</span>
          </button>
          <button
            onClick={handleAddNewTask}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary font-bold shadow-lg hover:shadow-primary/25 hover:brightness-105 active:scale-95 duration-200 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm select-none">add</span>
            <span className="text-xs uppercase tracking-wider font-bold">New Task</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar">
          {columnSchema.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className="min-w-[320px] max-w-[400px] flex-1 flex flex-col gap-4">
                {/* Column Header */}
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-on-surface-variant">
                      {col.name}
                    </h3>
                    <span className="bg-surface-container-high px-2.5 py-0.5 rounded-md text-xs font-bold text-on-surface-variant">
                      {colTasks.length}
                    </span>
                  </div>
                  <button className="text-on-surface-variant hover:text-on-surface cursor-pointer">
                    <span className="material-symbols-outlined text-lg select-none">more_horiz</span>
                  </button>
                </div>

                {/* Task Cards Column */}
                <div className="flex flex-col gap-4 min-h-[450px] rounded-2xl bg-white/[0.01] p-1.5 border border-dashed border-white/5">
                  <AnimatePresence mode="popLayout">
                    {colTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className={`glass-card p-5 rounded-2xl flex flex-col gap-4 cursor-pointer relative group ${
                          task.status === "completed" ? "opacity-60 grayscale-[0.4] hover:opacity-100 hover:grayscale-0" : ""
                        } ${task.status === "in-progress" ? "border-l-4 border-l-primary" : ""}`}
                        onClick={() => moveTask(task.id)}
                      >
                        {/* Subject Badge */}
                        <div className="flex justify-between items-start">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${task.subjectColor || "bg-primary/15 text-primary"}`}>
                            {task.subject}
                          </span>
                          <div className="flex gap-1">
                            {task.priority === "high" && (
                              <span className="material-symbols-outlined text-error fill-icon text-base select-none" title="High Priority">
                                priority_high
                              </span>
                            )}
                            {task.priority === "low" && (
                              <span className="material-symbols-outlined text-on-surface-variant text-base select-none" title="Low Priority">
                                low_priority
                              </span>
                            )}
                            {task.priority === "medium" && (
                              <span className="material-symbols-outlined text-primary text-base select-none" title="Medium Priority">
                                trending_up
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Text Content */}
                        <div>
                          <h4 className={`font-semibold text-base text-on-surface leading-tight transition-all ${
                            task.status === "completed" ? "line-through text-on-surface-variant" : ""
                          }`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-on-surface-variant line-clamp-2 mt-2 leading-relaxed font-light">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Progress metadata */}
                        {(task.progress !== undefined || task.estimatedTime || task.dueDate || task.statusText) && (
                          <div className="space-y-3 pt-1">
                            {task.progress !== undefined && task.status !== "completed" && (
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                  <span className="text-on-surface-variant">Progress</span>
                                  <span className="text-secondary">{task.progress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-secondary to-tertiary rounded-full transition-all duration-500"
                                    style={{ width: `${task.progress}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {task.score && (
                              <div className="text-xs font-bold text-secondary mb-1">
                                {task.score}
                              </div>
                            )}

                            <div className="flex justify-between items-center text-[11px] font-semibold">
                              {task.estimatedTime && (
                                <div className="flex items-center gap-1 text-on-surface-variant">
                                  <span className="material-symbols-outlined text-xs select-none">schedule</span>
                                  <span>{task.estimatedTime}</span>
                                </div>
                              )}
                              {task.dueDate && task.status !== "completed" && (
                                <div className="flex items-center gap-1 text-error">
                                  <span className="material-symbols-outlined text-xs select-none">event</span>
                                  <span>{task.dueDate}</span>
                                </div>
                              )}
                              {task.statusText && (
                                <div className="flex items-center gap-1.5 text-on-surface-variant">
                                  <span className="italic">{task.statusText}</span>
                                </div>
                              )}
                              {task.status === "completed" && (
                                <div className="flex items-center gap-1 text-tertiary font-bold uppercase tracking-wider ml-auto">
                                  <span className="material-symbols-outlined text-xs fill-icon select-none">check_circle</span>
                                  <span>Done</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        <span className="absolute bottom-3 right-3 text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none select-none italic">
                          Click to advance state
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {colTasks.length === 0 && (
                    <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-on-surface-variant/40 italic select-none">
                      No tasks in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
