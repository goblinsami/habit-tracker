import type { HabitEntry } from '@/types/database'
import { addDays, getLocalDateKey } from '@/utils/date'

export type HabitStats = {
  totalCompletedDays: number
  last30DaysPercentage: number
  currentStreak: number
  bestStreak: number
}

export function calculateHabitStats(entries: HabitEntry[], endDate = new Date()): HabitStats {
  const completedDates = new Set(
    entries.filter((entry) => entry.completed).map((entry) => entry.date),
  )

  return {
    totalCompletedDays: completedDates.size,
    last30DaysPercentage: calculateLast30DaysPercentage(completedDates, endDate),
    currentStreak: calculateCurrentStreak(completedDates, endDate),
    bestStreak: calculateBestStreak(completedDates),
  }
}

function calculateLast30DaysPercentage(completedDates: Set<string>, endDate: Date) {
  let completedDays = 0

  for (let index = 0; index < 30; index += 1) {
    const dateKey = getLocalDateKey(addDays(endDate, -index))

    if (completedDates.has(dateKey)) {
      completedDays += 1
    }
  }

  return Math.round((completedDays / 30) * 100)
}

function calculateCurrentStreak(completedDates: Set<string>, endDate: Date) {
  let streak = 0

  for (let currentDate = new Date(endDate); ; currentDate = addDays(currentDate, -1)) {
    const dateKey = getLocalDateKey(currentDate)

    if (!completedDates.has(dateKey)) {
      break
    }

    streak += 1
  }

  return streak
}

function calculateBestStreak(completedDates: Set<string>) {
  const sortedDates = [...completedDates].sort()
  let bestStreak = 0
  let currentStreak = 0
  let previousDate: Date | null = null

  for (const dateKey of sortedDates) {
    const [year, month, day] = dateKey.split('-').map(Number)
    const currentDate = new Date(year, month - 1, day)
    const isConsecutive =
      previousDate !== null && getLocalDateKey(addDays(previousDate, 1)) === dateKey

    currentStreak = isConsecutive ? currentStreak + 1 : 1
    bestStreak = Math.max(bestStreak, currentStreak)
    previousDate = currentDate
  }

  return bestStreak
}
