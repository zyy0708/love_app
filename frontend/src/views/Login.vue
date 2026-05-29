<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
      <h2 class="text-3xl font-bold text-center text-pink-600 mb-8">登录</h2>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input
            v-model="form.password"
            type="password"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-pink-600 text-white py-2 rounded-lg font-semibold hover:bg-pink-700 transition disabled:opacity-50"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <div class="mt-4 text-center">
        <p class="text-gray-600">
          没有账号？
          <router-link to="/register" class="text-pink-600 hover:text-pink-700 font-semibold">注册</router-link>
        </p>
      </div>

      <div v-if="error" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')

const form = reactive({
  email: '',
  password: '',
})

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''
    await authStore.login(form.email, form.password)
    await authStore.loadProfile()
    await authStore.loadCouple()
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.error || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>
