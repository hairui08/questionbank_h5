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
          <option value="__all__">全部章节</option>
          <option :value="CHAPTER_CLASSIFICATION_VALUE">章节归类</option>
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
        :key="paperGroup.key"
        class="paper-group"
        :class="{ chapter: isChapterGrouping }"
      >
        <header class="paper-header" :class="{ clickable: isChapterGrouping }">
          <button
            v-if="isChapterGrouping"
            class="chapter-toggle"
            type="button"
            :aria-label="isChapterExpanded(paperGroup.key) ? '收起章节' : '展开章节'"
            @click="toggleChapterExpansion(paperGroup.key)"
          >
            <span class="toggle-icon" :class="{ collapsed: !isChapterExpanded(paperGroup.key) }" />
          </button>
          <div class="paper-leading">
            <span class="paper-title">{{ paperGroup.paperTitle }}</span>
            <span v-if="paperGroup.subtitle" class="paper-subtitle">{{ paperGroup.subtitle }}</span>
            <span class="paper-count">共 {{ paperGroup.totalCount }} 题</span>
          </div>
        </header>

        <div
          v-for="sectionGroup in paperGroup.sections"
          :key="sectionGroup.key"
          class="section-group"
          :class="{ 'chapter-section': isChapterGrouping }"
          v-show="!isChapterGrouping || isChapterExpanded(paperGroup.key)"
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
                  <span
                    v-if="!isChapterGrouping"
                    class="favorite-chip"
                  >
                    {{ resolvePaperTag(paperGroup.subtitle || paperGroup.paperTitle) }}
                  </span>
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
import { flattenQuestions, normalizeExamPaper, normalizedPaper, type NormalizedQuestion } from "../composables/useExamPaper";
import { deleteFavorite, getFavoriteRecords, initFavoritesDb, type FavoriteRecord } from "../services/sqliteFavorites";

interface OptionItem {
  label: string;
  value: string;
}

interface SectionGroup {
  key: string;
  sectionName: string;
  items: FavoriteRecord[];
}

interface PaperGroup {
  key: string;
  paperTitle: string;
  totalCount: number;
  sections: SectionGroup[];
  subtitle?: string;
}

const CHAPTER_CLASSIFICATION_VALUE = "__group_chapter__";
const DEFAULT_CHAPTER_LABEL = "未归类章节";
const DEFAULT_SECTION_LABEL = "未归类小节";

const normalizedPaperSource = normalizedPaper ?? normalizeExamPaper();
const questionCategoryIndex = new Map<string, string[]>();
flattenQuestions(normalizedPaperSource.questions).forEach((question) => {
  if (!question?.answerKey) return;
  const path = Array.isArray(question.categoryPath)
    ? question.categoryPath.filter((label) => typeof label === "string" && label.trim().length > 0)
    : [];
  if (path.length > 0) {
    questionCategoryIndex.set(question.answerKey, path);
  }
});

const favorites = ref<FavoriteRecord[]>([]);
const loading = ref(true);
const selectedPaper = ref<string>("__all__");
const selectedSection = ref<string>("__all__");
const selectionMode = ref(false);
const selectedKeys = ref<Set<string>>(new Set());
const expandedChapterKeys = ref<Set<string>>(new Set());

const isChapterGrouping = computed(() => selectedSection.value === CHAPTER_CLASSIFICATION_VALUE);

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
  const items = filteredFavorites.value;
  return isChapterGrouping.value ? buildChapterGroups(items) : buildDefaultGroups(items);
});

onMounted(async () => {
  await refreshFavorites();
});

onActivated(async () => {
  await refreshFavorites();
});

watch(selectedPaper, () => {
  if (selectedSection.value !== CHAPTER_CLASSIFICATION_VALUE) {
    selectedSection.value = "__all__";
  }
});

watch(paperOptions, (options) => {
  if (selectedPaper.value === "__all__") return;
  const values = new Set(options.map((option) => option.value));
  if (!values.has(selectedPaper.value)) {
    selectedPaper.value = "__all__";
  }
});

watch(sectionOptions, (options) => {
  if (selectedSection.value === "__all__" || selectedSection.value === CHAPTER_CLASSIFICATION_VALUE) return;
  const values = new Set(options.map((option) => option.value));
  if (!values.has(selectedSection.value)) {
    selectedSection.value = "__all__";
  }
});

watch(isChapterGrouping, (isChapter) => {
  if (isChapter) {
    expandedChapterKeys.value = new Set(groupedFavorites.value.map((group) => group.key));
  } else if (expandedChapterKeys.value.size > 0) {
    expandedChapterKeys.value = new Set();
  }
});

watch(groupedFavorites, (groups) => {
  if (!isChapterGrouping.value) return;
  const next = new Set(expandedChapterKeys.value);
  const keys = new Set(groups.map((group) => group.key));
  let mutated = false;
  next.forEach((key) => {
    if (!keys.has(key)) {
      next.delete(key);
      mutated = true;
    }
  });
  keys.forEach((key) => {
    if (!next.has(key)) {
      next.add(key);
      mutated = true;
    }
  });
  if (mutated) {
    expandedChapterKeys.value = next;
  }
});

function buildDefaultGroups(items: FavoriteRecord[]): PaperGroup[] {
  const groups = new Map<string, { sections: Map<string, FavoriteRecord[]>; total: number }>();
  items.forEach((item) => {
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
      key: `paper::${paperTitle}`,
      paperTitle,
      totalCount: value.total,
      sections: Array.from(value.sections.entries())
        .map(([sectionName, sectionItems]) => ({
          key: `paper::${paperTitle}::section::${sectionName}`,
          sectionName,
          items: sortFavoriteItems(sectionItems),
        }))
        .sort((a, b) => a.sectionName.localeCompare(b.sectionName, "zh-CN")),
    }))
    .sort((a, b) => a.paperTitle.localeCompare(b.paperTitle, "zh-CN"));
}

function buildChapterGroups(items: FavoriteRecord[]): PaperGroup[] {
  const groups = new Map<
    string,
    {
      chapterName: string;
      paperTitle: string;
      sections: Map<string, FavoriteRecord[]>;
      total: number;
    }
  >();

  items.forEach((item) => {
    const { chapterName, sectionName } = resolveChapterSection(item);
    const paperTitle = normalizeLabel(item.paperTitle);
    const key = `${paperTitle}::${chapterName}`;
    const entry =
      groups.get(key) ?? {
        chapterName,
        paperTitle,
        sections: new Map<string, FavoriteRecord[]>(),
        total: 0,
      };
    const sectionKey = sectionName;
    const sectionItems = entry.sections.get(sectionKey) ?? [];
    sectionItems.push(item);
    entry.sections.set(sectionKey, sectionItems);
    entry.total += 1;
    groups.set(key, entry);
  });

  return Array.from(groups.entries())
    .map(([key, value]) => {
      const sections = Array.from(value.sections.entries())
        .map(([sectionName, sectionItems]) => ({
          key: `${key}::section::${sectionName}`,
          sectionName,
          items: sortFavoriteItems(sectionItems),
        }))
        .sort((a, b) => a.sectionName.localeCompare(b.sectionName, "zh-CN"));

      const subtitle =
        value.paperTitle && value.paperTitle !== value.chapterName ? value.paperTitle : undefined;

      return {
        key,
        paperTitle: value.chapterName,
        subtitle,
        totalCount: value.total,
        sections,
      };
    })
    .sort((a, b) => a.paperTitle.localeCompare(b.paperTitle, "zh-CN"));
}

function sortFavoriteItems(items: FavoriteRecord[]): FavoriteRecord[] {
  return items
    .slice()
    .sort((a, b) => {
      const left = normalizeNumber(a.number);
      const right = normalizeNumber(b.number);
      if (left === right) return 0;
      if (left === null) return 1;
      if (right === null) return -1;
      return left - right;
    });
}

function resolveChapterSection(item: FavoriteRecord) {
  const question = item.question as Partial<NormalizedQuestion> | undefined;
  const sectionName = resolveSectionName(item, question);
  const chapterName = resolveChapterName(item, question, sectionName);
  return { chapterName, sectionName };
}

function resolveSectionName(item: FavoriteRecord, question: Partial<NormalizedQuestion> | undefined) {
  if (question && typeof question.testTypeName === "string" && question.testTypeName.trim().length > 0) {
    return normalizeLabel(question.testTypeName, DEFAULT_SECTION_LABEL);
  }
  return normalizeLabel(item.typeName, DEFAULT_SECTION_LABEL);
}

function resolveChapterName(
  item: FavoriteRecord,
  question: Partial<NormalizedQuestion> | undefined,
  sectionName: string,
) {
  const candidates: Array<string | null | undefined> = [];

  if (question) {
    if (Array.isArray(question.categoryPath)) {
      const [first] = question.categoryPath.filter(
        (label): label is string => typeof label === "string" && label.trim().length > 0,
      );
      if (first) {
        candidates.push(first);
      }
    }
    const potentialChapter = (question as Record<string, unknown>).chapterTitle;
    if (typeof potentialChapter === "string" && potentialChapter.trim().length > 0) {
      candidates.push(potentialChapter);
    }
  }

  const indexPath = questionCategoryIndex.get(item.answerKey);
  if (indexPath && indexPath.length > 0) {
    candidates.unshift(indexPath[0]);
  }

  const resolved = candidates.find((value) => typeof value === "string" && value.trim().length > 0);
  if (resolved) {
    return normalizeLabel(resolved, DEFAULT_CHAPTER_LABEL);
  }

  const guessed = guessChapterFromSection(sectionName);
  if (guessed) {
    return guessed;
  }

  const paperTitle = normalizeLabel(item.paperTitle, DEFAULT_CHAPTER_LABEL);
  if (paperTitle && paperTitle !== DEFAULT_CHAPTER_LABEL) {
    return paperTitle;
  }

  return DEFAULT_CHAPTER_LABEL;
}

function guessChapterFromSection(sectionName: string): string | null {
  if (!sectionName || sectionName === DEFAULT_SECTION_LABEL) return null;
  if (/章|篇|部分/.test(sectionName)) {
    return sectionName;
  }
  const match = sectionName.match(/第([一二三四五六七八九十百千万]+)节/);
  if (match && match[1]) {
    return sectionName.replace(/第([一二三四五六七八九十百千万]+)节/, "第$1章");
  }
  return null;
}

function isChapterExpanded(groupKey: string): boolean {
  return expandedChapterKeys.value.has(groupKey);
}

function toggleChapterExpansion(groupKey: string) {
  if (!isChapterGrouping.value) return;
  const next = new Set(expandedChapterKeys.value);
  if (next.has(groupKey)) {
    next.delete(groupKey);
  } else {
    next.add(groupKey);
  }
  expandedChapterKeys.value = next;
}

async function refreshFavorites() {
  loading.value = true;
  try {
    await initFavoritesDb();
    favorites.value = await getFavoriteRecords();
    selectedPaper.value = "__all__";
    if (selectedSection.value !== CHAPTER_CLASSIFICATION_VALUE) {
      selectedSection.value = "__all__";
    }
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
  if (sectionValue === CHAPTER_CLASSIFICATION_VALUE) return true;
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

.paper-group.chapter {
  border-radius: 16px;
  overflow: hidden;
}

.paper-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f2f5;
}

.paper-header.clickable {
  cursor: pointer;
}

.paper-header.clickable:hover {
  background: #fff7f5;
}

.chapter-toggle {
  border: none;
  margin-right: 12px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ff4d4f;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 14px rgba(255, 77, 79, 0.28);
}

.chapter-toggle:focus-visible {
  outline: 2px solid rgba(255, 77, 79, 0.35);
  outline-offset: 2px;
}

.toggle-icon {
  position: relative;
  display: block;
  width: 12px;
  height: 2px;
  background: #fff;
  border-radius: 999px;
}

.toggle-icon::after {
  content: "";
  position: absolute;
  top: -5px;
  left: 5px;
  width: 2px;
  height: 12px;
  background: #fff;
  border-radius: 999px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.toggle-icon.collapsed::after {
  opacity: 1;
}

.paper-leading {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.paper-subtitle {
  font-size: 12px;
  color: #b3bac7;
  font-weight: 500;
}

.paper-group.chapter .paper-count {
  font-size: 12px;
  color: #d46a6a;
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

.paper-group.chapter .section-group {
  background: rgba(255, 245, 245, 0.72);
  border: none;
  padding-left: 28px;
  position: relative;
}

.paper-group.chapter .section-group::before {
  content: "";
  position: absolute;
  left: 14px;
  top: 20px;
  bottom: 20px;
  width: 1px;
  background: rgba(255, 77, 79, 0.2);
}

.paper-group.chapter .section-group:last-of-type::before {
  bottom: 36px;
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

.paper-group.chapter .favorite-items {
  padding-left: 4px;
}

.favorite-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(255, 245, 245, 0.7), rgba(255, 255, 255, 0.9));
  border: 1px solid #ffe2e4;
  position: relative;
}

.favorite-item.selectable {
  cursor: pointer;
}

.paper-group.chapter .favorite-item {
  background: #fff;
  border: 1px solid rgba(255, 192, 196, 0.7);
  padding-left: 18px;
}

.paper-group.chapter .favorite-item::before {
  content: "";
  position: absolute;
  left: -22px;
  top: 22px;
  width: 10px;
  height: 10px;
  background: #ff4d4f;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(255, 77, 79, 0.2);
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

.favorite-title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.6;
}

.favorite-actions {
  display: flex;
  justify-content: flex-end;
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
}

.selection-bar {
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
















