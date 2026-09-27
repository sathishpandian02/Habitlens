"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  GraduationCap,
  Trophy,
  Dumbbell,
  Briefcase,
  Lightbulb,
  Palette,
  Laptop,
  Smile,
  Zap,
} from "lucide-react";
import { USER_PERSONAS, STARTER_HABITS_LIBRARY } from "@/lib/constants";
import { HabitIcon } from "@/components/ui/HabitIcon";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/context/AuthContext";
import { useToast } from "@/components/context/ToastContext";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { showToast, showXPToast } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPersonaId, setSelectedPersonaId] = useState("student");
  const [secondaryInterests, setSecondaryInterests] = useState<string[]>(["Personal Growth", "Productivity"]);
  const [selectedHabits, setSelectedHabits] = useState<any[]>([]);
  const [customHabitName, setCustomHabitName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const personaIcons: Record<string, any> = {
    student: GraduationCap,
    athlete: Trophy,
    fitness: Dumbbell,
    professional: Briefcase,
    entrepreneur: Zap,
    creator: Palette,
    freelancer: Laptop,
    personal_growth: Sparkles,
  };

  const interestOptions = [
    "Academic Focus", "Strength Training", "Cardio & Endurance", "Deep Work",
    "Mental Clarity", "Sleep & Recovery", "Reading", "Nutrition", "Mindfulness"
  ];

  const handleSelectPersona = (personaId: string) => {
    setSelectedPersonaId(personaId);
    const persona = USER_PERSONAS.find((p) => p.id === personaId) || USER_PERSONAS[0];
    setSelectedHabits(persona.recommendedHabits);
  };

  const toggleInterest = (interest: string) => {
    setSecondaryInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const toggleHabitSelection = (habit: any) => {
    setSelectedHabits((prev) => {
      const exists = prev.some((h) => h.name === habit.name);
      if (exists) {
        return prev.filter((h) => h.name !== habit.name);
      } else {
        return [...prev, habit];
      }
    });
  };

  const handleAddCustomHabit = () => {
    if (!customHabitName.trim()) return;
    const newHabit = {
      name: customHabitName.trim(),
      description: "Custom personal habit",
      icon: "Zap",
      category: "Personal Growth",
      goalTarget: 1,
      goalUnit: "time",
      frequencyType: "DAILY",
      color: "#6366f1",
      priority: "MEDIUM",
    };
    setSelectedHabits((prev) => [...prev, newHabit]);
    setCustomHabitName("");
    showToast({ title: `Added "${newHabit.name}" to starter list`, type: "success" });
  };

  const handleFinishOnboarding = async () => {
    setIsLoading(true);
    try {
      const selectedPersona = USER_PERSONAS.find((p) => p.id === selectedPersonaId) || USER_PERSONAS[0];

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryType: selectedPersona.name,
          secondaryInterests,
          selectedHabits,
        }),
      });

      if (res.ok) {
        showXPToast(100, "Onboarding Profile Completed");
        await refreshUser();
        router.push("/dashboard");
      } else {
        showToast({ title: "Failed to save profile settings", type: "error" });
      }
    } catch (e) {
      console.error(e);
      showToast({ title: "Network error during onboarding", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const currentPersona = USER_PERSONAS.find((p) => p.id === selectedPersonaId) || USER_PERSONAS[0];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-6 sm:p-12 flex flex-col justify-between max-w-4xl mx-auto relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Progress Header */}
      <div className="flex items-center justify-between pb-8 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-white">
            Habit<span className="text-indigo-400">Lens</span> Setup
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <span className={step === 1 ? "text-indigo-400" : "text-emerald-400"}>1. Profile Persona</span>
          <span>•</span>
          <span className={step === 2 ? "text-indigo-400" : "text-slate-500"}>2. Starter Habits</span>
        </div>
      </div>

      {/* STEP 1: Choose Persona */}
      {step === 1 && (
        <div className="py-8 space-y-8 animate-in fade-in duration-200">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              Personalize Your Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              What describes you best?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              HabitLens uses your identity to customize habit suggestions, AI Coaching tone, and motivational recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {USER_PERSONAS.map((p) => {
              const Icon = personaIcons[p.id] || Sparkles;
              const isSelected = selectedPersonaId === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectPersona(p.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 backdrop-blur-md ${
                    isSelected
                      ? "bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/10 scale-[1.02]"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isSelected ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <h4 className="text-sm font-bold text-white">{p.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{p.description}</p>
                </div>
              );
            })}
          </div>

          {/* Secondary Interests */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Secondary Focus Areas (Optional)
            </h4>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((opt) => {
                const isChecked = secondaryInterests.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleInterest(opt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isChecked
                        ? "bg-indigo-500/20 border-indigo-500 text-indigo-300"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    {isChecked ? `✓ ${opt}` : `+ ${opt}`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Starter Habit Library */}
      {step === 2 && (
        <div className="py-8 space-y-8 animate-in fade-in duration-200">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              Curated for {currentPersona.name}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Select your starter habits
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Choose the daily habits you want to start tracking. You can modify or add more habits anytime later.
            </p>
          </div>

          {/* Habit Selection List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
            {STARTER_HABITS_LIBRARY.map((h, idx) => {
              const isSelected = selectedHabits.some((sh) => sh.name === h.name);

              return (
                <div
                  key={idx}
                  onClick={() => toggleHabitSelection(h)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-indigo-950/40 border-indigo-500/60 text-white"
                      : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${h.color}20` }}
                    >
                      <HabitIcon name={h.icon} className="w-4 h-4" color={h.color} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{h.name}</h4>
                      <p className="text-[10px] text-slate-400">
                        {h.category} • {h.goalTarget} {h.goalUnit}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                      isSelected ? "bg-indigo-600 border-indigo-500 text-white" : "border-slate-700"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Custom Habit Input */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={customHabitName}
              onChange={(e) => setCustomHabitName(e.target.value)}
              placeholder="Want to track something else? Enter custom habit name..."
              className="flex-1 p-2 text-xs rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500"
            />
            <button
              type="button"
              onClick={handleAddCustomHabit}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
        {step === 2 ? (
          <Button variant="ghost" size="md" onClick={() => setStep(1)}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Persona
          </Button>
        ) : (
          <div />
        )}

        {step === 1 ? (
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              if (selectedHabits.length === 0) {
                const persona = USER_PERSONAS.find((p) => p.id === selectedPersonaId) || USER_PERSONAS[0];
                setSelectedHabits(persona.recommendedHabits);
              }
              setStep(2);
            }}
          >
            Continue to Habits
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            onClick={handleFinishOnboarding}
            isLoading={isLoading}
            disabled={selectedHabits.length === 0}
          >
            Launch HabitLens Dashboard ({selectedHabits.length} Habits)
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
