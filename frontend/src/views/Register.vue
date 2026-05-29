<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
      <h2 class="text-3xl font-bold text-center text-pink-600 mb-8">注册</h2>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
          <input
            v-model="form.username"
            type="text"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <p class="text-xs text-gray-500 mt-1">3-30个字符，只能包含字母、数字和下划线</p>
        </div>

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
            @input="validatePassword"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <div class="mt-2 space-y-1">
            <p class="text-xs text-gray-600 mb-2 font-medium">密码要求：</p>
            <div class="flex items-center space-x-2">
              <span class="text-lg" :class="passwordChecks.minLength ? 'text-green-500' : 'text-gray-400'">
                {{ passwordChecks.minLength ? '✓' : '○' }}
              </span>
              <span class="text-xs" :class="passwordChecks.minLength ? 'text-green-600' : 'text-gray-500'">
                至少8个字符
              </span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-lg" :class="passwordChecks.hasUpperCase ? 'text-green-500' : 'text-gray-400'">
                {{ passwordChecks.hasUpperCase ? '✓' : '○' }}
              </span>
              <span class="text-xs" :class="passwordChecks.hasUpperCase ? 'text-green-600' : 'text-gray-500'">
                包含至少一个大写字母 (A-Z)
              </span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-lg" :class="passwordChecks.hasLowerCase ? 'text-green-500' : 'text-gray-400'">
                {{ passwordChecks.hasLowerCase ? '✓' : '○' }}
              </span>
              <span class="text-xs" :class="passwordChecks.hasLowerCase ? 'text-green-600' : 'text-gray-500'">
                包含至少一个小写字母 (a-z)
              </span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-lg" :class="passwordChecks.hasNumber ? 'text-green-500' : 'text-gray-400'">
                {{ passwordChecks.hasNumber ? '✓' : '○' }}
              </span>
              <span class="text-xs" :class="passwordChecks.hasNumber ? 'text-green-600' : 'text-gray-500'">
                包含至少一个数字 (0-9)
              </span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-lg" :class="passwordChecks.hasSpecial ? 'text-green-500' : 'text-gray-400'">
                {{ passwordChecks.hasSpecial ? '✓' : '○' }}
              </span>
              <span class="text-xs" :class="passwordChecks.hasSpecial ? 'text-green-600' : 'text-gray-500'">
                包含至少一个特殊字符 (!@#$%^&*(),.?":{}|<>)
              </span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading || !isPasswordValid"
          class="w-full bg-pink-600 text-white py-2 rounded-lg font-semibold hover:bg-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>

      <div class="mt-4 text-center">
        <p class="text-gray-600">
          已有账号？
          <router-link to="/login" class="text-pink-600 hover:text-pink-700 font-semibold">登录</router-link>
        </p>
      </div>

      <div v-if="error" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')

const form = reactive({
  username: '',
  email: '',
  password: '',
})

const passwordChecks = reactive({
  minLength: false,
  hasUpperCase: false,
  hasLowerCase: false,
  hasNumber: false,
  hasSpecial: false,
})

const isPasswordValid = computed(() => {
  return Object.values(passwordChecks).every(check => check === true)
})

function validatePassword() {
  const password = form.password
  passwordChecks.minLength = password.length >= 8
  passwordChecks.hasUpperCase = /[A-Z]/.test(password)
  passwordChecks.hasLowerCase = /[a-z]/.test(password)
  passwordChecks.hasNumber = /[0-9]/.test(password)
  passwordChecks.hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
}

const handleRegister = async () => {
  try {
    loading.value = true
    error.value = ''
    await authStore.register(form.username, form.email, form.password)
    await authStore.login(form.email, form.password)
    await authStore.loadProfile()
    router.push('/couple-binding')
  } catch (err) {
    const errDetails = err.response?.data?.details
    if (errDetails && Array.isArray(errDetails)) {
      error.value = errDetails.join('；')
    } else {
      error.value = err.response?.data?.error || '注册失败'
    }
  } finally {
    loading.value = false
  }
}
</script>
