<script setup lang="ts">
import { LogIn, UserPlus } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuth } from '@/composables/useAuth'
import { isSupabaseConfigured } from '@/lib/supabase'

const auth = useAuth()
const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const mode = ref<'login' | 'register'>('login')
const formMessage = ref<string | null>(null)

const isRegistering = computed(() => mode.value === 'register')
const submitLabel = computed(() => (isRegistering.value ? 'Crear cuenta' : 'Iniciar sesion'))

async function submitAuthForm() {
  formMessage.value = null

  try {
    if (isRegistering.value) {
      await auth.register(email.value, password.value)
    } else {
      await auth.login(email.value, password.value)
    }

    if (auth.isAuthenticated.value) {
      const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/today'
      await router.push(redirect)
      return
    }

    formMessage.value = 'Cuenta creada. Revisa tu email si tu proyecto requiere confirmar el registro.'
  } catch {
    formMessage.value = auth.authError.value
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-panel" aria-labelledby="auth-title">
      <div class="auth-heading">
        <p class="eyebrow">Habit Tracker</p>
        <h1 id="auth-title">{{ submitLabel }}</h1>
        <p>Accede para ver tu Today privado y mantener tu progreso sincronizado con Supabase.</p>
      </div>

      <div v-if="!isSupabaseConfigured" class="notice" role="alert">
        Configura `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` antes de iniciar sesion.
      </div>

      <form class="auth-form" @submit.prevent="submitAuthForm">
        <label>
          Email
          <input
            v-model.trim="email"
            type="email"
            name="email"
            autocomplete="email"
            placeholder="tu@email.com"
            required
          />
        </label>

        <label>
          Password
          <input
            v-model="password"
            type="password"
            name="password"
            autocomplete="current-password"
            minlength="6"
            required
          />
        </label>

        <button class="primary-button" type="submit" :disabled="auth.isLoading.value || !isSupabaseConfigured">
          <UserPlus v-if="isRegistering" :size="18" aria-hidden="true" />
          <LogIn v-else :size="18" aria-hidden="true" />
          <span>{{ auth.isLoading.value ? 'Procesando...' : submitLabel }}</span>
        </button>
      </form>

      <p v-if="formMessage" class="form-message" role="status">{{ formMessage }}</p>

      <button class="text-button" type="button" @click="mode = isRegistering ? 'login' : 'register'">
        {{ isRegistering ? 'Ya tengo cuenta' : 'Crear una cuenta nueva' }}
      </button>
    </section>
  </main>
</template>
