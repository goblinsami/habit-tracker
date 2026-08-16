<script setup lang="ts">
import { Archive, RotateCcw, Save, X } from 'lucide-vue-next'
import { computed, reactive, watch } from 'vue'

import CategoryIcon from '@/components/CategoryIcon.vue'
import type { HabitInput, HabitWithCategory } from '@/services/habits'
import type { Category } from '@/types/database'

const props = defineProps<{
  habit?: HabitWithCategory | null
  categories: Category[]
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  submit: [input: HabitInput]
  cancel: []
  archive: []
  restore: []
}>()

const form = reactive<HabitInput>({
  name: '',
  categoryId: '',
})

const isEditing = computed(() => Boolean(props.habit))
const selectedCategory = computed(
  () => props.categories.find((category) => category.id === form.categoryId) ?? null,
)
const title = computed(() => (isEditing.value ? 'Editar habito' : 'Nuevo habito'))
const submitLabel = computed(() => (isEditing.value ? 'Guardar cambios' : 'Crear habito'))

watch(
  () => [props.habit, props.categories] as const,
  ([habit, categories]) => {
    form.name = habit?.name ?? ''
    form.categoryId = habit?.category_id ?? categories[0]?.id ?? ''
  },
  { immediate: true },
)

function submitForm() {
  emit('submit', {
    name: form.name.trim(),
    categoryId: form.categoryId,
  })
}
</script>

<template>
  <form class="habit-form" @submit.prevent="submitForm">
    <div class="form-title-row">
      <div
        class="category-preview"
        :style="{ backgroundColor: selectedCategory ? `${selectedCategory.color}1a` : undefined }"
      >
        <CategoryIcon
          :icon="selectedCategory?.icon ?? 'Circle'"
          :color="selectedCategory?.color ?? '#57606a'"
          :size="22"
        />
      </div>
      <div>
        <h2>{{ title }}</h2>
        <p>Todos los habitos activos apareceran diariamente.</p>
      </div>
    </div>

    <label>
      Nombre
      <input v-model.trim="form.name" type="text" maxlength="100" placeholder="Guitarra" required />
    </label>

    <label>
      Categoria
      <select v-model="form.categoryId" required>
        <option value="" disabled>Selecciona categoria</option>
        <option v-for="category in categories" :key="category.id" :value="category.id">
          {{ category.name }}
        </option>
      </select>
    </label>

    <div class="form-actions">
      <button
        class="primary-button"
        type="submit"
        :disabled="isSubmitting || !form.name.trim() || !form.categoryId"
      >
        <Save :size="18" aria-hidden="true" />
        <span>{{ isSubmitting ? 'Guardando...' : submitLabel }}</span>
      </button>

      <button class="secondary-button" type="button" :disabled="isSubmitting" @click="emit('cancel')">
        <X :size="18" aria-hidden="true" />
        <span>Cancelar</span>
      </button>

      <button
        v-if="isEditing && !habit?.archived"
        class="danger-button"
        type="button"
        :disabled="isSubmitting"
        @click="emit('archive')"
      >
        <Archive :size="18" aria-hidden="true" />
        <span>Archivar</span>
      </button>

      <button
        v-if="isEditing && habit?.archived"
        class="secondary-button"
        type="button"
        :disabled="isSubmitting"
        @click="emit('restore')"
      >
        <RotateCcw :size="18" aria-hidden="true" />
        <span>Restaurar</span>
      </button>
    </div>
  </form>
</template>
