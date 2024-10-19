<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus as AddIcon, Delete as DeleteIcon } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { type Criterion, type Query, fields } from '../../model/query'
import { type Channel } from '../../model/channel'
import { useEnv } from '../../composables/env'
import { useQueryUtil } from '../../composables/query-util'
import heading from '../heading.vue'
import field from './field.vue'
import operator from './operator.vue'
import value from './value.vue'

const router = useRouter()
const env = useEnv()
const queryUtil = useQueryUtil()

const loading = ref(false)
const error = ref('')
const query = ref<Query | null>(null)
const newCriterion = ref<Criterion | null>(null)
const origName = ref('')

const unusedFields = computed(() => {
  const q = query.value
  if (q) {
    return fields.filter((f) => !Object.keys(q.criteria).includes(f.name))
  } else {
    return fields
  }
})
const userQueryName = computed(() => {
  return queryUtil.getUserQuery()
})
const saveEnabled = computed(() => query.value?.name)

onMounted(() => {
  origName.value = userQueryName.value || ''
})

const saveQuery = async () => {
  let url = `${env.apiBase}/queries`
  if (origName.value) {
    url += `/${origName.value}`
    if (origName.value !== query.value!.name) {
      queryUtil.deleteUserQuery()
    }
  }
  const response = await fetch(url, {
    method: userQueryName.value ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(queryUtil.toSavedQuery(query.value!))
  })
  if (response.ok) {
    localStorage.setItem('mythme.query', query.value!.name)
    router.replace({ path: `/` })
  } else {
    error.value = `Save Query: ${response.status} ${await response.text()}`
  }
}

const cancelQuery = async () => {
  router.replace({ path: `/` })
}

const deleteQuery = async () => {
  if (query.value) {
    const response = await fetch(`${env.apiBase}/queries/${query.value.name}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' }
    })
    if (response.ok) {
      localStorage.removeItem('mythme.query')
      router.replace({ path: `/` })
    } else {
      error.value = `Delete Query: ${response.status} ${await response.text()}`
    }
  }
}

/**
 * Initialize the new criterion.
 */
const initCriterion = () => {
  newCriterion.value = null
  if (unusedFields.value.length) {
    newCriterion.value = { field: unusedFields.value[0], operator: '=', value: '' }
  }
}

const addCriterion = () => {
  const criterion = newCriterion.value
  if (!criterion) throw new Error('No new criterion to add')
  query.value!.criteria[criterion.field.name] = criterion
  initCriterion()
}

const deleteCriterion = (criterion: Criterion) => {
  delete query.value!.criteria[criterion.field.name]
  initCriterion()
}

const fetchChannels = async () => {
  let channels: Channel[] = []
  const response = await fetch(`${env.apiBase}/channels`)
  if (response.ok) {
    channels = await response.json()
  } else {
    error.value = `Channels: ${response.status} ${await response.text()}`
  }
  fields.find((f) => f.name === 'channel')!.options = [
    ...new Set(channels.map((c) => c.callsign).sort())
  ]
  fields.find((f) => f.name === 'channum')!.options = [
    ...new Set(
      channels
        .map((c) => c.number)
        .sort((n1, n2) => n1 - n2)
        .map((n) => n.toString())
    )
  ]
}

const fetchCategories = async () => {
  let categories: string[] = []
  const response = await fetch(`${env.apiBase}/programs/categories`)
  if (response.ok) {
    categories = await response.json()
  } else {
    error.value = `Categories: ${response.status} ${await response.text()}`
  }
  fields.find((f) => f.name === 'category')!.options = categories
}

const fetchGenres = async () => {
  let genres: string[] = []
  const response = await fetch(`${env.apiBase}/genres`)
  if (response.ok) {
    genres = await response.json()
  } else {
    error.value = `Genres: ${response.status} ${await response.text()}`
  }
  fields.find((f) => f.name === 'genre')!.options = genres
}

const fetchQuery = async () => {
  query.value = null
  const queryName = userQueryName.value
  if (queryName) {
    const response = await fetch(`${env.apiBase}/queries/${queryName}`)
    if (response.ok) {
      const savedQuery = await response.json()
      query.value = queryUtil.fromSavedQuery(savedQuery)
    } else if (response.status !== 404) {
      error.value = `Query '${queryName}': ${response.status} ${await response.text()}`
    }
  }
  if (!query.value) {
    queryUtil.deleteUserQuery()
    console.error(`Query not found: ${userQueryName.value}`)
    router.replace({ path: `/` })
  }
}

const validateQuery = () => {
  if (query.value) {
    for (const [name, criterion] of Object.entries(query.value.criteria)) {
      if (!criterion.field) {
        error.value = `Field not found: ${name}`
      }
    }
  }
}

const initQuery = async () => {
  loading.value = true
  error.value = ''
  await Promise.all([fetchChannels(), fetchCategories() /*, fetchGenres()*/])
  if (userQueryName.value) {
    await fetchQuery()
    validateQuery()
  } else {
    query.value = { name: '', criteria: {} }
  }
  initCriterion()
  loading.value = false
}

initQuery()
</script>

<template>
  <heading title="query" :error="error" />
  <main>
    <div style="width: 880px">
      <div v-if="query" class="content">
        <div>
          <el-input
            v-model="query.name"
            class="name-input"
            placeholder="Query Name"
            :autofocus="!userQueryName"
          />
        </div>
        <template v-if="!error">
          <div v-for="(criterion, key) in query.criteria" :key="key" class="query-row">
            <div class="field-col">
              <field v-model="criterion.field" :options="[criterion.field, ...unusedFields]" />
            </div>
            <div class="operator-col">
              <operator v-model="criterion.operator" :field-type="criterion.field.type" />
            </div>
            <div class="value-col">
              <value
                v-model="criterion.value"
                :field="criterion.field"
                :operator="criterion.operator"
              />
            </div>
            <div class="action-col">
              <el-button
                type="primary"
                size="small"
                plain
                :icon="DeleteIcon"
                title="Delete"
                @click="() => deleteCriterion(criterion)"
              />
            </div>
          </div>
        </template>
        <div class="buttons">
          <el-button type="success" size="small" plain :disabled="!saveEnabled" @click="saveQuery"
            >Save</el-button
          >
          <el-popconfirm
            title="Delete this query?"
            width="160"
            icon=""
            confirm-button-type="text"
            cancel-button-type="text"
            @confirm="deleteQuery"
          >
            <template #reference>
              <el-button v-if="!!userQueryName" type="danger" size="small" plain>Delete</el-button>
            </template>
          </el-popconfirm>
          <el-button size="small" plain @click="cancelQuery">Cancel</el-button>
        </div>
        <div class="query-row">
          <div class="field-col col-label">Field</div>
          <div class="operator-col col-label">Operator</div>
          <div class="value-col col-label">Value</div>
          <div class="action-col col-label"></div>
        </div>
        <div v-if="newCriterion" class="query-row">
          <div class="field-col">
            <field v-model="newCriterion.field" :options="unusedFields" />
          </div>
          <div class="operator-col">
            <operator v-model="newCriterion.operator" :field-type="newCriterion.field.type" />
          </div>
          <div class="value-col">
            <value
              v-model="newCriterion.value"
              :field="newCriterion.field"
              :operator="newCriterion.operator"
            />
          </div>
          <div class="action-col">
            <el-button
              type="primary"
              size="small"
              plain
              :icon="AddIcon"
              title="Add"
              @click="addCriterion"
            />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
