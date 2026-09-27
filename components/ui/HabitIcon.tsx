"use client";

import React from "react";
import * as Icons from "lucide-react";

interface HabitIconProps {
  name: string;
  className?: string;
  color?: string;
}

export function HabitIcon({ name, className = "w-5 h-5", color }: HabitIconProps) {
  // @ts-ignore
  const IconComponent = Icons[name] || Icons.Zap;

  return <IconComponent className={className} style={color ? { color } : undefined} />;
}
