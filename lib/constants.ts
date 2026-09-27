export interface PersonaConfig {
  id: string;
  name: string;
  badge: string;
  description: string;
  recommendedHabits: Array<{
    name: string;
    description: string;
    icon: string;
    category: string;
    goalTarget: number;
    goalUnit: string;
    frequencyType: string;
    color: string;
    priority: string;
  }>;
}

export const USER_PERSONAS: PersonaConfig[] = [
  {
    id: "student",
    name: "Student",
    badge: "Student • Academic Focus",
    description: "Focus on study routines, revision, deep focus, and balanced wellness.",
    recommendedHabits: [
      { name: "Deep Study", description: "Focused study blocks without distractions", icon: "BookOpen", category: "Study", goalTarget: 90, goalUnit: "minutes", frequencyType: "DAILY", color: "#6366f1", priority: "HIGH" },
      { name: "Daily Revision", description: "Review class notes and key concepts", icon: "GraduationCap", category: "Study", goalTarget: 30, goalUnit: "minutes", frequencyType: "DAILY", color: "#8b5cf6", priority: "MEDIUM" },
      { name: "Reading", description: "Read academic or personal growth books", icon: "Book", category: "Personal Growth", goalTarget: 20, goalUnit: "pages", frequencyType: "DAILY", color: "#3b82f6", priority: "MEDIUM" },
      { name: "Sleep on Time", description: "Wind down and sleep before 11:00 PM", icon: "Moon", category: "Sleep", goalTarget: 1, goalUnit: "time", frequencyType: "DAILY", color: "#6366f1", priority: "HIGH" },
      { name: "Exercise / Movement", description: "Gym workout, jogging or home workout", icon: "Activity", category: "Fitness", goalTarget: 30, goalUnit: "minutes", frequencyType: "DAILY", color: "#10b981", priority: "MEDIUM" },
      { name: "Reduce Screen Time", description: "Limit non-academic phone time under 2 hrs", icon: "Smartphone", category: "Productivity", goalTarget: 1, goalUnit: "goal", frequencyType: "DAILY", color: "#f59e0b", priority: "HIGH" },
      { name: "Skill Learning", description: "Code, design or language practice", icon: "Code", category: "Personal Growth", goalTarget: 45, goalUnit: "minutes", frequencyType: "DAILY", color: "#ec4899", priority: "MEDIUM" },
    ],
  },
  {
    id: "athlete",
    name: "Athlete",
    badge: "Athlete • High Performance",
    description: "Built for peak physical conditioning, discipline, recovery, and nutrition.",
    recommendedHabits: [
      { name: "Training Session", description: "Sport-specific practice and drills", icon: "Trophy", category: "Fitness", goalTarget: 60, goalUnit: "minutes", frequencyType: "DAILY", color: "#ef4444", priority: "HIGH" },
      { name: "Strength Training", description: "Gym resistance and power lifting", icon: "Dumbbell", category: "Fitness", goalTarget: 45, goalUnit: "minutes", frequencyType: "DAILY", color: "#f97316", priority: "HIGH" },
      { name: "Running / Cardio", description: "Endurance run or sprint intervals", icon: "Flame", category: "Fitness", goalTarget: 5, goalUnit: "km", frequencyType: "DAILY", color: "#10b981", priority: "HIGH" },
      { name: "Hydration Target", description: "Drink at least 3.5 liters of clean water", icon: "Droplets", category: "Health", goalTarget: 3.5, goalUnit: "liters", frequencyType: "DAILY", color: "#06b6d4", priority: "MEDIUM" },
      { name: "Sleep & Recovery", description: "Get at least 8 hours of restorative sleep", icon: "Moon", category: "Sleep", goalTarget: 8, goalUnit: "hours", frequencyType: "DAILY", color: "#6366f1", priority: "HIGH" },
      { name: "Mobility & Stretching", description: "Post-workout recovery and flexibility", icon: "Smile", category: "Health", goalTarget: 15, goalUnit: "minutes", frequencyType: "DAILY", color: "#84cc16", priority: "MEDIUM" },
      { name: "High-Protein Nutrition", description: "Meet daily clean macronutrient goals", icon: "Apple", category: "Health", goalTarget: 1, goalUnit: "target", frequencyType: "DAILY", color: "#14b8a6", priority: "HIGH" },
    ],
  },
  {
    id: "fitness",
    name: "Fitness Enthusiast",
    badge: "Fitness • Active Lifestyle",
    description: "Consistent gym workouts, step goals, nutrition, and daily vitality.",
    recommendedHabits: [
      { name: "Gym Workout", description: "Complete weightlifting or resistance routine", icon: "Dumbbell", category: "Fitness", goalTarget: 50, goalUnit: "minutes", frequencyType: "DAILY", color: "#6366f1", priority: "HIGH" },
      { name: "10,000 Steps", description: "Daily walking and step target", icon: "Footprints", category: "Fitness", goalTarget: 10000, goalUnit: "steps", frequencyType: "DAILY", color: "#10b981", priority: "HIGH" },
      { name: "Drink Water", description: "Drink 3 liters of water throughout the day", icon: "Droplets", category: "Health", goalTarget: 3, goalUnit: "liters", frequencyType: "DAILY", color: "#0ea5e9", priority: "MEDIUM" },
      { name: "Track Nutrition", description: "Log healthy meals and hit protein target", icon: "Utensils", category: "Health", goalTarget: 1, goalUnit: "day", frequencyType: "DAILY", color: "#f59e0b", priority: "MEDIUM" },
      { name: "Sleep on Time", description: "Consistent 7.5+ hours of sleep", icon: "Moon", category: "Sleep", goalTarget: 1, goalUnit: "goal", frequencyType: "DAILY", color: "#8b5cf6", priority: "HIGH" },
      { name: "Daily Stretching", description: "Morning or evening full body mobility", icon: "Smile", category: "Health", goalTarget: 15, goalUnit: "minutes", frequencyType: "DAILY", color: "#ec4899", priority: "LOW" },
    ],
  },
  {
    id: "professional",
    name: "Professional",
    badge: "Professional • High Output",
    description: "Deep work sessions, strategic planning, continuous learning, and mental clarity.",
    recommendedHabits: [
      { name: "Deep Work Block", description: "2 hours uninterrupted high-leverage focus", icon: "Briefcase", category: "Productivity", goalTarget: 120, goalUnit: "minutes", frequencyType: "DAILY", color: "#4f46e5", priority: "HIGH" },
      { name: "Plan Tomorrow", description: "Outline top 3 priority tasks before bed", icon: "CheckSquare", category: "Productivity", goalTarget: 1, goalUnit: "plan", frequencyType: "DAILY", color: "#06b6d4", priority: "HIGH" },
      { name: "Industry Reading", description: "Read insightful articles or technical books", icon: "BookOpen", category: "Personal Growth", goalTarget: 25, goalUnit: "minutes", frequencyType: "DAILY", color: "#3b82f6", priority: "MEDIUM" },
      { name: "Gym or Run", description: "Cardio or weights for energy and stress relief", icon: "Activity", category: "Fitness", goalTarget: 35, goalUnit: "minutes", frequencyType: "DAILY", color: "#10b981", priority: "MEDIUM" },
      { name: "Digital Detox / Wind Down", description: "No email or Slack after 8:30 PM", icon: "Shield", category: "Sleep", goalTarget: 1, goalUnit: "routine", frequencyType: "DAILY", color: "#f43f5e", priority: "HIGH" },
      { name: "Daily Journaling", description: "Reflect on wins, decisions, and lessons", icon: "Feather", category: "Mindfulness", goalTarget: 1, goalUnit: "entry", frequencyType: "DAILY", color: "#eab308", priority: "LOW" },
    ],
  },
  {
    id: "personal_growth",
    name: "Personal Growth",
    badge: "Personal Growth • Mind & Body",
    description: "Holistic self-improvement, mindfulness, habits, and mindful living.",
    recommendedHabits: [
      { name: "Wake Up Early", description: "Rise at 6:30 AM with energizing routine", icon: "Sun", category: "Productivity", goalTarget: 1, goalUnit: "routine", frequencyType: "DAILY", color: "#f59e0b", priority: "HIGH" },
      { name: "Morning Meditation", description: "Mindful breathing and presence", icon: "Sparkles", category: "Mindfulness", goalTarget: 15, goalUnit: "minutes", frequencyType: "DAILY", color: "#8b5cf6", priority: "HIGH" },
      { name: "Reading Books", description: "Read non-fiction or philosophy books", icon: "Book", category: "Personal Growth", goalTarget: 20, goalUnit: "pages", frequencyType: "DAILY", color: "#3b82f6", priority: "HIGH" },
      { name: "Healthy Eating", description: "Wholesome whole foods, no junk or soda", icon: "Apple", category: "Health", goalTarget: 1, goalUnit: "day", frequencyType: "DAILY", color: "#10b981", priority: "MEDIUM" },
      { name: "Evening Journaling", description: "Gratitude and daily review", icon: "PenTool", category: "Mindfulness", goalTarget: 1, goalUnit: "entry", frequencyType: "DAILY", color: "#ec4899", priority: "MEDIUM" },
      { name: "Daily Walk", description: "Walk outdoors for fresh air and clarity", icon: "Footprints", category: "Health", goalTarget: 30, goalUnit: "minutes", frequencyType: "DAILY", color: "#06b6d4", priority: "LOW" },
      { name: "Sleep on Time", description: "In bed by 10:45 PM for 8h rest", icon: "Moon", category: "Sleep", goalTarget: 1, goalUnit: "target", frequencyType: "DAILY", color: "#6366f1", priority: "HIGH" },
    ],
  },
];

export const STARTER_HABITS_LIBRARY = [
  { name: "Running", icon: "Flame", category: "Fitness", goalTarget: 30, goalUnit: "minutes", frequencyType: "DAILY", color: "#10b981", priority: "HIGH" },
  { name: "Gym / Workout", icon: "Dumbbell", category: "Fitness", goalTarget: 45, goalUnit: "minutes", frequencyType: "DAILY", color: "#6366f1", priority: "HIGH" },
  { name: "Reading", icon: "BookOpen", category: "Personal Growth", goalTarget: 20, goalUnit: "pages", frequencyType: "DAILY", color: "#3b82f6", priority: "MEDIUM" },
  { name: "Sleep on Time", icon: "Moon", category: "Sleep", goalTarget: 1, goalUnit: "time", frequencyType: "DAILY", color: "#8b5cf6", priority: "HIGH" },
  { name: "Wake Up Early", icon: "Sun", category: "Productivity", goalTarget: 1, goalUnit: "time", frequencyType: "DAILY", color: "#f59e0b", priority: "MEDIUM" },
  { name: "Drink Enough Water", icon: "Droplets", category: "Health", goalTarget: 3, goalUnit: "liters", frequencyType: "DAILY", color: "#06b6d4", priority: "MEDIUM" },
  { name: "Meditation", icon: "Sparkles", category: "Mindfulness", goalTarget: 15, goalUnit: "minutes", frequencyType: "DAILY", color: "#a855f7", priority: "MEDIUM" },
  { name: "Study / Focus Block", icon: "GraduationCap", category: "Study", goalTarget: 60, goalUnit: "minutes", frequencyType: "DAILY", color: "#4f46e5", priority: "HIGH" },
  { name: "Skill Learning", icon: "Code", category: "Personal Growth", goalTarget: 30, goalUnit: "minutes", frequencyType: "DAILY", color: "#ec4899", priority: "MEDIUM" },
  { name: "Walking / Steps", icon: "Footprints", category: "Fitness", goalTarget: 8000, goalUnit: "steps", frequencyType: "DAILY", color: "#14b8a6", priority: "MEDIUM" },
  { name: "Stretching & Mobility", icon: "Smile", category: "Health", goalTarget: 15, goalUnit: "minutes", frequencyType: "DAILY", color: "#84cc16", priority: "LOW" },
  { name: "Reduce Screen Time", icon: "Smartphone", category: "Productivity", goalTarget: 1, goalUnit: "goal", frequencyType: "DAILY", color: "#ef4444", priority: "HIGH" },
  { name: "Healthy Nutrition", icon: "Apple", category: "Health", goalTarget: 1, goalUnit: "day", frequencyType: "DAILY", color: "#10b981", priority: "MEDIUM" },
  { name: "Journaling & Gratitude", icon: "Feather", category: "Mindfulness", goalTarget: 1, goalUnit: "entry", frequencyType: "DAILY", color: "#f97316", priority: "LOW" },
  { name: "Planning Tomorrow", icon: "CheckSquare", category: "Productivity", goalTarget: 1, goalUnit: "plan", frequencyType: "DAILY", color: "#0284c7", priority: "HIGH" },
];

export const DEFAULT_ACHIEVEMENTS = [
  { code: "FIRST_STEP", title: "First Step", description: "Complete your very first habit in HabitLens.", category: "GENERAL", icon: "Trophy", xpReward: 50, conditionType: "FIRST_HABIT", threshold: 1 },
  { code: "STREAK_7", title: "7-Day Warrior", description: "Maintain a flawless 7-day consistency streak.", category: "STREAK", icon: "Flame", xpReward: 150, conditionType: "STREAK_7", threshold: 7 },
  { code: "STREAK_30", title: "Habit Master", description: "Sustain a powerful 30-day streak of dedication.", category: "STREAK", icon: "Crown", xpReward: 500, conditionType: "STREAK_30", threshold: 30 },
  { code: "TOTAL_50", title: "Consistency King", description: "Log 50 completed habits across your journey.", category: "COMPLETION", icon: "Award", xpReward: 250, conditionType: "TOTAL_50", threshold: 50 },
  { code: "READING_30", title: "Knowledge Builder", description: "Complete 30 reading or learning sessions.", category: "MASTERY", icon: "BookOpen", xpReward: 300, conditionType: "READING_30", threshold: 30 },
  { code: "PERFECT_DAY", title: "Perfect Day", description: "Complete 100% of all scheduled habits in one single day.", category: "COMPLETION", icon: "Star", xpReward: 100, conditionType: "PERFECT_DAY", threshold: 1 },
  { code: "PERFECT_WEEK", title: "Flawless Week", description: "Achieve a 100% weekly habit completion rate.", category: "COMPLETION", icon: "ShieldCheck", xpReward: 400, conditionType: "PERFECT_WEEK", threshold: 1 },
  { code: "COMEBACK", title: "Resilient Comeback", description: "Restart and complete your habits after an inactive period.", category: "SPECIAL", icon: "Zap", xpReward: 120, conditionType: "COMEBACK", threshold: 1 },
];

export const DEFAULT_CHALLENGES = [
  { title: "7-Day Reading Sprint", description: "Read for at least 20 minutes every single day for 7 days straight.", category: "Personal Growth", durationDays: 7, targetCount: 7, badgeReward: "Book" },
  { title: "30-Day Fitness Awakening", description: "Log workouts or 8,000+ daily steps across 30 days to build raw discipline.", category: "Fitness", durationDays: 30, targetCount: 30, badgeReward: "Dumbbell" },
  { title: "Sleep Reset & Recovery", description: "Sleep on time before 11:00 PM for 7 consecutive nights to recharge your brain.", category: "Sleep", durationDays: 7, targetCount: 7, badgeReward: "Moon" },
  { title: "Digital Focus Challenge", description: "Keep non-work screen time under 2 hours daily for 14 days.", category: "Productivity", durationDays: 14, targetCount: 14, badgeReward: "Smartphone" },
];
