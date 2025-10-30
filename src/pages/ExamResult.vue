<template>
  <div class="result-page">
    <header class="result-header">
      <button class="icon-button" type="button" aria-label="返回" @click="goBack">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <h1 class="header-title">做题记录</h1>
      <div class="header-actions">
        <button class="icon-button" type="button" aria-label="一键清空">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2h5v2h-1v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8H4V6h5Zm2-1v1h2V5Z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </header>

    <section class="filter-bar">
      <select v-model="activeFilterId" class="dropdown-select">
        <option value="all">全部</option>
        <option value="admission">入学测试</option>
        <option value="chapter">章节练习</option>
        <option value="past">历年真题</option>
        <option value="daily">每日一练</option>
      </select>
      <input
        v-model="searchQuery"
        type="text"
        class="dropdown-input"
        placeholder="输入关键字搜索"
      />
    </section>

    <main class="record-list">
      <article
        v-for="record in filteredRecords"
        :key="record.id"
        class="record-card"
      >
        <header class="record-header">
          <span class="record-badge" :data-type="record.badge.type">{{ record.badge.label }}</span>
          <div class="record-title">
            <div class="record-name">{{ record.title }}</div>
            <div class="record-subtitle">{{ record.subtitle }}</div>
          </div>
        </header>
        <div class="record-meta">
          <span>{{ record.meta.time }}</span>
          <span>共{{ record.meta.total }}题</span>
          <span>做对：{{ record.meta.correct }}题</span>
        </div>
        <footer class="record-actions">
          <button
            v-for="action in record.actions"
            :key="action.id"
            type="button"
            :class="['action-button', `is-${action.variant}`]"
            @click="handleAction(action.id, record.id)"
          >
            {{ action.label }}
          </button>
        </footer>
      </article>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";

interface SubjectOption {
  id: string;
  label: string;
}

interface CategoryOption {
  id: string;
  label: string;
}

interface RecordBadge {
  label: string;
  type: "wrong" | "daily" | "chapter" | "admission" | "past";
}

interface RecordMeta {
  time: string;
  total: number;
  correct: number;
}

type RecordActionVariant = "outline" | "primary" | "ghost";

interface RecordAction {
  id: string;
  label: string;
  variant: RecordActionVariant;
}

interface PracticeRecord {
  id: string;
  title: string;
  subtitle: string;
  badge: RecordBadge;
  meta: RecordMeta;
  actions: RecordAction[];
}

const router = useRouter();

const subjects: SubjectOption[] = [
  { id: "subject-1", label: "初级社会工作综合能力" },
  { id: "subject-2", label: "初级社会工作实务" },
];

const categories: CategoryOption[] = [
  { id: "all", label: "全部" },
  { id: "admission", label: "入学测试" },
  { id: "chapter", label: "章节练习" },
  { id: "past", label: "历年真题" },
  { id: "daily", label: "每日一练" },
];

const records = reactive<PracticeRecord[]>([
  {
    id: "r-1",
    title: "第一章 社会工作的内涵、原则及主要领域错题重做",
    subtitle: "领域错题重做",
    badge: { label: "错", type: "wrong" },
    meta: { time: "9 分钟前", total: 4, correct: 0 },
    actions: [
      { id: "continue", label: "继续", variant: "outline" },
      { id: "analysis", label: "查看解析", variant: "primary" },
      { id: "report", label: "报告", variant: "ghost" },
    ],
  },
  {
    id: "r-2",
    title: "2025年10月20日《初级社会工作综合能力》每日一练",
    subtitle: "每日一练",
    badge: { label: "每", type: "daily" },
    meta: { time: "12 分钟前", total: 10, correct: 2 },
    actions: [
      { id: "redo", label: "重做", variant: "outline" },
      { id: "analysis", label: "查看解析", variant: "primary" },
      { id: "report", label: "报告", variant: "ghost" },
    ],
  },
  {
    id: "r-3",
    title: "人类需要的层次和类型",
    subtitle: "章节练习",
    badge: { label: "章", type: "chapter" },
    meta: { time: "16 分钟前", total: 21, correct: 0 },
    actions: [
      { id: "continue", label: "继续", variant: "outline" },
      { id: "analysis", label: "查看解析", variant: "primary" },
      { id: "report", label: "报告", variant: "ghost" },
    ],
  },
  {
    id: "r-4",
    title: "社会工作的特点",
    subtitle: "章节练习",
    badge: { label: "章", type: "chapter" },
    meta: { time: "32 分钟前", total: 10, correct: 1 },
    actions: [
      { id: "continue", label: "继续", variant: "outline" },
      { id: "analysis", label: "查看解析", variant: "primary" },
      { id: "report", label: "报告", variant: "ghost" },
    ],
  },
  {
    id: "r-5",
    title: "最近7天错题重做",
    subtitle: "错题汇总",
    badge: { label: "错", type: "wrong" },
    meta: { time: "2 小时前", total: 8, correct: 0 },
    actions: [
      { id: "redo", label: "重做", variant: "outline" },
      { id: "analysis", label: "查看解析", variant: "primary" },
      { id: "report", label: "报告", variant: "ghost" },
    ],
  },
]);

const activeSubjectId = ref(subjects[0].id);
const activeFilterId = ref(categories[0].id);
const searchQuery = ref("");

const activeSubject = computed(
  () => subjects.find((item) => item.id === activeSubjectId.value) ?? subjects[0],
);
const activeFilter = computed(
  () => categories.find((item) => item.id === activeFilterId.value) ?? categories[0],
);

const filteredRecords = computed(() => {
  let filtered = records;

  if (activeFilterId.value !== "all") {
    filtered = filtered.filter((record) => {
      switch (activeFilterId.value) {
        case "admission":
          return record.badge.type === "admission";
        case "chapter":
          return record.badge.type === "chapter";
        case "past":
          return record.badge.type === "past";
        case "daily":
          return record.badge.type === "daily";
        default:
          return true;
      }
    });
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    filtered = filtered.filter((record) => {
      return (
        record.title.toLowerCase().includes(q) ||
        record.subtitle.toLowerCase().includes(q)
      );
    });
  }

  return filtered;
});

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push({ name: "home" });
  }
}

function handleAction(actionId: string, recordId: string) {
  if (actionId === "continue" || actionId === "redo") {
    router
      .push({
        name: "answer",
        query: { action: actionId, recordId, ts: Date.now().toString() },
      })
      .catch(() => {});
    return;
  }

  if (actionId === "analysis") {
    router
      .push({
        name: "analysis",
        query: { recordId, ts: Date.now().toString() },
      })
      .catch(() => {});
    return;
  }
}
</script>

<style scoped>
.result-page {
  min-height: 100vh;
  background: #f5f6fb;
  color: #262626;
  display: flex;
  flex-direction: column;
}

.result-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 54px;
  background: #ffffff;
  padding: 16px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: none;
  background: #f4f5f9;
  color: #8c8c8c;
  cursor: pointer;
}

.icon-button svg {
  width: 18px;
  height: 18px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.header-actions {
  display: inline-flex;
  gap: 12px;
}

.filter-bar {
  display: flex;
  gap: 12px;
  padding: 12px 20px;
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.dropdown {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #ffffff;
  font-size: 14px;
  color: #333333;
  cursor: pointer;
}

.dropdown svg {
  width: 16px;
  height: 16px;
  color: #8c8c8c;
}

.record-list {
  flex: 1;
  padding: 12px 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.record-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px 18px;
  box-shadow: 0 12px 24px rgba(31, 35, 53, 0.06);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-header {
  display: flex;
  gap: 12px;
}

.record-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}

.record-badge[data-type="wrong"] {
  background: linear-gradient(90deg, #ff6d5c 0%, #ff8360 100%);
}

.record-badge[data-type="daily"] {
  background: linear-gradient(90deg, #54d158 0%, #7be27f 100%);
}

.record-badge[data-type="chapter"] {
  background: linear-gradient(90deg, #5584ff 0%, #6d9bff 100%);
}

.record-badge[data-type="admission"] {
  background: linear-gradient(90deg, #9c27b0 0%, #ba68c8 100%);
}

.record-badge[data-type="past"] {
  background: linear-gradient(90deg, #ff9800 0%, #ffb74d 100%);
}

.record-title {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.record-name {
  font-size: 15px;
  font-weight: 600;
  color: #262626;
  line-height: 1.4;
}

.record-subtitle {
  font-size: 13px;
  color: #8c8c8c;
}

.record-meta {
  font-size: 13px;
  color: #8c8c8c;
  display: flex;
  gap: 10px;
}

.record-actions {
  padding-top: 14px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(92px, 1fr));
  gap: 10px;
}

.action-button {
  border-radius: 999px;
  padding: 6px 0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, background-color 0.15s ease, filter 0.15s ease;
}

.action-button.is-outline {
  border: 1px solid rgba(255, 109, 92, 0.6);
  background: rgba(255, 109, 92, 0.08);
  color: #ff6d5c;
}

.action-button.is-primary {
  border: none;
  background: linear-gradient(90deg, #ff6d5c 0%, #ff845c 100%);
  color: #ffffff;
}

.action-button.is-ghost {
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: #ffffff;
  color: #595959;
}

.action-button:hover {
  transform: translateY(-1px);
}

.action-button.is-outline:hover {
  background: rgba(255, 109, 92, 0.16);
}

.action-button.is-primary:hover {
  filter: brightness(1.05);
}

.action-button.is-ghost:hover {
  background: rgba(0, 0, 0, 0.04);
}

@media (max-width: 420px) {
  .filter-bar {
    padding: 10px 16px;
  }

  .record-list {
    padding: 12px 12px 20px;
  }

  .record-card {
    padding: 14px 16px;
  }
}

.dropdown-select,
.dropdown-input {
  flex: 1;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #ffffff;
  font-size: 14px;
  color: #333333;
}

.dropdown-select {
  appearance: none;
  background-image: none;
}

.dropdown-input::placeholder {
  color: #8c8c8c;
}
</style>

