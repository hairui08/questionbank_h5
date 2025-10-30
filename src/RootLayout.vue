<template>
  <div class="dev-shell">
    <aside class="left-nav">
      <div class="nav-title">页面导航</div>
      <nav class="nav-list">
        <button class="nav-item" :class="{ active: route.name === 'home' }" type="button" @click="navigate('home')">题库首页</button>
        <button class="nav-item" :class="{ active: route.name === 'answer' }" type="button" @click="navigate('answer')">试卷答题页</button>
        <button class="nav-item" :class="{ active: route.name === 'chapter' }" type="button" @click="navigate('chapter')">练习答题页</button>
        <button class="nav-item" :class="{ active: route.name === 'examresult' }" type="button" @click="navigate('examresult')">答题记录</button>
        <button class="nav-item" :class="{ active: route.name === 'analysis' }" type="button" @click="navigate('analysis')">答案解析</button>
        <button class="nav-item" :class="{ active: route.name === 'wronglist' }" type="button" @click="navigate('wronglist')">错题集</button>
        <button class="nav-item" :class="{ active: route.name === 'collectlist' }" type="button" @click="navigate('collectlist')">收藏夹</button>
      </nav>
    </aside>

    <section class="right-pane">
      <div class="right-tabs">
        <button
          class="tab-btn"
          :class="{ active: activePane === 'feature' }"
          type="button"
          @click="activePane = 'feature'"
        >
          功能页面
        </button>
        <button
          class="tab-btn"
          :class="{ active: activePane === 'doc' }"
          type="button"
          @click="activePane = 'doc'"
        >
          需求文档
        </button>
      </div>

      <div class="pane-content">
        <div v-if="activePane === 'feature'" class="mobile-preview">
          <div class="phone-frame">
            <div class="phone-scroll">
              <!-- 将原来的 App.vue 作为功能页面容器（内部是 <router-view />） -->
              <App />
            </div>
          </div>
        </div>

        <div v-else class="doc-pane">
          <RequirementsDoc :docKey="String(route.name || '')" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import App from "./App.vue";
import RequirementsDoc from "./RequirementsDoc.vue";

const router = useRouter();
const route = useRoute();
const activePane = ref<"feature" | "doc">("feature");

function navigate(name: string) {
  router.push({ name });
}
</script>

<style scoped>
.dev-shell {
  display: flex;
  min-height: 100vh;
  background: #f3f5f7;
  color: #1f1f1f;
}

/* 左侧导航 */
.left-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 240px;
  height: 100vh;
  flex: none;
  border-right: 1px solid #e5e7eb;
  background: #fff;
  padding: 16px 12px;
  overflow-y: auto;
  z-index: 100;
}

.nav-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  text-align: left;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #303133;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.nav-item:hover {
  border-color: #ff6b63;
  background: rgba(255, 107, 99, 0.08);
}
.nav-item.active {
  border-color: #ff6b63;
  background: rgba(255, 107, 99, 0.12);
  color: #ff6b63;
  font-weight: 600;
}

/* 右侧区域 */
.right-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-left: 240px;
}

.right-tabs {
  position: fixed;
  top: 0;
  left: 240px;
  right: 0;
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  z-index: 90;
}
.tab-btn {
  border: none;
  background: #f5f7fb;
  color: #404040;
  border-radius: 8px;
  padding: 8px 14px;
  cursor: pointer;
  font-weight: 600;
}
.tab-btn.active {
  color: #ff6b63;
  background: rgba(255, 107, 99, 0.12);
}

/* 内容区 */
.pane-content {
  flex: 1;
  padding: 16px;
  padding-top: 72px; /* 为固定的标签栏留出空间 */
  overflow: auto;
}

/* 手机预览容器：切换到功能页面时使用手机宽度展示 */
.mobile-preview {
  display: flex;
  align-items: flex-start;
  padding: 8px;
}

/* 可按需调整宽度：375 / 390 / 414 / 430 */
.phone-frame {
  width: 410px;
  max-width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 18px 40px rgba(31, 35, 53, 0.08);
  overflow: hidden;
}

/* 让实际页面可滚动 */
.phone-scroll {
  height: calc(100vh - 140px);
  overflow: auto;
  -webkit-overflow-scrolling: touch; /* iOS/移动端顺滑滚动 */
  scrollbar-width: none; /* Firefox 隐藏滚动条 */
  -ms-overflow-style: none; /* IE/Edge 旧版隐藏滚动条 */
}
/* Chrome/Safari 隐藏滚动条 */
.phone-scroll::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

/* 文档面板 */
.doc-pane {
  margin: 0 auto;
}
</style>
