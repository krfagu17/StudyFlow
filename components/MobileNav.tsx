"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileNavItem {
  name: string;
  href: string;
  icon: string;
}

const navItems: MobileNavItem[] = [
  { name: "Home", href: "/", icon: "home" },
  { name: "Plan", href: "/planner", icon: "event_note" },
  { name: "Tasks", href: "/tasks", icon: "check_circle" },
  { name: "Notes", href: "/notes", icon: "description" },
  { name: "Timer", href: "/timer", icon: "alarm" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 w-full z-50 rounded-t-xl bg-surface-container/80 backdrop-blur-2xl border-t border-white/12 shadow-[0_-10px_40px_rgba(0,0,0,0.4)] flex justify-around items-center px-2 pb-safe pt-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 active:scale-90 ${
              isActive
                ? "bg-primary-container text-on-primary-container font-bold"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[22px] select-none ${
                isActive ? "fill-icon" : ""
              }`}
            >
              {item.icon}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider mt-1">
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
