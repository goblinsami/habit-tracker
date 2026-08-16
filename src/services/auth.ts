import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

import { isSupabaseConfigured, supabase } from '@/lib/supabase'

type AuthListener = (event: AuthChangeEvent, session: Session | null) => void

function assertSupabaseConfig() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase no esta configurado. Revisa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.')
  }
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return data.session
}

export async function signInWithPassword(email: string, password: string) {
  assertSupabaseConfig()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data.session
}

export async function signUpWithPassword(email: string, password: string) {
  assertSupabaseConfig()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data.session
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

export function onAuthChange(listener: AuthListener) {
  return supabase.auth.onAuthStateChange(listener).data.subscription
}
