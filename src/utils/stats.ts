import type { HabitEntry } from '@/types/database'
import { addDays, formatWeekdayNarrow, getLocalDateKey } from '@/utils/date'

export type HabitStats = {
  totalCompletedDays: number
  last30DaysPercentage: number
  currentStreak: number
  bestStreak: number
}

export type HabitWeekDay = {
  date: string
  label: string
  completed: boolean
  isToday: boolean
}

export function calculateHabitStats(entries: HabitEntry[], endDate = new Date()): HabitStats {
  const completedDates = getCompletedDateSet(entries)

  return {
    totalCompletedDays: completedDates.size,
    last30DaysPercentage: calculateLast30DaysPercentageFromDates(completedDates, endDate),
    currentStreak: calculateCurrentStreakFromDates(completedDates, endDate),
    bestStreak: calculateBestStreak(completedDates),
  }
}

export function buildLastSevenHabitDays(entries: HabitEntry[], endDate = new Date()): HabitWeekDay[] {
  const completedDates = getCompletedDateSet(entries)
  const todayKey = getLocalDateKey(endDate)

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(endDate, index - 6)
    const dateKey = getLocalDateKey(date)

    return {
      date: dateKey,
      label: formatWeekdayNarrow(dateKey),
      completed: completedDates.has(dateKey),
      isToday: dateKey === todayKey,
    }
  })
}

export function calculateCurrentMonthPercentage(entries: HabitEntry[], endDate = new Date()) {
  const completedDates = getCompletedDateSet(entries)
  const year = endDate.getFullYear()
  const month = endDate.getMonth()
  const elapsedDays = endDate.getDate()
  let completedDays = 0

  for (let day = 1; day <= elapsedDays; day += 1) {
    const dateKey = getLocalDateKey(new Date(year, month, day))

    if (completedDates.has(dateKey)) {
      completedDays += 1
    }
  }

  return Math.round((completedDays / elapsedDays) * 100)
}

export function calculateCurrentStreak(entries: HabitEntry[], endDate = new Date()) {
  return calculateCurrentStreakFromDates(getCompletedDateSet(entries), endDate)
}

function getCompletedDateSet(entries: HabitEntry[]) {
  return new Set(entries.filter((entry) => entry.completed).map((entry) => entry.date))
}

function calculateLast30DaysPercentageFromDates(completedDates: Set<string>, endDate: Date) {
  let completedDays = 0

  for (let index = 0; index < 30; index += 1) {
    const dateKey = getLocalDateKey(addDays(endDate, -index))

    if (completedDates.has(dateKey)) {
      completedDays += 1
    }
  }

  return Math.round((completedDays / 30) * 100)
}

function calculateCurrentStreakFromDates(completedDates: Set<string>, endDate: Date) {
  if (completedDates.size === 0) {
    return 0
  }

  const sortedDates = [...completedDates].sort()
  const latestCompletedDate = sortedDates.reduce<Date | null>((latest, currentDateKey) => {
    const [year, month, day] = currentDateKey.split('-').map(Number)
    const currentDate = new Date(year, month - 1, day)

    if (currentDate > endDate) {
      return latest
    }

    if (!latest || currentDate > latest) {
      return currentDate
    }

    return latest
  }, null)

  if (!latestCompletedDate) {
    return 0
  }

  let streak = 0

  for (let currentDate = new Date(latestCompletedDate); ; currentDate = addDays(currentDate, -1)) {
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
