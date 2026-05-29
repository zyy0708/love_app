<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 p-4">
    <div class="max-w-4xl mx-auto">
      <nav class="mb-8 flex justify-between items-center">
        <router-link to="/dashboard" class="text-3xl font-bold text-pink-600">💕 情侣日记</router-link>
        <button
          @click="authStore.logout"
          class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          登出
        </button>
      </nav>

      <div class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">
          {{ isEditing ? '编辑日记' : '写日记' }}
        </h2>

        <form @submit.prevent="saveDiary" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">标题（可选）</label>
            <input
              v-model="form.title"
              type="text"
              placeholder="给这段回忆起个标题"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">今天的心情</label>
            <div class="grid grid-cols-3 md:grid-cols-6 gap-2">
              <button
                v-for="(emoji, mood) in moods"
                :key="mood"
                type="button"
                @click="form.mood = mood"
                :class="[
                  'text-3xl p-2 rounded-lg transition',
                  form.mood === mood ? 'bg-pink-200 scale-110' : 'bg-gray-100 hover:bg-gray-200',
                ]"
              >
                {{ emoji }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">记录内容</label>
            <textarea
              v-model="form.content"
              placeholder="记录我们的故事..."
              rows="10"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">添加照片</label>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                @change="handleImageUpload"
                class="hidden"
                ref="fileInput"
              />
              <button
                type="button"
                @click="$refs.fileInput?.click()"
                class="text-gray-600 hover:text-gray-800"
              >
                📷 点击选择照片
              </button>
              <div v-if="form.images?.length > 0" class="mt-4 flex gap-2 flex-wrap">
                <div v-for="(img, idx) in form.images" :key="idx" class="relative">
                  <img :src="img" alt="preview" class="h-24 w-24 object-cover rounded" />
                  <button
                    type="button"
                    @click="form.images.splice(idx, 1)"
                    class="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-4">
            <button
              type="submit"
              :disabled="!form.content || loading"
              class="flex-1 bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition disabled:opacity-50"
            >
              {{ loading ? '保存中...' : '保存日记' }}
            </button>
            <router-link
              to="/dashboard"
              class="flex-1 text-center bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
            >
              返回
            </router-link>
          </div>
        </form>

        <div v-if="error" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useDiaryStore } from '../stores/diary'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const diaryStore = useDiaryStore()

const fileInput = ref(null)
const loading = ref(false)
const error = ref('')
const isEditing = ref(false)

const moods = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  neutral: '😐',
  loved: '😍',
  excited: '🤩',
}

const form = reactive({
  title: '',
  content: '',
  mood: 'happy',
  images: [],
})

const handleImageUpload = (e) => {
  const files = e.target.files
  for (let file of files) {
    const reader = new FileReader()
    reader.onload = (event) => {
      form.images.push(event.target.result)
    }
    reader.readAsDataURL(file)
  }
}

const saveDiary = async () => {
  try {
    loading.value = true
    error.value = ''

    if (isEditing.value) {
      await diaryStore.updateEntry(route.params.id, form.title, form.content, form.mood, form.images)
    } else {
      await diaryStore.createEntry(form.title, form.content, form.mood, form.images)
    }

    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.error || '保存失败'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (route.params.id) {
    isEditing.value = true
    try {
      const entry = await diaryStore.loadEntry(route.params.id)
      form.title = entry.title
      form.content = entry.content
      form.mood = entry.mood
      form.images = entry.images || []
    } catch (err) {
      error.value = '加载日记失败'
    }
  }
})
</script>
