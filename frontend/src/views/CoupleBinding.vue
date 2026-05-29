<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 p-4">
    <div class="max-w-2xl mx-auto">
      <nav class="mb-8 flex justify-between items-center">
        <h1 class="text-3xl font-bold text-pink-600">💕 情侣日记</h1>
        <button
          @click="authStore.logout"
          class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          登出
        </button>
      </nav>

      <div class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">配对您的伴侣</h2>

        <div v-if="!bindCode && !coupled" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">伴侣的邮箱</label>
            <input
              v-model="partnerEmail"
              type="email"
              placeholder="输入伴侣的邮箱地址"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <button
            @click="initCouple"
            :disabled="!partnerEmail || loading"
            class="w-full bg-pink-600 text-white py-2 rounded-lg font-semibold hover:bg-pink-700 transition disabled:opacity-50"
          >
            {{ loading ? '生成中...' : '生成配对码' }}
          </button>
        </div>

        <div v-if="bindCode && !coupled" class="space-y-6">
          <div class="p-4 bg-pink-50 rounded-lg border-2 border-pink-300">
            <p class="text-sm text-gray-600 mb-2">您的配对码（24小时有效）：</p>
            <div class="text-3xl font-bold text-pink-600 text-center mb-4">{{ bindCode }}</div>
            <p class="text-sm text-gray-600">请分享这个码给您的伴侣</p>
          </div>

          <button
            @click="resetCouple"
            class="w-full bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
          >
            重新生成
          </button>
        </div>

        <div v-else class="space-y-6">
          <div class="p-4 bg-green-50 rounded-lg border-2 border-green-300">
            <p class="text-green-700 font-semibold">✓ 已与伴侣配对</p>
            <p class="text-sm text-gray-600 mt-2">{{ authStore.couple?.user2_username }}</p>
          </div>

          <router-link
            to="/dashboard"
            class="block text-center bg-pink-600 text-white py-2 rounded-lg font-semibold hover:bg-pink-700 transition"
          >
            进入日记系统
          </router-link>
        </div>

        <div v-if="error" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {{ error }}
        </div>
      </div>

      <div class="mt-6 bg-white rounded-lg shadow-lg p-6">
        <h3 class="font-semibold text-gray-800 mb-3">如何配对？</h3>
        <ol class="text-sm text-gray-600 space-y-2">
          <li>1. 点击"生成配对码"</li>
          <li>2. 复制配对码分享给伴侣</li>
          <li>3. 伴侣使用此码完成配对</li>
          <li>4. 配对完成后即可开始记录</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { userService } from '../services'

const router = useRouter()
const authStore = useAuthStore()
const partnerEmail = ref('')
const bindCode = ref('')
const coupled = ref(false)
const loading = ref(false)
const error = ref('')

onMounted(() => {
  if (authStore.couple) {
    coupled.value = true
  }
})

const initCouple = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await userService.initializeCouple(partnerEmail.value)
    bindCode.value = response.data.bindCode
  } catch (err) {
    error.value = err.response?.data?.error || '生成失败'
  } finally {
    loading.value = false
  }
}

const resetCouple = () => {
  bindCode.value = ''
  partnerEmail.value = ''
}
</script>
