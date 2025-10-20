<template>
  <div class="wrong-page">
    <header class="wrong-header">
      <button class="icon-button back" type="button" aria-label="返回" @click="goBack">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <h1 class="header-title">错题集</h1>
      <div class="header-actions">
        <button class="icon-button" type="button" aria-label="一键清空">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2h5v2h-1v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8H4V6h5Zm2-1v1h2V5Z" fill="currentColor" />
          </svg>
        </button>
        <button class="icon-button" type="button" aria-label="设置" @click="openAutoRemoveDialog">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .11-.63l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.07 7.07 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 14.24 2h-4.48a.5.5 0 0 0-.5.42l-.36 2.54c-.6.24-1.16.55-1.68.94l-2.39-.96a.5.5 0 0 0-.6.22L2.31 8.48a.5.5 0 0 0 .11.63l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 0 0-.11.63l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96c.52.39 1.08.7 1.68.94l.36 2.54a.5.5 0 0 0 .5.42h4.48a.5.5 0 0 0 .5-.42l.36-2.54c.6-.24 1.16-.55 1.68-.94l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.11-.63l-2.03-1.58ZM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </header>

    <nav class="category-tabs">
      <button
        v-for="category in categories"
        :key="category.id"
        type="button"
        class="category-tab"
        :class="{ active: category.id === activeCategoryId }"
        @click="selectCategory(category.id)"
      >
        {{ category.label }}
      </button>
    </nav>

    <section class="summary-card">
      <div class="ring-wrapper">
       <div class="ring">
        <div class="ring-inner">
          <span class="ring-value">{{ overview.wrongCount }}</span>
          <span class="ring-label">错题数</span>
        </div>
      </div>
        <div class="overview-meta">
          <span class="meta-label">累计移除：</span>
          <span class="meta-value">{{ overview.removedCount }}</span>
        </div>
      </div>
      <!-- <button class="print-button" type="button">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 3a2 2 0 0 0-2 2v3H4a2 2 0 0 0-2 2v6h3v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3h3v-6a2 2 0 0 0-2-2h-1V5a2 2 0 0 0-2-2H7Zm0 2h10v4H7V5Zm0 9h10v5H7v-5Zm12-1h2v4h-2v-4Zm-16 0h2v4H3v-4Z" fill="currentColor" />
        </svg>
        错题打印
      </button> -->
    </section>

    <section class="filter-chips">
      <button
        v-for="filter in filters"
        :key="filter.id"
        type="button"
        class="chip"
        :class="{ active: filter.id === activeFilterId }"
        @click="selectFilter(filter.id)"
      >
        {{ filter.label }}
      </button>
    </section>

    <template v-if="isChapterFilter">
      <section
        v-for="chapter in chapters"
        :key="chapter.id"
        class="chapter-card"
      >
        <div class="chapter-main">
          <button
            type="button"
            class="chapter-toggle"
            :aria-label="isChapterExpanded(chapter.id) ? '收起章节' : '展开章节'"
            @click="toggleChapter(chapter.id)"
          >
            <span class="chapter-toggle-icon" :class="{ expanded: isChapterExpanded(chapter.id) }" />
          </button>
          <div class="chapter-title">
            <span class="chapter-order">{{ chapter.order }}</span>
            <span class="chapter-name">{{ chapter.title }}</span>
          </div>
        </div>
        <transition name="chapter-slide">
          <div
            v-if="isChapterExpanded(chapter.id) && chapter.sections?.length"
            class="chapter-sections"
            role="region"
            :aria-label="`${chapter.title}小节列表`"
          >
            <ul class="chapter-section-list">
              <li
                v-for="section in chapter.sections"
                :key="section.id"
                class="chapter-section-item"
              >
                <div class="chapter-section-bullet" />
                <div class="chapter-section-content">
                  <div class="chapter-section-title">{{ section.title }}</div>
                  <div class="chapter-section-meta">错题 {{ section.wrongCount }}</div>
                </div>
                <div class="chapter-section-actions">
                  <button type="button" class="mini-button" @click="handlePeriodAction('analysis', section.id)">查看</button>
                  <button type="button" class="mini-button primary" @click="handlePeriodAction('redo', section.id)">重做</button>
                </div>
              </li>
            </ul>
          </div>
        </transition>
        <div class="chapter-footer">
          <div class="chapter-meta">
            <span class="meta-label">错题：</span>
            <span class="meta-value">{{ chapter.wrongCount }}</span>
          </div>
          <div class="chapter-actions">
            <button type="button" class="outline-button" @click="handlePeriodAction('redo', chapter.id)">重做</button>
            <button type="button" class="outline-button" @click="handlePeriodAction('continue', chapter.id)">继续</button>
            <button type="button" class="primary-button" @click="handlePeriodAction('analysis', chapter.id)">查看解析</button>
          </div>
        </div>
      </section>
    </template>
    <template v-else>
      <section
        v-for="period in displayPeriods"
        :key="period.id"
        :class="['period-card', { 'type-card': isTypeFilter }]"
      >
        <div class="period-info">
          <div class="period-title">{{ period.label }}</div>
          <div class="period-meta">
            <span class="meta-label">错题：</span>
            <span class="meta-value">{{ period.wrongCount }}</span>
          </div>
        </div>
        <div class="period-actions">
          <button type="button" class="outline-button" @click="handlePeriodAction('redo', period.id)">重做</button>
          <button type="button" class="outline-button" @click="handlePeriodAction('continue', period.id)">继续</button>
          <button type="button" class="primary-button" @click="handlePeriodAction('analysis', period.id)">查看解析</button>
        </div>
      </section>
    </template>
    <transition name="dialog-fade">
      <div v-if="showAutoRemoveDialog" class="dialog-backdrop" @click.self="closeAutoRemoveDialog">
        <div class="dialog-panel">
          <header class="dialog-header">
            <div class="dialog-title">设置自动移除错题</div>
            <button class="dialog-close" type="button" aria-label="关闭" @click="closeAutoRemoveDialog">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </header>
          <div class="dialog-subtitle">请选择做对几次，自动移除错题</div>
          <div class="dialog-options">
            <button
              v-for="option in autoRemoveOptions"
              :key="option.id"
              type="button"
              class="dialog-option"
              :class="{ active: option.id === selectedAutoRemoveId }"
              @click="selectAutoRemove(option.id)"
            >
              <span>{{ option.label }}</span>
              <svg v-if="option.id === selectedAutoRemoveId" viewBox="0 0 24 24" aria-hidden="true" class="option-check">
                <path d="m8 12 3 3 5-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
          <label class="dialog-checkbox">
            <input type="checkbox" v-model="dontRemindNext" />
            <span>下次不再提醒</span>
          </label>
        </div>
      </div>
  </transition>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { useRouter } from "vue-router";

interface Category {
  id: string;
  label: string;
}

interface FilterChip {
  id: string;
  label: string;
}

interface ChapterSection {
  id: string;
  title: string;
  wrongCount: number;
}

interface Chapter {
  id: string;
  order: string;
  title: string;
  wrongCount: number;
  sections?: ChapterSection[];
}

interface Period {
  id: string;
  label: string;
  wrongCount: number;
}

type PeriodAction = "redo" | "continue" | "analysis";

interface AutoRemoveOption {
  id: string;
  label: string;
}

const router = useRouter();

const categories: Category[] = [
  { id: "ability", label: "初级社会工作综合能力" },
  { id: "practice", label: "初级社会工作实务" },
  { id: "comprehensive", label: "题型综合训练" },
];

const filters: FilterChip[] = [
    { id: "recent", label: "最近错题" },
    { id: "type", label: "题型分类" },
    { id: "chapter", label: "章节分类" },
    { id: "real", label: "真题分类" },
  ];

const periods: Period[] = [
    { id: "7d", label: "最近7天", wrongCount: 4 },
    { id: "30d", label: "最近30天", wrongCount: 4 },
  ];

const typePeriods: Period[] = [
    { id: "single", label: "单选题", wrongCount: 5 },
    { id: "multi", label: "多选题", wrongCount: 4 },
    { id: "judge", label: "判断题", wrongCount: 3 },
  ];

const chapters: Chapter[] = [
  {
    id: "ch1",
    order: "第一章",
    title: "社会工作的内涵、原则及主要领域",
    wrongCount: 4,
    sections: [
      { id: "ch1-sec1", title: "第一节 社会工作的内涵", wrongCount: 2 },
      { id: "ch1-sec2", title: "第二节 社会工作的基本原则", wrongCount: 1 },
      { id: "ch1-sec3", title: "第三节 社会工作的主要领域", wrongCount: 1 },
    ],
  },
  {
    id: "ch2",
    order: "第二章",
    title: "社会工作价值观与专业伦理",
    wrongCount: 1,
    sections: [
      { id: "ch2-sec1", title: "第一节 社会工作价值观", wrongCount: 1 },
      { id: "ch2-sec2", title: "第二节 社会工作伦理原则", wrongCount: 0 },
    ],
  },
  {
    id: "ch3",
    order: "第三章",
    title: "人类行为与社会环境",
    wrongCount: 5,
    sections: [
      { id: "ch3-sec1", title: "第一节 人类行为基础", wrongCount: 3 },
      { id: "ch3-sec2", title: "第二节 社会环境概述", wrongCount: 2 },
    ],
  },
  {
    id: "ch4",
    order: "第四章",
    title: "个案工作方法",
    wrongCount: 1,
    sections: [
      { id: "ch4-sec1", title: "第一节 个案工作的过程", wrongCount: 1 },
      { id: "ch4-sec2", title: "第二节 个案工作技巧", wrongCount: 0 },
    ],
  },
];

const autoRemoveOptions: AutoRemoveOption[] = [
    { id: "never", label: "不移除" },
    { id: "1", label: "1次" },
    { id: "2", label: "2次" },
    { id: "3", label: "3次" },
    { id: "4", label: "4次" },
    { id: "5", label: "5次" },
  ];

const overview = reactive({
  wrongCount: 4,
  removedCount: 0,
});

const activeCategoryId = ref(categories[0]?.id ?? "");
const activeFilterId = ref("recent");
const showAutoRemoveDialog = ref(false);
const selectedAutoRemoveId = ref(autoRemoveOptions[0]?.id ?? "never");
const dontRemindNext = ref(false);
const pendingContinuePeriodId = ref<string | null>(null);
const expandedChapterIds = ref<Set<string>>(new Set());

const isTypeFilter = computed(() => activeFilterId.value === "type");
const isChapterFilter = computed(() => activeFilterId.value === "chapter");
const displayPeriods = computed(() => (isTypeFilter.value ? typePeriods : periods));
const isChapterExpanded = (id: string) => expandedChapterIds.value.has(id);

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push({ name: "home" });
  }
}

function selectCategory(id: string) {
  activeCategoryId.value = id;
}

function selectFilter(id: string) {
  activeFilterId.value = id;
  if (id !== "chapter") {
    expandedChapterIds.value = new Set();
  }
}

function toggleChapter(id: string) {
  const next = new Set(expandedChapterIds.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  expandedChapterIds.value = next;
}

function openAutoRemoveDialog() {
  pendingContinuePeriodId.value = null;
  showAutoRemoveDialog.value = true;
}

function closeAutoRemoveDialog() {
  pendingContinuePeriodId.value = null;
  showAutoRemoveDialog.value = false;
}

function selectAutoRemove(id: string) {
  selectedAutoRemoveId.value = id;
  const pendingId = pendingContinuePeriodId.value;
  if (pendingId) {
    pendingContinuePeriodId.value = null;
    showAutoRemoveDialog.value = false;
    router
      .push({
        name: "chapter",
        query: { action: "continue", periodId: pendingId, autoRemove: id, ts: Date.now().toString() },
      })
      .catch(() => {});
  } else {
    showAutoRemoveDialog.value = false;
  }
}

function handlePeriodAction(action: PeriodAction, periodId: string) {
  if (action === "redo") {
    router
    .push({
      name: "chapter",
      query: { action, periodId, ts: Date.now().toString() },
    })
    .catch(() => {});
  } else if (action === "continue") {
    pendingContinuePeriodId.value = periodId;
    showAutoRemoveDialog.value = true;
  } else if (action === "analysis") {
    router
    .push({
      name: "analysis",
      query: { action, periodId, ts: Date.now().toString() },
    })
    .catch(() => {});
  }
}
</script>

<style scoped>
.wrong-page {
  min-height: 100vh;
  padding-bottom: 72px;
  background: linear-gradient(180deg, rgba(255, 239, 234, 0.35) 0%, #ffffff 28%);
  font-family: "PingFang SC", "Microsoft YaHei", system-ui, -apple-system, sans-serif;
  color: #262626;
  position: relative;
}

.wrong-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 8px;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: none;
  background: #f5f6fa;
  color: #8c8c8c;
  cursor: pointer;
  transition: color 0.2s ease, background 0.2s ease;
}

.icon-button svg {
  width: 20px;
  height: 20px;
}

.icon-button.back {
  color: #262626;
  background: #f5f6fa;
}

.icon-button:hover {
  background: #ffe8e1;
  color: #ff6d5c;
}

.header-actions {
  display: inline-flex;
  gap: 12px;
}

.category-tabs {
  display: flex;
  overflow-x: hidden;
  padding: 16px 20px 12px;
  gap: 16px;
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.category-tab {
  position: relative;
  border: none;
  background: none;
  font-size: 15px;
  color: #8c8c8c;
  padding: 4px 0;
  white-space: nowrap;
  cursor: pointer;
}

.category-tab.active {
  color: #ff6d5c;
  font-weight: 600;
}

.category-tab.active::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -8px;
  width: 100%;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, #ff6d5c 0%, #ff855c 100%);
}

.summary-card {
  position: relative;
  margin: 24px 24px 20px;
  padding: 32px 24px 10px;
  border-radius: 24px;
  background: radial-gradient(circle at 30% 20%, rgba(255, 109, 92, 0.16), rgba(255, 109, 92, 0.06));
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.ring {
  width: 148px;
  height: 148px;
  border-radius: 50%;
  background: radial-gradient(circle, #ff795c 0%, #ff5b4d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 24px rgba(255, 91, 77, 0.26);
  position: relative;
}

.ring::before,
.ring::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  opacity: 0.32;
}

.ring::before {
  width: 172px;
  height: 172px;
  background: rgba(255, 112, 90, 0.28);
}

.ring::after {
  width: 194px;
  height: 194px;
  background: rgba(255, 112, 90, 0.18);
}

.ring-inner {
  width: 116px;
  height: 116px;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  color: #ff5b4d;
}

.ring-value {
  font-size: 34px;
  font-weight: 700;
  line-height: 1;
}

.ring-label {
  margin-top: 6px;
  font-size: 14px;
}

.overview-meta {
  font-size: 14px;
  color: #595959;
}

.overview-meta .meta-value {
  font-weight: 600;
  color: #ff6d5c;
}

.print-button {
  position: absolute;
  top: 16px;
  right: 16px;
  border: 1px solid rgba(255, 109, 92, 0.5);
  background: rgba(255, 109, 92, 0.1);
  color: #ff6d5c;
  padding: 10px 16px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.print-button svg {
  width: 18px;
  height: 18px;
}

.print-button:hover {
  background: rgba(255, 109, 92, 0.2);
  transform: translateY(-1px);
}

.filter-chips {
  display: flex;
  gap: 12px;
  padding: 0 20px 12px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.filter-chips::-webkit-scrollbar {
  display: none;
}

.chip {
  border: none;
  background: #f2f3f7;
  color: #666;
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.chip.active {
  background: #ff6d5c;
  color: #ffffff;
  font-weight: 600;
}

.period-card {
  margin: 20px;
  padding: 18px 20px;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  background: #ffffff;
  box-shadow: 0 10px 26px rgba(31, 35, 53, 0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.period-card.type-card {
  margin: 0 20px;
  padding: 18px 0;
  border: none;
  border-radius: 0;
  box-shadow: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.period-card.type-card:first-of-type {
  margin-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.period-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chapter-card {
  margin: 20px;
  padding: 18px 20px;
  border-radius: 16px;
  border: 1px solid rgba(255, 109, 92, 0.22);
  background: #ffffff;
  box-shadow: 0 10px 28px rgba(255, 109, 92, 0.14);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chapter-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chapter-toggle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #ff6d5c;
  background: #fff5f3;
  color: #ff6d5c;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.chapter-toggle:active {
  background: #ff6d5c;
  color: #fff;
}

.chapter-toggle-icon {
  position: relative;
  width: 16px;
  height: 2px;
  background: currentColor;
  border-radius: 999px;
  transition: transform 0.2s ease;
}

.chapter-toggle-icon::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 2px;
  height: 16px;
  background: currentColor;
  border-radius: 999px;
  transform: translate(-50%, -50%);
  transition: opacity 0.2s ease;
}

.chapter-toggle-icon.expanded::after {
  opacity: 0;
}

.chapter-title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
  color: #262626;
}

.chapter-order {
  font-size: 15px;
  font-weight: 600;
  color: #ff6d5c;
}

.chapter-name {
  font-size: 16px;
  font-weight: 500;
  color: #262626;
}


.chapter-sections {
  margin: 8px 0 0 48px;
  padding: 12px 0 0 12px;
  border-left: 2px solid rgba(255, 109, 92, 0.18);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chapter-section-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chapter-section-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(255, 245, 243, 0.85);
  border: 1px solid rgba(255, 109, 92, 0.2);
}

.chapter-section-bullet {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ff6d5c;
  box-shadow: 0 0 0 4px rgba(255, 109, 92, 0.2);
}

.chapter-section-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chapter-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.chapter-section-meta {
  font-size: 12px;
  color: #ff6d5c;
  font-weight: 500;
}

.chapter-section-actions {
  display: flex;
  gap: 8px;
}

.mini-button {
  min-width: 60px;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid #ff6d5c;
  background: #fff;
  color: #ff6d5c;
  font-size: 12px;
  font-weight: 500;
}

.mini-button.primary {
  background: #ff6d5c;
  color: #fff;
}

.chapter-slide-enter-active,
.chapter-slide-leave-active {
  transition: all 0.2s ease;
}

.chapter-slide-enter-from,
.chapter-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.chapter-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-left: 4px;
}

.chapter-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #8c8c8c;
}

.chapter-meta .meta-value {
  font-size: 16px;
  font-weight: 600;
  color: #ff6d5c;
}

.chapter-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.period-card.type-card .period-info {
  gap: 4px;
}

.period-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.period-card.type-card .period-title {
  font-size: 15px;
}

.period-meta {
  font-size: 14px;
  color: #8c8c8c;
}

.period-meta .meta-value {
  color: #ff6d5c;
  font-weight: 600;
}

.period-actions {
  display: inline-flex;
  gap: 10px;
}

.period-card.type-card .period-actions {
  gap: 8px;
}

.outline-button,
.primary-button {
  flex: none;
  min-width: 70px;
  height: 34px;
  padding: 0 16px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.outline-button {
  border: 1px solid rgba(255, 109, 92, 0.6);
  background: rgba(255, 109, 92, 0.08);
  color: #ff6d5c;
}

.outline-button:hover {
  background: rgba(255, 109, 92, 0.16);
  transform: translateY(-1px);
}

.primary-button {
  border: none;
  background: linear-gradient(90deg, #ff6d5c 0%, #ff845c 100%);
  color: #ffffff;
  padding: 0 14px;
}

.primary-button:hover {
  transform: translateY(-1px);
  filter: brightness(1.05);
}

.dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 0 24px;
}

.dialog-panel {
  width: 100%;
  max-width: 360px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 12px;
}

.dialog-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.dialog-close {
  border: none;
  background: none;
  color: #8c8c8c;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.dialog-close:hover {
  color: #ff6d5c;
}

.dialog-close svg {
  width: 18px;
  height: 18px;
}

.dialog-subtitle {
  padding: 0 20px 12px;
  font-size: 14px;
  color: #a6a6a6;
  border-bottom: 1px solid #f1f1f1;
}

.dialog-options {
  display: flex;
  flex-direction: column;
  padding: 4px 0;
}

.dialog-option {
  border: none;
  background: none;
  padding: 14px 20px;
  font-size: 15px;
  color: #262626;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.dialog-option + .dialog-option {
  border-top: 1px solid #f5f5f5;
}

.dialog-option.active {
  color: #ff6d5c;
  font-weight: 600;
}

.option-check {
  width: 20px;
  height: 20px;
  color: #ff6d5c;
}

.dialog-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px 18px;
  font-size: 14px;
  color: #8c8c8c;
}

.dialog-checkbox input {
  width: 18px;
  height: 18px;
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

@media (max-width: 420px) {
  .summary-card {
    margin: 20px 16px;
  }

  .ring {
    width: 160px;
    height: 160px;
  }

  .ring::before {
    width: 190px;
    height: 190px;
  }

  .ring::after {
    width: 218px;
    height: 218px;
  }

  .ring-inner {
    width: 128px;
    height: 128px;
  }

  .period-card {
    margin: 16px;
    flex-direction: column;
    align-items: flex-start;
  }

  .period-actions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .chapter-card {
    margin: 16px;
  }

  .chapter-footer {
    flex-direction: column;
    align-items: flex-start;
    padding-left: 0;
    gap: 10px;
  }

  .chapter-actions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .outline-button,
  .primary-button {
    min-width: 0;
    flex: 1 1 30%;
  }

}
</style>


