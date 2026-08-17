<script setup lang="ts">
import { Activity, CalendarRange } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'

import ActivityHeatmap from '@/components/ActivityHeatmap.vue'
import { listEntriesForDateRange } from '@/services/entries'
import { listHabits, type HabitWithCategory } from '@/services/habits'
import type { HabitEntry } from '@/types/database'
import { buildActivityWeeks, buildHabitActivityWeeks, type ActivityWeek } from '@/utils/activity'
import { addDays, formatShortDate, getLocalDateKey, startOfWeek } from '@/utils/date'

type HabitActivityBoard = {
  habit: HabitWithCategory
  weeks: ActivityWeek[]
  completedCount: number
}

const entries = ref<HabitEntry[]>([])
const habits = ref<HabitWithCategory[]>([])
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)

const endDate = new Date()
const startDate = startOfWeek(addDays(endDate, -364))
const startDateKey = getLocalDateKey(startDate)
const endDateKey = getLocalDateKey(endDate)

const weeks = computed(() => buildActivityWeeks(entries.value, endDate))
const completedEntries = computed(() => entries.value.filter((entry) => entry.completed))
const activeDays = computed(() => new Set(completedEntries.value.map((entry) => entry.date)).size)
const totalCompletions = computed(() => completedEntries.value.length)
const habitBoards = computed<HabitActivityBoard[]>(() =>
  habits.value.map((habit) => {
    const habitEntries = entries.value.filter((entry) => entry.habit_id === habit.id)

    return {
      habit,
      weeks: buildHabitActivityWeeks(habitEntries, endDate),
      completedCount: habitEntries.filter((entry) => entry.completed).length,
    }
  }),
)
const bestDay = computed(() => {
  const completedByDate = new Map<string, number>()

  for (const entry of completedEntries.value) {
    completedByDate.set(entry.date, (completedByDate.get(entry.date) ?? 0) + 1)
  }

  return [...completedByDate.entries()].sort((left, right) => right[1] - left[1])[0] ?? null
})

onMounted(() => {
  void loadActivity()
})

async function loadActivity() {
  isLoading.value = true
  errorMessage.value = null

  try {
    const [loadedEntries, loadedHabits] = await Promise.all([
      listEntriesForDateRange(startDateKey, endDateKey),
      listHabits(),
    ])

    entries.value = loadedEntries
    habits.value = loadedHabits
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'No se pudo cargar la actividad.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="page">
    <section class="page-header" aria-labelledby="activity-title">
      <div>
        <p class="eyebrow">Activity</p>
        <h1 id="activity-title">Actividad</h1>
        <p>{{ formatShortDate(startDateKey) }} - {{ formatShortDate(endDateKey) }}</p>
      </div>

      <div class="summary-pill" aria-label="Dias con actividad">
        <CalendarRange :size="18" aria-hidden="true" />
        <span>{{ activeDays }} dias activos</span>
      </div>
    </section>

    <p v-if="errorMessage" class="notice" role="alert">{{ errorMessage }}</p>

    <div v-if="isLoading" class="loading-state">Cargando actividad...</div>

    <template v-else>
      <section class="activity-stats" aria-label="Resumen de actividad">
        <article>
          <span>{{ totalCompletions }}</span>
          <p>completados</p>
        </article>
        <article>
          <span>{{ activeDays }}</span>
          <p>dias activos</p>
        </article>
        <article>
          <span>{{ bestDay?.[1] ?? 0 }}</span>
          <p>mejor dia</p>
        </article>
      </section>

      <ActivityHeatmap heading-id="global-activity-heatmap" :weeks="weeks" />

      <section v-if="totalCompletions === 0" class="empty-state compact-empty">
        <Activity :size="32" aria-hidden="true" />
        <div>
          <h2>Aun no hay actividad registrada</h2>
          <p>Cuando marques habitos en Today, este historial empezara a llenarse.</p>
        </div>
      </section>

      <section class="habit-activity-section" aria-labelledby="habit-boards-title">
        <div class="section-heading">
          <div>
            <h2 id="habit-boards-title">Por habito</h2>
            <p>{{ habitBoards.length }} boards individuales</p>
          </div>
        </div>

        <div v-if="habitBoards.length === 0" class="empty-state compact-empty">
          <Activity :size="32" aria-hidden="true" />
          <div>
            <h2>No hay habitos todavia</h2>
            <p>Crea habitos para ver su actividad individual.</p>
          </div>
        </div>

        <div v-else class="habit-activity-list">
          <ActivityHeatmap
            v-for="board in habitBoards"
            :key="board.habit.id"
            :heading-id="`habit-activity-${board.habit.id}`"
            :weeks="board.weeks"
            :title="board.habit.name"
            :description="`${board.habit.category?.name ?? 'Sin categoria'} - ${board.completedCount} completados`"
            :icon="board.habit.category?.icon ?? 'Circle'"
            :color="board.habit.category?.color ?? '#2da44e'"
          />
        </div>
      </section>
    </template>
  </main>
</template>
