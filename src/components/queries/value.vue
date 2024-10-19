<script setup lang="ts">
import { ref, watch } from 'vue'
import { type Field, type Operator } from '../../model/query'

const width = '220px'
const model = defineModel<string>({ default: '' })
const props = defineProps<{ field: Field; operator: Operator }>()
const emit = defineEmits(['update:modelValue'])

const val = ref<string>('')
const val2 = ref<string>('')
const num = ref<number>(0)
const num2 = ref<number>(0)
const arr = ref<string[]>([])

watch(
  () => props.field.name,
  (name, old) => {
    if (name !== old) {
      clearValues()
    }
  }
)
watch(
  () => props.operator,
  (op, old) => {
    arr.value = []
    if (op === 'BETWEEN') {
      val.value = ''
    }
    if (old === 'BETWEEN') {
      val.value = ''
      val2.value = ''
    }
    emitUpdate()
  }
)

const initValues = () => {
  const v = model.value
  if (props.operator === 'IN') {
    arr.value = v ? JSON.parse(v) : []
  } else if (props.operator === 'BETWEEN') {
    const [v1, v2] = v ? JSON.parse(v) : ['', '']
    val.value = v1
    val2.value = v2
    if (props.field.type === 'number') {
      num.value = v1 ? parseInt(v1) : 0
      num2.value = v2 ? parseInt(v2) : 0
    }
  } else if (props.field.type === 'number') {
    num.value = v ? parseInt(v) : 0
  } else {
    val.value = v
  }
}

const clearValues = () => {
  val.value = ''
  val2.value = ''
  num.value = 0
  num2.value = 0
  arr.value = []
  emitUpdate()
}

const numChange = () => {
  val.value = num.value.toString()
  if (props.operator === 'BETWEEN') {
    val2.value = num2.value.toString()
  } else {
    val2.value = ''
  }
  emitUpdate()
}

const arrChange = () => {
  val.value = JSON.stringify(arr.value)
  emitUpdate()
}

const emitUpdate = () => {
  if (props.field.type === 'date') {
    val.value = val.value ? new Date(val.value).toISOString() : ''
    val2.value = val2.value ? new Date(val2.value).toISOString() : ''
  }
  if (props.operator === 'BETWEEN') {
    if (val.value && val2.value) {
      emit('update:modelValue', JSON.stringify([val.value, val2.value]))
    }
  } else {
    emit('update:modelValue', val.value)
  }
}

initValues()
</script>

<template>
  <span v-if="field.options && operator !== 'LIKE'">
    <el-select
      v-if="operator === 'IN'"
      v-model="arr"
      size="small"
      multiple
      style="width: 460px"
      @change="arrChange"
    >
      <el-option v-for="opt in field.options" :key="opt" :value="opt" />
    </el-select>
    <el-select v-else v-model="val" size="small" :style="{ width }" @change="emitUpdate">
      <el-option v-for="opt in field.options" :key="opt" :value="opt" />
    </el-select>
  </span>
  <el-date-picker
    v-if="field.type === 'date'"
    v-model="val"
    type="datetime"
    size="small"
    @change="emitUpdate"
  />
  <span v-if="!field.options || operator === 'LIKE'">
    <el-input-number
      v-if="field.type === 'number'"
      v-model="num"
      size="small"
      @change="numChange"
    />
    <el-input
      v-if="field.type !== 'number' && field.type !== 'date'"
      v-model="val"
      size="small"
      :style="{ width }"
      @change="emitUpdate"
    />
  </span>

  <span v-if="operator === 'BETWEEN'">
    <span style="font-size: 12px; margin: 0 15px">AND</span>
    <el-select
      v-if="field.options"
      v-model="val2"
      size="small"
      :style="{ width }"
      @change="emitUpdate"
    >
      <el-option v-for="opt in field.options" :key="opt" :value="opt" />
    </el-select>
    <el-date-picker
      v-if="field.type === 'date'"
      v-model="val2"
      type="datetime"
      size="small"
      @change="emitUpdate"
    />
    <span v-if="!field.options">
      <el-input-number
        v-if="field.type === 'number'"
        v-model="num2"
        size="small"
        @change="numChange"
      />
    </span>
  </span>
</template>
