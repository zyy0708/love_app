<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 p-4">
    <div class="max-w-6xl mx-auto">
      <nav class="mb-8 flex justify-between items-center">
        <h1 class="text-3xl font-bold text-pink-600">💕 我们的日记</h1>
        <div class="space-x-4">
          <router-link
            to="/diary/new"
            class="inline-block px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
          >
            ✍️ 写日记
          </router-link>
          <router-link
            to="/timeline"
            class="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            📺 时间线
          </router-link>
          <button
            @click="authStore.logout"
            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            登出
          </button>
        </div>
      </nav>

      <!-- 纪念日倒计时 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">🎉 我们的故事</h3>
          <p class="text-3xl font-bold text-pink-600 mb-2">{{ authStore.couple?.user1_username }} ❤️ {{ authStore.couple?.user2_username }}</p>
          <p class="text-sm text-gray-600">{{ authStore.couple?.user1_avatar }} + {{ authStore.couple?.user2_avatar }}</p>
        </div>

        <div v-if="aiSummary" class="bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">🤖 这周的我们</h3>
          <p class="text-gray-700">{{ aiSummary.content }}</p>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">💬 快速操作</h3>
          <div class="space-y-2">
            <select
              v-model="summaryPeriod"
              @change="loadAISummary"
              class="w-full px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="week">周总结</option>
              <option value="month">月总结</option>
              <option value="year">年总结</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 日记列表 -->
      <div class="space-y-4">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">📚 最近的日记</h2>

        <div v-if="entries.length === 0" class="text-center py-12 bg-white rounded-lg">
          <p class="text-gray-600 text-lg">还没有日记，开始创建一个吧！</p>
        </div>

        <div v-for="entry in entries" :key="entry.id" class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
          <div class="flex justify-between items-start mb-2">
            <div>
              <h3 class="text-xl font-semibold text-gray-800">{{ entry.title || '无标题' }}</h3>
              <p class="text-sm text-gray-600">{{ entry.username }} · {{ formatDate(entry.created_at) }}</p>
            </div>
            <span class="text-2xl">{{ moodEmoji(entry.mood) }}</span>
          </div>

          <p class="text-gray-700 mb-4 line-clamp-3">{{ entry.content }}</p>

          <div v-if="entry.images?.length > 0" class="mb-4 flex gap-2">
            <img
              v-for="img in entry.images.slice(0, 3)"
              :key="img"
              :src="img"
              alt="diary image"
              class="h-20 w-20 object-cover rounded"
            />
          </div>

          <div class="flex gap-2">
            <router-link
              :to="`/diary/${entry.id}`"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
            >
              查看
            </router-link>
            <button
              @click="deleteEntry(entry.id)"
              class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
            >
              删除
            </button>
          </div>
        </div>

        <button
          v-if="entries.length > 0"
          @click="loadMore"
          :disabled="loadingMore"
          class="w-full mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
        >
          {{ loadingMore ? '加载中...' : '加载更多' }}
        </button>
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

const entries = ref([])
const aiSummary = ref(null)
const summaryPeriod = ref('week')
const loadingMore = ref(false)
const offset = ref(0)

const moodEmoji = (mood) => {
  const moods = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    neutral: '😐',
    loved: '😍',
    excited: '🤩',
  }
  return moods[mood] || '💭'
}

const formatDate = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: zhCN })
}

const loadEntries = async () => {
  try {
    entries.value = await diaryStore.loadEntries(20, offset.value)
  } catch (err) {
    console.error('Failed to load entries', err)
  }
}

const loadMore = async () => {
  try {
    loadingMore.value = true
    offset.value += 20
    const more = await diaryStore.loadEntries(20, offset.value)
    entries.value.push(...more)
  } finally {
    loadingMore.value = false
  }
}

const loadAISummary = async () => {
  try {
    aiSummary.value = await diaryStore.loadAISummary(summaryPeriod.value)
  } catch (err) {
    console.error('Failed to load AI summary', err)
  }
}

const deleteEntry = async (entryId) => {
  if (confirm('确定要删除这篇日记吗？')) {
    try {
      await diaryStore.deleteEntry(entryId)
      entries.value = entries.value.filter(e => e.id !== entryId)
    } catch (err) {
      alert('删除失败')
    }
  }
}

onMounted(() => {
  loadEntries()
  loadAISummary()
})
</script>
