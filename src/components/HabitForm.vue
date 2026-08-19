<script setup lang="ts">
import { Archive, RotateCcw, Save, X } from 'lucide-vue-next'
import { computed, reactive, watch } from 'vue'

import CategoryIcon from '@/components/CategoryIcon.vue'
import type { HabitInput, HabitWithCategory } from '@/services/habits'
import type { Category } from '@/types/database'
import { normalizeWeekdays, WEEKDAY_OPTIONS, type HabitFrequencyType } from '@/utils/frequency'

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

const frequencyOptions: Array<{ value: HabitFrequencyType; label: string }> = [
  { value: 'daily', label: 'Diaria' },
  { value: 'weekdays', label: 'Días concretos' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'yearly', label: 'Anual' },
]

const form = reactive<HabitInput>({
  name: '',
  categoryId: '',
  frequencyType: 'daily',
  frequencyDays: [],
  frequencyWeekday: null,
  yearlyMonth: null,
  yearlyDay: null,
})

const isEditing = computed(() => Boolean(props.habit))
const selectedCategory = computed(
  () => props.categories.find((category) => category.id === form.categoryId) ?? null,
)
const title = computed(() => (isEditing.value ? 'Editar habito' : 'Nuevo habito'))
const submitLabel = computed(() => (isEditing.value ? 'Guardar cambios' : 'Crear habito'))
const showWeekdayPicker = computed(() => form.frequencyType === 'weekdays')
const showWeeklyPicker = computed(() => form.frequencyType === 'weekly')
const showYearlyPicker = computed(() => form.frequencyType === 'yearly')

watch(
  () => [props.habit, props.categories] as const,
  ([habit, categories]) => {
    form.name = habit?.name ?? ''
    form.categoryId = habit?.category_id ?? categories[0]?.id ?? ''
    form.frequencyType = habit?.frequency_type ?? 'daily'
    form.frequencyDays = normalizeWeekdays(habit?.frequency_days ?? [])
    form.frequencyWeekday = habit?.frequency_weekday ?? null
    form.yearlyMonth = habit?.yearly_month ?? null
    form.yearlyDay = habit?.yearly_day ?? null
  },
  { immediate: true },
)

function toggleWeekday(day: number) {
  const current = new Set(form.frequencyDays)

  if (current.has(day)) {
    current.delete(day)
  } else {
    current.add(day)
  }

  form.frequencyDays = [...current].sort((left, right) => left - right)
}

function submitForm() {
  const payload: HabitInput = {
    name: form.name.trim(),
    categoryId: form.categoryId,
    frequencyType: form.frequencyType,
    frequencyDays: normalizeWeekdays(form.frequencyDays),
    frequencyWeekday:
      form.frequencyType === 'weekly' ? Number(form.frequencyWeekday ?? 0) : null,
    yearlyMonth: form.frequencyType === 'yearly' ? Number(form.yearlyMonth ?? 1) : null,
    yearlyDay: form.frequencyType === 'yearly' ? Number(form.yearlyDay ?? 1) : null,
  }

  if (payload.frequencyType === 'weekdays' && payload.frequencyDays.length === 0) {
    return
  }

  if (payload.frequencyType === 'weekly' && payload.frequencyWeekday === null) {
    return
  }

  if (payload.frequencyType === 'yearly' && (!payload.yearlyMonth || !payload.yearlyDay)) {
    return
  }

  emit('submit', payload)
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
        <p>Configura cuando debe contarse este habito.</p>
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

    <fieldset>
      <legend>Frecuencia</legend>
      <div class="segmented-group">
        <button
          v-for="option in frequencyOptions"
          :key="option.value"
          type="button"
          class="segmented-option"
          :class="{ active: form.frequencyType === option.value }"
          @click="form.frequencyType = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </fieldset>

    <div v-if="showWeekdayPicker" class="picker-block">
      <label>Selecciona los dias</label>
      <div class="weekday-grid">
        <button
          v-for="day in WEEKDAY_OPTIONS"
          :key="day.value"
          type="button"
          class="weekday-chip"
          :class="{ active: form.frequencyDays.includes(day.value) }"
          @click="toggleWeekday(day.value)"
        >
          {{ day.label }}
        </button>
      </div>
    </div>

    <label v-if="showWeeklyPicker">
      Dia de la semana
      <select v-model.number="form.frequencyWeekday" required>
        <option value="" disabled>Selecciona un dia</option>
        <option v-for="day in WEEKDAY_OPTIONS" :key="day.value" :value="day.value">
          {{ day.label }}
        </option>
      </select>
    </label>

    <div v-if="showYearlyPicker" class="yearly-grid">
      <label>
        Mes
        <select v-model.number="form.yearlyMonth" required>
          <option value="" disabled>Mes</option>
          <option v-for="month in 12" :key="month" :value="month">
            {{ month }}
          </option>
        </select>
      </label>

      <label>
        Dia
        <select v-model.number="form.yearlyDay" required>
          <option value="" disabled>Dia</option>
          <option v-for="day in 31" :key="day" :value="day">
            {{ day }}
          </option>
        </select>
      </label>
    </div>

    <div class="form-actions">
      <button
        class="primary-button"
        type="submit"
        :disabled="
          isSubmitting ||
          !form.name.trim() ||
          !form.categoryId ||
          (form.frequencyType === 'weekdays' && form.frequencyDays.length === 0) ||
          (form.frequencyType === 'weekly' && (form.frequencyWeekday === null || form.frequencyWeekday === undefined)) ||
          (form.frequencyType === 'yearly' && (!form.yearlyMonth || !form.yearlyDay))
        "
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
