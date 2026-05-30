<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
    <!-- Navigation -->
    <nav class="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">
          💕 我们的日记
        </h1>
        <div class="flex items-center gap-3">
          <router-link
            to="/diary/new"
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            写日记
          </router-link>
          <router-link
            to="/timeline"
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-xl font-semibold border border-gray-200 hover:border-pink-300 hover:bg-pink-50 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            时间线
          </router-link>
          <button
            @click="handleLogout"
            class="px-4 py-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </nav>

    <div class="max-w-6xl mx-auto px-4 py-8">
      <!-- Couple Info & AI Summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Couple Card -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-pink-100">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center">
              <span class="text-2xl">💑</span>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">我们的故事</h3>
              <p class="text-sm text-gray-500">在一起的每一天</p>
            </div>
          </div>
          <p class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">
            {{ authStore.couple?.user1_username }} ❤️ {{ authStore.couple?.user2_username }}
          </p>
        </div>

        <!-- AI Summary Card -->
        <div v-if="aiSummary" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-pink-100">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <span class="text-2xl">🤖</span>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">{{ summaryLabel }}</h3>
              <p class="text-sm text-gray-500">AI 智能总结</p>
            </div>
          </div>
          <p class="text-gray-700 leading-relaxed">{{ aiSummary.content }}</p>
        </div>

        <!-- Quick Actions Card -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-pink-100">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-rose-400 to-red-400 rounded-full flex items-center justify-center">
              <span class="text-2xl">✨</span>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">快速操作</h3>
              <p class="text-sm text-gray-500">查看你们的回忆</p>
            </div>
          </div>
          <select
            v-model="summaryPeriod"
            @change="loadAISummary"
            class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="week">📊 周总结</option>
            <option value="month">📈 月总结</option>
            <option value="year">📅 年总结</option>
          </select>
        </div>
      </div>

      <!-- Diary List -->
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-800">📚 最近的日记</h2>
          <span class="text-sm text-gray-500">共 {{ entries.length }} 篇</span>
        </div>

        <!-- Loading State -->
        <div v-if="initialLoading" class="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl">
          <div class="inline-flex items-center gap-3">
            <svg class="animate-spin h-6 w-6 text-pink-500" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-500 text-lg">加载中...</span>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="loadError" class="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl">
          <div class="text-red-500 mb-4">
            <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-gray-600 text-lg mb-4">{{ loadError }}</p>
          <button
            @click="loadEntries"
            class="px-6 py-2.5 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors duration-200"
          >
            重试
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="entries.length === 0" class="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl">
          <div class="text-6xl mb-4">📝</div>
          <p class="text-gray-600 text-lg mb-4">还没有日记，开始创建一个吧！</p>
          <router-link
            to="/diary/new"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            写第一篇日记
          </router-link>
        </div>

        <!-- Diary Cards -->
        <template v-else>
          <div
            v-for="entry in entries"
            :key="entry.id"
            class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-pink-100 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <div class="flex justify-between items-start mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center">
                  <span class="text-xl">{{ moodEmoji(entry.mood) }}</span>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-800">{{ entry.title || '无标题' }}</h3>
                  <p class="text-sm text-gray-500">{{ entry.username }} · {{ formatDate(entry.created_at) }}</p>
                </div>
              </div>
            </div>

            <p class="text-gray-700 mb-4 line-clamp-3 leading-relaxed">{{ entry.content }}</p>

            <!-- Images -->
            <div v-if="entry.images?.length > 0" class="mb-4 flex gap-3 overflow-x-auto pb-2">
              <img
                v-for="img in entry.images.slice(0, 4)"
                :key="img"
                :src="img"
                alt="diary image"
                class="h-24 w-24 object-cover rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
              />
              <div
                v-if="entry.images.length > 4"
                class="h-24 w-24 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600 font-semibold"
              >
                +{{ entry.images.length - 4 }}
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2 pt-4 border-t border-gray-100">
              <router-link
                :to="`/diary/${entry.id}`"
                class="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-100 transition-colors duration-200 text-sm font-medium"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                查看
              </router-link>
              <button
                @click="deleteEntry(entry.id)"
                class="inline-flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200 text-sm font-medium"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                删除
              </button>
            </div>
          </div>

          <!-- Load More Button -->
          <div v-if="hasMore" class="text-center pt-4">
            <button
              @click="loadMore"
              :disabled="loadingMore"
              class="inline-flex items-center gap-2 px-8 py-3 bg-white text-gray-700 rounded-xl font-semibold border border-gray-200 hover:border-pink-300 hover:bg-pink-50 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
            >
              <svg v-if="loadingMore" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loadingMore ? '加载中...' : '加载更多' }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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
const initialLoading = ref(true)
const loadError = ref('')
const offset = ref(0)
const hasMore = ref(true)

const summaryLabel = computed(() => {
  const labels = { week: '这周的我们', month: '这个月的我们', year: '这一年的我们' }
  return labels[summaryPeriod.value] || 'AI 总结'
})

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

const handleLogout = () => {
  authStore.logout()
  window.location.href = '/login'
}

const loadEntries = async () => {
  try {
    initialLoading.value = true
    loadError.value = ''
    offset.value = 0
    const data = await diaryStore.loadEntries(20, 0)
    entries.value = data
    hasMore.value = data.length >= 20
  } catch (err) {
    loadError.value = '加载日记失败，请重试'
  } finally {
    initialLoading.value = false
  }
}

const loadMore = async () => {
  try {
    loadingMore.value = true
    offset.value += 20
    const more = await diaryStore.loadEntries(20, offset.value)
    entries.value.push(...more)
    hasMore.value = more.length >= 20
  } catch (err) {
    // 静默处理
  } finally {
    loadingMore.value = false
  }
}

const loadAISummary = async () => {
  try {
    aiSummary.value = await diaryStore.loadAISummary(summaryPeriod.value)
  } catch (err) {
    aiSummary.value = null
  }
}

const deleteEntry = async (entryId) => {
  if (confirm('确定要删除这篇日记吗？删除后无法恢复。')) {
    try {
      await diaryStore.deleteEntry(entryId)
      entries.value = entries.value.filter(e => e.id !== entryId)
    } catch (err) {
      alert('删除失败，请重试')
    }
  }
}

onMounted(() => {
  loadEntries()
  loadAISummary()
})
</script>
