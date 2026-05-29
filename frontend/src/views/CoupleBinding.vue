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

        <!-- 已配对成功 -->
        <div v-if="coupled" class="space-y-6">
          <div class="p-4 bg-green-50 rounded-lg border-2 border-green-300">
            <p class="text-green-700 font-semibold">✓ 已与伴侣配对</p>
            <p class="text-sm text-gray-600 mt-2">
              {{ authStore.couple?.user1_username || authStore.couple?.user2_username }}
            </p>
          </div>

          <router-link
            to="/dashboard"
            class="block text-center bg-pink-600 text-white py-2 rounded-lg font-semibold hover:bg-pink-700 transition"
          >
            进入日记系统
          </router-link>
        </div>

        <!-- 未配对 - 有配对码显示 -->
        <div v-else-if="bindCode" class="space-y-6">
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

        <!-- 未配对 - 选择生成或输入配对码 -->
        <div v-else class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- 生成配对码 -->
            <div class="border-2 border-gray-200 rounded-lg p-4">
              <h3 class="font-semibold text-gray-800 mb-3">我发起配对</h3>
              <div class="space-y-4">
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
            </div>

            <!-- 输入配对码 -->
            <div class="border-2 border-gray-200 rounded-lg p-4">
              <h3 class="font-semibold text-gray-800 mb-3">我输入配对码</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">配对码</label>
                  <input
                    v-model="inputBindCode"
                    type="text"
                    placeholder="输入6位配对码"
                    maxlength="6"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 uppercase"
                  />
                </div>
                <button
                  @click="doBindCouple"
                  :disabled="!inputBindCode || inputBindCode.length !== 6 || loading"
                  class="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {{ loading ? '配对中...' : '确认配对' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="error" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {{ error }}
        </div>
      </div>

      <div class="mt-6 bg-white rounded-lg shadow-lg p-6">
        <h3 class="font-semibold text-gray-800 mb-3">如何配对？</h3>
        <ol class="text-sm text-gray-600 space-y-2">
          <li>1. 一方点击"我发起配对"，生成配对码</li>
          <li>2. 将配对码分享给另一方</li>
          <li>3. 另一方点击"我输入配对码"，完成配对</li>
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
const inputBindCode = ref('')
const bindCode = ref('')
const coupled = ref(false)
const loading = ref(false)
const error = ref('')

onMounted(async () => {
  await checkCoupleStatus()
})

const checkCoupleStatus = async () => {
  try {
    await authStore.loadCouple()
    if (authStore.couple) {
      coupled.value = true
    }
  } catch (err) {
    // 忽略，可能只是还没配对
  }
}

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

const doBindCouple = async () => {
  try {
    loading.value = true
    error.value = ''
    await userService.bindCouple(inputBindCode.value.toUpperCase())
    await checkCoupleStatus()
    inputBindCode.value = ''
  } catch (err) {
    error.value = err.response?.data?.error || '配对失败'
  } finally {
    loading.value = false
  }
}

const resetCouple = () => {
  bindCode.value = ''
  partnerEmail.value = ''
}
</script>
