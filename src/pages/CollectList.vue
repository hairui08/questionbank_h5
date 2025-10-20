<template>
  <div class="collect-page">
    <header class="collect-header">
      <button class="icon-button" type="button" @click="handleBack" aria-label="返回">
        <svg class="header-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <h1 class="header-title">试题收藏</h1>
      <template v-if="!selectionMode">
        <button
          class="icon-button danger"
          type="button"
          @click="enterSelectionMode"
          :disabled="favorites.length === 0"
        >
          <svg class="header-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path d="M6 7l1 13a2 2 0 0 0 2 1.8h6a2 2 0 0 0 2-1.8l1-13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M9 7V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </template>
      <template v-else>
        <button class="text-link" type="button" @click="exitSelectionMode">
          取消
        </button>
      </template>
    </header>

    <section class="filters">
      <label class="filter">
        <select v-model="selectedPaper" class="filter-select">
          <option value="__all__">全部试卷</option>
          <option v-for="option in paperOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>

      <label class="filter">
        <select v-model="selectedSection" class="filter-select">
          <option value="__all__">全部题型</option>
          <option v-for="option in sectionOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
    </section>

    <section v-if="loading" class="state loading">正在加载收藏…</section>
    <section v-else-if="groupedFavorites.length === 0" class="state empty">暂无收藏试题</section>
    <section v-else class="favorite-list">
      <article
        v-for="paperGroup in groupedFavorites"
        :key="paperGroup.paperTitle"
        class="paper-group"
      >
        <header class="paper-header">
          <div class="paper-leading">
            <span class="paper-title">{{ paperGroup.paperTitle }}</span>
            <span class="paper-count">共 {{ paperGroup.totalCount }} 题</span>
          </div>
        </header>

        <div
          v-for="sectionGroup in paperGroup.sections"
          :key="paperGroup.paperTitle + '-' + sectionGroup.sectionName"
          class="section-group"
        >
          <ul class="favorite-items">
            <li
              v-for="item in sectionGroup.items"
              :key="item.answerKey"
              class="favorite-item"
              :class="{ selectable: selectionMode }"
              @click="selectionMode ? toggleItemSelection(item.answerKey) : undefined"
            >
              <div v-if="selectionMode" class="favorite-selector" @click.stop="toggleItemSelection(item.answerKey)">
                <span class="selector-circle" :class="{ checked: selectedKeysSet.has(item.answerKey) }" />
              </div>
              <div class="favorite-content">
                <div class="favorite-meta">
                  <span class="favorite-chip">{{ resolvePaperTag(paperGroup.paperTitle) }}</span>
                  <span class="favorite-section" v-if="sectionGroup.sectionName">{{ sectionGroup.sectionName }}</span>
                </div>
                <div class="favorite-title">{{ item.title || "未命名试题" }}</div>
                <div class="favorite-actions">
                  <button
                    class="action-button outline"
                    type="button"
                    @click.stop="handleReview(item)"
                    :disabled="selectionMode"
                  >
                    查看
                  </button>
                  <button
                    class="action-button solid"
                    type="button"
                    @click.stop="handleRetry(item)"
                    :disabled="selectionMode"
                  >
                    重做
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </article>
    </section>
    <transition name="selection-bar">
      <div v-if="selectionMode" class="selection-bar">
        <button class="select-toggle" type="button" @click="toggleSelectAll">
          <span class="selector-circle" :class="{ checked: isAllSelected }" />
          <span class="select-label">全选</span>
        </button>
        <button class="selection-delete" type="button" :disabled="selectedCount === 0" @click="handleDeleteSelected">
          删除
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onActivated, onMounted, ref, watch } from "vue";
import { deleteFavorite, getFavoriteRecords, initFavoritesDb, type FavoriteRecord } from "../services/sqliteFavorites";

interface OptionItem {
  label: string;
  value: string;
}

interface SectionGroup {
  sectionName: string;
  items: FavoriteRecord[];
}

interface PaperGroup {
  paperTitle: string;
  totalCount: number;
  sections: SectionGroup[];
}

const favorites = ref<FavoriteRecord[]>([]);
const loading = ref(true);
const selectedPaper = ref<string>("__all__");
const selectedSection = ref<string>("__all__");
const selectionMode = ref(false);
const selectedKeys = ref<Set<string>>(new Set());

const paperOptions = computed<OptionItem[]>(() => {
  const map = new Map<string, number>();
  favorites.value.forEach((item) => {
    const key = normalizeLabel(item.paperTitle);
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return Array.from(map.entries()).map(([value, count]) => ({
    value,
    label: `${value} (${count})`,
  }));
});

const sectionOptions = computed<OptionItem[]>(() => {
  const scoped = favorites.value.filter((item) => filterByPaper(item, selectedPaper.value));
  const map = new Map<string, number>();
  scoped.forEach((item) => {
    const key = normalizeLabel(item.typeName);
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return Array.from(map.entries()).map(([value, count]) => ({
    value,
    label: `${value} (${count})`,
  }));
});

const filteredFavorites = computed(() =>
  favorites.value.filter(
    (item) =>
      filterByPaper(item, selectedPaper.value) &&
      filterBySection(item, selectedSection.value),
  ),
);

const groupedFavorites = computed<PaperGroup[]>(() => {
  const groups = new Map<string, { sections: Map<string, FavoriteRecord[]>; total: number }>();
  filteredFavorites.value.forEach((item) => {
    const paper = normalizeLabel(item.paperTitle);
    const section = normalizeLabel(item.typeName, "Uncategorized Section");
    const entry = groups.get(paper) ?? { sections: new Map(), total: 0 };
    const sectionList = entry.sections.get(section) ?? [];
    sectionList.push(item);
    entry.sections.set(section, sectionList);
    entry.total += 1;
    groups.set(paper, entry);
  });

  return Array.from(groups.entries())
    .map(([paperTitle, value]) => ({
      paperTitle,
      totalCount: value.total,
      sections: Array.from(value.sections.entries())
        .map(([sectionName, items]) => ({
          sectionName,
          items: items
            .slice()
            .sort((a, b) => {
              const left = normalizeNumber(a.number);
              const right = normalizeNumber(b.number);
              if (left === right) return 0;
              if (left === null) return 1;
              if (right === null) return -1;
              return left - right;
            }),
        }))
        .sort((a, b) => a.sectionName.localeCompare(b.sectionName, "zh-CN")),
    }))
    .sort((a, b) => a.paperTitle.localeCompare(b.paperTitle, "zh-CN"));
});

onMounted(async () => {
  await refreshFavorites();
});

onActivated(async () => {
  await refreshFavorites();
});

watch(selectedPaper, () => {
  selectedSection.value = "__all__";
});

watch(paperOptions, (options) => {
  if (selectedPaper.value === "__all__") return;
  const values = new Set(options.map((option) => option.value));
  if (!values.has(selectedPaper.value)) {
    selectedPaper.value = "__all__";
  }
});

watch(sectionOptions, (options) => {
  if (selectedSection.value === "__all__") return;
  const values = new Set(options.map((option) => option.value));
  if (!values.has(selectedSection.value)) {
    selectedSection.value = "__all__";
  }
});

async function refreshFavorites() {
  loading.value = true;
  try {
    await initFavoritesDb();
    favorites.value = await getFavoriteRecords();
    selectedPaper.value = "__all__";
    selectedSection.value = "__all__";
    reconcileSelection();
  } catch (error) {
    console.warn("[favorites] collect list load failure", error);
    favorites.value = [];
    exitSelectionMode();
  } finally {
    loading.value = false;
  }
}

function filterByPaper(item: FavoriteRecord, paperValue: string) {
  if (paperValue === "__all__") return true;
  return normalizeLabel(item.paperTitle) === paperValue;
}

function filterBySection(item: FavoriteRecord, sectionValue: string) {
  if (sectionValue === "__all__") return true;
  return normalizeLabel(item.typeName, "Uncategorized Section") === sectionValue;
}

function normalizeLabel(value: string | null | undefined, fallback = "Uncategorized Paper") {
  const text = typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
  return text;
}

function normalizeNumber(value: number | null | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
}

function resolvePaperTag(title: string | null | undefined) {
  const text = normalizeLabel(title, "未命名试卷");
  const compact = text.replace(/\s+/g, "");
  if (/入学|开学|摸底/.test(compact)) {
    return "入学测试";
  }
  if (/阶段|月考|专题|闯关/.test(compact)) {
    return "阶段测试";
  }
  if (/历年|真题|押题|卷/.test(compact)) {
    return "历年真题";
  }
  if (/章节|练习|专项|强化/.test(compact)) {
    return "章节练习";
  }
  return "综合训练";
}

function handleBack() {
  if (window.history.length > 1) {
    window.history.back();
  }
}

function handleReview(item: FavoriteRecord) {
  console.log("查看收藏题目", item.answerKey);
}

function handleRetry(item: FavoriteRecord) {
  console.log("重做收藏题目", item.answerKey);
}

function enterSelectionMode() {
  selectionMode.value = true;
  selectedKeys.value = new Set();
}

function exitSelectionMode() {
  selectionMode.value = false;
  selectedKeys.value = new Set();
}

const visibleItems = computed(() => filteredFavorites.value);

const selectedKeysSet = computed(() => selectedKeys.value);

const selectedCount = computed(() => selectedKeys.value.size);

const isAllSelected = computed(() => {
  const items = visibleItems.value;
  if (!items.length) return false;
  return items.every((item) => selectedKeys.value.has(item.answerKey));
});

function toggleItemSelection(answerKey: string) {
  const next = new Set(selectedKeys.value);
  if (next.has(answerKey)) {
    next.delete(answerKey);
  } else {
    next.add(answerKey);
  }
  selectedKeys.value = next;
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedKeys.value = new Set();
  } else {
    selectedKeys.value = new Set(visibleItems.value.map((item) => item.answerKey));
  }
}

async function handleDeleteSelected() {
  if (selectedKeys.value.size === 0) return;
  const confirmed = window.confirm(`确定删除选中的 ${selectedKeys.value.size} 条收藏吗？`);
  if (!confirmed) return;
  const keys = Array.from(selectedKeys.value);
  await Promise.all(keys.map((key) => deleteFavorite(key)));
  await refreshFavorites();
  exitSelectionMode();
}

function reconcileSelection() {
  if (!selectionMode.value) return;
  const availableKeys = new Set(visibleItems.value.map((item) => item.answerKey));
  const next = new Set<string>();
  selectedKeys.value.forEach((key) => {
    if (availableKeys.has(key)) {
      next.add(key);
    }
  });
  selectedKeys.value = next;
  if (next.size === 0 && visibleItems.value.length === 0) {
    exitSelectionMode();
  }
}

watch(filteredFavorites, () => {
  reconcileSelection();
});
</script>

<style scoped>
.collect-page {
  min-height: 100vh;
  background: #f7f8fa;
  display: flex;
  flex-direction: column;
}

.collect-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #1f1f1f;
  margin: 0 12px;
}

.icon-button {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  border: 1px solid #e4e7ed;
  background: #fff;
  color: #4a4a4a;
}

.icon-button:disabled {
  opacity: 0.4;
  pointer-events: none;
}

.text-link {
  border: none;
  background: none;
  color: #ff4d4f;
  font-size: 15px;
  font-weight: 600;
  padding: 6px 8px;
}

.icon-button.danger {
  color: #ff4d4f;
  border-color: #ffe2e3;
  background: #fff5f5;
}

.header-icon {
  width: 20px;
  height: 20px;
}

.filters {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 16px;
  background: #fff;
}

.filter {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  color: #555;
}

.filter-label {
  font-weight: 600;
  color: #1f1f1f;
}

.filter-select {
  height: 38px;
  border-radius: 10px;
  border: 1px solid #e3e7ee;
  padding: 0 12px;
  background: #f9fafb;
  color: #333;
}

.state {
  padding: 80px 16px;
  text-align: center;
  color: #9aa5b5;
  font-size: 15px;
}

.favorite-list {
  padding: 12px 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.paper-group {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 6px 20px rgba(31, 42, 68, 0.08);
  overflow: hidden;
}

.paper-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f2f5;
}

.paper-leading {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.paper-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f1f1f;
}

.paper-count {
  font-size: 12px;
  color: #9aa5b5;
}

.section-group {
  padding: 16px;
  border-bottom: 1px solid #f0f2f5;
  background: #fff;
}

.section-group:last-of-type {
  border-bottom: none;
}

.favorite-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.favorite-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(255, 245, 245, 0.7), rgba(255, 255, 255, 0.9));
  border: 1px solid #ffe2e4;
}

.favorite-item.selectable {
  cursor: pointer;
}

.favorite-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
}

.selector-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #d9d9d9;
  background: #fff;
  transition: all 0.2s ease;
}

.selector-circle.checked {
  border-color: #ff4d4f;
  background: #ff4d4f;
  box-shadow: inset 0 0 0 4px #fff;
}

.favorite-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  color: #1f1f1f;
}

.favorite-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 12px;
  color: #9aa5b5;
}

.favorite-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 12px;
  border-radius: 999px;
  background: rgba(255, 77, 79, 0.12);
  color: #ff4d4f;
  font-size: 12px;
  font-weight: 600;
}

.favorite-section {
  font-weight: 600;
  color: #ff7a45;
}
\n
.favorite-title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.6;
}

.favorite-actions {
  display: flex;
  gap: 16px;
  margin-top: 4px;
}

.action-button {
  min-width: 84px;
  padding: 6px 16px;
  border-radius: 18px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.action-button.outline {
  background: #fff;
  color: #3569f6;
  border-color: rgba(53, 105, 246, 0.4);
}

.action-button.outline:not(:disabled):hover {
  background: rgba(53, 105, 246, 0.08);
  border-color: #3569f6;
}

.action-button.solid {
  background: #ff4d4f;
  color: #fff;
  border-color: #ff4d4f;
}

.action-button.solid:not(:disabled):hover {
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.3);
}

.action-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}.selection-bar {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
  gap: 12px;
}

.select-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  border: none;
  background: none;
  font-size: 15px;
  color: #1f1f1f;
  padding: 6px 0;
}

.select-label {
  font-weight: 500;
}

.selection-delete {
  min-width: 96px;
  height: 40px;
  border-radius: 20px;
  border: none;
  background: #ff4d4f;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.selection-delete:disabled {
  opacity: 0.4;
  pointer-events: none;
}

.selection-bar-enter-active,
.selection-bar-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.selection-bar-enter-from,
.selection-bar-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>





