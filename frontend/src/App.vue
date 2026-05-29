<template>
  <router-view />
</template>

<script setup>
import { useAuthStore } from './stores/auth'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

onMounted(async () => {
  if (authStore.token) {
    try {
      await authStore.loadProfile()
    } catch (err) {
      // token 过期或无效，清除登录状态
      authStore.logout()
      router.push('/login')
    }
  }
})
</script>
