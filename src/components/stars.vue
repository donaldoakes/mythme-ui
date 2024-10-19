<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ rating: number }>()

const stars = computed(() => {
  let s = Math.trunc(props.rating)
  const r = props.rating % 1
  if (r >= 0.25 && r < 0.75) {
    s += 0.5
  } else if (r >= 0.75) {
    s += 1
  }
  return s
})
</script>

<template>
  <div v-if="rating" :title="`${stars} Stars`" style="font-size: 14px">
    <div style="display: inline-block">{{ '★'.repeat(stars) }}</div>
    <div
      v-if="stars % 1"
      style="display: inline-block; overflow: hidden; width: 8px; position: relative; top: 7px"
    >
      ★
    </div>
  </div>
</template>
