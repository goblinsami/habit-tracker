<script setup lang="ts">
import { Check, MessageSquare, Save } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'

import CategoryIcon from '@/components/CategoryIcon.vue'
import type { HabitWithCategory } from '@/services/habits'
import type { HabitEntry } from '@/types/database'
import { formatHabitFrequency } from '@/utils/frequency'

const props = defineProps<{
  habit: HabitWithCategory
  entry?: HabitEntry | null
  isSaving?: boolean
}>()

const emit = defineEmits<{
  toggle: [habitId: string, completed: boolean]
  saveComment: [habitId: string, comment: string]
}>()

const isCommentOpen = ref(false)
const draftComment = ref('')

const isCompleted = computed(() => props.entry?.completed ?? false)
const hasComment = computed(() => Boolean(props.entry?.comment))
const commentButtonLabel = computed(() => (hasComment.value ? 'Editar comentario' : 'Añadir comentario'))

watch(
  () => props.entry?.comment,
  (comment) => {
    draftComment.value = comment ?? ''
  },
  { immediate: true },
)

function toggleCompleted() {
  emit('toggle', props.habit.id, !isCompleted.value)
}

function saveComment() {
  emit('saveComment', props.habit.id, draftComment.value)
  isCommentOpen.value = false
}
</script>

<template>
  <article class="today-habit-row" :class="{ completed: isCompleted }">
    <button
      class="habit-check"
      type="button"
      :aria-pressed="isCompleted"
      :aria-label="isCompleted ? `Desmarcar ${habit.name}` : `Completar ${habit.name}`"
      :disabled="isSaving"
      @click="toggleCompleted"
    >
      <Check v-if="isCompleted" :size="18" aria-hidden="true" />
    </button>

    <div class="today-habit-main">
      <div class="today-habit-title">
        <span
          class="category-row-icon small"
          :style="{ backgroundColor: habit.category ? `${habit.category.color}1a` : undefined }"
        >
          <CategoryIcon
            :icon="habit.category?.icon ?? 'Circle'"
            :color="habit.category?.color ?? '#57606a'"
            :size="17"
          />
        </span>
        <div>
          <h3>{{ habit.name }}</h3>
          <p>{{ habit.category?.name ?? 'Sin categoria' }}</p>
        </div>
      </div>

      <p class="habit-frequency-label">{{ formatHabitFrequency(habit) }}</p>

      <div v-if="isCommentOpen" class="comment-editor">
        <textarea
          v-model="draftComment"
          rows="3"
          maxlength="500"
          placeholder="Nota opcional para hoy"
        />
        <button class="secondary-button" type="button" :disabled="isSaving" @click="saveComment">
          <Save :size="16" aria-hidden="true" />
          <span>{{ isSaving ? 'Guardando...' : 'Guardar nota' }}</span>
        </button>
      </div>
      <p v-else-if="entry?.comment" class="habit-comment">{{ entry.comment }}</p>
    </div>

    <div class="today-habit-actions">
      <button
        class="icon-button"
        type="button"
        :aria-label="commentButtonLabel"
        :title="commentButtonLabel"
        @click="isCommentOpen = !isCommentOpen"
      >
        <MessageSquare :size="18" aria-hidden="true" />
      </button>
      <span v-if="isSaving" class="saving-label">Guardando</span>
    </div>
  </article>
</template>
