export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function getDateFromLocalKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number)

  return new Date(year, month - 1, day)
}

export function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)

  return nextDate
}

export function startOfWeek(date: Date) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() - nextDate.getDay())

  return nextDate
}

export function formatLongDate(date = new Date()) {
  return new Intl.DateTimeFormat('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatShortDate(dateKey: string) {
  return new Intl.DateTimeFormat('es', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(getDateFromLocalKey(dateKey))
}

export function formatWeekdayNarrow(dateKey: string) {
  return new Intl.DateTimeFormat('es', {
    weekday: 'narrow',
  })
    .format(getDateFromLocalKey(dateKey))
    .toUpperCase()
}
