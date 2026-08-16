import type { HabitEntry } from '@/types/database'
import { addDays, formatShortDate, getLocalDateKey, startOfWeek } from '@/utils/date'

export type ActivityDay = {
  date: string
  completedCount: number
  intensity: number
  isFuture: boolean
  label: string
}

export type ActivityWeek = {
  key: string
  days: ActivityDay[]
}

export function buildActivityWeeks(entries: HabitEntry[], endDate = new Date()) {
  const todayKey = getLocalDateKey(endDate)
  const completedByDate = new Map<string, number>()

  for (const entry of entries) {
    if (!entry.completed) {
      continue
    }

    completedByDate.set(entry.date, (completedByDate.get(entry.date) ?? 0) + 1)
  }

  const maxCompleted = Math.max(1, ...completedByDate.values())
  const startDate = startOfWeek(addDays(endDate, -364))
  const endWeekDate = addDays(startOfWeek(endDate), 6)
  const weeks: ActivityWeek[] = []

  for (let weekStart = startDate; weekStart <= endWeekDate; weekStart = addDays(weekStart, 7)) {
    const days: ActivityDay[] = []

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const currentDate = addDays(weekStart, dayIndex)
      const dateKey = getLocalDateKey(currentDate)
      const completedCount = completedByDate.get(dateKey) ?? 0
      const isFuture = dateKey > todayKey
      const intensity = isFuture ? 0 : getIntensity(completedCount, maxCompleted)
      const label = isFuture
        ? `${formatShortDate(dateKey)}`
        : `${formatShortDate(dateKey)}: ${completedCount} completados`

      days.push({
        date: dateKey,
        completedCount,
        intensity,
        isFuture,
        label,
      })
    }

    weeks.push({
      key: getLocalDateKey(weekStart),
      days,
    })
  }

  return weeks
}

export function buildHabitActivityWeeks(entries: HabitEntry[], endDate = new Date()) {
  const completedEntries = entries.filter((entry) => entry.completed)

  return buildActivityWeeks(completedEntries, endDate)
}

function getIntensity(completedCount: number, maxCompleted: number) {
  if (completedCount <= 0) {
    return 0
  }

  const ratio = completedCount / maxCompleted

  if (ratio <= 0.25) {
    return 1
  }

  if (ratio <= 0.5) {
    return 2
  }

  if (ratio <= 0.75) {
    return 3
  }

  return 4
}
