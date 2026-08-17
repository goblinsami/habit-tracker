<script setup lang="ts">
import { computed } from 'vue'

import CategoryIcon from '@/components/CategoryIcon.vue'
import type { ActivityWeek } from '@/utils/activity'

const props = defineProps<{
  weeks: ActivityWeek[]
  headingId?: string
  title?: string
  description?: string
  icon?: string
  color?: string
}>()

const headingId = computed(() => props.headingId ?? 'activity-heatmap-title')
const heatmapStyle = computed(() => ({
  '--heatmap-color': props.color ?? '#2da44e',
}))
const weekdayLabels = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
const intensityLevels = [0, 1, 2, 3, 4]
</script>

<template>
  <section class="activity-card" :style="heatmapStyle" :aria-labelledby="headingId">
    <div class="panel-heading">
      <div class="activity-card-heading">
        <span
          v-if="icon"
          class="category-row-icon small"
          :style="{ backgroundColor: `${color ?? '#2da44e'}1a` }"
        >
          <CategoryIcon :icon="icon" :color="color ?? '#2da44e'" :size="18" />
        </span>
        <div>
          <h2 :id="headingId">{{ title ?? 'Ultimos 12 meses' }}</h2>
          <p>{{ description ?? 'Intensidad basada en habitos completados por dia.' }}</p>
        </div>
      </div>
    </div>

    <div class="heatmap-scroll" role="region" aria-label="Heatmap de actividad" tabindex="0">
      <div class="heatmap">
        <div class="weekday-labels" aria-hidden="true">
          <span v-for="label in weekdayLabels" :key="label">{{ label }}</span>
        </div>

        <div class="heatmap-weeks">
          <div v-for="week in weeks" :key="week.key" class="heatmap-week">
            <span
              v-for="day in week.days"
              :key="day.date"
              class="heatmap-day"
              :class="[`level-${day.intensity}`, { future: day.isFuture }]"
              :title="day.label"
              :aria-label="day.label"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="heatmap-legend" aria-label="Leyenda de intensidad">
      <span>Menos</span>
      <span
        v-for="level in intensityLevels"
        :key="level"
        class="heatmap-day"
        :class="`level-${level}`"
        aria-hidden="true"
      />
      <span>Mas</span>
    </div>
  </section>
</template>
