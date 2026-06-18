import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const routes = [
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '首页' },
      },
      {
        path: 'works',
        name: 'WorkManagement',
        component: () => import('@/views/WorkManagement.vue'),
        meta: { title: '作品管理' },
      },
      {
        path: 'works/:id',
        name: 'WorkDetail',
        component: () => import('@/views/WorkDetail.vue'),
        meta: { title: '作品详情' },
      },
      {
        path: 'ai-images',
        name: 'AiImageManagement',
        component: () => import('@/views/AiImageManagement.vue'),
        meta: { title: 'AI生图管理' },
      },
      {
        path: 'ai-images/:id',
        name: 'AiImageDetail',
        component: () => import('@/views/AiImageDetail.vue'),
        meta: { title: 'AI生图详情' },
      },
    ],
  },
]

const router = new Router({
  mode: 'hash',
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { x: 0, y: 0 }
  },
})

export default router