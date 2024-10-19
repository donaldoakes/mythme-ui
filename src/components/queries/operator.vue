<script setup lang="ts">
import { computed, watch } from 'vue'
import { type Operator, type FieldType, allowableOperators } from '../../model/query'

const model = defineModel<Operator>({ required: true })

const props = defineProps<{ fieldType: FieldType }>()

const operators = computed<Operator[]>(() => {
  return allowableOperators[props.fieldType]
})

watch(
  () => props.fieldType,
  () => {
    if (!(model.value in operators.value)) {
      model.value = operators.value[0]
    }
  }
)

const onSelect = (operator: Operator) => {
  model.value = operator
}
</script>

<template>
  <el-dropdown @command="onSelect">
    <el-button size="small" plain type="primary">{{ model }}</el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-for="op in operators" :key="op" :command="op">{{
          op
        }}</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
