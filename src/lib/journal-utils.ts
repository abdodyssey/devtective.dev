/**
 * Calculate journaling streaks from an array of date strings.
 * Dates are expected in YYYY-MM-DD or standard parseable formats.
 */
export function calculateJournalStreak(dates: string[]): {
  currentStreak: number;
  longestStreak: number;
  todayCompleted: boolean;
} {
  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, todayCompleted: false };
  }

  // Get current date in local timezone format (YYYY-MM-DD)
  // We construct it based on local date parts to avoid UTC timezone mismatches
  const getLocalDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Normalize all input dates to local YYYY-MM-DD format
  const uniqueDates = Array.from(
    new Set(
      dates
        .map((d) => {
          if (!d) return "";
          try {
            return getLocalDateString(new Date(d));
          } catch {
            return "";
          }
        })
        .filter(Boolean)
    )
  ).sort((a, b) => b.localeCompare(a)); // Sort descending (newest first)

  if (uniqueDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, todayCompleted: false };
  }

  const today = new Date();
  const todayStr = getLocalDateString(today);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  const todayCompleted = uniqueDates.includes(todayStr);
  const hasActiveStreak = todayCompleted || uniqueDates.includes(yesterdayStr);

  // 1. Calculate Current Streak
  let currentStreak = 0;
  if (hasActiveStreak) {
    // Start counting back from either today (if completed) or yesterday
    const checkDate = todayCompleted ? new Date() : yesterday;
    let checkDateStr = getLocalDateString(checkDate);

    while (uniqueDates.includes(checkDateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
      checkDateStr = getLocalDateString(checkDate);
    }
  }

  // 2. Calculate Longest Streak
  let longestStreak = 0;
  let tempStreak = 0;
  const sortedAsc = [...uniqueDates].reverse(); // Oldest first

  if (sortedAsc.length > 0) {
    tempStreak = 1;
    longestStreak = 1;

    for (let i = 1; i < sortedAsc.length; i++) {
      const prev = new Date(sortedAsc[i - 1]);
      const curr = new Date(sortedAsc[i]);

      // Normalize both to midnight to count difference in days accurately
      prev.setHours(0, 0, 0, 0);
      curr.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(curr.getTime() - prev.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1; // reset streak
      }

      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }
  }

  // Safety check: longest streak cannot be smaller than current streak
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  return {
    currentStreak,
    longestStreak,
    todayCompleted,
  };
}

export interface Achievement {
  id: string;
  icon: string;
  label: string;
  description: string;
  unlocked: boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface PostForAchievement {
  date: string | null;
  wordCount?: number;
}

/**
 * Calculate which achievement badges are unlocked based on journal history.
 */
export function calculateAchievements(
  posts: PostForAchievement[],
  streakInfo: { currentStreak: number; longestStreak: number; todayCompleted: boolean }
): Achievement[] {
  const totalPosts = posts.length;

  return [
    {
      id: "first_entry",
      icon: "📝",
      label: "First Word",
      description: "Tulis jurnal pertamamu.",
      unlocked: totalPosts >= 1,
      rarity: "common",
    },
    {
      id: "five_entries",
      icon: "📚",
      label: "Bookworm",
      description: "Tulis 5 entri jurnal.",
      unlocked: totalPosts >= 5,
      rarity: "common",
    },
    {
      id: "ten_entries",
      icon: "🗒️",
      label: "Dedicated",
      description: "Tulis 10 entri jurnal.",
      unlocked: totalPosts >= 10,
      rarity: "rare",
    },
    {
      id: "streak_3",
      icon: "🔥",
      label: "On a Roll",
      description: "Raih streak 3 hari berturut-turut.",
      unlocked: streakInfo.longestStreak >= 3,
      rarity: "common",
    },
    {
      id: "streak_7",
      icon: "⚡",
      label: "Week Warrior",
      description: "Raih streak 7 hari berturut-turut.",
      unlocked: streakInfo.longestStreak >= 7,
      rarity: "rare",
    },
    {
      id: "streak_30",
      icon: "🚀",
      label: "Unstoppable",
      description: "Raih streak 30 hari berturut-turut.",
      unlocked: streakInfo.longestStreak >= 30,
      rarity: "epic",
    },
    {
      id: "streak_100",
      icon: "👑",
      label: "Legend",
      description: "Raih streak 100 hari berturut-turut.",
      unlocked: streakInfo.longestStreak >= 100,
      rarity: "legendary",
    },
    {
      id: "today",
      icon: "✅",
      label: "Daily Done",
      description: "Sudah nulis hari ini.",
      unlocked: streakInfo.todayCompleted,
      rarity: "common",
    },
  ];
}
