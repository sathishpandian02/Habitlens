const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { subDays, format } = require("date-fns");

const prisma = new PrismaClient();

const DEFAULT_ACHIEVEMENTS = [
  { code: "FIRST_STEP", title: "First Step", description: "Complete your very first habit in HabitLens.", category: "GENERAL", icon: "Trophy", xpReward: 50, conditionType: "FIRST_HABIT", threshold: 1 },
  { code: "STREAK_7", title: "7-Day Warrior", description: "Maintain a flawless 7-day consistency streak.", category: "STREAK", icon: "Flame", xpReward: 150, conditionType: "STREAK_7", threshold: 7 },
  { code: "STREAK_30", title: "Habit Master", description: "Sustain a powerful 30-day streak of dedication.", category: "STREAK", icon: "Crown", xpReward: 500, conditionType: "STREAK_30", threshold: 30 },
  { code: "TOTAL_50", title: "Consistency King", description: "Log 50 completed habits across your journey.", category: "COMPLETION", icon: "Award", xpReward: 250, conditionType: "TOTAL_50", threshold: 50 },
  { code: "READING_30", title: "Knowledge Builder", description: "Complete 30 reading or learning sessions.", category: "MASTERY", icon: "BookOpen", xpReward: 300, conditionType: "READING_30", threshold: 30 },
  { code: "PERFECT_DAY", title: "Perfect Day", description: "Complete 100% of all scheduled habits in one single day.", category: "COMPLETION", icon: "Star", xpReward: 100, conditionType: "PERFECT_DAY", threshold: 1 },
  { code: "PERFECT_WEEK", title: "Flawless Week", description: "Achieve a 100% weekly habit completion rate.", category: "COMPLETION", icon: "ShieldCheck", xpReward: 400, conditionType: "PERFECT_WEEK", threshold: 1 },
  { code: "COMEBACK", title: "Resilient Comeback", description: "Restart and complete your habits after an inactive period.", category: "SPECIAL", icon: "Zap", xpReward: 120, conditionType: "COMEBACK", threshold: 1 },
];

const DEFAULT_CHALLENGES = [
  { title: "7-Day Reading Sprint", description: "Read for at least 20 minutes every single day for 7 days straight.", category: "Personal Growth", durationDays: 7, targetCount: 7, badgeReward: "Book" },
  { title: "30-Day Fitness Awakening", description: "Log workouts or 8,000+ daily steps across 30 days to build raw discipline.", category: "Fitness", durationDays: 30, targetCount: 30, badgeReward: "Dumbbell" },
  { title: "Sleep Reset & Recovery", description: "Sleep on time before 11:00 PM for 7 consecutive nights to recharge your brain.", category: "Sleep", durationDays: 7, targetCount: 7, badgeReward: "Moon" },
  { title: "Digital Focus Challenge", description: "Keep non-work screen time under 2 hours daily for 14 days.", category: "Productivity", durationDays: 14, targetCount: 14, badgeReward: "Smartphone" },
];

async function main() {
  console.log("Seeding HabitLens database with comprehensive demo dataset...");

  // Clean existing records if any
  await prisma.notification.deleteMany();
  await prisma.aIConversation.deleteMany();
  await prisma.aIInsight.deleteMany();
  await prisma.focusSession.deleteMany();
  await prisma.challengeParticipant.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.xPTransaction.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.dailyReflection.deleteMany();
  await prisma.goalHabit.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.streak.deleteMany();
  await prisma.habitLog.deleteMany();
  await prisma.habit.deleteMany();
  await prisma.category.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Achievements
  console.log("Creating Achievements...");
  for (const ach of DEFAULT_ACHIEVEMENTS) {
    await prisma.achievement.create({
      data: ach,
    });
  }

  // 2. Seed Challenges
  console.log("Creating Challenges...");
  for (const ch of DEFAULT_CHALLENGES) {
    await prisma.challenge.create({
      data: {
        ...ch,
        startDate: subDays(new Date(), 10),
        endDate: subDays(new Date(), -20),
        isActive: true,
      },
    });
  }

  // 3. Create Demo User
  console.log("Creating Demo User...");
  const hashedPassword = await bcrypt.hash("Password123!", 10);

  const demoUser = await prisma.user.create({
    data: {
      fullName: "HabitLens Guest",
      username: "guest",
      email: "demo@habitlens.local",
      passwordHash: hashedPassword,
      role: "USER",
      profile: {
        create: {
          primaryType: "Student",
          secondaryInterests: JSON.stringify(["Personal Growth", "Fitness", "Productivity"]),
          bio: "Software developer & student striving for consistent mastery and personal excellence.",
          onboardingCompleted: true,
        },
      },
      settings: {
        create: {
          theme: "dark",
          remindersEnabled: true,
          weeklySummaryEnabled: true,
          weightedScoringEnabled: false,
        },
      },
    },
  });

  // 4. Create Categories for Demo User
  console.log("Creating Categories...");
  const categories = [
    { name: "Study", color: "#6366f1", icon: "BookOpen" },
    { name: "Fitness", color: "#10b981", icon: "Dumbbell" },
    { name: "Personal Growth", color: "#3b82f6", icon: "Sparkles" },
    { name: "Sleep", color: "#8b5cf6", icon: "Moon" },
    { name: "Health", color: "#06b6d4", icon: "Droplets" },
    { name: "Productivity", color: "#f59e0b", icon: "Zap" },
    { name: "Mindfulness", color: "#ec4899", icon: "Feather" },
  ];

  const categoryMap = new Map();
  for (const cat of categories) {
    const createdCat = await prisma.category.create({
      data: {
        userId: demoUser.id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        isSystem: true,
      },
    });
    categoryMap.set(cat.name, createdCat.id);
  }

  // 5. Create Habits for Demo User
  console.log("Creating Habits...");
  const habitsData = [
    {
      name: "Deep Study & Coding",
      description: "Dedicated full-focus algorithmic study and full-stack software building",
      categoryId: categoryMap.get("Study"),
      icon: "BookOpen",
      goalTarget: 90,
      goalUnit: "mins",
      frequencyType: "DAILY",
      scheduledDays: "[0,1,2,3,4,5,6]",
      reminderTime: "09:00",
      priority: "HIGH",
      difficulty: "HARD",
      color: "#6366f1",
    },
    {
      name: "Gym & Strength Training",
      description: "Progressive overload resistance training and core strengthening",
      categoryId: categoryMap.get("Fitness"),
      icon: "Dumbbell",
      goalTarget: 50,
      goalUnit: "mins",
      frequencyType: "DAILY",
      scheduledDays: "[0,1,2,3,4,5,6]",
      reminderTime: "17:30",
      priority: "HIGH",
      difficulty: "MEDIUM",
      color: "#10b981",
    },
    {
      name: "Read 20 Pages",
      description: "Read books on systems engineering, philosophy, and peak performance",
      categoryId: categoryMap.get("Personal Growth"),
      icon: "Book",
      goalTarget: 20,
      goalUnit: "pages",
      frequencyType: "DAILY",
      scheduledDays: "[0,1,2,3,4,5,6]",
      reminderTime: "21:00",
      priority: "MEDIUM",
      difficulty: "EASY",
      color: "#3b82f6",
    },
    {
      name: "Sleep Before 11:00 PM",
      description: "Wind down electronics at 10:15 PM to ensure 8 hours of restorative sleep",
      categoryId: categoryMap.get("Sleep"),
      icon: "Moon",
      goalTarget: 1,
      goalUnit: "routine",
      frequencyType: "DAILY",
      scheduledDays: "[0,1,2,3,4,5,6]",
      reminderTime: "22:30",
      priority: "HIGH",
      difficulty: "MEDIUM",
      color: "#8b5cf6",
    },
    {
      name: "Hydration (3 Liters)",
      description: "Drink clean water throughout the day for mental clarity and recovery",
      categoryId: categoryMap.get("Health"),
      icon: "Droplets",
      goalTarget: 3,
      goalUnit: "liters",
      frequencyType: "DAILY",
      scheduledDays: "[0,1,2,3,4,5,6]",
      reminderTime: "12:00",
      priority: "MEDIUM",
      difficulty: "EASY",
      color: "#06b6d4",
    },
    {
      name: "Morning Walk & Mobility",
      description: "15 minutes outdoor sunlight walk and joint stretching",
      categoryId: categoryMap.get("Mindfulness"),
      icon: "Sparkles",
      goalTarget: 15,
      goalUnit: "mins",
      frequencyType: "DAILY",
      scheduledDays: "[0,1,2,3,4,5,6]",
      reminderTime: "07:00",
      priority: "LOW",
      difficulty: "EASY",
      color: "#f59e0b",
    },
  ];

  const createdHabits = [];
  for (const h of habitsData) {
    const habit = await prisma.habit.create({
      data: {
        userId: demoUser.id,
        ...h,
      },
    });
    createdHabits.push(habit);
  }

  // 6. Generate 45 Days of Realistic Historical Logs
  console.log("Generating 45 days of realistic habit tracking logs...");
  const today = new Date();
  let totalLogsCreated = 0;

  for (let i = 44; i >= 0; i--) {
    const dateObj = subDays(today, i);
    const dateStr = format(dateObj, "yyyy-MM-dd");
    const dayOfWeek = dateObj.getDay();
    const isToday = i === 0;

    for (let hIdx = 0; hIdx < createdHabits.length; hIdx++) {
      const habit = createdHabits[hIdx];
      let status = "COMPLETED";

      if (isToday) {
        if (hIdx < 4) status = "COMPLETED";
        else status = "PENDING";
      } else {
        const randomFactor = Math.sin(i * 1.5 + hIdx) * 10;
        if (hIdx === 3 && (dayOfWeek === 5 || dayOfWeek === 6)) {
          status = randomFactor > 4 ? "COMPLETED" : randomFactor > 0 ? "SKIPPED" : "MISSED";
        } else if (randomFactor < -6) {
          status = "MISSED";
        } else if (randomFactor < -4) {
          status = "SKIPPED";
        } else {
          status = "COMPLETED";
        }
      }

      await prisma.habitLog.create({
        data: {
          habitId: habit.id,
          userId: demoUser.id,
          date: dateStr,
          status,
          value: status === "COMPLETED" ? habit.goalTarget : 0,
          completedAt: status === "COMPLETED" ? dateObj : null,
        },
      });
      totalLogsCreated++;
    }

    if (i % 2 === 0 && !isToday) {
      const moods = ["GREAT", "GOOD", "GREAT", "GOOD", "OKAY"];
      const energies = ["HIGH", "HIGH", "MEDIUM", "HIGH", "MEDIUM"];
      const notes = [
        "High focus session during systems architecture study. Completed full exercise routine.",
        "Felt energized after morning walk. Deep work session was very productive.",
        "Consistent day. Hit 3L water goal and finished 25 pages of reading.",
        "Slight afternoon fatigue, but bounced back with evening workout.",
        "Solid momentum. Staying dedicated to the 30-day streak challenge.",
      ];
      const mIdx = i % moods.length;

      await prisma.dailyReflection.create({
        data: {
          userId: demoUser.id,
          date: dateStr,
          mood: moods[mIdx],
          energyLevel: energies[mIdx],
          notes: notes[mIdx],
        },
      });
    }
  }

  console.log(`Generated ${totalLogsCreated} habit logs.`);

  // 7. Seed Streaks for Demo User
  console.log("Setting streaks...");
  for (let idx = 0; idx < createdHabits.length; idx++) {
    const habit = createdHabits[idx];
    const currentStreak = idx === 3 ? 6 : idx === 0 ? 14 : 12;
    const bestStreak = idx === 0 ? 21 : 18;

    await prisma.streak.create({
      data: {
        userId: demoUser.id,
        habitId: habit.id,
        currentStreak,
        bestStreak,
        lastCompletedDate: format(subDays(today, 1), "yyyy-MM-dd"),
        consistencyScore: idx === 3 ? 74.0 : 92.0,
      },
    });
  }

  // 8. Seed XP Transactions (~1,340 XP -> Level 6)
  console.log("Adding XP transactions...");
  await prisma.xPTransaction.createMany({
    data: [
      { userId: demoUser.id, amount: 250, reason: "Initial 30-Day Consistency Milestone" },
      { userId: demoUser.id, amount: 150, reason: "7-Day Warrior Badge Unlocked" },
      { userId: demoUser.id, amount: 100, reason: "Perfect Day Consistency Bonus" },
      { userId: demoUser.id, amount: 300, reason: "Knowledge Builder (30 Reading Sessions)" },
      { userId: demoUser.id, amount: 400, reason: "Daily Habit Completion Logs (Past 40 Days)" },
      { userId: demoUser.id, amount: 140, reason: "Weekly Top Improver Bonus" },
    ],
  });

  // 9. Unlock Achievements for Demo User
  console.log("Unlocking user achievements...");
  const dbAchievements = await prisma.achievement.findMany();
  for (const ach of dbAchievements) {
    if (["FIRST_STEP", "STREAK_7", "TOTAL_50", "READING_30", "PERFECT_DAY"].includes(ach.code)) {
      await prisma.userAchievement.create({
        data: {
          userId: demoUser.id,
          achievementId: ach.id,
          unlockedAt: subDays(today, 12),
          progress: ach.threshold,
        },
      });
    } else {
      await prisma.userAchievement.create({
        data: {
          userId: demoUser.id,
          achievementId: ach.id,
          unlockedAt: null,
          progress: Math.round(ach.threshold * 0.6),
        },
      });
    }
  }

  // 10. Seed Goals and Connect Habits
  console.log("Creating Goals and Habit Links...");
  const goal1 = await prisma.goal.create({
    data: {
      userId: demoUser.id,
      title: "Master Full-Stack Architecture & DSA",
      description: "Build production-level cloud software, master algorithms, and maintain daily learning cadence.",
      category: "Study",
      targetDate: subDays(today, -60),
      progressPercentage: 84,
      status: "ACTIVE",
    },
  });

  await prisma.goalHabit.create({
    data: { goalId: goal1.id, habitId: createdHabits[0].id, weight: 1.5 },
  });
  await prisma.goalHabit.create({
    data: { goalId: goal1.id, habitId: createdHabits[2].id, weight: 1.0 },
  });

  const goal2 = await prisma.goal.create({
    data: {
      userId: demoUser.id,
      title: "Achieve Peak Physical Conditioning",
      description: "Consistent progressive resistance training, 8 hours recovery, and optimal hydration.",
      category: "Fitness",
      targetDate: subDays(today, -90),
      progressPercentage: 88,
      status: "ACTIVE",
    },
  });

  await prisma.goalHabit.create({
    data: { goalId: goal2.id, habitId: createdHabits[1].id, weight: 1.5 },
  });
  await prisma.goalHabit.create({
    data: { goalId: goal2.id, habitId: createdHabits[3].id, weight: 1.2 },
  });
  await prisma.goalHabit.create({
    data: { goalId: goal2.id, habitId: createdHabits[4].id, weight: 0.8 },
  });

  // 11. Enroll in Challenges
  console.log("Enrolling in Challenges...");
  const dbChallenges = await prisma.challenge.findMany();
  if (dbChallenges[0]) {
    await prisma.challengeParticipant.create({
      data: {
        challengeId: dbChallenges[0].id,
        userId: demoUser.id,
        progressCount: 6,
        isCompleted: false,
      },
    });
  }
  if (dbChallenges[1]) {
    await prisma.challengeParticipant.create({
      data: {
        challengeId: dbChallenges[1].id,
        userId: demoUser.id,
        progressCount: 24,
        isCompleted: false,
      },
    });
  }

  // 12. Seed AI Insights & Notifications
  console.log("Creating AI Insights and Notifications...");
  await prisma.aIInsight.createMany({
    data: [
      {
        userId: demoUser.id,
        type: "STRENGTH",
        title: "Study & Coding Superpower",
        message: "Your 'Deep Study & Coding' habit has maintained 94% consistency across the past 30 days.",
        actionText: "Maintain this anchor to compound your career growth.",
      },
      {
        userId: demoUser.id,
        type: "OPPORTUNITY",
        title: "Sleep Consistency Opportunity",
        message: "Shifting your evening wind-down 30 minutes earlier will boost next-day morning energy by ~22%.",
        actionText: "Set sleep reminder for 10:15 PM.",
      },
      {
        userId: demoUser.id,
        type: "TREND",
        title: "3 Consecutive Weeks of Growth",
        message: "Your weekly score has improved from 68% to 81% (+13% week-over-week).",
        actionText: "Keep this trajectory to unlock Habit Master.",
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: demoUser.id,
        type: "PROGRESS",
        title: "📈 Weekly Summary Ready",
        message: "You scored 82% this week — 14% better than last week! Check your Analytics Lens.",
        link: "/dashboard/analytics",
        isRead: false,
      },
      {
        userId: demoUser.id,
        type: "STREAK",
        title: "🔥 12-Day Streak Active!",
        message: "Your consistency is compounding. Keep up the great momentum today.",
        link: "/dashboard",
        isRead: false,
      },
      {
        userId: demoUser.id,
        type: "ACHIEVEMENT",
        title: "🏆 Knowledge Builder Unlocked",
        message: "You logged 30 completed reading sessions. +300 XP awarded!",
        link: "/dashboard/achievements",
        isRead: true,
      },
    ],
  });

  console.log("✅ Seed completed successfully! Demo user ready: guest / Password123!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
