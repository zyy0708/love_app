import { defineStore } from 'pinia'
import { ref } from 'vue'
import { diaryService } from '../services'

export const useDiaryStore = defineStore('diary', () => {
  const entries = ref([])
  const timeline = ref([])
  const currentEntry = ref(null)
  const aiSummary = ref(null)

  const createEntry = async (title, content, mood, images) => {
    const response = await diaryService.createEntry(title, content, mood, images)
    entries.value.unshift(response.data)
    return response.data
  }

  const loadEntries = async (limit = 20, offset = 0) => {
    const response = await diaryService.getEntries(limit, offset)
    entries.value = response.data
    return response.data
  }

  const loadEntry = async (entryId) => {
    const response = await diaryService.getEntry(entryId)
    currentEntry.value = response.data
    return response.data
  }

  const updateEntry = async (entryId, title, content, mood, images) => {
    const response = await diaryService.updateEntry(entryId, title, content, mood, images)
    const index = entries.value.findIndex(e => e.id === entryId)
    if (index !== -1) {
      entries.value[index] = response.data
    }
    return response.data
  }

  const deleteEntry = async (entryId) => {
    await diaryService.deleteEntry(entryId)
    entries.value = entries.value.filter(e => e.id !== entryId)
  }

  const loadTimeline = async (limit = 30, offset = 0) => {
    const response = await diaryService.getTimeline(limit, offset)
    timeline.value = response.data
    return response.data
  }

  const loadAISummary = async (period = 'week') => {
    const response = await diaryService.getAISummary(period)
    aiSummary.value = response.data
    return response.data
  }

  return {
    entries,
    timeline,
    currentEntry,
    aiSummary,
    createEntry,
    loadEntries,
    loadEntry,
    updateEntry,
    deleteEntry,
    loadTimeline,
    loadAISummary,
  }
})
