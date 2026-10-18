"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Sparkles, Wrench, User } from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "হোম", href: "/", icon: Home },
    { label: "নোট", href: "/notes", icon: BookOpen },
    { label: "AI কুইজ", href: "/ai-quiz", icon: Sparkles, highlight: true },
    { label: "টুলস", href: "/tools/gpa-calculator", icon: Wrench },
    { label: "প্রোফাইল", href: "/login", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200 px-3 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-4 group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 group-active:scale-95 transition">
                  <Icon className="w-6 h-6 animate-pulse" />
                </div>
                <span className="text-[11px] font-bold text-blue-600 mt-1">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2 rounded-lg transition ${
                isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className={`text-[10px] mt-0.5 ${isActive ? "font-bold text-blue-600" : "font-medium"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
