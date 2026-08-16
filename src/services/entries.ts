import { supabase } from '@/lib/supabase'
import type { HabitEntry } from '@/types/database'

export type HabitEntryInput = {
  habitId: string
  userId: string
  date: string
  completed: boolean
  comment: string | null
}

export async function listEntriesForDate(date: string) {
  const { data, error } = await supabase
    .from('habit_entries')
    .select('*')
    .eq('date', date)
    .order('created_at')

  if (error) {
    throw error
  }

  return data
}

export async function listEntriesForDateRange(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('habit_entries')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date')

  if (error) {
    throw error
  }

  return data
}

export async function listEntriesForHabit(habitId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('habit_entries')
    .select('*')
    .eq('habit_id', habitId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

export async function listAllEntriesForHabit(habitId: string) {
  const { data, error } = await supabase
    .from('habit_entries')
    .select('*')
    .eq('habit_id', habitId)
    .order('date', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

export async function upsertHabitEntry(input: HabitEntryInput) {
  const { data, error } = await supabase
    .from('habit_entries')
    .upsert(
      {
        habit_id: input.habitId,
        user_id: input.userId,
        date: input.date,
        completed: input.completed,
        comment: input.comment,
      },
      {
        onConflict: 'habit_id,user_id,date',
      },
    )
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export function entriesByHabitId(entries: HabitEntry[]) {
  return new Map(entries.map((entry) => [entry.habit_id, entry]))
}
