import type { Session } from '@supabase/supabase-js'
import { computed, readonly, ref } from 'vue'

import {
  getCurrentSession,
  onAuthChange,
  signInWithPassword,
  signOut as signOutService,
  signUpWithPassword,
} from '@/services/auth'

const session = ref<Session | null>(null)
const isLoading = ref(true)
const authError = ref<string | null>(null)

let initialization: Promise<void> | null = null
let unsubscribeAuth: (() => void) | null = null

function setSession(nextSession: Session | null) {
  session.value = nextSession
}

async function initializeAuth() {
  if (initialization) {
    return initialization
  }

  initialization = (async () => {
    isLoading.value = true
    authError.value = null

    try {
      setSession(await getCurrentSession())

      if (!unsubscribeAuth) {
        const subscription = onAuthChange((_event, nextSession) => {
          setSession(nextSession)
        })

        unsubscribeAuth = () => subscription.unsubscribe()
      }
    } catch (error) {
      authError.value = error instanceof Error ? error.message : 'No se pudo cargar la sesion.'
      setSession(null)
    } finally {
      isLoading.value = false
    }
  })()

  return initialization
}

async function login(email: string, password: string) {
  isLoading.value = true
  authError.value = null

  try {
    setSession(await signInWithPassword(email, password))
  } catch (error) {
    authError.value = error instanceof Error ? error.message : 'No se pudo iniciar sesion.'
    throw error
  } finally {
    isLoading.value = false
  }
}

async function register(email: string, password: string) {
  isLoading.value = true
  authError.value = null

  try {
    setSession(await signUpWithPassword(email, password))
  } catch (error) {
    authError.value = error instanceof Error ? error.message : 'No se pudo crear la cuenta.'
    throw error
  } finally {
    isLoading.value = false
  }
}

async function logout() {
  isLoading.value = true
  authError.value = null

  try {
    await signOutService()
    setSession(null)
  } catch (error) {
    authError.value = error instanceof Error ? error.message : 'No se pudo cerrar sesion.'
    throw error
  } finally {
    isLoading.value = false
  }
}

export function useAuth() {
  return {
    session: readonly(session),
    user: computed(() => session.value?.user ?? null),
    isAuthenticated: computed(() => Boolean(session.value?.user)),
    isLoading: readonly(isLoading),
    authError: readonly(authError),
    initializeAuth,
    login,
    register,
    logout,
  }
}
