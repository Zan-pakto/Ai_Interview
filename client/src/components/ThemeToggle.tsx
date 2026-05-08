"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-lg" />;
  }

  return (
    <button
      onClick={() => {
        console.log("Current theme:", theme);
        const newTheme = theme === "dark" ? "light" : "dark";
        console.log("Setting theme to:", newTheme);
        setTheme(newTheme);
      }}
      className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.06] transition-colors overflow-hidden"
    >
      <Sun size={18} className="absolute transition-all scale-100 rotate-0 dark:scale-0 dark:-rotate-90 text-neutral-600" />
      <Moon size={18} className="absolute transition-all scale-0 rotate-90 dark:scale-100 dark:rotate-0 text-neutral-300" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
