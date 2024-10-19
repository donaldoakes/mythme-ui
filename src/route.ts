import { createRouter, createWebHistory } from 'vue-router'
import programs from './components/programs.vue'
import query from './components/queries/query.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'programs',
      component: programs
    },
    {
      path: '/query',
      name: 'query',
      component: query
    }
  ]
})

export default router
