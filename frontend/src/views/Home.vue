<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
    <!-- Hero Section -->
    <div class="relative overflow-hidden">
      <!-- Background decorations -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-pink-200 rounded-full opacity-20 animate-pulse"></div>
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-rose-200 rounded-full opacity-20 animate-pulse" style="animation-delay: 1s;"></div>
      </div>

      <div class="relative max-w-6xl mx-auto px-4 py-20 sm:py-32">
        <div class="text-center">
          <!-- Logo with animation -->
          <div class="mb-8 animate-bounce-slow">
            <span class="text-7xl sm:text-8xl">💕</span>
          </div>

          <h1 class="text-4xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600 mb-6">
            情侣日记
          </h1>

          <p class="text-lg sm:text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            记录你们一起的每一刻，让爱意在文字中永恒
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <router-link
              to="/register"
              class="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <span class="relative z-10">开始记录我们的故事</span>
              <div class="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </router-link>

            <router-link
              to="/login"
              class="inline-flex items-center justify-center px-8 py-4 bg-white text-pink-600 rounded-2xl font-semibold text-lg border-2 border-pink-200 hover:border-pink-400 hover:bg-pink-50 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
            >
              我已有账号
            </router-link>
          </div>
        </div>

        <!-- Feature Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <!-- Feature 1 -->
          <div class="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-pink-100">
            <div class="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <span class="text-3xl">📝</span>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-3">日记系统</h3>
            <p class="text-gray-600 leading-relaxed">
              记录文字、照片和心情，支持多种情绪标签，让每一天都有迹可循
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-pink-100">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <span class="text-3xl">🎉</span>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-3">纪念日提醒</h3>
            <p class="text-gray-600 leading-relaxed">
              重要日期不再遗忘，倒计时让每一天都充满期待
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-pink-100">
            <div class="w-16 h-16 bg-gradient-to-br from-rose-400 to-red-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <span class="text-3xl">🤖</span>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-3">AI 智能总结</h3>
            <p class="text-gray-600 leading-relaxed">
              AI 自动分析你们的回忆，生成温馨的周/月/年度总结
            </p>
          </div>
        </div>

        <!-- Stats Section -->
        <div class="mt-20 text-center">
          <div class="inline-flex items-center gap-8 bg-white/60 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-md">
            <div class="text-center">
              <div class="text-2xl font-bold text-pink-600">100%</div>
              <div class="text-sm text-gray-500">私密安全</div>
            </div>
            <div class="w-px h-10 bg-pink-200"></div>
            <div class="text-center">
              <div class="text-2xl font-bold text-pink-600">∞</div>
              <div class="text-sm text-gray-500">永久保存</div>
            </div>
            <div class="w-px h-10 bg-pink-200"></div>
            <div class="text-center">
              <div class="text-2xl font-bold text-pink-600">💝</div>
              <div class="text-sm text-gray-500">专属于你们</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="text-center py-8 text-gray-500 text-sm">
      <p>用爱记录，用心珍藏 💕</p>
    </footer>
  </div>
</template>

<script setup>
// Home page component
</script>

<style scoped>
@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce-slow {
  animation: bounce-slow 3s ease-in-out infinite;
}
</style>
