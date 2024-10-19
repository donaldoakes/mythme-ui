<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElDropdown, ElTable } from 'element-plus'
import { ArrowDown, Edit as EditIcon, Plus as PlusIcon } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import type { Credit, Program } from '../model/program'
import type { SavedQuery, Sort } from '../model/query'
import { recordingTypes, type ScheduledRecording } from '../model/recording'
import { useEnv } from '../composables/env'
import { useDateTime } from '../composables/date-time'
import { useQueryUtil } from '../composables/query-util'
import heading from './heading.vue'
import channel from './channel.vue'
import stars from './stars.vue'
import credits from './credits.vue'

const router = useRouter()
const env = useEnv()
const dateTime = useDateTime()
const queryUtil = useQueryUtil()

const loading = ref(true)
const error = ref('')
const dark = ref(localStorage.getItem('mythme.dark') === 'true')
const queries = ref<SavedQuery[]>([])
const userQuery = ref(queryUtil.getUserQuery())
const programs = ref<Program[]>([])
// workaround element-plus pagination reentrancy issue
const paging = ref(false)
const page = ref(1)
const pageSize = ref(50)
const pageCount = ref(0)
const total = ref(0)
const sort = ref<Sort>({ name: 'start' })
const icons = ref(localStorage.getItem('mythme.icons') === 'true')
const progCredits = ref<Credit[]>([])

onMounted(async () => {
  await fetchQueries()
  if (userQuery.value && !queryUtil.findUserQuery(queries.value)) {
    // previously saved query no longer exists
    queryUtil.deleteUserQuery()
    userQuery.value = ''
  }
  await fetchPrograms()
})

const fetchQueries = async () => {
  loading.value = true
  error.value = ''
  queries.value = []
  let response = await fetch(`${env.apiBase}/queries`)
  if (response.ok) {
    queries.value = await response.json()
  } else {
    error.value = `Queries: ${response.status} ${await response.text()}`
    loading.value = false
    // throw here to prevent fetchPrograms() from obscuring the error
    throw new Error(error.value)
  }
}

const fetchPrograms = async () => {
  loading.value = true
  error.value = ''
  programs.value = []
  if (!paging.value) pageCount.value = 0
  let url = `${env.apiBase}/programs`
  let params: string[] = []
  if (page.value !== 1) {
    params.push(`offset=${(page.value - 1) * pageSize.value + 1}`)
  }
  if (sort.value.name !== 'start' || (sort.value.order && sort.value.order !== 'asc')) {
    params.push(`sort=${sort.value.name}`)
    if (sort.value.order === 'desc') {
      params.push('desc=true')
    }
  }
  // params.push('debug=true')

  const query = queryUtil.findUserQuery(queries.value)
  if (query) {
    const qs = queryUtil.queryString(query)
    if (params.length) {
      url += (qs ? `${qs}&` : '?') + params.join('&')
    } else {
      url += qs
    }
  } else {
    queryUtil.deleteUserQuery()
    if (params.length) url += '?' + params.join('&')
  }

  // console.log(`fetchPrograms: '${url}'`)
  const response = await fetch(url)
  if (response.ok) {
    const result = await response.json()
    programs.value = result.programs.map((p: Program) => {
      const prog = {
        ...p,
        start: new Date(p.start),
        end: new Date(p.end)
      }
      if (prog.aired) prog.aired = new Date(prog.aired)
      return prog
    })
    total.value = result.total
    if (!paging.value) {
      pageCount.value =
        Math.floor(result.total / pageSize.value) + (result.total % pageSize.value ? 1 : 0)
    }
  } else {
    error.value = `Programs: ${response.status} ${await response.text()}`
  }
  loading.value = false
}

const fetchCredits = async (channelId: number, start: Date) => {
  const response = await fetch(
    `${env.apiBase}/credits?channel_id=${channelId}&start=${start.toISOString()}`
  )
  if (response.ok) {
    progCredits.value = await response.json()
  } else {
    console.error(`Credits: ${response.status} ${await response.text()}`)
    error.value = `Credits: ${response.status} ${response.statusText}`
  }
}

const recordingTypeOptions = [1, 2, 4, 5, 6, 7, 0].map((num) => {
  return { ...recordingTypes[num] }
})

const getSeasonEpisode = (program: Program): string => {
  let se = ''
  if (program.season) {
    if (program.season > 2000) return se // year
    se = `S${program.season.toString().padStart(2, '0')}`
    if (program.episode) se += ':'
  }
  if (program.episode) se += `E${program.episode.toString().padStart(2, '0')}`
  return se
}

const getRecordingType = (program: Program): string => {
  const recType = program.recording?.type || 0
  return recordingTypes[recType].name
}
const getRecordingTypeStatus = (program: Program): string => {
  const recType = program.recording?.type || 0
  if (recType === 0) return ''
  if (recType === 8) return 'danger'
  return 'success'
}
const getRecordingStatus = (program: Program): string => {
  let recStatus = program.recording?.status || 'Not Recording'
  if (recStatus === 'WillRecord') recStatus = 'Will Record'
  return recStatus
}

const onThemeChange = (darkTheme: boolean) => {
  dark.value = darkTheme
}

const onFilterChange = (filters: Record<string, string[]>) => {
  icons.value = filters.channel?.includes('icons') || false
  localStorage.setItem('mythme.icons', icons.value.toString())
}

const onNewQuery = () => {
  queryUtil.deleteUserQuery()
  router.push({ path: '/query' })
}

const onEditQuery = () => {
  router.push({ path: '/query' })
}

const onRecordSelect = async (record: { program: Program; rec_type: number }) => {
  try {
    const recording_type = recordingTypes[record.rec_type]
    if (recording_type.number === 0) {
      if (record.program.recording) {
        const response = await fetch(`${env.apiBase}/recordings/${record.program.recording.id}`, {
          method: 'DELETE',
          headers: { Accept: 'application/json' }
        })
        if (response.ok) {
          delete record.program.recording
        } else {
          error.value = `Failed to delete recording: ${response.status} ${await response.text()}`
          throw new Error(error.value)
        }
      }
    } else {
      const response = await fetch(`${env.apiBase}/recordings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel_id: record.program.channel.id,
          start: record.program.start,
          type: record.rec_type
        })
      })
      if (!response.ok) {
        throw new Error(`Failed to schedule recording: ${response.status} ${await response.text()}`)
      }
      const recording: ScheduledRecording = await response.json()
      recording.start = new Date(recording.start)
      record.program.recording = recording
    }
  } catch (err) {
    error.value = `${err}`
    console.log('Error:', err)
    if (record.program.recording) {
      record.program.recording.type = 8
    } else {
      record.program.recording = {
        id: 0,
        channel_id: record.program.channel.id,
        start: record.program.start,
        status: 'Error',
        type: 8
      }
    }
  }
}

const onQuerySelect = async (name: string) => {
  if (name === '[Unfiltered]') {
    queryUtil.deleteUserQuery()
    userQuery.value = ''
    await fetchPrograms()
  } else {
    queryUtil.saveUserQuery(name)
    userQuery.value = name
    await fetchPrograms()
  }
}

const onPageChange = async () => {
  paging.value = true
  await fetchPrograms()
  paging.value = false
}

const onSortChange = async (s: {
  column: { property: string; order: 'ascending' | 'descending' }
}) => {
  sort.value = { name: s.column.property, order: s.column.order === 'descending' ? 'desc' : 'asc' }
  page.value = 1
  await fetchPrograms()
}
</script>

<template>
  <header>
    <heading title="programs" :error="error" @theme-change="onThemeChange">
      <template #controls>
        <div>
          <el-dropdown placement="bottom-start" @command="onQuerySelect">
            <el-button class="query-drop-btn" plain>
              {{ userQuery || '[Unfiltered]'
              }}<el-icon class="el-icon--right" style="margin-left: 5px"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="[Unfiltered]">[Unfiltered]</el-dropdown-item>
                <el-dropdown-item v-for="q in queries" :key="q.name" :command="q.name">{{
                  q.name
                }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button
            v-if="userQuery"
            type="primary"
            class="query-edit-btn"
            title="Edit Query"
            plain
            :icon="EditIcon"
            @click="onEditQuery"
          />
          <el-button
            type="primary"
            class="query-edit-btn"
            title="New Query"
            plain
            style="margin-left: 5px"
            :icon="PlusIcon"
            @click="onNewQuery"
          />
        </div>
      </template>
    </heading>
  </header>
  <main>
    <div>
      <el-table
        v-loading="loading"
        :data="programs"
        :empty-text="loading ? ' ' : 'No matching programs'"
        @filter-change="onFilterChange"
        @sort-change="onSortChange"
      >
        <el-table-column
          prop="channum"
          label="Channel"
          column-key="channel"
          :filters="[{ text: 'Icons', value: 'icons' }]"
          :filtered-value="icons ? ['icons'] : []"
          sortable="custom"
          width="125"
        >
          <template #default="scope"
            ><channel :channel="scope.row.channel" :icon="icons" :dark="dark"
          /></template>
        </el-table-column>
        <el-table-column
          prop="title"
          :label="'Programs' + (total ? ` (${total})` : '')"
          sortable="custom"
        >
          <template #default="scope">
            <div style="display: flex">
              <div class="data-title">
                {{ scope.row.title }}
                <span v-if="getSeasonEpisode(scope.row)" class="data-title-sub">
                  {{ getSeasonEpisode(scope.row) }}
                </span>
              </div>
              <div class="data-action">
                <el-dropdown @command="onRecordSelect">
                  <el-button size="small" plain :type="getRecordingTypeStatus(scope.row)">
                    {{ getRecordingType(scope.row)
                    }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        v-for="recording_type in recordingTypeOptions"
                        :key="scope.row.title + recording_type.number"
                        :command="{ program: scope.row, rec_type: recording_type.number }"
                        >{{ recording_type.name }}</el-dropdown-item
                      >
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
            <div class="data-sub">
              <span>{{ scope.row.description }}</span>
              <span style="white-space: nowrap">
                <span class="data-sub-suffix"
                  >[{{ dateTime.duration(scope.row.start, scope.row.end) }} hrs]</span
                >
                <el-popover
                  v-if="scope.row.credits"
                  placement="right"
                  :width="450"
                  trigger="click"
                  @before-enter="
                    async () => await fetchCredits(scope.row.channel.id, scope.row.start)
                  "
                >
                  <template #reference>
                    <a class="data-sub-link">Credits</a>
                  </template>
                  <credits :title="scope.row.title" :credits="progCredits" />
                </el-popover>
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="start" label="Start" sortable="custom" width="120">
          <template #default="scope">
            <div class="data-date">
              <div>{{ dateTime.formatDate(scope.row.start) }}</div>
              <div>{{ dateTime.formatTime(scope.row.start) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="Category" sortable="custom" width="125" />
        <el-table-column prop="year" label="Year" sortable="custom" width="120">
          <template #default="scope">
            <div v-if="scope.row.year">{{ scope.row.year }}</div>
            <div v-if="!scope.row.year && scope.row.aired">
              {{ dateTime.formatDate(scope.row.aired) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="rating" label="Rating" sortable="custom" width="100">
          <template #default="scope">
            <stars :rating="scope.row.rating" />
          </template>
        </el-table-column>
      </el-table>
      <div v-if="!loading" class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-count="pageCount"
          :page-size="pageSize"
          layout="prev, pager, next"
          @change="onPageChange"
        />
      </div>
    </div>
  </main>
</template>
