<template>
  <router-view />
</template>

<script setup>
import { useAuthStore } from './stores/auth'
import { onMounted } from 'vue'

const authStore = useAuthStore()

onMounted(() => {
  if (authStore.token) {
    authStore.loadProfile()
  }
})
</script>

<style>
@import './style.css';
</style>
