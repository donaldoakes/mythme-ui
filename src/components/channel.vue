<script setup lang="ts">
import { computed } from 'vue'
import type { Channel } from '../model/channel'
import { useEnv } from '../composables/env'

const props = defineProps<{ channel: Channel; icon: boolean; dark: boolean }>()
const env = useEnv()

const inversion = computed(() => {
  switch (props.channel.icon?.shade) {
    case 'light':
      return props.dark ? 1 : 0
    case 'dark':
      return props.dark ? 0 : 1
    case 'white':
      return props.dark ? 0.25 : 0.75
    case 'gray':
      return props.dark ? 0.75 : 0.25
    default:
      return 0
  }
})
</script>

<template>
  <div class="data-title" :title="channel.name">
    <div :style="{ display: icon ? 'flex' : 'block', alignItems: 'center' }">
      <div>
        <img
          v-if="icon && channel.icon"
          :src="`${env.iconsBase}/${channel.icon.file}`"
          :alt="channel.callsign"
          height="32"
          :style="{ filter: `invert(${inversion})` }"
        />
        <span v-else>{{ channel.callsign }}</span>
      </div>
      <div style="margin-top: -7px; margin-left: 10px">
        {{ channel.number }}
      </div>
    </div>
  </div>
</template>
