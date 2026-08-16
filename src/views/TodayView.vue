<script setup lang="ts">
import { CalendarDays, ListPlus } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import DailyProgress from '@/components/DailyProgress.vue'
import HabitGroup from '@/components/HabitGroup.vue'
import { useAuth } from '@/composables/useAuth'
import { entriesByHabitId, listEntriesForDate, upsertHabitEntry } from '@/services/entries'
import { listHabits, sortHabits, type HabitWithCategory } from '@/services/habits'
import type { HabitEntry } from '@/types/database'
import { formatLongDate, getLocalDateKey } from '@/utils/date'

type HabitGroupView = {
  key: string
  title: string
  icon: string
  color: string
  habits: HabitWithCategory[]
}

const auth = useAuth()
const today = getLocalDateKey()
const todayLabel = formatLongDate()

const habits = ref<HabitWithCategory[]>([])
const entryMap = ref(new Map<string, HabitEntry>())
const savingHabitIds = ref(new Set<string>())
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)

const activeHabits = computed(() => habits.value.filter((habit) => !habit.archived))
const completedCount = computed(
  () =>
    activeHabits.value.filter((habit) => entryMap.value.get(habit.id)?.completed ?? false).length,
)
const hasHabits = computed(() => activeHabits.value.length > 0)

const groupedHabits = computed(() => {
  const groups = new Map<string, HabitGroupView>()

  for (const habit of activeHabits.value) {
    const groupKey = habit.category?.id ?? 'uncategorized'

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        key: groupKey,
        title: habit.category?.name ?? 'Sin categoria',
        icon: habit.category?.icon ?? 'Circle',
        color: habit.category?.color ?? '#57606a',
        habits: [],
      })
    }

    groups.get(groupKey)?.habits.push(habit)
  }

  return [...groups.values()].map((group) => ({
    ...group,
    habits: sortHabits(group.habits),
  }))
})

onMounted(() => {
  void loadToday()
})

async function loadToday() {
  isLoading.value = true
  errorMessage.value = null

  try {
    const [loadedHabits, loadedEntries] = await Promise.all([listHabits(), listEntriesForDate(today)])
    habits.value = sortHabits(loadedHabits)
    entryMap.value = entriesByHabitId(loadedEntries)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'No se pudo cargar Today.'
  } finally {
    isLoading.value = false
  }
}

function makeOptimisticEntry(habitId: string, completed: boolean, comment: string | null): HabitEntry {
  const previousEntry = entryMap.value.get(habitId)

  return {
    id: previousEntry?.id ?? `optimistic-${habitId}-${today}`,
    habit_id: habitId,
    user_id: auth.user.value?.id ?? '',
    date: today,
    completed,
    comment,
    created_at: previousEntry?.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

function setSaving(habitId: string, isSaving: boolean) {
  const nextSaving = new Set(savingHabitIds.value)

  if (isSaving) {
    nextSaving.add(habitId)
  } else {
    nextSaving.delete(habitId)
  }

  savingHabitIds.value = nextSaving
}

function setEntry(habitId: string, entry: HabitEntry | null) {
  const nextEntries = new Map(entryMap.value)

  if (entry) {
    nextEntries.set(habitId, entry)
  } else {
    nextEntries.delete(habitId)
  }

  entryMap.value = nextEntries
}

async function persistEntry(habitId: string, completed: boolean, comment: string | null) {
  if (!auth.user.value) {
    throw new Error('Necesitas iniciar sesion para registrar Today.')
  }

  return upsertHabitEntry({
    habitId,
    userId: auth.user.value.id,
    date: today,
    completed,
    comment,
  })
}

async function toggleHabit(habitId: string, completed: boolean) {
  const previousEntry = entryMap.value.get(habitId) ?? null
  const nextComment = previousEntry?.comment ?? null

  errorMessage.value = null
  setSaving(habitId, true)
  setEntry(habitId, makeOptimisticEntry(habitId, completed, nextComment))

  try {
    setEntry(habitId, await persistEntry(habitId, completed, nextComment))
  } catch (error) {
    setEntry(habitId, previousEntry)
    errorMessage.value = error instanceof Error ? error.message : 'No se pudo guardar el cambio.'
  } finally {
    setSaving(habitId, false)
  }
}

async function saveComment(habitId: string, comment: string) {
  const previousEntry = entryMap.value.get(habitId) ?? null
  const completed = previousEntry?.completed ?? false
  const normalizedComment = comment.trim() || null

  errorMessage.value = null
  setSaving(habitId, true)
  setEntry(habitId, makeOptimisticEntry(habitId, completed, normalizedComment))

  try {
    setEntry(habitId, await persistEntry(habitId, completed, normalizedComment))
  } catch (error) {
    setEntry(habitId, previousEntry)
    errorMessage.value = error instanceof Error ? error.message : 'No se pudo guardar el comentario.'
  } finally {
    setSaving(habitId, false)
  }
}
</script>

<template>
  <main class="page">
    <section class="page-header" aria-labelledby="today-title">
      <div>
        <p class="eyebrow">Today</p>
        <h1 id="today-title">Tu dia de hoy</h1>
        <p>{{ todayLabel }}</p>
      </div>

      <DailyProgress :completed="completedCount" :total="activeHabits.length" />
    </section>

    <p v-if="errorMessage" class="notice" role="alert">{{ errorMessage }}</p>

    <div v-if="isLoading" class="loading-state">Cargando Today...</div>

    <section v-else-if="!hasHabits" class="empty-state" aria-labelledby="empty-title">
      <CalendarDays :size="32" aria-hidden="true" />
      <div>
        <h2 id="empty-title">No hay habitos activos</h2>
        <p>Crea al menos un habito para empezar a registrar el dia.</p>
        <RouterLink class="inline-link" to="/habits">
          <ListPlus :size="16" aria-hidden="true" />
          <span>Crear habito</span>
        </RouterLink>
      </div>
    </section>

    <div v-else class="today-layout">
      <HabitGroup
        v-for="group in groupedHabits"
        :key="group.key"
        :title="group.title"
        :icon="group.icon"
        :color="group.color"
        :habits="group.habits"
        :entries="entryMap"
        :saving-habit-ids="savingHabitIds"
        @toggle="toggleHabit"
        @save-comment="saveComment"
      />
    </div>
  </main>
</template>
