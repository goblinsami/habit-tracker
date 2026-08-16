import { computed, ref } from 'vue'

import { useAuth } from '@/composables/useAuth'
import {
  createHabit,
  listHabits,
  setHabitArchived,
  sortHabits,
  updateHabit,
  type HabitInput,
  type HabitWithCategory,
} from '@/services/habits'

const habits = ref<HabitWithCategory[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function useHabits() {
  const auth = useAuth()

  async function loadHabits() {
    isLoading.value = true
    errorMessage.value = null

    try {
      habits.value = sortHabits(await listHabits())
    } catch (error) {
      errorMessage.value = getErrorMessage(error, 'No se pudieron cargar los habitos.')
    } finally {
      isLoading.value = false
    }
  }

  async function addHabit(input: HabitInput) {
    if (!auth.user.value) {
      throw new Error('Necesitas iniciar sesion para crear habitos.')
    }

    isLoading.value = true
    errorMessage.value = null

    try {
      const habit = await createHabit(auth.user.value.id, input)
      habits.value = sortHabits([...habits.value, habit])
      return habit
    } catch (error) {
      errorMessage.value = getErrorMessage(error, 'No se pudo crear el habito.')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function saveHabit(habitId: string, input: HabitInput) {
    isLoading.value = true
    errorMessage.value = null

    try {
      const habit = await updateHabit(habitId, input)
      habits.value = sortHabits(
        habits.value.map((currentHabit) => (currentHabit.id === habit.id ? habit : currentHabit)),
      )
      return habit
    } catch (error) {
      errorMessage.value = getErrorMessage(error, 'No se pudo actualizar el habito.')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function archiveHabit(habitId: string) {
    return changeHabitArchiveState(habitId, true)
  }

  async function restoreHabit(habitId: string) {
    return changeHabitArchiveState(habitId, false)
  }

  async function changeHabitArchiveState(habitId: string, archived: boolean) {
    isLoading.value = true
    errorMessage.value = null

    try {
      const habit = await setHabitArchived(habitId, archived)
      habits.value = sortHabits(
        habits.value.map((currentHabit) => (currentHabit.id === habit.id ? habit : currentHabit)),
      )
      return habit
    } catch (error) {
      errorMessage.value = getErrorMessage(error, 'No se pudo cambiar el estado del habito.')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    habits: computed(() => habits.value),
    activeHabits: computed(() => habits.value.filter((habit) => !habit.archived)),
    archivedHabits: computed(() => habits.value.filter((habit) => habit.archived)),
    habitCount: computed(() => habits.value.length),
    activeHabitCount: computed(() => habits.value.filter((habit) => !habit.archived).length),
    isLoading,
    errorMessage,
    loadHabits,
    addHabit,
    saveHabit,
    archiveHabit,
    restoreHabit,
  }
}
