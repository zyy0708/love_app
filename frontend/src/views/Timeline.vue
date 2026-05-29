<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 p-4">
    <div class="max-w-4xl mx-auto">
      <nav class="mb-8 flex justify-between items-center">
        <router-link to="/dashboard" class="text-3xl font-bold text-pink-600">💕 时间线</router-link>
        <button
          @click="handleLogout"
          class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          登出
        </button>
      </nav>

      <div class="space-y-6">
        <!-- 加载中 -->
        <div v-if="initialLoading" class="text-center py-12 bg-white rounded-lg">
          <p class="text-gray-500 text-lg">加载中...</p>
        </div>

        <!-- 加载失败 -->
        <div v-else-if="loadError" class="text-center py-12 bg-white rounded-lg">
          <p class="text-red-500 text-lg">{{ loadError }}</p>
          <button @click="loadTimeline" class="mt-2 text-pink-600 hover:underline">重试</button>
        </div>

        <!-- 空状态 -->
        <div v-else-if="timeline.length === 0" class="text-center py-12 bg-white rounded-lg">
          <p class="text-gray-600 text-lg">还没有时间线事件</p>
        </div>

        <!-- 时间线列表 -->
        <template v-else>
          <div v-for="item in timeline" :key="item.id" class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex gap-4">
              <div class="text-4xl flex-shrink-0">
                {{ getEventEmoji(item.entry_type) }}
              </div>
              <div class="flex-1">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-800">{{ item.title }}</h3>
                    <p class="text-sm text-gray-600">
                      {{ item.username }} · {{ formatDate(item.created_at) }}
                    </p>
                  </div>
                </div>

                <p class="text-gray-700 mb-3 line-clamp-2">{{ item.preview }}</p>

                <router-link
                  v-if="item.entry_id"
                  :to="`/diary/${item.entry_id}`"
                  class="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                >
                  查看更多 →
                </router-link>
              </div>
            </div>
          </div>

          <button
            v-if="hasMore"
            @click="loadMore"
            :disabled="loadingMore"
            class="w-full mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
          >
            {{ loadingMore ? '加载中...' : '加载更多' }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useDiaryStore } from '../stores/diary'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const router = useRouter()
const authStore = useAuthStore()
const diaryStore = useDiaryStore()

const timeline = ref([])
const loadingMore = ref(false)
const initialLoading = ref(true)
const loadError = ref('')
const offset = ref(0)
const hasMore = ref(true)

const getEventEmoji = (type) => {
  const emojis = {
    diary: '📝',
    anniversary: '🎉',
    photo: '📷',
    memory: '💭',
  }
  return emojis[type] || '✨'
}

const formatDate = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: zhCN })
}

const handleLogout = () => {
  authStore.logout()
  window.location.href = '/login'
}

const loadTimeline = async () => {
  try {
    initialLoading.value = true
    loadError.value = ''
    offset.value = 0
    const data = await diaryStore.loadTimeline(30, 0)
    timeline.value = data
    hasMore.value = data.length >= 30
  } catch (err) {
    loadError.value = '加载时间线失败，请重试'
  } finally {
    initialLoading.value = false
  }
}

const loadMore = async () => {
  try {
    loadingMore.value = true
    offset.value += 30
    const more = await diaryStore.loadTimeline(30, offset.value)
    timeline.value.push(...more)
    hasMore.value = more.length >= 30
  } catch (err) {
    // 静默处理
  } finally {
    loadingMore.value = false
  }
}

onMounted(() => {
  loadTimeline()
})
</script>
