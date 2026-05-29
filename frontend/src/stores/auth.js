import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userService } from '../services'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const couple = ref(null)

  const isLoggedIn = computed(() => !!token.value)

  const login = async (email, password) => {
    const response = await userService.login(email, password)
    token.value = response.data.token
    user.value = response.data
    localStorage.setItem('token', token.value)
    return response.data
  }

  const register = async (username, email, password) => {
    const response = await userService.register(username, email, password)
    return response.data
  }

  const loadProfile = async () => {
    const response = await userService.getProfile()
    user.value = response.data
    return response.data
  }

  const loadCouple = async () => {
    try {
      const response = await userService.getCouple()
      couple.value = response.data
      return response.data
    } catch (error) {
      couple.value = null
      return null
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    couple.value = null
    localStorage.removeItem('token')
  }

  return {
    user,
    token,
    couple,
    isLoggedIn,
    login,
    register,
    loadProfile,
    loadCouple,
    logout,
  }
})
