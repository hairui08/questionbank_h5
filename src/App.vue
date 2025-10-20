<template>
  <div v-if="isHome" class="home-page">
    <header class="home-header">
      <div class="header-bar">
        <span class="header-title">小学教师资格证</span>
      </div>

      <div class="subject-tabs">
        <button
          v-for="subject in subjects"
          :key="subject.id"
          class="subject-tab"
          :class="{ active: subject.id === activeSubjectId }"
          type="button"
          @click="selectSubject(subject.id)"
        >
          {{ subject.label }}
        </button>
        <img
          class="subject-select-icon"
          src="@/assets/bool/select-subject.png"
          alt="选择科目"
        />
      </div>

      <div class="stats-card">
        <div class="stat-block">
          <span class="stat-value">{{ stats.leftDays }}</span>
          <span class="stat-label">距离考试天数</span>
        </div>
        <div class="stats-progress">
          <div class="stats-progress-gauge">
            <svg class="stats-progress-svg" viewBox="0 0 100 50" fill="none">
              <defs>
                <linearGradient
                  id="statsGaugeGradient"
                  x1="0%"
                  y1="100%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stop-color="#31d0c3" />
                  <stop offset="100%" stop-color="#33c7a6" />
                </linearGradient>
              </defs>
              <path
                class="stats-gauge-track"
                d="M5 50 A45 45 0 0 1 95 50"
              />
              <path
                class="stats-gauge-fill"
                d="M5 50 A45 45 0 0 1 95 50"
                :style="{
                  'stroke-dasharray': semicircleStrokeLength,
                  'stroke-dashoffset': progressDashOffset
                }"
              />
            </svg>
            <span class="progress-value">{{ correctPercentText }}</span>
          </div>
          <span class="progress-label">正确率</span>
        </div>
        <div class="stat-block">
          <span class="stat-value">{{ stats.finishedCount }}</span>
          <span class="stat-label">做题总数</span>
        </div>
      </div>

      <div class="stage-module">
        <div class="quick-grid">
          <button
            v-for="action in quickPrimaryActions"
            :key="action.id"
            class="quick-action"
            type="button"
            :style="getActionStyle(action)"
            @click="handleQuickAction(action)"
          >
            <span class="action-icon">
              <img
                v-if="isImageSource(action.short)"
                :src="action.short"
                alt=""
                class="action-icon-image"
              />
              <span v-else>{{ action.short }}</span>
            </span>
            <span class="action-label">{{ action.label }}</span>
          </button>
        </div>
      </div>
    </header>

    <main class="home-content">
      <div class="div_application">
          <button
            v-for="action in quickSecondaryActions"
            :key="action.id"
            class="quick-action"
            type="button"
            :style="getActionStyle(action)"
            @click="handleQuickAction(action)"
          >
            <span class="action-icon">
              <img
                v-if="isImageSource(action.short)"
                :src="action.short"
                alt=""
                class="action-icon-image"
              />
              <span v-else>{{ action.short }}</span>
            </span>
            <span class="action-label">{{ action.label }}</span>
          </button>
      </div>

      <div class="chapter_modlue">
        <div class="section-header">
          <div>
            <div class="section-title">章节练习</div>
            <div class="section-subtitle">针对性巩固 知识点全覆盖</div>
          </div>
          <button class="section-more" type="button">更多</button>
        </div>
        <div class="chapter-list">
          <article
            v-for="(chapter, index) in chapterExercises"
            :key="chapter.id"
            class="chapter-card-item"
          >
            <div
              class="chapter-node-row chapter-node-row--root chapter-node-row--depth-0"
              :class="{
                'is-collapsible': hasChildren(chapter),
                'has-children': hasChildren(chapter),
                'is-expanded': hasChildren(chapter) && isNodeExpanded(chapter.id),
              }"
              @click="onNodeRowClick(chapter)"
            >
              <div
                class="chapter-node-leading chapter-node-leading--root"
                :class="{
                  'is-expanded': hasChildren(chapter) && isNodeExpanded(chapter.id),
                  'has-children': hasChildren(chapter),
                  'is-last': index === chapterExercises.length - 1,
                }"
              >
                <button
                  v-if="hasChildren(chapter)"
                  :class="[
                    'chapter-toggle',
                    { 'is-expanded': isNodeExpanded(chapter.id) },
                  ]"
                  type="button"
                  :aria-expanded="isNodeExpanded(chapter.id)"
                  :aria-label="isNodeExpanded(chapter.id) ? '收起章节' : '展开章节'"
                  @click.stop="toggleChapter(chapter.id)"
                />
                <span v-else class="chapter-leaf" />
              </div>
              <div
                class="chapter-node-info"
                :class="[
                  'chapter-node-info--level-0',
                  { 'with-divider': hasChildren(chapter) },
                ]"
              >
                <div class="chapter-module">
                  <div class="chapter-node-title">{{ chapter.title }}</div>
                  <div class="chapter-node-count">共{{ chapter.count }}题</div>
                </div>
                <button class="chapter-action" type="button" @click.stop="goChapter">去做题</button>
              </div>
    
               
            </div>
            <transition name="chapter-collapse">
              <ChapterTreeBranch
                v-if="hasChildren(chapter) && isNodeExpanded(chapter.id)"
                :nodes="chapter.children || []"
                :depth="1"
              />
            </transition>
          </article>
        </div>
      </div>
    </main>

    <nav class="home-tabbar">
      <button
        v-for="item in tabbarItems"
        :key="item.id"
        class="tabbar-button"
        :class="{ active: item.id === activeTabbarId }"
        type="button"
      >
        <span class="tab-icon">
          <img
            v-if="item.isImage"
            :src="item.icon"
            :alt="item.label"
            class="tab-icon-image"
          />
          <template v-else>
            {{ item.icon }}
          </template>
        </span>
        <span class="tab-label">{{ item.label }}</span>
      </button>
    </nav>
  </div>
  <router-view v-else class="page-container" />
</template>

<script setup lang="ts">
import { computed, defineComponent, h, PropType, ref } from "vue";
import type { Component } from "vue";
import { useRoute, useRouter } from "vue-router";
import iconLive from "./assets/icon_live.png";
import iconStudy from "./assets/icon_study.png";
import iconQuestion from "./assets/icon_question.png";
import iconMine from "./assets/icon_mine.png";
import stageRuXueIcon from "./assets/stage/ruxue.png";
import stageZhangJieIcon from "./assets/stage/zhangjie.png";
import stageLiNianIcon from "./assets/stage/linian.png";
import stageJieDuanIcon from "./assets/stage/jieduan.png";
import stageMoNiIcon from "./assets/stage/moni.png";
import quickCuoTiIcon from "./assets/application/cuoti.png";
import quickShouCangIcon from "./assets/application/shoucang.png";
import quickJiLuIcon from "./assets/application/jilu.png";

interface QuickAction {
  id: string;
  label: string;
  short: string;
  accent?: {
    start: string;
    end: string;
    text: string;
  };
  target?: "answer" | "analysis" | "wrong" | "collect" | "records";
}

interface ChapterNode {
  id: string;
  title: string;
  count: number;
  children?: ChapterNode[];
}

const route = useRoute();
const router = useRouter();

const isHome = computed(() => route.name === "home");

const subjects = [
  { id: "subject-1", label: "科目一" },
  { id: "subject-2", label: "科目二" },
  { id: "subject-3", label: "科目三" },
  { id: "subject-4", label: "科目四" },
  { id: "subject-5", label: "科目五" },
];
const activeSubjectId = ref(subjects[0].id);

const stats = {
  leftDays: 100,
  correctRate: 0.585,
  finishedCount: 100,
};

const correctPercentText = computed(() => `${(stats.correctRate * 100).toFixed(1)}%`);
const SEMICIRCLE_RADIUS = 45;
const SEMICIRCLE_LENGTH = Math.PI * SEMICIRCLE_RADIUS;
const semicircleStrokeLength = `${SEMICIRCLE_LENGTH.toFixed(3)} ${SEMICIRCLE_LENGTH.toFixed(3)}`;
const progressDashOffset = computed(() => {
  const rate = Math.min(Math.max(stats.correctRate, 0), 1);
  return `${(SEMICIRCLE_LENGTH * (1 - rate)).toFixed(3)}`;
});

function selectSubject(subjectId: string) {
  activeSubjectId.value = subjectId;
}

const isImageSource = (value: string) =>
  /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(value);

const quickPrimaryActions: QuickAction[] = [
  {
    id: "entrance",
    label: "入学测试",
    short: stageRuXueIcon,
    accent: { start: "#ffe2db", end: "#ffd4d3", text: "#ff6b63" },
    target: "answer",
  },
  {
    id: "chapter",
    label: "章节练习",
    short: stageZhangJieIcon,
    accent: { start: "#ffe8d0", end: "#ffdcb4", text: "#ff8b3a" },
    target: "answer",
  },
  {
    id: "history",
    label: "历年真题",
    short: stageLiNianIcon,
    accent: { start: "#dff3ff", end: "#cfe8ff", text: "#1d78ff" },
    target: "answer",
  },
  {
    id: "stage",
    label: "阶段测试",
    short: stageJieDuanIcon,
    accent: { start: "#e0f8f2", end: "#cef1e6", text: "#15b887" },
    target: "answer",
  }
];

const quickSecondaryActions: QuickAction[] = [
  {
    id: "wrong",
    label: "错题集",
    short: quickCuoTiIcon,
    accent: { start: "#ffe8e1", end: "#ffd4cb", text: "#ff6d5c" },
    target: "wrong",
  },
  {
    id: "collect",
    label: "收藏夹",
    short: quickShouCangIcon,
    accent: { start: "#e0f1ff", end: "#d0e5ff", text: "#2572ff" },
    target: "collect",
  },
  {
    id: "record",
    label: "做题记录",
    short: quickJiLuIcon,
    accent: { start: "#e6fbef", end: "#d6f3e3", text: "#2bb77b" },
    target: "records",
  },
];

const chapterExercises: ChapterNode[] = [
  {
    id: "chapter-1",
    title: "第一章 职业理念",
    count: 300,
    children: [
      {
        id: "chapter-1-1",
        title: "职业理念 基础",
        count: 50,
        children: [
          {
            id: "chapter-1-1-1",
            title: "第一节 教育的起源",
            count: 150,
          },
        ],
      },
    ],
  },
  {
    id: "chapter-2",
    title: "第一章 职业理念",
    count: 300,
    children: [
      {
        id: "chapter-2-1",
        title: "职业理念 基础",
        count: 50,
        children: [
          {
            id: "chapter-2-1-1",
            title: "第一节 教育的起源",
            count: 150,
          },
        ],
      },
    ],
  },
  {
    id: "chapter-3",
    title: "第一章 职业理念",
    count: 300,
    children: [
      {
        id: "chapter-3-1",
        title: "职业理念 基础",
        count: 50,
        children: [
          {
            id: "chapter-3-1-1",
            title: "第一节 教育的起源",
            count: 150,
          },
        ],
      },
    ],
  },
];

const expandedChapterIds = ref(new Set<string>(["chapter-1", "chapter-1-1"]));

function hasChildren(node: ChapterNode): node is ChapterNode & { children: ChapterNode[] } {
  return Array.isArray(node.children) && node.children.length > 0;
}

function isNodeExpanded(nodeId: string) {
  return expandedChapterIds.value.has(nodeId);
}

function toggleChapter(nodeId: string) {
  const next = new Set(expandedChapterIds.value);

  if (next.has(nodeId)) {
    next.delete(nodeId);
  } else {
    next.add(nodeId);
  }

  expandedChapterIds.value = next;
}

function onNodeRowClick(node: ChapterNode) {
  if (hasChildren(node)) {
    toggleChapter(node.id);
  }
}

const ChapterTreeBranch: Component = defineComponent({
  name: "ChapterTreeBranch",
  props: {
    nodes: {
      type: Array as PropType<ChapterNode[]>,
      required: true,
    },
    depth: {
      type: Number,
      default: 1,
    },
  },
  setup(props) {
    return () =>
      h(
        "div",
        {
          class: ["chapter-children", `chapter-children--depth-${props.depth}`],
        },
        props.nodes.map((node, index) => {
          const isLast = index === props.nodes.length - 1;
          const hasChild = hasChildren(node);
          const expanded = hasChild && isNodeExpanded(node.id);
          const nested = hasChild ? node.children ?? [] : [];

          return h(
            "div",
            {
              key: node.id,
              class: [
                "chapter-branch",
                { "is-last": isLast, [`chapter-branch--depth-${props.depth}`]: true },
              ],
            },
            [
              h(
                "div",
                {
                  class: [
                    "chapter-node-row",
                    "chapter-node-row--nested",
                    `chapter-node-row--depth-${props.depth}`,
                    {
                      "is-collapsible": hasChild,
                      "has-children": hasChild,
                      "is-expanded": expanded,
                    },
                  ],
                  onClick: () => onNodeRowClick(node),
                },
                [
                  h(
                    "div",
                    {
                      class: [
                        "chapter-node-leading",
                        "chapter-node-leading--nested",
                        {
                          "is-expanded": expanded,
                          "has-children": hasChild,
                          "is-last": isLast,
                          [`chapter-node-leading--depth-${props.depth}`]: true,
                        },
                      ],
                    },
                    hasChild
                      ? [
                          h("button", {
                            class: ["chapter-toggle", { "is-expanded": expanded }],
                            type: "button",
                            "aria-expanded": expanded,
                            "aria-label": expanded ? "收起章节" : "展开章节",
                            onClick: (event: MouseEvent) => {
                              event.stopPropagation();
                              toggleChapter(node.id);
                            },
                          }),
                        ]
                      : [h("span", { class: "chapter-leaf" })]
                  ),
                  h(
                    "div",
                    {
                      class: [
                        "chapter-node-info",
                        `chapter-node-info--level-${props.depth}`,
                        { "with-divider": hasChild },
                      ],
                    },
                    [
                      h("div", { class: "chapter-module" }, [
                        h("div", { class: "chapter-node-title" }, node.title),
                        h("div", { class: "chapter-node-count" }, `共${node.count}题`),
                      ]),
                      h(
                        "button",
                        {
                          class: "chapter-action",
                          type: "button",
                          onClick: (event: MouseEvent) => {
                            event.stopPropagation();
                            goChapter();
                          },
                        },
                        "去做题"
                      ),
                    ]
                  ),
                ]
              ),
              expanded
                ? h(ChapterTreeBranch, {
                    nodes: nested,
                    depth: props.depth + 1,
                  })
                : null,
            ]
          );
        })
      );
  },
});

const tabbarItems = [
  { id: "tab-live", label: "直播", icon: iconLive, isImage: true },
  { id: "tab-study", label: "学习", icon: iconStudy, isImage: true },
  { id: "tab-answer", label: "题库", icon: iconQuestion, isImage: true },
  { id: "tab-me", label: "我的", icon: iconMine, isImage: true  },
];

const activeTabbarId = ref(tabbarItems[2].id);

function getActionStyle(action: QuickAction) {
  if (!action.accent) {
    return {};
  }

  return {
    "--action-start": action.accent.start,
    "--action-end": action.accent.end,
    "--action-text": action.accent.text,
  };
}

function handleQuickAction(action: QuickAction) {
  if (action.target === "answer") {
    goAnswer();
    return;
  }

  if (action.target === "analysis") {
    goAnalysis();
    return;
  }

  if (action.target === "wrong") {
    goWrong();
    return;
  }

  if (action.target === "collect") {
    goCollect();
    return;
  }

  if (action.target === "records") {
    goRecord();
  }
}

function goChapter() {
  router.push({ name: "chapter" });
}

function goAnswer() {
  router.push({ name: "answer" });
}

function goAnalysis() {
  router.push({ name: "analysis" });
}

function goWrong() {
  router.push({ name: "wronglist" });
}

function goCollect() {
  router.push({ name: "collectlist" });
}

function goRecord() {
  router.push({ name: "examresult" });
}
</script>

<style>
body{
  background: rgba(250, 250, 250, 1);
}
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f6fb;
  color: #1f1f1f;
}

.home-header {
  background: #ffffff;
  padding: 16px 20px 24px;
}

.header-bar {
  display: flex;
  justify-content: center;
  align-items: center;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.header-menu {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 12px;
  border: none;
  background: #f5f7fb;
  gap: 4px;
  cursor: pointer;
}

.menu-dot {
  width: 4px;
  height: 4px;
  background: #bfbfbf;
  border-radius: 50%;
}

.subject-tabs {
  position: relative;
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding-right: 56px;
}

.subject-select-icon {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  pointer-events: none;
}

.subject-tab {
  position: relative;
  border: none;
  background: none;
  font-size: 15px;
  color: #8c8c8c;
  padding: 6px 0;
  cursor: pointer;
}

.subject-tab.active {
  color: #ff4d4f;
  font-weight: 600;
}

.subject-tab.active::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -4px;
  height: 3px;
  border-radius: 2px;
  background: #ff4d4f;
}

.stats-card {
  margin-top: 26px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding: 24px 32px;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(31, 35, 53, 0.08);
}

.stat-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 96px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #1f2335;
}

.stat-label {
  font-size: 13px;
  color: #8c8c8c;
}

.stats-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats-progress-gauge {
  position: relative;
  width: 100px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-progress-svg {
  width: 132px;
  height: 72px;
}

.stats-gauge-track,
.stats-gauge-fill {
  fill: none;
  stroke-width: 7;
  stroke-linecap: round;
}

.stats-gauge-track {
  stroke: #f0f2f5;
}

.stats-gauge-fill {
  stroke: url(#statsGaugeGradient);
  transition: stroke-dashoffset 0.3s ease;
}

.progress-value {
  position: absolute;
  top: 68%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  font-weight: 600;
  color: #1f2335;
}

.progress-label {
  font-size: 13px;
  color: #8c8c8c;
}

.home-content {
  flex: 1;
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.div_application{
  display: flex;
  justify-content:space-around;
  background: #fff;
  padding: 10px 0;
}

.chapter_modlue{
  padding: 10px 15px 6px;
}

.card {
  background: #ffffff;
  border-radius: 18px;
  padding: 18px 20px;
  box-shadow: 0 18px 40px rgba(31, 35, 53, 0.08);
}

.quick-card.secondary {
  padding-top: 10px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.section-subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: #9aa1af;
}

.quick-grid {
  margin-top: 22px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(72px, 1fr));
  gap: 16px;
}

.quick-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: #4a4a4a;
  padding: 4px 0;
}

.action-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
}

.action-icon-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: inherit;
  display: block;
}

.action-label {
  font-size: 14px;
  color: #404040;
}

.section-header {
  padding: 0 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-more {
  border: none;
  background: none;
  color: #8c8c8c;
  font-size: 13px;
  cursor: pointer;
}

.chapter-card {
  padding-bottom: 12px;
  --tree-row-height: 56px;
  --tree-line-color: #e8ebf2;
  --tree-branch-gap: 8px;
  --tree-stem-gap: 20px;
}

.chapter-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chapter-card-item {
  border-radius: 16px;
  border: 1px solid #f0f2f5;
  background: rgba(255, 255, 255, 0.98);
  padding: 16px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.chapter-node-row {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 6px 0;
  cursor: default;
  user-select: none;
  --tree-icon-offset: 0px;
}

.chapter-node-row.is-collapsible {
  cursor: pointer;
}

.chapter-node-row--root {
  align-items: center;
  padding-bottom: 8px;
}

.chapter-node-row--nested {
  --tree-row-height: 46px;
  padding: 8px 0;
}

/* Precomputed offsets keep toggle icons sharing a single vertical column */
.chapter-node-row--depth-1 {
  --tree-icon-offset: 66px;
}

.chapter-node-row--depth-2 {
  --tree-icon-offset: 138px;
}

.chapter-node-row--depth-3 {
  --tree-icon-offset: 222px;
}

.chapter-node-row--root.has-children .chapter-node-info.with-divider {
  padding-bottom: 12px;
  margin-bottom: 6px;
}

.chapter-node-row--nested.has-children .chapter-node-info.with-divider {
  padding-bottom: 10px;
  margin-bottom: 6px;
}

.chapter-node-info {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
}

.chapter-module{
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chapter-node-title {
  color: #303133;
}

.chapter-node-count {
  color: #a0a6b0;
}

.chapter-node-info--level-0 .chapter-node-title {
  font-size: 15px;
  font-weight: 600;
}

.chapter-node-info--level-0 .chapter-node-count {
  font-size: 12px;
}

.chapter-node-info--level-1 .chapter-node-title {
  font-size: 14px;
  font-weight: 500;
}

.chapter-node-info--level-1 .chapter-node-count {
  font-size: 12px;
}

.chapter-node-info--level-2 .chapter-node-title {
  font-size: 13px;
  font-weight: 500;
}

.chapter-node-info--level-2 .chapter-node-count {
  font-size: 11px;
}

.chapter-node-leading {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 36px;
  flex: none;
  margin-left: calc(-1 * var(--tree-icon-offset, 0px));
  z-index: 1;
  --tree-connector-center: 12px;
}

.chapter-node-leading::before,
.chapter-node-leading::after {
  content: "";
  position: absolute;
  left: var(--tree-connector-center);
  width: 1px;
  background: var(--tree-line-color);
  transform: translateX(-0.5px);
  pointer-events: none;
  opacity: 1;
  z-index: 0;
}

.chapter-node-leading::before {
  top: calc(-1 * var(--tree-stem-gap));
  bottom: 50%;
}

.chapter-node-leading::after {
  top: 50%;
  bottom: calc(-1 * var(--tree-stem-gap));
}

.chapter-node-leading--root::before {
  opacity: 0;
}

.chapter-node-leading.is-last::after {
  opacity: 0;
}

.chapter-node-leading.has-children.is-expanded::after {
  opacity: 1;
}

.chapter-node-row--depth-0 .chapter-node-leading::after {
  opacity: 0;
}

.chapter-node-row--depth-0 .chapter-node-leading.has-children.is-expanded::after {
  opacity: 1;
}

.chapter-node-leading--root {
  margin-left: 0;
  --tree-connector-center: 16px;
}

.chapter-node-leading--nested {
  padding-left: 0;
  width: 36px;
}

.chapter-toggle,
.chapter-leaf {
  flex: none;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.chapter-node-leading--root .chapter-toggle,
.chapter-node-leading--root .chapter-leaf {
  width: 32px;
  height: 32px;
  border-radius: 10px;
}

.chapter-node-leading--depth-1 .chapter-toggle,
.chapter-node-leading--depth-1 .chapter-leaf {
  width: 24px;
  height: 24px;
  border-radius: 6px;
}

.chapter-node-leading--depth-2 .chapter-toggle,
.chapter-node-leading--depth-2 .chapter-leaf {
  width: 18px;
  height: 18px;
  border-radius: 4px;
}

.chapter-node-leading--depth-2,
.chapter-node-leading--depth-3,
.chapter-node-leading--depth-4,
.chapter-node-leading--depth-5 {
  --tree-connector-center: 9px;
}

.chapter-toggle {
  position: relative;
  border: 1px solid #dde0e6;
  background: #ffffff;
  transition: border-color 0.2s ease, background-color 0.2s ease;
  cursor: pointer;
  z-index: 1;
}

.chapter-node-leading--nested .chapter-leaf {
  border: 1px solid #ccd1db;
  background: #ffffff;
  position: relative;
  z-index: 1;
}

.chapter-toggle::before,
.chapter-toggle::after {
  content: "";
  position: absolute;
  border-radius: 1px;
  transition: opacity 0.2s ease;
}

.chapter-toggle::before {
  width: 12px;
  height: 2px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.chapter-toggle::after {
  width: 2px;
  height: 12px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.chapter-toggle.is-expanded::after {
  opacity: 0;
}

.chapter-toggle:hover {
  border-color: #ff6b63;
  background: rgba(255, 107, 99, 0.08);
}

.chapter-leaf {
  border-radius: 50%;
  border: 1px solid #ccd1db;
  position: relative;
  z-index: 1;
}

.chapter-action {
  border: none;
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: #ff6b63;
  background: linear-gradient(92deg, rgba(255, 109, 99, 0.16), rgba(255, 109, 99, 0.08));
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.chapter-action:hover {
  background: linear-gradient(92deg, rgba(255, 109, 99, 0.22), rgba(255, 109, 99, 0.12));
  transform: translateY(-1px);
}

.chapter-node-row--nested .chapter-action {
  align-self: flex-start;
  margin-top: 6px;
}

.chapter-children {
  position: relative;
  margin: 6px 0 0 24px;
  padding: 14px 0 0 40px;
  display: flex;
  flex-direction: column;
  gap: var(--tree-branch-gap);
}

.chapter-children::before {
  content: none;
}

.chapter-children--depth-1 {
  margin-left: 28px;
  padding-left: 42px;
}

.chapter-children--depth-2 {
  margin-left: 32px;
  padding-left: 44px;
}

.chapter-collapse-enter-active,
.chapter-collapse-leave-active {
  transition: all 0.2s ease;
}

.chapter-collapse-enter-from,
.chapter-collapse-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.home-tabbar {
  position: sticky;
  bottom: 0;
  padding-bottom: 8px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #ffffff;
  border-top: 1px solid #eef0f5;
  box-shadow: 0 -10px 26px rgba(31, 35, 53, 0.06);
  z-index: 999;
}

.tabbar-button {
  border: none;
  background: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  color: #8c8c8c;
  cursor: pointer;
}

.tabbar-button.active {
  color: #ff4d4f;
  font-weight: 600;
}

.tab-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: inherit;
  font-size: 14px;
}

.page-container {
  min-height: 100vh;
}

@media (max-width: 420px) {
  .stats-card {
    gap: 12px;
    padding: 16px;
  }

  .stat-block,
  .stats-progress {
    flex: 1 1 0;
    min-width: 0;
  }

  .stats-progress-gauge {
    width: 80px;
    height: 60px;
  }

  .stats-progress-svg {
    width: 80px;
    height: 60px;
  }

  .action-icon {
    width: 48px;
    height: 48px;
    border-radius: 16px;
  }
}
</style>


