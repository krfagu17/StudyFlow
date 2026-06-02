"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    currentStreak: 12,
    xpProgress: 8450,
    flowLevel: 24,
    totalHours: 148.5,
  });
  const [heatmapCells, setHeatmapCells] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    // 1. Fetch live user stats
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setStats({
            currentStreak: data.user.currentStreak,
            xpProgress: data.user.xpProgress,
            flowLevel: data.user.flowLevel,
            totalHours: data.user.totalHours,
          });
        }
      })
      .catch((err) => console.error("Error loading analytics auth:", err))
      .finally(() => setLoading(false));

    // 2. Generate contribution cells
    const cells = Array.from({ length: 364 }, () => Math.random());
    setHeatmapCells(cells);

    // 3. Fetch live subjects for distribution
    fetch("/api/subjects")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.subjects) {
          setSubjects(data.subjects);
        }
      })
      .catch((err) => console.error("Error loading analytics subjects:", err));
  }, []);

  // Compute dynamic subject distribution
  const totalProgress = subjects.reduce((sum, s) => sum + (s.progress || 10), 0);
  const subjectDistribution = subjects.length > 0 
    ? subjects.map((s, idx) => {
        const colors = ["bg-primary", "bg-secondary", "bg-tertiary", "bg-orange-400", "bg-blue-400"];
        return {
          name: s.title,
          pct: totalProgress > 0 ? Math.round(((s.progress || 10) / totalProgress) * 100) : Math.round(100 / subjects.length),
          color: colors[idx % colors.length]
        };
      })
    : [
        { name: "Neuroscience", pct: 45, color: "bg-primary" },
        { name: "Biochemistry", pct: 30, color: "bg-secondary" },
        { name: "Pathology", pct: 15, color: "bg-tertiary" },
        { name: "Others", pct: 10, color: "bg-surface-container-highest" },
      ];

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1440px] mx-auto">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">
            Progress Dashboard
          </p>
          <h2 className="font-bold text-3xl md:text-4xl text-on-background tracking-tight">
            Academic Flow Analytics
          </h2>
          <p className="text-on-surface-variant text-sm md:text-base font-medium max-w-xl">
            Visualize your deep work patterns and optimize your study velocity for the upcoming exam season.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary font-bold shadow-lg hover:brightness-105 active:scale-95 duration-200 transition-all cursor-pointer text-xs uppercase tracking-wider">
            Download Report
          </button>
          <button className="px-5 py-3 rounded-xl glass-card text-on-surface font-bold hover:bg-white/10 active:scale-95 duration-200 transition-all cursor-pointer text-xs uppercase tracking-wider">
            Custom Range
          </button>
        </div>
      </section>

      {/* Bento Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Productivity Heatmap */}
          <div className="md:col-span-8 glass-card rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-base text-on-surface">Productivity Heatmap</h3>
              <div className="flex items-center gap-2 text-on-surface-variant text-[11px] font-semibold uppercase tracking-wider">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-[2px] bg-surface-container-highest" />
                  <div className="w-3 h-3 rounded-[2px] bg-primary-container/40" />
                  <div className="w-3 h-3 rounded-[2px] bg-primary-container/70" />
                  <div className="w-3 h-3 rounded-[2px] bg-primary" />
                </div>
                <span>More</span>
              </div>
            </div>
            
            <div className="overflow-x-auto custom-scrollbar pb-2">
              <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-[620px]">
                {heatmapCells.map((val, idx) => {
                  let opacityClass = "bg-surface-container-highest";
                  let hours = 0;
                  
                  if (val > 0.8) {
                    opacityClass = "bg-primary shadow-[0_0_6px_rgba(209,188,255,0.4)]";
                    hours = Math.floor(val * 8) + 4;
                  } else if (val > 0.5) {
                    opacityClass = "bg-primary-container/70";
                    hours = Math.floor(val * 6) + 2;
                  } else if (val > 0.25) {
                    opacityClass = "bg-primary-container/40";
                    hours = Math.floor(val * 4) + 1;
                  }
                  
                  return (
                    <div
                      key={idx}
                      className={`w-3 h-3 rounded-[2px] ${opacityClass} hover:ring-1 hover:ring-white/40 transition-all cursor-pointer`}
                      title={`Day ${idx + 1}: ${hours} study hours`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Gamification Level Card */}
          <div className="md:col-span-4 glass-card rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-lg text-tertiary">Flow Level {stats.flowLevel}</h3>
                  <p className="text-on-surface-variant text-xs mt-0.5 font-medium">Master Researcher</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container border border-tertiary/20">
                  <span className="material-symbols-outlined fill-icon select-none">military_tech</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  <span>XP Progress</span>
                  <span>{stats.xpProgress} / 10,000</span>
                </div>
                <div className="h-3 w-full bg-surface-container-lowest rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-secondary to-tertiary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((stats.xpProgress / 10000) * 100, 100)}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-[10px] font-bold text-on-surface-variant mb-3 uppercase tracking-wider">
                Recent Badges
              </h4>
              <div className="flex gap-4">
                {[
                  { icon: "bolt", label: "7 Day Streak", color: "text-primary bg-primary/10 border-primary/20" },
                  { icon: "auto_stories", label: "Revision Master", color: "text-secondary bg-secondary/10 border-secondary/20" },
                  { icon: "verified", label: "Exam Ready", color: "text-tertiary bg-tertiary/10 border-tertiary/20" },
                ].map((badge) => (
                  <div key={badge.label} className="group relative">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${badge.color}`}>
                      <span className="material-symbols-outlined fill-icon select-none">{badge.icon}</span>
                    </div>
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-background border border-white/10 px-2 py-0.5 rounded shadow-lg pointer-events-none">
                      {badge.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Study Hours */}
          <div className="md:col-span-7 glass-card rounded-2xl p-6">
            <h3 className="font-bold text-base text-on-surface mb-6">Weekly Study Hours</h3>
            <div className="flex items-end justify-between h-48 gap-4 px-2">
              {[
                { day: "Mon", hrs: 6.2, pct: "60%", active: false },
                { day: "Tue", hrs: 8.5, pct: "85%", active: false },
                { day: "Wed", hrs: 9.8, pct: "95%", active: true },
                { day: "Thu", hrs: 4.1, pct: "40%", active: false },
                { day: "Fri", hrs: 7.2, pct: "70%", active: false },
                { day: "Sat", hrs: 3.0, pct: "30%", active: false },
                { day: "Sun", hrs: 2.1, pct: "20%", active: false },
              ].map((bar) => (
                <div key={bar.day} className="flex flex-col items-center gap-2.5 flex-1 group">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 relative cursor-pointer ${
                      bar.active
                        ? "bg-primary shadow-[0_0_12px_rgba(209,188,255,0.45)]"
                        : "bg-primary/20 group-hover:bg-primary/40"
                    }`}
                    style={{ height: bar.pct }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-surface-container-high px-1.5 py-0.5 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none whitespace-nowrap">
                      {bar.hrs}h
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${bar.active ? "text-primary" : "text-on-surface-variant"}`}>
                    {bar.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Subject wise split ring chart */}
          <div className="md:col-span-5 glass-card rounded-2xl p-6">
            <h3 className="font-bold text-base text-on-surface mb-6">Subject Distribution</h3>
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
              <div className="relative w-36 h-36 shrink-0">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-surface-container-highest"
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="11"
                  />
                  {subjectDistribution.slice(0, 4).map((item, idx) => {
                    const circum = 251.2;
                    const prevPct = subjectDistribution.slice(0, idx).reduce((sum, cur) => sum + cur.pct, 0);
                    const strokeOffset = circum - (item.pct / 100) * circum;
                    const strokeRotation = (prevPct / 100) * 360 - 90;
                    const textClass = item.color.replace("bg-", "text-");
                    
                    return (
                      <circle
                        key={item.name}
                        className={`${textClass} transition-all duration-500`}
                        cx="50"
                        cy="50"
                        fill="transparent"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="11"
                        strokeDasharray={circum}
                        strokeDashoffset={strokeOffset}
                        strokeLinecap="round"
                        style={{
                          transform: `rotate(${strokeRotation}deg)`,
                          transformOrigin: "50px 50px"
                        }}
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-bold text-2xl text-primary leading-none">{stats.totalHours}h</span>
                  <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider mt-1">
                    Total
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 flex-1 w-full">
                {subjectDistribution.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <span className="text-on-surface-variant line-clamp-1">{item.name}</span>
                    </div>
                    <span className="text-on-surface font-bold">{item.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced KPI Stats */}
          <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Retention Rate", val: "92%", color: "border-l-primary text-primary", change: "+4%", sub: "Based on active recall scores" },
              { label: "Focus Score", val: "88/100", color: "border-l-secondary text-secondary", change: "High Performance", sub: "Avg deep work session: 92min" },
              { label: "Study Velocity", val: "14.2", color: "border-l-tertiary text-tertiary", change: "Pages/Hr", sub: "Optimal reading speed active" },
              { label: "Exam Readiness", val: "76%", color: "border-l-outline text-on-surface", change: `${stats.currentStreak} day streak`, sub: "12 days until Finals" },
            ].map((kpi) => (
              <div key={kpi.label} className={`glass-card p-5 rounded-xl border-l-4 ${kpi.color.split(" ")[0]}`}>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{kpi.label}</p>
                <div className="flex items-end gap-2 mt-1.5">
                  <h4 className={`text-2xl font-bold ${kpi.color.split(" ")[1]}`}>{kpi.val}</h4>
                  <span className="text-[10px] font-bold text-green-400 mb-1 flex items-center">
                    {kpi.change}
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant font-medium mt-1">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Goal comparative line chart */}
          <div className="md:col-span-12 glass-card rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-base text-on-surface">Learning Goals Progress</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(209,188,255,0.4)]" />
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Planned</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary shadow-[0_0_8px_rgba(252,170,255,0.4)]" />
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Actual</span>
                </div>
              </div>
            </div>
            
            <div className="h-64 w-full relative">
              <svg className="w-full h-full" viewBox="0 0 1000 200" preserveAspectRatio="none">
                <path
                  d="M0,180 Q100,160 200,150 T400,120 T600,80 T800,50 T1000,20"
                  fill="transparent"
                  opacity="0.4"
                  stroke="#d1bcff"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                />
                <path
                  d="M0,180 L100,175 L200,140 L300,145 L400,110 L500,90 L600,95 L700,70 L800,75 L900,40 L1000,35"
                  fill="transparent"
                  stroke="url(#lineGradient)"
                  strokeLinecap="round"
                  strokeWidth="4"
                />
                <defs>
                  <linearGradient id="lineGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#d1bcff" stopOpacity="1" />
                    <stop offset="100%" stopColor="#fcaaff" stopOpacity="1" />
                  </linearGradient>
                </defs>
              </svg>
              
              <div className="absolute inset-0 border-b border-white/5 pointer-events-none" />
              <div className="absolute inset-0 border-b border-white/5 translate-y-1/4 pointer-events-none" />
              <div className="absolute inset-0 border-b border-white/5 translate-y-2/4 pointer-events-none" />
              <div className="absolute inset-0 border-b border-white/5 translate-y-3/4 pointer-events-none" />
            </div>
            
            <div className="flex justify-between mt-4 px-2 text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
