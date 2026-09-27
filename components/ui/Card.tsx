import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverEffect?: boolean;
}

export function Card({ className, glass = true, hoverEffect = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 transition-all duration-200 border",
        glass
          ? "bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-black/20"
          : "bg-white dark:bg-gray-900 border-slate-200 dark:border-slate-800",
        hoverEffect && "hover:border-indigo-500/40 dark:hover:border-indigo-500/40 hover:shadow-md dark:hover:shadow-indigo-500/5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800/60", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-semibold text-slate-900 dark:text-white tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
}
