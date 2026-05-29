import api from './api'

export const userService = {
  register(username, email, password) {
    return api.post('/users/register', { username, email, password })
  },

  login(email, password) {
    return api.post('/users/login', { email, password })
  },

  getProfile() {
    return api.get('/users/profile')
  },

  initializeCouple(user2Email) {
    return api.post('/users/couple/initialize', { user2Email })
  },

  bindCouple(bindCode) {
    return api.post('/users/couple/bind', { bindCode })
  },

  getCouple() {
    return api.get('/users/couple')
  },
}

export const diaryService = {
  createEntry(title, content, mood, images = []) {
    return api.post('/diary', { title, content, mood, images })
  },

  getEntries(limit = 20, offset = 0) {
    return api.get(`/diary?limit=${limit}&offset=${offset}`)
  },

  getEntry(entryId) {
    return api.get(`/diary/${entryId}`)
  },

  updateEntry(entryId, title, content, mood, images) {
    return api.put(`/diary/${entryId}`, { title, content, mood, images })
  },

  deleteEntry(entryId) {
    return api.delete(`/diary/${entryId}`)
  },

  getTimeline(limit = 30, offset = 0) {
    return api.get(`/diary/timeline?limit=${limit}&offset=${offset}`)
  },

  getAISummary(period = 'week') {
    return api.get(`/diary/ai-summary?period=${period}`)
  },
}
