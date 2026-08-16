import { computed, ref } from 'vue'

import { useAuth } from '@/composables/useAuth'
import {
  createCategory,
  deleteCategory,
  listCategories,
  sortCategories,
  updateCategory,
  type CategoryInput,
} from '@/services/categories'
import type { Category } from '@/types/database'

const categories = ref<Category[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function useCategories() {
  const auth = useAuth()

  async function loadCategories() {
    isLoading.value = true
    errorMessage.value = null

    try {
      categories.value = sortCategories(await listCategories())
    } catch (error) {
      errorMessage.value = getErrorMessage(error, 'No se pudieron cargar las categorias.')
    } finally {
      isLoading.value = false
    }
  }

  async function addCategory(input: CategoryInput) {
    if (!auth.user.value) {
      throw new Error('Necesitas iniciar sesion para crear categorias.')
    }

    isLoading.value = true
    errorMessage.value = null

    try {
      const category = await createCategory(auth.user.value.id, input)
      categories.value = sortCategories([...categories.value, category])
      return category
    } catch (error) {
      errorMessage.value = getErrorMessage(error, 'No se pudo crear la categoria.')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function saveCategory(categoryId: string, input: CategoryInput) {
    isLoading.value = true
    errorMessage.value = null

    try {
      const category = await updateCategory(categoryId, input)
      categories.value = sortCategories(
        categories.value.map((currentCategory) =>
          currentCategory.id === category.id ? category : currentCategory,
        ),
      )
      return category
    } catch (error) {
      errorMessage.value = getErrorMessage(error, 'No se pudo actualizar la categoria.')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function removeCategory(categoryId: string) {
    isLoading.value = true
    errorMessage.value = null

    try {
      await deleteCategory(categoryId)
      categories.value = categories.value.filter((category) => category.id !== categoryId)
    } catch (error) {
      errorMessage.value = getErrorMessage(error, 'No se pudo eliminar la categoria.')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    categories: computed(() => categories.value),
    categoryCount: computed(() => categories.value.length),
    isLoading,
    errorMessage,
    loadCategories,
    addCategory,
    saveCategory,
    removeCategory,
  }
}
