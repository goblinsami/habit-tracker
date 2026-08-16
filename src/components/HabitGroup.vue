<script setup lang="ts">
import CategoryIcon from '@/components/CategoryIcon.vue'
import HabitRow from '@/components/HabitRow.vue'
import type { HabitWithCategory } from '@/services/habits'
import type { HabitEntry } from '@/types/database'

defineProps<{
  title: string
  icon: string
  color: string
  habits: HabitWithCategory[]
  entries: Map<string, HabitEntry>
  savingHabitIds: Set<string>
}>()

defineEmits<{
  toggle: [habitId: string, completed: boolean]
  saveComment: [habitId: string, comment: string]
}>()
</script>

<template>
  <section class="habit-group" :aria-labelledby="`group-${title}`">
    <div class="habit-group-heading">
      <span class="category-row-icon" :style="{ backgroundColor: `${color}1a` }">
        <CategoryIcon :icon="icon" :color="color" :size="20" />
      </span>
      <div>
        <h2 :id="`group-${title}`">{{ title }}</h2>
        <p>{{ habits.length }} habitos</p>
      </div>
    </div>

    <div class="today-habit-list">
      <HabitRow
        v-for="habit in habits"
        :key="habit.id"
        :habit="habit"
        :entry="entries.get(habit.id)"
        :is-saving="savingHabitIds.has(habit.id)"
        @toggle="(habitId, completed) => $emit('toggle', habitId, completed)"
        @save-comment="(habitId, comment) => $emit('saveComment', habitId, comment)"
      />
    </div>
  </section>
</template>
