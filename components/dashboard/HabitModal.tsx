"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { HabitIcon } from "@/components/ui/HabitIcon";
import { useToast } from "@/components/context/ToastContext";

const AVAILABLE_ICONS = [
  "Flame", "Dumbbell", "BookOpen", "Book", "Moon", "Sun", "Droplets",
  "Sparkles", "Code", "Trophy", "Activity", "Footprints", "Smile",
  "Apple", "Smartphone", "Feather", "CheckSquare", "Zap", "Target", "Briefcase"
];

const AVAILABLE_COLORS = [
  "#6366f1", "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b",
  "#ef4444", "#ec4899", "#06b6d4", "#14b8a6", "#84cc16"
];

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitToEdit?: any | null;
  categories: Array<{ id: string; name: string; color: string }>;
  onSaved: () => void;
}

export function HabitModal({ isOpen, onClose, habitToEdit, categories, onSaved }: HabitModalProps) {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [icon, setIcon] = useState("Flame");
  const [color, setColor] = useState("#6366f1");
  const [goalTarget, setGoalTarget] = useState(1);
  const [goalUnit, setGoalUnit] = useState("times");
  const [frequencyType, setFrequencyType] = useState("DAILY");
  const [reminderTime, setReminderTime] = useState("09:00");
  const [priority, setPriority] = useState("MEDIUM");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name || "");
      setDescription(habitToEdit.description || "");
      setCategoryId(habitToEdit.categoryId || categories[0]?.id || "");
      setIcon(habitToEdit.icon || "Flame");
      setColor(habitToEdit.color || "#6366f1");
      setGoalTarget(habitToEdit.goalTarget || 1);
      setGoalUnit(habitToEdit.goalUnit || "times");
      setFrequencyType(habitToEdit.frequencyType || "DAILY");
      setReminderTime(habitToEdit.reminderTime || "09:00");
      setPriority(habitToEdit.priority || "MEDIUM");
      setDifficulty(habitToEdit.difficulty || "MEDIUM");
    } else {
      setName("");
      setDescription("");
      setCategoryId(categories[0]?.id || "");
      setIcon("Flame");
      setColor("#6366f1");
      setGoalTarget(1);
      setGoalUnit("times");
      setFrequencyType("DAILY");
      setReminderTime("09:00");
      setPriority("MEDIUM");
      setDifficulty("MEDIUM");
    }
  }, [habitToEdit, categories, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast({ title: "Please enter a habit name", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const url = habitToEdit ? `/api/habits/${habitToEdit.id}` : "/api/habits";
      const method = habitToEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          categoryId: categoryId || null,
          icon,
          color,
          goalTarget: Number(goalTarget) || 1,
          goalUnit: goalUnit.trim() || "times",
          frequencyType,
          reminderTime,
          priority,
          difficulty,
        }),
      });

      if (res.ok) {
        showToast({
          title: habitToEdit ? "Habit updated successfully!" : "New habit created!",
          type: "success",
        });
        onSaved();
        onClose();
      } else {
        const data = await res.json();
        showToast({ title: data.error || "Failed to save habit", type: "error" });
      }
    } catch (err) {
      console.error(err);
      showToast({ title: "Network error saving habit", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={habitToEdit ? "Edit Habit" : "Create New Habit"}
      subtitle="Define your habit cadence, target metrics, and reminder schedule"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Habit Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Habit Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Read 20 Pages, Morning Run"
              className="w-full p-2.5 text-xs rounded-xl bg-slate-800/60 border border-slate-700 focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl bg-slate-800/60 border border-slate-700 focus:outline-none focus:border-indigo-500 text-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Description / Why It Matters
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Sharpens deep focus and continuous learning"
            className="w-full p-2.5 text-xs rounded-xl bg-slate-800/60 border border-slate-700 focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500"
          />
        </div>

        {/* Icon & Color Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Icon & Color Accent
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {AVAILABLE_ICONS.slice(0, 10).map((ic) => (
              <button
                type="button"
                key={ic}
                onClick={() => setIcon(ic)}
                className={`p-2 rounded-xl border flex-shrink-0 transition-all ${
                  icon === ic
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-md"
                    : "border-slate-800 bg-slate-800/40 text-slate-400 hover:text-white"
                }`}
              >
                <HabitIcon name={ic} className="w-4 h-4" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-2">
            {AVAILABLE_COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  color === c ? "scale-125 border-white shadow-sm" : "border-transparent opacity-80 hover:opacity-100"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Target & Units */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Daily Target
            </label>
            <input
              type="number"
              min="1"
              value={goalTarget}
              onChange={(e) => setGoalTarget(Number(e.target.value))}
              className="w-full p-2.5 text-xs rounded-xl bg-slate-800/60 border border-slate-700 focus:outline-none focus:border-indigo-500 text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Unit
            </label>
            <input
              type="text"
              value={goalUnit}
              onChange={(e) => setGoalUnit(e.target.value)}
              placeholder="e.g. minutes, pages, steps, km"
              className="w-full p-2.5 text-xs rounded-xl bg-slate-800/60 border border-slate-700 focus:outline-none focus:border-indigo-500 text-white"
            />
          </div>
        </div>

        {/* Frequency & Reminder & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Frequency
            </label>
            <select
              value={frequencyType}
              onChange={(e) => setFrequencyType(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl bg-slate-800/60 border border-slate-700 focus:outline-none focus:border-indigo-500 text-white"
            >
              <option value="DAILY">Every Day</option>
              <option value="WEEKDAYS">Weekdays Only</option>
              <option value="WEEKLY">Weekly Target</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Reminder Time
            </label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl bg-slate-800/60 border border-slate-700 focus:outline-none focus:border-indigo-500 text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl bg-slate-800/60 border border-slate-700 focus:outline-none focus:border-indigo-500 text-white"
            >
              <option value="HIGH">High Priority 🔥</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
            {habitToEdit ? "Update Habit" : "Create Habit"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
