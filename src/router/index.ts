import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layouts/Layout.vue'
import Home from '@/views/Home.vue'
import Analysis from '@/views/Analysis.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Layout,
      children: [
        {
          path: '',
          name: 'home',
          component: Home
        },
        {
          path: 'home',
          name: 'home-alias',
          component: Home
        }
      ]
    },
    {
      path: '/analysis',
      name: 'analysis',
      component: Analysis
    }
  ]
})

export default router

