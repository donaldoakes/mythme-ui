<script setup lang="ts">
import { ArrowDown } from '@element-plus/icons-vue'
import { type Field, fields } from '../../model/query'

const model = defineModel<Field>({ required: true })

defineProps<{ options: Field[] }>()

const onSelect = (fieldName: string) => {
  const field = fields.find((field) => field.name === fieldName)
  if (!field) throw new Error(`Field not found: ${fieldName}`)
  model.value = field
}
</script>

<template>
  <el-dropdown v-if="options.length" @command="onSelect">
    <el-button size="small" plain type="primary">
      {{ model.label }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-for="field in options" :key="field.name" :command="field.name">{{
          field.label
        }}</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
