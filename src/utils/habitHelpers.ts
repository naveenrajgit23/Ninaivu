// ============================================================
// நினைவு (Ninaivu) — Habit Helpers
// ============================================================

import type { Habit, HabitCompletion, HabitFrequency } from '../types';

// Helper to format date in local timezone YYYY-MM-DD
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to get start of week (Monday) date string
export function getStartOfWeekDateString(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  // Adjust so Monday is 0, Tuesday is 1... Sunday is 6
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return getLocalDateString(monday);
}

// Helper to get start of month string YYYY-MM
export function getStartOfMonthDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// Add/subtract days utility
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Add/subtract months utility
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export interface HabitCalculatedStats {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  missedPeriods: number;
  consistencyScore: number; // percentage 0 - 100
  isCompletedToday: boolean;
  todayCount: number;
  isCompleted: boolean;
}

export function calculateHabitStats(
  habit: Habit,
  completions: HabitCompletion[]
): HabitCalculatedStats {
  const habitCompletions = completions.filter((c) => c.habit_id === habit.id);
  const totalCompletions = habitCompletions.length;

  const todayStr = getLocalDateString(new Date());
  
  // 1. Group completions by local date
  const completionsByDay: Record<string, number> = {};
  habitCompletions.forEach((c) => {
    const dayStr = getLocalDateString(new Date(c.completed_at));
    completionsByDay[dayStr] = (completionsByDay[dayStr] || 0) + 1;
  });

  const todayCount = completionsByDay[todayStr] || 0;
  const isCompletedToday = todayCount >= habit.target_count;

  // Let's determine the elapsed period since the start_date
  const startDate = new Date(habit.start_date);
  const today = new Date();
  
  // Reset time portions to calculate correct differences
  const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (habit.frequency === 'daily') {
    // ── Daily Streak Calculation ──
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // We count backward from today (or yesterday if today isn't completed yet)
    let checkDate = currentDay;
    const todayCompleted = (completionsByDay[getLocalDateString(checkDate)] || 0) >= habit.target_count;
    const yesterdayCompleted = (completionsByDay[getLocalDateString(addDays(checkDate, -1))] || 0) >= habit.target_count;

    if (todayCompleted) {
      checkDate = currentDay;
    } else if (yesterdayCompleted) {
      checkDate = addDays(currentDay, -1);
    } else {
      checkDate = addDays(currentDay, -1); // start checking from yesterday for streak active check
    }

    // Current Streak
    while (checkDate >= startDay) {
      const dateStr = getLocalDateString(checkDate);
      const dayCompleted = (completionsByDay[dateStr] || 0) >= habit.target_count;
      if (dayCompleted) {
        currentStreak++;
        checkDate = addDays(checkDate, -1);
      } else {
        // If we checked today and it's not completed, we move to yesterday.
        // But if yesterday is also not completed, the streak is broken.
        break;
      }
    }

    // Longest Streak
    let tempDate = new Date(startDay);
    while (tempDate <= currentDay) {
      const dateStr = getLocalDateString(tempDate);
      const dayCompleted = (completionsByDay[dateStr] || 0) >= habit.target_count;
      if (dayCompleted) {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
      tempDate = addDays(tempDate, 1);
    }

    // Missed days and consistency
    // Total possible days since start date (excluding today if not completed yet to be fair)
    const endCheckDay = todayCompleted ? currentDay : addDays(currentDay, -1);
    let totalPossibleDays = 0;
    let completedDaysCount = 0;

    let d = new Date(startDay);
    while (d <= currentDay) {
      const dateStr = getLocalDateString(d);
      const dayCompleted = (completionsByDay[dateStr] || 0) >= habit.target_count;
      
      if (d <= endCheckDay) {
        totalPossibleDays++;
      }
      if (dayCompleted) {
        completedDaysCount++;
      }
      d = addDays(d, 1);
    }

    const missedPeriods = Math.max(0, totalPossibleDays - completedDaysCount);
    const consistencyScore = totalPossibleDays > 0 ? Math.round((completedDaysCount / totalPossibleDays) * 100) : 0;

    return {
      currentStreak,
      longestStreak,
      totalCompletions,
      missedPeriods,
      consistencyScore,
      isCompletedToday,
      todayCount,
      isCompleted: todayCompleted,
    };
  } else if (habit.frequency === 'weekly') {
    // ── Weekly Streak Calculation ──
    // Group completions by week (Monday of that week)
    const completionsByWeek: Record<string, number> = {};
    habitCompletions.forEach((c) => {
      const weekStr = getStartOfWeekDateString(new Date(c.completed_at));
      completionsByWeek[weekStr] = (completionsByWeek[weekStr] || 0) + 1;
    });

    const currentWeekMondayStr = getStartOfWeekDateString(currentDay);
    const startWeekMondayStr = getStartOfWeekDateString(startDay);

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Check if current week or previous week is completed
    const currentWeekMonday = new Date(currentWeekMondayStr);
    const prevWeekMonday = addDays(currentWeekMonday, -7);

    const isCurrentWeekCompleted = (completionsByWeek[currentWeekMondayStr] || 0) >= habit.target_count;
    const isPrevWeekCompleted = (completionsByWeek[getLocalDateString(prevWeekMonday)] || 0) >= habit.target_count;

    let checkWeek = currentWeekMonday;
    if (isCurrentWeekCompleted) {
      checkWeek = currentWeekMonday;
    } else if (isPrevWeekCompleted) {
      checkWeek = prevWeekMonday;
    } else {
      checkWeek = prevWeekMonday;
    }

    const startWeekMonday = new Date(startWeekMondayStr);

    // Current Streak
    while (checkWeek >= startWeekMonday) {
      const weekStr = getLocalDateString(checkWeek);
      const weekCompleted = (completionsByWeek[weekStr] || 0) >= habit.target_count;
      if (weekCompleted) {
        currentStreak++;
        checkWeek = addDays(checkWeek, -7);
      } else {
        break;
      }
    }

    // Longest Streak
    let tempWeek = new Date(startWeekMonday);
    while (tempWeek <= currentWeekMonday) {
      const weekStr = getLocalDateString(tempWeek);
      const weekCompleted = (completionsByWeek[weekStr] || 0) >= habit.target_count;
      if (weekCompleted) {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
      tempWeek = addDays(tempWeek, 7);
    }

    // Missed weeks and consistency
    const endCheckWeek = isCurrentWeekCompleted ? currentWeekMonday : prevWeekMonday;
    let totalPossibleWeeks = 0;
    let completedWeeksCount = 0;

    let w = new Date(startWeekMonday);
    while (w <= currentWeekMonday) {
      const weekStr = getLocalDateString(w);
      const weekCompleted = (completionsByWeek[weekStr] || 0) >= habit.target_count;

      if (w <= endCheckWeek) {
        totalPossibleWeeks++;
      }
      if (weekCompleted) {
        completedWeeksCount++;
      }
      w = addDays(w, 7);
    }

    const missedPeriods = Math.max(0, totalPossibleWeeks - completedWeeksCount);
    const consistencyScore = totalPossibleWeeks > 0 ? Math.round((completedWeeksCount / totalPossibleWeeks) * 100) : 0;

    return {
      currentStreak,
      longestStreak,
      totalCompletions,
      missedPeriods,
      consistencyScore,
      isCompletedToday,
      todayCount,
      isCompleted: isCurrentWeekCompleted,
    };
  } else {
    // ── Monthly Streak Calculation ──
    const completionsByMonth: Record<string, number> = {};
    habitCompletions.forEach((c) => {
      const monthStr = getStartOfMonthDateString(new Date(c.completed_at));
      completionsByMonth[monthStr] = (completionsByMonth[monthStr] || 0) + 1;
    });

    const currentMonthStr = getStartOfMonthDateString(currentDay);
    const startMonthStr = getStartOfMonthDateString(startDay);

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const startMonthDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const currentMonthDate = new Date(today.getFullYear(), today.getMonth(), 1);

    const prevMonthDate = addMonths(currentMonthDate, -1);
    const prevMonthStr = getStartOfMonthDateString(prevMonthDate);

    const isCurrentMonthCompleted = (completionsByMonth[currentMonthStr] || 0) >= habit.target_count;
    const isPrevMonthCompleted = (completionsByMonth[prevMonthStr] || 0) >= habit.target_count;

    let checkMonth = currentMonthDate;
    if (isCurrentMonthCompleted) {
      checkMonth = currentMonthDate;
    } else if (isPrevMonthCompleted) {
      checkMonth = prevMonthDate;
    } else {
      checkMonth = prevMonthDate;
    }

    // Current Streak
    while (checkMonth >= startMonthDate) {
      const monthStr = getStartOfMonthDateString(checkMonth);
      const monthCompleted = (completionsByMonth[monthStr] || 0) >= habit.target_count;
      if (monthCompleted) {
        currentStreak++;
        checkMonth = addMonths(checkMonth, -1);
      } else {
        break;
      }
    }

    // Longest Streak
    let tempMonth = new Date(startMonthDate);
    while (tempMonth <= currentMonthDate) {
      const monthStr = getStartOfMonthDateString(tempMonth);
      const monthCompleted = (completionsByMonth[monthStr] || 0) >= habit.target_count;
      if (monthCompleted) {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
      tempMonth = addMonths(tempMonth, 1);
    }

    // Missed months and consistency
    const endCheckMonth = isCurrentMonthCompleted ? currentMonthDate : prevMonthDate;
    let totalPossibleMonths = 0;
    let completedMonthsCount = 0;

    let m = new Date(startMonthDate);
    while (m <= currentMonthDate) {
      const monthStr = getStartOfMonthDateString(m);
      const monthCompleted = (completionsByMonth[monthStr] || 0) >= habit.target_count;

      if (m <= endCheckMonth) {
        totalPossibleMonths++;
      }
      if (monthCompleted) {
        completedMonthsCount++;
      }
      m = addMonths(m, 1);
    }

    const missedPeriods = Math.max(0, totalPossibleMonths - completedMonthsCount);
    const consistencyScore = totalPossibleMonths > 0 ? Math.round((completedMonthsCount / totalPossibleMonths) * 100) : 0;

    return {
      currentStreak,
      longestStreak,
      totalCompletions,
      missedPeriods,
      consistencyScore,
      isCompletedToday,
      todayCount,
      isCompleted: isCurrentMonthCompleted,
    };
  }
}

// Heatmap generator (returns counts mapped by local YYYY-MM-DD for a specific year and month)
export function getMonthlyHeatmapData(
  completions: HabitCompletion[],
  year: number,
  month: number
): Record<string, number> {
  const data: Record<string, number> = {};
  
  // Start of month & End of month
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  // Group and filter completions
  completions.forEach((c) => {
    const compDate = new Date(c.completed_at);
    if (
      compDate.getFullYear() === year &&
      compDate.getMonth() === month
    ) {
      const dateStr = getLocalDateString(compDate);
      data[dateStr] = (data[dateStr] || 0) + 1;
    }
  });

  return data;
}

// Function to calculate goal progress including habits
export function calculateGoalProgress(
  goalId: string,
  tasks: any[],
  habits: Habit[],
  completions: HabitCompletion[]
): number {
  const linkedTasks = tasks.filter((t) => t.goal_id === goalId);
  const linkedHabits = habits.filter((h) => h.goal_id === goalId);

  const totalItems = linkedTasks.length + linkedHabits.length;
  if (totalItems === 0) return 0;

  let totalProgress = 0;

  // Task progress: 100% if completed, 0% otherwise
  linkedTasks.forEach((t) => {
    if (t.status === 'completed') {
      totalProgress += 100;
    }
  });

  // Habit progress: consistency score
  linkedHabits.forEach((h) => {
    const stats = calculateHabitStats(h, completions);
    totalProgress += stats.consistencyScore;
  });

  return Math.round(totalProgress / totalItems);
}
