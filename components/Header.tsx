"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  icon: string;
  color: string;
}

export default function Header() {
  const router = useRouter();
  const [streak, setStreak] = useState(12);
  const [name, setName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Welcome to StudyFlow!",
      description: "Your dynamic workspace and default subjects have been initialized.",
      time: "Just now",
      read: false,
      icon: "auto_stories",
      color: "text-primary bg-primary/10 border-primary/20"
    },
    {
      id: "2",
      title: "Streak Milestone",
      description: "Keep it up! You are maintaining a 12-day study streak.",
      time: "2 hours ago",
      read: false,
      icon: "local_fire_department",
      color: "text-secondary bg-secondary/10 border-secondary/20"
    },
    {
      id: "3",
      title: "Level Up!",
      description: "Congratulations, you have reached Flow Level 24.",
      time: "1 day ago",
      read: true,
      icon: "military_tech",
      color: "text-tertiary bg-tertiary/10 border-tertiary/20"
    }
  ]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setStreak(data.user.currentStreak);
          setName(data.user.name);
          
          // Update the streak milestone notification based on real database streak
          setNotifications(prev => 
            prev.map(n => 
              n.id === "2" 
                ? { ...n, description: `Keep it up! You are maintaining a ${data.user.currentStreak}-day study streak.` }
                : n
            )
          );
        }
      })
      .catch((err) => console.error("Error fetching header auth:", err));
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.refresh();
        router.push("/login");
      }
    } catch (error) {
      console.error("Header logout error:", error);
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const hasUnread = notifications.some(n => !n.read);

  return (
    <header className="flex justify-between items-center px-4 md:px-8 h-20 w-full sticky top-0 z-45 bg-background/40 backdrop-blur-md border-b border-white/10">
      {/* Click outside overlay to close dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile Title */}
      <h1 className="lg:hidden font-bold text-xl text-primary leading-none tracking-tight select-none">
        StudyFlow
      </h1>

      {/* Desktop Search Bar */}
      <div className="hidden md:flex items-center bg-surface-container/60 rounded-full px-4 py-2 border border-white/5 w-96 focus-within:border-primary/50 transition-all duration-300">
        <span className="material-symbols-outlined text-on-surface-variant text-sm mr-2 select-none">search</span>
        <input
          type="text"
          className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-on-surface w-full p-0 placeholder:text-on-surface-variant/50"
          placeholder="Search your knowledge base..."
        />
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4 relative">
        {/* Active Streak Badge */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 glass-card px-3.5 py-1.5 rounded-full cursor-pointer"
        >
          <span className="material-symbols-outlined text-secondary fill-icon text-sm select-none">local_fire_department</span>
          <span className="font-bold text-xs whitespace-nowrap">{streak} Days</span>
        </motion.div>

        {/* Notifications Icon & Dropdown Container */}
        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors relative hover:bg-white/5 active:scale-95 duration-200 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px] select-none">notifications</span>
            {hasUnread && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full animate-pulse" />
            )}
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-3 w-80 sm:w-96 glass-card rounded-2xl border border-white/10 shadow-2xl p-4 z-50 flex flex-col gap-4 overflow-hidden"
              >
                {/* Dropdown Header */}
                <div className="flex justify-between items-center border-b border-white/5 pb-2 shrink-0">
                  <h3 className="font-bold text-sm text-on-surface">Notifications</h3>
                  {hasUnread && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-[10px] text-primary hover:text-secondary font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {/* Dropdown Body */}
                <div className="flex flex-col gap-3 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                  {notifications.length > 0 ? (
                    notifications.map((item) => (
                      <div 
                        key={item.id} 
                        className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all duration-300 relative group/item ${
                          item.read 
                            ? "bg-white/[0.02] border-white/5 opacity-70" 
                            : "bg-primary/5 border-primary/10 shadow-sm"
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${item.color}`}>
                          <span className="material-symbols-outlined text-base select-none">{item.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-xs font-bold text-on-surface truncate">{item.title}</p>
                          <p className="text-[10px] text-on-surface-variant leading-relaxed mt-0.5">{item.description}</p>
                          <span className="text-[8px] text-on-surface-variant/60 font-semibold block mt-1.5">{item.time}</span>
                        </div>
                        {/* Dismiss button */}
                        <button
                          onClick={() => handleDismissNotification(item.id)}
                          className="absolute right-2 top-2 opacity-0 group-hover/item:opacity-100 p-1 rounded-md text-on-surface-variant hover:text-error hover:bg-white/5 transition-all cursor-pointer"
                          title="Dismiss"
                        >
                          <span className="material-symbols-outlined text-xs select-none">close</span>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-xs text-on-surface-variant/40 italic py-8 select-none">
                      No notifications yet
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Log Out Icon */}
        <button
          onClick={handleLogout}
          className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-error hover:bg-white/5 active:scale-95 duration-200"
          title="Log Out"
        >
          <span className="material-symbols-outlined text-[22px] select-none">logout</span>
        </button>

        {/* User Profile Avatar */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30 cursor-pointer shadow-lg"
          title={name || "User Profile"}
        >
          <img
            alt="User profile"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6ceFXpyK2RoN6mDyT1SWXOAEsg6A6N5shpQ-2Lzr1rFEJsOKIMSb2YJUIMUVqmB0W6q1S_gnw1ENLjcO8Mff5xMlTb_qPxdeGURD1QjFxUP-f5-ajhWzxHB-snzcW-uCgaoSH9PzD0sFDfrCxzBeosMc89wX0NIIjwhNRu_lTmimaJZluTYoqz6UoVfa8ana0Pz48fZ39gw4VfCZGZE0GZzZS58dph_u2c_oEjMhz5jCgFpG1yjsqEPUy7fEKy7TeSWn2MHkZO50p"
          />
        </motion.div>
      </div>
    </header>
  );
}
