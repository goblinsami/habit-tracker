<script setup lang="ts">
import { ArrowLeft, CalendarCheck, MessageSquareText } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import ActivityHeatmap from '@/components/ActivityHeatmap.vue'
import CategoryIcon from '@/components/CategoryIcon.vue'
import { listAllEntriesForHabit } from '@/services/entries'
import { getHabit, type HabitWithCategory } from '@/services/habits'
import type { HabitEntry } from '@/types/database'
import { buildHabitActivityWeeks } from '@/utils/activity'
import { formatShortDate } from '@/utils/date'
import { formatHabitFrequency } from '@/utils/frequency'
import { calculateHabitStats } from '@/utils/stats'

const route = useRoute()
const habit = ref<HabitWithCategory | null>(null)
const entries = ref<HabitEntry[]>([])
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)

const habitId = computed(() => String(route.params.id ?? ''))
const endDate = new Date()

const weeks = computed(() => buildHabitActivityWeeks(entries.value, endDate))
const stats = computed(() => calculateHabitStats(entries.value, endDate))
const comments = computed(() =>
  entries.value
    .filter((entry) => entry.comment)
    .sort((left, right) => right.date.localeCompare(left.date)),
)

watch(habitId, () => void loadHabitDetail(), { immediate: true })

async function loadHabitDetail() {
  isLoading.value = true
  errorMessage.value = null

  try {
    const [loadedHabit, loadedEntries] = await Promise.all([
      getHabit(habitId.value),
      listAllEntriesForHabit(habitId.value),
    ])

    habit.value = loadedHabit
    entries.value = loadedEntries
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'No se pudo cargar el habito.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="page">
    <RouterLink class="inline-link back-link" to="/habits">
      <ArrowLeft :size="16" aria-hidden="true" />
      <span>Habitos</span>
    </RouterLink>

    <div v-if="isLoading" class="loading-state">Cargando detalle...</div>

    <p v-else-if="errorMessage" class="notice" role="alert">{{ errorMessage }}</p>

    <template v-else-if="habit">
      <section class="habit-detail-header" aria-labelledby="habit-detail-title">
        <div
          class="habit-detail-icon"
          :style="{ backgroundColor: habit.category ? `${habit.category.color}1a` : undefined }"
        >
          <CategoryIcon
            :icon="habit.category?.icon ?? 'Circle'"
            :color="habit.category?.color ?? '#57606a'"
            :size="30"
          />
        </div>

        <div>
          <p class="eyebrow">{{ habit.category?.name ?? 'Sin categoria' }}</p>
          <h1 id="habit-detail-title">{{ habit.name }}</h1>
          <p>
            {{ habit.archived ? 'Archivado' : 'Activo' }} • {{ formatHabitFrequency(habit) }} • creado el
            {{ formatShortDate(habit.created_at.slice(0, 10)) }}
          </p>
        </div>
      </section>

      <section class="activity-stats habit-stats" aria-label="Estadisticas del habito">
        <article>
          <span>{{ stats.totalCompletedDays }}</span>
          <p>dias completados</p>
        </article>
        <article>
          <span>{{ stats.last30DaysPercentage }}%</span>
          <p>ultimos 30 dias</p>
        </article>
        <article>
          <span>{{ stats.currentStreak }}</span>
          <p>racha actual</p>
        </article>
        <article>
          <span>{{ stats.bestStreak }}</span>
          <p>mejor racha</p>
        </article>
      </section>

      <ActivityHeatmap
        :weeks="weeks"
        title="Historial del habito"
        description="Cada celda muestra si este habito se completo en ese dia."
      />

      <section class="comments-card" aria-labelledby="comments-title">
        <div class="panel-heading">
          <div>
            <h2 id="comments-title">Comentarios</h2>
            <p>{{ comments.length }} notas registradas</p>
          </div>
          <MessageSquareText :size="22" aria-hidden="true" />
        </div>

        <div v-if="comments.length === 0" class="empty-state compact-empty">
          <CalendarCheck :size="30" aria-hidden="true" />
          <div>
            <h2>No hay comentarios todavia</h2>
            <p>Las notas que guardes desde Today apareceran aqui.</p>
          </div>
        </div>

        <ul v-else class="comment-list">
          <li v-for="entry in comments" :key="entry.id">
            <time :datetime="entry.date">{{ formatShortDate(entry.date) }}</time>
            <p>{{ entry.comment }}</p>
          </li>
        </ul>
      </section>
    </template>
  </main>
</template>
