"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface SidebarItem {
  name: string;
  href: string;
  icon: string;
}

const sidebarItems: SidebarItem[] = [
  { name: "Dashboard", href: "/", icon: "dashboard" },
  { name: "Study Planner", href: "/planner", icon: "event_note" },
  { name: "Tasks", href: "/tasks", icon: "check_circle" },
  { name: "Focus Timer", href: "/timer", icon: "alarm" },
  { name: "Notes", href: "/notes", icon: "description" },
  { name: "Analytics", href: "/analytics", icon: "insights" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [streak, setStreak] = useState(12);
  const [xp, setXp] = useState(8450);

  useEffect(() => {
    // Fetch current user stats on load
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setStreak(data.user.currentStreak);
          setXp(data.user.xpProgress);
        }
      })
      .catch((err) => console.error("Error fetching stats:", err));
  }, [pathname]); // Refresh stats when navigating

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.refresh();
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside className="h-screen w-64 hidden lg:flex flex-col fixed left-0 top-0 bg-background/85 backdrop-blur-xl border-r border-white/10 shadow-2xl z-50 p-6 gap-y-4">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_15px_rgba(209,188,255,0.3)]">
          <span className="material-symbols-outlined text-on-primary font-semibold select-none">school</span>
        </div>
        <div>
          <h1 className="font-bold text-xl text-primary leading-none tracking-tight">StudyFlow</h1>
          <p className="text-[10px] text-on-surface-variant/80 tracking-widest uppercase mt-0.5">Premium Focus</p>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-y-1.5">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden ${
                isActive
                  ? "text-primary font-bold bg-primary/10 border-r-4 border-primary"
                  : "text-on-surface-variant hover:bg-white/5 hover:text-primary"
              }`}
            >
              {!isActive && (
                <span className="absolute inset-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              )}
              
              <span
                className={`material-symbols-outlined text-xl transition-colors select-none ${
                  isActive ? "fill-icon text-primary" : "text-on-surface-variant group-hover:text-primary"
                }`}
              >
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Stats Streak widget */}
      <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-4">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-2xl bg-secondary-container/20 border border-secondary/20 flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-sm fill-icon animate-pulse select-none">local_fire_department</span>
            <span className="text-secondary text-xs font-bold uppercase tracking-wider">{streak} Day Streak</span>
          </div>
          <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
            <div 
              className="h-full bg-secondary rounded-full shadow-[0_0_10px_rgba(252,170,255,0.4)]" 
              style={{ width: `${Math.min((xp / 10000) * 100, 100)}%` }}
            />
          </div>
        </motion.div>

        {/* Log Out Action */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 rounded-xl text-error hover:bg-error/10 transition-all duration-300 cursor-pointer w-full text-left"
        >
          <span className="material-symbols-outlined text-xl select-none">logout</span>
          <span className="text-sm font-bold uppercase tracking-wider">Log Out</span>
        </button>
      </div>
    </aside>
  );
}
