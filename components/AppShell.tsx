"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import AtmosphericBackground from "@/components/AtmosphericBackground";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login";

  if (isAuthPage) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center relative z-10 px-4">
        <AtmosphericBackground />
        {children}
      </div>
    );
  }

  return (
    <>
      {/* Ambient background glows */}
      <AtmosphericBackground />
      
      {/* Sidebar Navigation (Desktop) */}
      <Sidebar />

      {/* Main outer wrapper */}
      <div className="lg:pl-64 min-h-screen flex flex-col relative z-10">
        {/* Top Header App Bar */}
        <Header />

        {/* Content container */}
        <div className="flex-1">
          {children}
        </div>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <MobileNav />
    </>
  );
}
