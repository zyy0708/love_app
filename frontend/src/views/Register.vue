<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 flex items-center justify-center p-4">
    <!-- Background decorations -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute top-20 right-10 w-32 h-32 bg-pink-200 rounded-full opacity-20 animate-float"></div>
      <div class="absolute bottom-20 left-10 w-40 h-40 bg-rose-200 rounded-full opacity-20 animate-float" style="animation-delay: 2s;"></div>
    </div>

    <div class="relative w-full max-w-md">
      <!-- Back to home -->
      <router-link
        to="/"
        class="inline-flex items-center text-gray-600 hover:text-pink-600 mb-6 transition-colors duration-200"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        返回首页
      </router-link>

      <!-- Register Card -->
      <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-pink-100">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span class="text-4xl">💕</span>
          </div>
          <h2 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">
            创建账号
          </h2>
          <p class="text-gray-500 mt-2">开始记录你们的美好时光</p>
        </div>

        <!-- Register Form -->
        <form @submit.prevent="handleRegister" class="space-y-5">
          <!-- Username Field -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">用户名</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                v-model="form.username"
                type="text"
                required
                placeholder="你的昵称"
                class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent focus:bg-white transition-all duration-200"
              />
            </div>
            <p class="text-xs text-gray-500">2-30个字符</p>
          </div>

          <!-- Email Field -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">邮箱</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                v-model="form.email"
                type="email"
                required
                placeholder="your@email.com"
                class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent focus:bg-white transition-all duration-200"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">密码</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="创建密码"
                @input="validatePassword"
                class="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent focus:bg-white transition-all duration-200"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>

            <!-- Password Strength Indicator -->
            <div class="space-y-2 mt-3">
              <div class="flex gap-2">
                <div
                  v-for="i in 4"
                  :key="i"
                  class="h-1 flex-1 rounded-full transition-all duration-300"
                  :class="passwordStrength >= i ? strengthColors[passwordStrength] : 'bg-gray-200'"
                ></div>
              </div>
              <p class="text-xs" :class="strengthTextColors[passwordStrength]">
                {{ strengthLabels[passwordStrength] }}
              </p>
            </div>

            <!-- Password Requirements -->
            <div class="space-y-1.5 mt-3">
              <div class="flex items-center gap-2" v-for="(check, key) in passwordChecks" :key="key">
                <span class="text-sm" :class="check ? 'text-green-500' : 'text-gray-400'">
                  {{ check ? '✓' : '○' }}
                </span>
                <span class="text-xs" :class="check ? 'text-green-600' : 'text-gray-500'">
                  {{ requirementLabels[key] }}
                </span>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div
            v-if="error"
            class="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-sm">{{ error }}</span>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading || !isPasswordValid"
            class="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:shadow-lg disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              注册中...
            </span>
            <span v-else>创建账号</span>
          </button>
        </form>

        <!-- Login Link -->
        <div class="mt-6 text-center">
          <p class="text-gray-600">
            已有账号？
            <router-link
              to="/login"
              class="text-pink-600 hover:text-pink-700 font-semibold transition-colors duration-200"
            >
              立即登录
            </router-link>
          </p>
        </div>
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
const showPassword = ref(false)
const passwordStrength = ref(0)

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
})

const requirementLabels = {
  minLength: '至少8个字符',
  hasUpperCase: '包含大写字母',
  hasLowerCase: '包含小写字母',
  hasNumber: '包含数字',
}

const strengthLabels = ['', '弱', '一般', '较强', '强']
const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']
const strengthTextColors = ['', 'text-red-600', 'text-orange-600', 'text-yellow-600', 'text-green-600']

const isPasswordValid = computed(() => {
  return passwordChecks.minLength && passwordChecks.hasUpperCase && passwordChecks.hasLowerCase && passwordChecks.hasNumber
})

function validatePassword() {
  const password = form.password

  passwordChecks.minLength = password.length >= 8
  passwordChecks.hasUpperCase = /[A-Z]/.test(password)
  passwordChecks.hasLowerCase = /[a-z]/.test(password)
  passwordChecks.hasNumber = /\d/.test(password)

  // Calculate strength
  let strength = 0
  if (passwordChecks.minLength) strength++
  if (passwordChecks.hasUpperCase) strength++
  if (passwordChecks.hasLowerCase) strength++
  if (passwordChecks.hasNumber) strength++
  passwordStrength.value = strength
}

const handleRegister = async () => {
  try {
    loading.value = true
    error.value = ''
    await authStore.register(form.username, form.email, form.password)
  } catch (err) {
    const errDetails = err.response?.data?.details
    if (errDetails && Array.isArray(errDetails)) {
      error.value = errDetails.join('；')
    } else {
      error.value = err.response?.data?.error || '注册失败'
    }
    return
  } finally {
    loading.value = false
  }

  // 注册成功，尝试登录
  try {
    loading.value = true
    await authStore.login(form.email, form.password)
    await authStore.loadProfile()
    router.push('/couple-binding')
  } catch (err) {
    // 注册成功但登录失败，跳转到登录页让用户手动登录
    error.value = '注册成功，请登录'
    router.push('/login')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}
</style>
