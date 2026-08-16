<script setup lang="ts">
import { Save, Trash2, X } from 'lucide-vue-next'
import { computed, reactive, watch } from 'vue'

import CategoryIcon from '@/components/CategoryIcon.vue'
import ColorPicker from '@/components/ColorPicker.vue'
import IconPicker from '@/components/IconPicker.vue'
import { defaultCategoryColor } from '@/constants/categoryColors'
import { defaultCategoryIcon } from '@/constants/categoryIcons'
import type { CategoryInput } from '@/services/categories'
import type { Category } from '@/types/database'

const props = defineProps<{
  category?: Category | null
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  submit: [input: CategoryInput]
  cancel: []
  delete: []
}>()

const form = reactive<CategoryInput>({
  name: '',
  icon: defaultCategoryIcon,
  color: defaultCategoryColor,
})

const isEditing = computed(() => Boolean(props.category))
const title = computed(() => (isEditing.value ? 'Editar categoria' : 'Nueva categoria'))
const submitLabel = computed(() => (isEditing.value ? 'Guardar cambios' : 'Crear categoria'))

watch(
  () => props.category,
  (category) => {
    form.name = category?.name ?? ''
    form.icon = category?.icon ?? defaultCategoryIcon
    form.color = category?.color ?? defaultCategoryColor
  },
  { immediate: true },
)

function submitForm() {
  emit('submit', {
    name: form.name.trim(),
    icon: form.icon,
    color: form.color,
  })
}
</script>

<template>
  <form class="category-form" @submit.prevent="submitForm">
    <div class="form-title-row">
      <div class="category-preview">
        <CategoryIcon :icon="form.icon" :color="form.color" :size="22" />
      </div>
      <div>
        <h2>{{ title }}</h2>
        <p>Nombre, icono y color. Nada mas por ahora.</p>
      </div>
    </div>

    <label>
      Nombre
      <input v-model.trim="form.name" type="text" maxlength="80" placeholder="Musica" required />
    </label>

    <fieldset>
      <legend>Icono</legend>
      <IconPicker v-model="form.icon" :color="form.color" />
    </fieldset>

    <fieldset>
      <legend>Color</legend>
      <ColorPicker v-model="form.color" />
    </fieldset>

    <div class="form-actions">
      <button class="primary-button" type="submit" :disabled="isSubmitting || !form.name.trim()">
        <Save :size="18" aria-hidden="true" />
        <span>{{ isSubmitting ? 'Guardando...' : submitLabel }}</span>
      </button>

      <button class="secondary-button" type="button" :disabled="isSubmitting" @click="emit('cancel')">
        <X :size="18" aria-hidden="true" />
        <span>Cancelar</span>
      </button>

      <button
        v-if="isEditing"
        class="danger-button"
        type="button"
        :disabled="isSubmitting"
        @click="emit('delete')"
      >
        <Trash2 :size="18" aria-hidden="true" />
        <span>Eliminar</span>
      </button>
    </div>
  </form>
</template>
