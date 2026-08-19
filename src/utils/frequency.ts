import type { Habit } from '@/types/database'

export type HabitFrequencyType = 'daily' | 'weekdays' | 'weekly' | 'yearly'

export const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
export const WEEKDAY_OPTIONS = WEEKDAY_LABELS.map((label, index) => ({
  value: index,
  label,
}))

export function normalizeWeekdays(value: number[] | null | undefined): number[] {
  if (!Array.isArray(value)) {
    return []
  }

  const normalized = new Set<number>()

  for (const entry of value) {
    const weekday = Number(entry)

    if (Number.isInteger(weekday) && weekday >= 0 && weekday <= 6) {
      normalized.add(weekday)
    }
  }

  return [...normalized].sort((left, right) => left - right)
}

export function getWeekdayForDate(date = new Date()): number {
  return (date.getDay() + 6) % 7
}

export function getTodayWeekday(): number {
  return getWeekdayForDate(new Date())
}

export function isHabitDueOnDate(
  habit: Pick<Habit, 'frequency_type' | 'frequency_days' | 'frequency_weekday' | 'yearly_month' | 'yearly_day'>,
  date: Date | string,
) {
  const referenceDate = typeof date === 'string' ? new Date(`${date}T12:00:00`) : new Date(date)
  const weekday = getWeekdayForDate(referenceDate)

  switch (habit.frequency_type) {
    case 'weekdays':
      return normalizeWeekdays(habit.frequency_days).includes(weekday)
    case 'weekly':
      return (habit.frequency_weekday ?? weekday) === weekday
    case 'yearly':
      return (habit.yearly_month ?? referenceDate.getMonth() + 1) === referenceDate.getMonth() + 1 &&
        (habit.yearly_day ?? referenceDate.getDate()) === referenceDate.getDate()
    case 'daily':
    default:
      return true
  }
}

export function isHabitDueToday(habit: Pick<Habit, 'frequency_type' | 'frequency_days' | 'frequency_weekday' | 'yearly_month' | 'yearly_day'>) {
  return isHabitDueOnDate(habit, new Date())
}

export function formatHabitFrequency(
  habit: Pick<Habit, 'frequency_type' | 'frequency_days' | 'frequency_weekday' | 'yearly_month' | 'yearly_day'>,
) {
  switch (habit.frequency_type) {
    case 'weekdays': {
      const weekdays = normalizeWeekdays(habit.frequency_days)
      if (weekdays.length === 0) {
        return 'Días de la semana'
      }

      return weekdays.map((day) => WEEKDAY_LABELS[day]).join(', ')
    }
    case 'weekly':
      return `Semanal · ${WEEKDAY_LABELS[habit.frequency_weekday ?? getTodayWeekday()]}`
    case 'yearly':
      return `Anual · ${habit.yearly_day ?? 1}/${habit.yearly_month ?? 1}`
    case 'daily':
    default:
      return 'Diaria'
  }
}
