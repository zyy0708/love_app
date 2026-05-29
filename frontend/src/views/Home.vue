<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center p-4">
    <div class="max-w-4xl w-full">
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold text-pink-600 mb-4">💕 情侣日记</h1>
        <p class="text-xl text-gray-600 mb-8">记录我们一起的每一刻</p>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="text-4xl mb-2">📝</div>
            <h3 class="text-lg font-semibold text-gray-800">日记系统</h3>
            <p class="text-gray-600 text-sm">记录文字、照片和心情</p>
          </div>
          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="text-4xl mb-2">🎉</div>
            <h3 class="text-lg font-semibold text-gray-800">纪念日</h3>
            <p class="text-gray-600 text-sm">倒计时重要日期</p>
          </div>
          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="text-4xl mb-2">🤖</div>
            <h3 class="text-lg font-semibold text-gray-800">AI总结</h3>
            <p class="text-gray-600 text-sm">自动生成回忆总结</p>
          </div>
        </div>

        <div class="space-y-4">
          <router-link to="/register" class="inline-block mr-4 px-8 py-3 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition">
            开始使用
          </router-link>
          <router-link to="/login" class="inline-block px-8 py-3 bg-white text-pink-600 rounded-lg font-semibold border-2 border-pink-600 hover:bg-pink-50 transition">
            我已有账号
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>
