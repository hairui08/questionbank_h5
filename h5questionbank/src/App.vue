<template>
  <div v-if="isHome" class="home-shell">
    <div class="home-card">
      <h1 class="home-title">题库演示</h1>
      <p class="home-subtitle">请选择要体验的页面</p>
      <div class="home-actions">
        <button class="home-button" type="button" @click="goAnswer">答题页面</button>
        <button class="home-button" type="button" @click="goAnalysis">答案解析</button>
      </div>
    </div>
  </div>
  <router-view v-else class="page-container" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const isHome = computed(() => route.name === "home");

function goAnswer() {
  router.push({ name: "answer" });
}

function goAnalysis() {
  router.push({ name: "analysis" });
}
</script>

<style scoped>
.home-shell {
  min-height: 100vh;
  background: linear-gradient(130deg, #1677ff, #4096ff);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
}

.home-card {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 24px;
  padding: 36px 28px;
  width: min(420px, 100%);
  text-align: center;
  box-shadow: 0 24px 60px rgba(22, 119, 255, 0.25);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.home-title {
  margin: 0;
  font-size: 24px;
  color: #0f1d3d;
  font-weight: 700;
}

.home-subtitle {
  margin: 0;
  color: #4b5d7b;
  font-size: 14px;
}

.home-actions {
  display: grid;
  gap: 12px;
}

.home-button {
  padding: 14px 18px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(120deg, #1677ff, #52c1ff);
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}

.home-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 30px rgba(22, 119, 255, 0.35);
}

.page-container {
  min-height: 100vh;
}

@media (max-width: 480px) {
  .home-card {
    padding: 28px 20px;
    border-radius: 20px;
  }

  .home-title {
    font-size: 22px;
  }
}
</style>
