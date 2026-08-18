<script setup lang="ts">
import { Flame } from 'lucide-vue-next'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import CategoryIcon from '@/components/CategoryIcon.vue'
import type { HabitWithCategory } from '@/services/habits'
import type { HabitEntry } from '@/types/database'
import {
  buildLastSevenHabitDays,
  calculateCurrentMonthPercentage,
  calculateCurrentStreak,
} from '@/utils/stats'

const props = defineProps<{
  habit: HabitWithCategory
  entries: HabitEntry[]
}>()

const color = computed(() => props.habit.category?.color ?? '#2da44e')
const icon = computed(() => props.habit.category?.icon ?? 'Circle')
const categoryName = computed(() => props.habit.category?.name ?? 'Sin categoria')
const weekDays = computed(() => buildLastSevenHabitDays(props.entries))
const monthPercentage = computed(() => calculateCurrentMonthPercentage(props.entries))
const currentStreak = computed(() => calculateCurrentStreak(props.entries))
</script>

<template>
  <article class="habit-week-card" :style="{ '--habit-color': color }">
    <div class="habit-week-top">
      <RouterLink class="habit-week-title" :to="{ name: 'habit-detail', params: { id: habit.id } }">
        <span class="category-row-icon small" :style="{ backgroundColor: `${color}1a` }">
          <CategoryIcon :icon="icon" :color="color" :size="18" />
        </span>

        <span class="habit-week-copy">
          <strong>{{ habit.name }}</strong>
          <span>{{ categoryName }}</span>
        </span>
      </RouterLink>

      <div class="habit-week-metrics" :aria-label="`${monthPercentage}% este mes, racha ${currentStreak} dias`">
        <span>{{ monthPercentage }}%</span>
        <span>
          <Flame :size="14" aria-hidden="true" />
          {{ currentStreak }}
        </span>
      </div>
    </div>

    <div class="habit-week-strip" aria-label="Ultimos 7 dias">
      <span v-for="day in weekDays" :key="`${day.date}-label`" class="habit-week-label">
        {{ day.label }}
      </span>
      <span
        v-for="day in weekDays"
        :key="day.date"
        class="habit-week-dot"
        :class="{ completed: day.completed, today: day.isToday }"
        :title="`${day.date}: ${day.completed ? 'completado' : 'no completado'}`"
        :aria-label="`${day.label} ${day.completed ? 'completado' : 'no completado'}`"
      />
    </div>
  </article>
</template>
