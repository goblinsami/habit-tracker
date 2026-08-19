import { supabase } from '@/lib/supabase'
import type { Habit } from '@/types/database'
import type { HabitFrequencyType } from '@/utils/frequency'

export type HabitInput = {
  name: string
  categoryId: string
  frequencyType: HabitFrequencyType
  frequencyDays: number[]
  frequencyWeekday: number | null
  yearlyMonth: number | null
  yearlyDay: number | null
}

export type HabitWithCategory = Habit & {
  category: {
    id: string
    name: string
    icon: string
    color: string
  } | null
}

function mapHabitWithCategory(habit: Habit & { categories: HabitWithCategory['category'] }) {
  const { categories, ...rest } = habit

  return {
    ...rest,
    category: categories,
  }
}

export async function listHabits() {
  const { data, error } = await supabase
    .from('habits')
    .select('*, categories!habits_category_user_fk(id, name, icon, color)')
    .order('archived')
    .order('created_at')

  if (error) {
    throw error
  }

  return data.map(mapHabitWithCategory)
}

export async function getHabit(habitId: string) {
  const { data, error } = await supabase
    .from('habits')
    .select('*, categories!habits_category_user_fk(id, name, icon, color)')
    .eq('id', habitId)
    .single()

  if (error) {
    throw error
  }

  return mapHabitWithCategory(data)
}

export async function createHabit(userId: string, input: HabitInput) {
  const { data, error } = await supabase
    .from('habits')
    .insert({
      user_id: userId,
      name: input.name,
      category_id: input.categoryId,
      frequency_type: input.frequencyType,
      frequency_days: input.frequencyDays,
      frequency_weekday: input.frequencyWeekday,
      yearly_month: input.yearlyMonth,
      yearly_day: input.yearlyDay,
    })
    .select('*, categories!habits_category_user_fk(id, name, icon, color)')
    .single()

  if (error) {
    throw error
  }

  return mapHabitWithCategory(data)
}

export async function updateHabit(habitId: string, input: HabitInput) {
  const { data, error } = await supabase
    .from('habits')
    .update({
      name: input.name,
      category_id: input.categoryId,
      frequency_type: input.frequencyType,
      frequency_days: input.frequencyDays,
      frequency_weekday: input.frequencyWeekday,
      yearly_month: input.yearlyMonth,
      yearly_day: input.yearlyDay,
    })
    .eq('id', habitId)
    .select('*, categories!habits_category_user_fk(id, name, icon, color)')
    .single()

  if (error) {
    throw error
  }

  return mapHabitWithCategory(data)
}

export async function setHabitArchived(habitId: string, archived: boolean) {
  const { data, error } = await supabase
    .from('habits')
    .update({ archived })
    .eq('id', habitId)
    .select('*, categories!habits_category_user_fk(id, name, icon, color)')
    .single()

  if (error) {
    throw error
  }

  return mapHabitWithCategory(data)
}

export function sortHabits(habits: HabitWithCategory[]) {
  return [...habits].sort((left, right) => {
    if (left.archived !== right.archived) {
      return left.archived ? 1 : -1
    }

    const categoryCompare = (left.category?.name ?? '').localeCompare(
      right.category?.name ?? '',
      'es',
    )

    if (categoryCompare !== 0) {
      return categoryCompare
    }

    return left.name.localeCompare(right.name, 'es')
  })
}
