<script setup lang="ts">
import {
  ChartNoAxesColumnIncreasing,
  FolderOpen,
  ListChecks,
  LogOut,
  Sprout,
  Sun,
} from 'lucide-vue-next'
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'

import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const route = useRoute()
const auth = useAuth()

const userEmail = computed(() => auth.user.value?.email ?? '')

const navigationItems = [
  { to: '/today', label: 'Today', icon: Sun },
  { to: '/habits', label: 'Habits', icon: ListChecks },
  { to: '/activity', label: 'Activity', icon: ChartNoAxesColumnIncreasing },
  { to: '/categories', label: 'Categories', icon: FolderOpen },
]

function isActiveNavItem(path: string) {
  return path === '/habits' ? route.path.startsWith('/habits') : route.path === path
}

async function handleLogout() {
  await auth.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <div class="app-shell">
    <header v-if="auth.isAuthenticated.value" class="topbar">
      <RouterLink class="brand" to="/today" aria-label="Ir a Today">
        <span class="brand-mark">
          <Sprout :size="18" aria-hidden="true" />
        </span>
        <span>Habit Tracker</span>
      </RouterLink>

      <nav class="main-nav" aria-label="Navegacion principal">
        <RouterLink
          v-for="item in navigationItems"
          :key="item.to"
          class="nav-link"
          :class="{ active: isActiveNavItem(item.to) }"
          :to="item.to"
        >
          <component :is="item.icon" :size="16" aria-hidden="true" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="session-actions">
        <span class="user-email">{{ userEmail }}</span>
        <button class="icon-button" type="button" aria-label="Cerrar sesion" @click="handleLogout">
          <LogOut :size="18" aria-hidden="true" />
        </button>
      </div>
    </header>

    <RouterView />
  </div>
</template>
