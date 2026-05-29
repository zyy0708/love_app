import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import CoupleBinding from '../views/CoupleBinding.vue'
import Dashboard from '../views/Dashboard.vue'
import DiaryEditor from '../views/DiaryEditor.vue'
import Timeline from '../views/Timeline.vue'

const routes = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/login',
    component: Login,
    meta: { guestOnly: true },
  },
  {
    path: '/register',
    component: Register,
    meta: { guestOnly: true },
  },
  {
    path: '/couple-binding',
    component: CoupleBinding,
    meta: { requiresAuth: true },
  },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, requiresCouple: true },
  },
  {
    path: '/diary/new',
    component: DiaryEditor,
    meta: { requiresAuth: true, requiresCouple: true },
  },
  {
    path: '/diary/:id',
    component: DiaryEditor,
    meta: { requiresAuth: true, requiresCouple: true },
  },
  {
    path: '/timeline',
    component: Timeline,
    meta: { requiresAuth: true, requiresCouple: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (authStore.isLoggedIn && to.meta.guestOnly) {
    if (!authStore.couple) {
      await authStore.loadCouple()
    }

    if (authStore.couple) {
      next('/dashboard')
    } else {
      next('/couple-binding')
    }
    return
  }

  if (to.path === '/' && authStore.isLoggedIn) {
    if (!authStore.couple) {
      await authStore.loadCouple()
    }

    if (authStore.couple) {
      next('/dashboard')
    } else {
      next('/couple-binding')
    }
    return
  }

  if (to.meta.requiresAuth) {
    if (!authStore.isLoggedIn) {
      next('/login')
      return
    }

    if (to.meta.requiresCouple) {
      if (!authStore.couple) {
        await authStore.loadCouple()
      }

      if (!authStore.couple) {
        next('/couple-binding')
        return
      }
    }
  }

  next()
})

export default router
