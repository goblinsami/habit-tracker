import { createRouter, createWebHistory } from 'vue-router'

import { useAuth } from '@/composables/useAuth'
import ActivityView from '@/views/ActivityView.vue'
import CategoriesView from '@/views/CategoriesView.vue'
import HabitDetailView from '@/views/HabitDetailView.vue'
import HabitsView from '@/views/HabitsView.vue'
import LoginView from '@/views/LoginView.vue'
import TodayView from '@/views/TodayView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/today',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        guestOnly: true,
      },
    },
    {
      path: '/today',
      name: 'today',
      component: TodayView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/categories',
      name: 'categories',
      component: CategoriesView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/habits',
      name: 'habits',
      component: HabitsView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/habits/:id',
      name: 'habit-detail',
      component: HabitDetailView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/activity',
      name: 'activity',
      component: ActivityView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/today',
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuth()

  await auth.initializeAuth()

  if (to.meta.requiresAuth && !auth.isAuthenticated.value) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  if (to.meta.guestOnly && auth.isAuthenticated.value) {
    return { name: 'today' }
  }

  return true
})

export default router
