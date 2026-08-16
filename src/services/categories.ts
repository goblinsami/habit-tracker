import { supabase } from '@/lib/supabase'
import type { Category } from '@/types/database'

export type CategoryInput = {
  name: string
  icon: string
  color: string
}

export async function listCategories() {
  const { data, error } = await supabase.from('categories').select('*').order('created_at')

  if (error) {
    throw error
  }

  return data
}

export async function createCategory(userId: string, input: CategoryInput) {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      user_id: userId,
      name: input.name,
      icon: input.icon,
      color: input.color,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateCategory(categoryId: string, input: CategoryInput) {
  const { data, error } = await supabase
    .from('categories')
    .update({
      name: input.name,
      icon: input.icon,
      color: input.color,
    })
    .eq('id', categoryId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteCategory(categoryId: string) {
  const { error } = await supabase.from('categories').delete().eq('id', categoryId)

  if (error) {
    throw error
  }
}

export function sortCategories(categories: Category[]) {
  return [...categories].sort((left, right) => left.name.localeCompare(right.name, 'es'))
}
