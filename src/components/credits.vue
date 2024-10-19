<script setup lang="ts">
import { type Credit, type Role } from '../model/program'

const props = defineProps<{ title: string; credits: Credit[] }>()

const roleLabels: { [key: string]: Role[] } = {
  'Directed By': ['director'],
  Starring: ['actor', 'guest_star', 'guest'],
  Presenter: ['presenter'],
  Writers: ['writer'],
  Producers: ['producer']
}

const getCredits = (roles: Role[]): string[] => {
  return props.credits.filter((c) => roles.includes(c.role)).map((c) => c.name)
}
</script>

<template>
  <div>
    <div class="el-popover__title">{{ title }}</div>
    <table>
      <template v-for="(roles, label) in roleLabels">
        <tr v-if="props.credits.find((c) => roles.includes(c.role))" :key="label">
          <td style="white-space: nowrap; vertical-align: top; padding-right: 10px">
            {{ label }}:
          </td>
          <td>{{ getCredits(roles).join(', ') }}</td>
        </tr>
      </template>
    </table>
  </div>
</template>
