<script setup lang="ts">
import { FolderOpen, Pencil, Plus } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'

import CategoryForm from '@/components/CategoryForm.vue'
import CategoryIcon from '@/components/CategoryIcon.vue'
import { useCategories } from '@/composables/useCategories'
import type { CategoryInput } from '@/services/categories'
import type { Category } from '@/types/database'

const categoriesStore = useCategories()

const isFormVisible = ref(false)
const editingCategoryId = ref<string | null>(null)
const localMessage = ref<string | null>(null)

const editingCategory = computed(
  () =>
    categoriesStore.categories.value.find((category) => category.id === editingCategoryId.value) ??
    null,
)

const hasCategories = computed(() => categoriesStore.categoryCount.value > 0)

onMounted(() => {
  void categoriesStore.loadCategories()
})

function startCreate() {
  editingCategoryId.value = null
  localMessage.value = null
  isFormVisible.value = true
}

function startEdit(category: Category) {
  editingCategoryId.value = category.id
  localMessage.value = null
  isFormVisible.value = true
}

function closeForm() {
  editingCategoryId.value = null
  isFormVisible.value = false
}

async function submitCategory(input: CategoryInput) {
  localMessage.value = null

  try {
    if (editingCategoryId.value) {
      await categoriesStore.saveCategory(editingCategoryId.value, input)
      localMessage.value = 'Categoria actualizada.'
    } else {
      await categoriesStore.addCategory(input)
      localMessage.value = 'Categoria creada.'
    }

    closeForm()
  } catch {
    localMessage.value = null
  }
}

async function removeEditingCategory() {
  if (!editingCategory.value) {
    return
  }

  const shouldDelete = window.confirm(`Eliminar "${editingCategory.value.name}"?`)

  if (!shouldDelete) {
    return
  }

  try {
    await categoriesStore.removeCategory(editingCategory.value.id)
    localMessage.value = 'Categoria eliminada.'
    closeForm()
  } catch {
    localMessage.value = null
  }
}
</script>

<template>
  <main class="page">
    <section class="page-header" aria-labelledby="categories-title">
      <div>
        <p class="eyebrow">Categories</p>
        <h1 id="categories-title">Categorias</h1>
        <p>Organiza tus habitos por areas sencillas, con iconos y colores consistentes.</p>
      </div>

      <button class="primary-button header-action" type="button" @click="startCreate">
        <Plus :size="18" aria-hidden="true" />
        <span>Nueva categoria</span>
      </button>
    </section>

    <p v-if="categoriesStore.errorMessage.value" class="notice" role="alert">
      {{ categoriesStore.errorMessage.value }}
    </p>

    <p v-if="localMessage" class="form-message" role="status">{{ localMessage }}</p>

    <section
      class="categories-layout"
      :class="{ 'single-panel': !isFormVisible }"
      aria-label="Gestion de categorias"
    >
      <CategoryForm
        v-if="isFormVisible"
        :key="editingCategory?.id ?? 'new-category'"
        :category="editingCategory"
        :is-submitting="categoriesStore.isLoading.value"
        @submit="submitCategory"
        @cancel="closeForm"
        @delete="removeEditingCategory"
      />

      <section class="categories-panel" aria-labelledby="category-list-title">
        <div class="panel-heading">
          <div>
            <h2 id="category-list-title">Listado</h2>
            <p>{{ categoriesStore.categoryCount.value }} categorias</p>
          </div>
        </div>

        <div v-if="categoriesStore.isLoading.value && !hasCategories" class="loading-state">
          Cargando categorias...
        </div>

        <div v-else-if="!hasCategories" class="empty-state">
          <FolderOpen :size="32" aria-hidden="true" />
          <div>
            <h2>Todavia no hay categorias</h2>
            <p>Crea la primera para agrupar habitos en la siguiente fase.</p>
          </div>
        </div>

        <ul v-else class="category-list">
          <li v-for="category in categoriesStore.categories.value" :key="category.id">
            <button class="category-row" type="button" @click="startEdit(category)">
              <span class="category-row-icon" :style="{ backgroundColor: `${category.color}1a` }">
                <CategoryIcon :icon="category.icon" :color="category.color" :size="20" />
              </span>

              <span class="category-row-text">
                <strong>{{ category.name }}</strong>
                <span>{{ category.icon }}</span>
              </span>

              <Pencil :size="18" aria-hidden="true" />
            </button>
          </li>
        </ul>
      </section>
    </section>
  </main>
</template>
