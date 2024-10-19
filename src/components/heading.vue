<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ title?: string; subTitle?: string; error?: string }>()
const emit = defineEmits(['themeChange'])

const dark = ref(localStorage.getItem('mythme.dark') === 'true')
document.documentElement.classList.toggle('dark', dark.value)

const onThemeChange = () => {
  document.documentElement.classList.toggle('dark', dark.value)
  localStorage.setItem('mythme.dark', `${dark.value}`)
  emit('themeChange', dark.value)
}
</script>

<template>
  <div class="error">
    <el-alert v-if="error" title="Error" type="error" :description="props.error" show-icon />
  </div>
  <div class="heading">
    <img
      class="heading-logo"
      src="/img/mm.png"
      alt="mythme"
      width="18px"
      height="20px"
      :style="{ filter: `invert(${dark ? 1 : 0})` }"
    />
    <div>mythme</div>
    <div v-if="title" class="title">{{ title }}</div>
    <div v-if="subTitle" class="sub-title">{{ subTitle }}</div>
    <div class="heading-controls">
      <slot name="controls"> </slot>
    </div>
    <div class="heading-toggle">
      <el-switch
        v-model="dark"
        size="small"
        active-text="Dark"
        inactive-text="Light"
        @change="onThemeChange"
      />
    </div>
  </div>
</template>
