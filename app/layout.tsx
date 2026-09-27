import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/context/ThemeContext";
import { AuthProvider } from "@/components/context/AuthContext";
import { ToastProvider } from "@/components/context/ToastContext";

export const metadata: Metadata = {
  title: "HabitLens — Advanced AI-Powered Habit & Personal Growth Platform",
  description: "Track habits, analyze performance, unlock intelligent AI coaching, build streaks, and achieve measurable personal growth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
