<script setup lang="ts">
import { Archive, FolderOpen, Pencil, Plus, RotateCcw } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import CategoryIcon from '@/components/CategoryIcon.vue'
import HabitForm from '@/components/HabitForm.vue'
import { useCategories } from '@/composables/useCategories'
import { useHabits } from '@/composables/useHabits'
import type { HabitInput, HabitWithCategory } from '@/services/habits'

const categoriesStore = useCategories()
const habitsStore = useHabits()

const isFormVisible = ref(false)
const editingHabitId = ref<string | null>(null)
const localMessage = ref<string | null>(null)

const editingHabit = computed(
  () => habitsStore.habits.value.find((habit) => habit.id === editingHabitId.value) ?? null,
)
const hasCategories = computed(() => categoriesStore.categoryCount.value > 0)
const hasActiveHabits = computed(() => habitsStore.activeHabitCount.value > 0)
const hasArchivedHabits = computed(() => habitsStore.archivedHabits.value.length > 0)

onMounted(() => {
  void categoriesStore.loadCategories()
  void habitsStore.loadHabits()
})

function startCreate() {
  editingHabitId.value = null
  localMessage.value = null
  isFormVisible.value = true
}

function startEdit(habit: HabitWithCategory) {
  editingHabitId.value = habit.id
  localMessage.value = null
  isFormVisible.value = true
}

function closeForm() {
  editingHabitId.value = null
  isFormVisible.value = false
}

async function submitHabit(input: HabitInput) {
  localMessage.value = null

  try {
    if (editingHabitId.value) {
      await habitsStore.saveHabit(editingHabitId.value, input)
      localMessage.value = 'Habito actualizado.'
    } else {
      await habitsStore.addHabit(input)
      localMessage.value = 'Habito creado.'
    }

    closeForm()
  } catch {
    localMessage.value = null
  }
}

async function archiveEditingHabit() {
  if (!editingHabit.value) {
    return
  }

  try {
    await habitsStore.archiveHabit(editingHabit.value.id)
    localMessage.value = 'Habito archivado.'
    closeForm()
  } catch {
    localMessage.value = null
  }
}

async function restoreEditingHabit() {
  if (!editingHabit.value) {
    return
  }

  try {
    await habitsStore.restoreHabit(editingHabit.value.id)
    localMessage.value = 'Habito restaurado.'
    closeForm()
  } catch {
    localMessage.value = null
  }
}
</script>

<template>
  <main class="page">
    <section class="page-header" aria-labelledby="habits-title">
      <div>
        <p class="eyebrow">Habits</p>
        <h1 id="habits-title">Habitos</h1>
        <p>Crea y mantiene los habitos diarios activos. La programacion compleja queda fuera del MVP.</p>
      </div>

      <button
        class="primary-button header-action"
        type="button"
        :disabled="!hasCategories"
        @click="startCreate"
      >
        <Plus :size="18" aria-hidden="true" />
        <span>Nuevo habito</span>
      </button>
    </section>

    <p v-if="categoriesStore.errorMessage.value" class="notice" role="alert">
      {{ categoriesStore.errorMessage.value }}
    </p>

    <p v-if="habitsStore.errorMessage.value" class="notice" role="alert">
      {{ habitsStore.errorMessage.value }}
    </p>

    <p v-if="localMessage" class="form-message" role="status">{{ localMessage }}</p>

    <section v-if="!hasCategories && !categoriesStore.isLoading.value" class="empty-state">
      <FolderOpen :size="32" aria-hidden="true" />
      <div>
        <h2>Primero necesitas una categoria</h2>
        <p>Los habitos requieren categoria para mantener Today ordenado.</p>
        <RouterLink class="inline-link" to="/categories">Crear categoria</RouterLink>
      </div>
    </section>

    <section
      v-else
      class="categories-layout"
      :class="{ 'single-panel': !isFormVisible }"
      aria-label="Gestion de habitos"
    >
      <HabitForm
        v-if="isFormVisible"
        :key="editingHabit?.id ?? 'new-habit'"
        :habit="editingHabit"
        :categories="categoriesStore.categories.value"
        :is-submitting="habitsStore.isLoading.value"
        @submit="submitHabit"
        @cancel="closeForm"
        @archive="archiveEditingHabit"
        @restore="restoreEditingHabit"
      />

      <section class="categories-panel" aria-labelledby="habit-list-title">
        <div class="panel-heading">
          <div>
            <h2 id="habit-list-title">Activos</h2>
            <p>{{ habitsStore.activeHabitCount.value }} habitos</p>
          </div>
        </div>

        <div v-if="habitsStore.isLoading.value && !hasActiveHabits" class="loading-state">
          Cargando habitos...
        </div>

        <div v-else-if="!hasActiveHabits" class="empty-state compact-empty">
          <Archive :size="30" aria-hidden="true" />
          <div>
            <h2>Todavia no hay habitos activos</h2>
            <p>Crea uno para que aparezca en Today.</p>
          </div>
        </div>

        <ul v-else class="category-list">
          <li v-for="habit in habitsStore.activeHabits.value" :key="habit.id">
            <div class="category-row habit-row">
              <RouterLink class="habit-row-link" :to="{ name: 'habit-detail', params: { id: habit.id } }">
                <span
                  class="category-row-icon"
                  :style="{ backgroundColor: habit.category ? `${habit.category.color}1a` : undefined }"
                >
                  <CategoryIcon
                    :icon="habit.category?.icon ?? 'Circle'"
                    :color="habit.category?.color ?? '#57606a'"
                    :size="20"
                  />
                </span>

                <span class="category-row-text">
                  <strong>{{ habit.name }}</strong>
                  <span>{{ habit.category?.name ?? 'Sin categoria' }}</span>
                </span>
              </RouterLink>

              <button class="icon-button" type="button" aria-label="Editar habito" @click="startEdit(habit)">
                <Pencil :size="18" aria-hidden="true" />
              </button>
            </div>
          </li>
        </ul>

        <section v-if="hasArchivedHabits" class="archived-section" aria-labelledby="archived-title">
          <h2 id="archived-title">Archivados</h2>
          <ul class="category-list">
            <li v-for="habit in habitsStore.archivedHabits.value" :key="habit.id">
              <div class="category-row habit-row archived">
                <RouterLink class="habit-row-link" :to="{ name: 'habit-detail', params: { id: habit.id } }">
                  <span
                    class="category-row-icon"
                    :style="{
                      backgroundColor: habit.category ? `${habit.category.color}1a` : undefined,
                    }"
                  >
                    <CategoryIcon
                      :icon="habit.category?.icon ?? 'Circle'"
                      :color="habit.category?.color ?? '#57606a'"
                      :size="20"
                    />
                  </span>

                  <span class="category-row-text">
                    <strong>{{ habit.name }}</strong>
                    <span>{{ habit.category?.name ?? 'Sin categoria' }}</span>
                  </span>
                </RouterLink>

                <button class="icon-button" type="button" aria-label="Editar habito" @click="startEdit(habit)">
                  <RotateCcw :size="18" aria-hidden="true" />
                </button>
              </div>
            </li>
          </ul>
        </section>
      </section>
    </section>
  </main>
</template>
