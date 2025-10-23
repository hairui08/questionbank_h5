<template>
  <div
    v-if="paperReady"
    class="exam-page"
    :style="pageStyle"
  >
     <div class="exam-header">
      <div class="header-row">
        <div class="header-left">
          <button class="icon-button" type="button" @click="handleBack" aria-label="返回">
            <svg class="header-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <span class="paper-title">{{ paperTitle }}</span>
        </div>
        <div class="header-right">
          <button class="icon-button" type="button" @click="toggleSettings" aria-label="设置">
            <svg class="header-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="6" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="18" cy="12" r="2" />
            </svg>
          </button>
        </div>
      </div>
      <div class="header-row">
        <span class="test-type">{{ currentQuestionTypeName }}</span>
        <span class="test-progress">
          <span class="progress-current">{{ currentQuestionNumber }}</span>/<span class="progress-total">{{ totalQuestionCount }}</span>
        </span>
      </div>
    </div>

    <div
      v-if="currentQuestion"
      class="question-wrapper"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
    >
      <div class="question-content">
        <div class="question-text" v-if="hasRichText(currentQuestion.content)" v-html="currentQuestion.content" />
        <div class="question-text" v-else-if="hasRichText(currentQuestion.title)" v-html="currentQuestion.title" />

        <template v-if="isChoiceQuestion(currentQuestion)">
          <div class="option-list" :data-type="currentQuestion.newTestType">
            <div
              v-for="option in getRenderedOptions(currentQuestion)"
              :key="option.id ?? (currentQuestion.answerKey + '-' + option.label)"
              class="option-item interactive"
              :class="resolveOptionClasses(currentQuestion, option)"
            >
              <input
                class="option-input"
                :type="currentQuestion.newTestType === 2 ? 'checkbox' : 'radio'"
                :name="'q-' + currentQuestion.answerKey"
                disabled
              />
              <span class="option-label">{{ option.label }}</span>
              <div class="option-content" v-html="option.content || '&nbsp;'" />
            </div>
          </div>
        </template>

        <template v-else-if="isEssayQuestion(currentQuestion)">
          <div
            class="rich-answer readonly"
            v-html="getEssayAnswerHtml(currentQuestion)"
          />
        </template>

        <template v-else-if="isCombinationQuestion(currentQuestion)">
          <div class="combination-group">
            <div
              v-for="child in currentQuestion.children"
              :key="child.answerKey"
              class="combination-item"
            >
              <div class="combination-header">
                <div class="combination-title">
                  <span class="combination-index">{{ child.childOrderLabel || child.number }}</span>
                  <span class="combination-type">{{ getQuestionTypeLabel(child) }}</span>
                </div>
              </div>
              <div class="combination-text" v-if="hasRichText(child.content)" v-html="child.content" />
              <div class="combination-text" v-else-if="hasRichText(child.title)" v-html="child.title" />

              <template v-if="isChoiceQuestion(child)">
                <div class="option-list child" :data-type="child.newTestType">
                  <div
                    v-for="option in getRenderedOptions(child)"
                    :key="option.id ?? (child.answerKey + '-' + option.label)"
                    class="option-item"
                    :class="resolveOptionClasses(child, option)"
                  >
                    <input
                      class="option-input"
                      :type="child.newTestType === 2 ? 'checkbox' : 'radio'"
                      :name="'q-' + child.answerKey"
                      disabled
                    />
                    <span class="option-label">{{ option.label }}</span>
                    <div class="option-content" v-html="option.content || '&nbsp;'" />
                  </div>
                </div>
              </template>

              <template v-else-if="isEssayQuestion(child)">
                <div class="rich-answer child readonly" v-html="getEssayAnswerHtml(child)" />
              </template>

              <transition name="fade-slide">
                <div v-if="analysisVisible" class="combination-analysis">
                  <template v-if="isChoiceQuestion(child)">
                    <div class="analysis-answers">
                      <div class="analysis-title">答案</div>
                      <div class="analysis-row answers">
                        <span class="analysis-label">正确答案</span>
                        <span class="analysis-value correct">
                          {{ getAnswerFieldDisplay(child.answer) }}
                        </span>
                        <span class="analysis-label">我的答案</span>
                        <span class="analysis-value my" :class="{ empty: !isQuestionAnswered(child) }">
                          {{ getChoiceAnswerDisplay(child) }}
                        </span>
                      </div>
                    </div>

                    <div class="analysis-rich-panel">
                      <div class="analysis-subtitle">试题解析</div>
                      <div class="analysis-rich">
                        <span v-if="hasRichText(child.analytic)" v-html="child.analytic" />
                        <span v-else class="analysis-empty">暂无解析</span>
                      </div>
                    </div>
                  </template>

                  <template v-else-if="isEssayQuestion(child)">
                    <div class="analysis-block">
                      <div class="analysis-subtitle">我的答案</div>
                      <div v-if="hasEssayAnswer(child)" class="analysis-rich" v-html="getEssayAnswerHtml(child)" />
                      <div v-else class="analysis-empty">未作答</div>
                      <div class="analysis-subtitle">试题答案</div>
                      <div v-if="hasRichText(child.answer)" class="analysis-rich" v-html="child.answer" />
                      <div v-else class="analysis-empty">暂无标准答案</div>
                      <div class="analysis-subtitle">答案解析</div>
                      <div v-if="hasRichText(child.analytic)" class="analysis-rich" v-html="child.analytic" />
                      <div v-else class="analysis-empty">暂无解析</div>
                    </div>
                  </template>
                </div>
              </transition>
            </div>
          </div>
        </template>
      </div>

      <transition name="fade-slide">
        <div
          v-if="analysisVisible && currentQuestion && !isCombinationQuestion(currentQuestion)"
          class="analysis-panel"
        >
          <template v-if="isChoiceQuestion(currentQuestion)">
            <!-- 新的答案解析布局（单/多/判断） -->
            <div class="analysis-answers">
              <div class="analysis-title">答案</div>
              <div class="analysis-row answers">
                <span class="analysis-label">正确答案</span>
                <span class="analysis-value correct">
                  {{ getAnswerFieldDisplay(currentQuestion.answer) }}
                </span>
                <span class="analysis-label">我的答案</span>
                <span
                  class="analysis-value my"
                  :class="{ empty: !isQuestionAnswered(currentQuestion) }"
                >
                  {{ getChoiceAnswerDisplay(currentQuestion) }}
                </span>
              </div>
            </div>

            <div class="analysis-rich-panel">
              <div class="analysis-subtitle">试题解析</div>
              <div class="analysis-rich">
                <span v-if="hasRichText(currentQuestion.analytic)" v-html="currentQuestion.analytic" />
                <span v-else class="analysis-empty">暂无解析</span>
              </div>
            </div>
          </template>

          <template v-else-if="isEssayQuestion(currentQuestion)">
            <div class="analysis-block">
              <div class="analysis-subtitle">我的答案</div>
              <div v-if="hasEssayAnswer(currentQuestion)" class="analysis-rich" v-html="getEssayAnswerHtml(currentQuestion)" />
              <div v-else class="analysis-empty">未作答</div>
              <div class="analysis-subtitle">试题答案</div>
              <div v-if="hasRichText(currentQuestion.answer)" class="analysis-rich" v-html="currentQuestion.answer" />
              <div v-else class="analysis-empty">暂无标准答案</div>
              <div class="analysis-subtitle">答案解析</div>
              <div v-if="hasRichText(currentQuestion.analytic)" class="analysis-rich" v-html="currentQuestion.analytic" />
              <div v-else class="analysis-empty">暂无解析</div>
            </div>
          </template>

        </div>
      </transition>
    </div>

    <div class="bottom-actions">
      <button class="bottom-action" type="button" @click="answerCardOpen = true">
        <svg class="action-icon" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.8" />
          <circle cx="9" cy="8" r="1.6" fill="currentColor" />
          <circle cx="15" cy="8" r="1.6" fill="currentColor" />
          <circle cx="9" cy="12" r="1.6" fill="currentColor" />
          <circle cx="15" cy="12" r="1.6" fill="currentColor" />
          <circle cx="9" cy="16" r="1.6" fill="currentColor" />
          <circle cx="15" cy="16" r="1.6" fill="currentColor" />
        </svg>
        <span class="action-label">答题卡</span>
      </button>
      <button
        class="bottom-action"
        type="button"
        :class="{ active: currentCollectState }"
        @click="toggleCollect"
      >
        <svg class="action-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17.8 6.6 19.8l1-6.1-4.4-4.3 6.1-.9L12 3Z"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
          />
        </svg>
        <span class="action-label">{{ currentCollectState ? "已收藏" : "收藏" }}</span>
      </button>
    </div>

    <transition name="slide-top">
      <div v-if="settingsOpen" class="settings-panel" @click.stop>
        <div class="settings-row">
          <span class="settings-label">字体大小</span>
          <div class="settings-options">
            <button
              v-for="option in fontOptions"
              :key="option.label"
              class="settings-option"
              :class="{ active: fontScale === option.scale }"
              type="button"
              @click="selectFont(option)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>
    </transition>
    <div v-if="settingsOpen" class="settings-mask" @click="settingsOpen = false" />

    <transition name="slide-up">
      <div v-if="answerCardOpen" class="answer-card-sheet" @click.stop>
        <div class="sheet-header">
          <span>答题卡</span>
          <button class="icon-button" type="button" @click="answerCardOpen = false">关闭</button>
        </div>
        <div class="answer-card-groups">
          <section
            v-for="group in answerCardGroups"
            :key="group.typeName"
            class="answer-card-group"
          >
            <div class="card-group-title">{{ group.typeName }}</div>
            <div class="answer-card-grid">
              <button
                v-for="item in group.items"
                :key="item.question.answerKey"
                class="card-item"
                :class="{
                  done: isQuestionAnswered(item.question),
                  active: currentQuestion?.answerKey === item.question.answerKey
                }"
                type="button"
                @click="goToQuestion(item.index)"
              >
                {{ item.question.number }}
              </button>
            </div>
          </section>
        </div>
      </div>
    </transition>
    <div v-if="answerCardOpen" class="sheet-mask" @click="answerCardOpen = false" />

    <div v-if="submitConfirmOpen" class="dialog-mask" @click.self="submitConfirmOpen = false">
      <div class="dialog">
        <div class="dialog-title">提示</div>
        <div class="dialog-content">确定交卷吗？</div>
        <div class="dialog-actions">
          <button class="action-button" type="button" @click="submitConfirmOpen = false">取消</button>
          <button class="action-button primary" type="button" @click="handleSubmitConfirm">确定</button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="empty-state">暂无试卷数据</div>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import {
  formatSeconds,
  getQuestionTypeLabel,
  isChoiceQuestion,
  isCombinationQuestion,
  isEssayQuestion,
  normalizeExamPaper,
  normalizedPaper,
  parseAnswerTokens,
} from "../composables/useExamPaper";
import type { NormalizedOption, NormalizedQuestion } from "../composables/useExamPaper";

const fontOptions = [
  { label: "小", scale: 0.9 },
  { label: "中", scale: 1 },
  { label: "大", scale: 1.1 },
];
const FONT_STORAGE_KEY = "exam-font-scale";

const paper = normalizedPaper ?? normalizeExamPaper();
const topLevelQuestions = paper.questions;
const totalQuestionCount = paper.testNum;
const paperTitle = paper.title;

const fontScale = ref(fontOptions[1].scale);
const settingsOpen = ref(false);
const answerCardOpen = ref(false);
const submitConfirmOpen = ref(false);
const analysisVisible = ref(true);
const currentIndex = ref(0);

const pageStyle = computed(() => ({
  "--font-scale": String(fontScale.value),
}));

const currentQuestion = computed<NormalizedQuestion | null>(() => topLevelQuestions[currentIndex.value] ?? null);
const currentQuestionNumber = computed(() => currentQuestion.value?.number ?? 0);
const currentQuestionTypeName = computed(() => currentQuestion.value?.testTypeName ?? "");
const lastQuestionIndex = computed(() => Math.max(0, topLevelQuestions.length - 1));
const paperReady = computed(() => topLevelQuestions.length > 0);
const answerCardGroups = computed(() => {
  const groups: Array<{
    typeName: string;
    items: Array<{ question: NormalizedQuestion; index: number }>;
  }> = [];
  const groupIndexMap = new Map<string, number>();

  topLevelQuestions.forEach((question, index) => {
    const typeName = question.testTypeName || "其他";
    let groupIndex = groupIndexMap.get(typeName);

    if (groupIndex === undefined) {
      groupIndex = groups.length;
      groupIndexMap.set(typeName, groupIndex);
      groups.push({
        typeName,
        items: [],
      });
    }

    groups[groupIndex].items.push({ question, index });
  });

  return groups;
});

const collectedState = reactive<Record<string, boolean>>({});
topLevelQuestions.forEach((question) => {
  collectedState[question.answerKey] = question.isCollect;
});

const currentCollectState = computed(() => {
  const question = currentQuestion.value;
  if (!question) return false;
  return Boolean(collectedState[question.answerKey]);
});

watch(currentIndex, () => {
  analysisVisible.value = true;
});

watch(fontScale, (scale) => {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(FONT_STORAGE_KEY, String(scale));
  } catch (error) {
    console.warn("无法保存字体大小设置", error);
  }
});



onMounted(() => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(FONT_STORAGE_KEY);
      if (stored) {
        const numeric = Number(stored);
        const matched = fontOptions.find((option) => Math.abs(option.scale - numeric) < 0.001);
        if (matched) {
          fontScale.value = matched.scale;
        }
      }
    } catch (error) {
      console.warn("无法读取字体大小设置", error);
    }
  }
});

onBeforeUnmount(() => {});

function toggleSettings() {
  settingsOpen.value = !settingsOpen.value;
}

function selectFont(option: { label: string; scale: number }) {
  fontScale.value = option.scale;
  settingsOpen.value = false;
}

function goPrev() {
  if (currentIndex.value > 0) {
    currentIndex.value -= 1;
  }
}

function goNext() {
  if (currentIndex.value < topLevelQuestions.length - 1) {
    currentIndex.value += 1;
  }
}

function goToQuestion(index: number) {
  if (index < 0 || index >= topLevelQuestions.length) return;
  currentIndex.value = index;
  answerCardOpen.value = false;
}

function toggleCollect() {
  const question = currentQuestion.value;
  if (!question) return;
  collectedState[question.answerKey] = !collectedState[question.answerKey];
}

function toggleAnalysis() {
  if (!currentQuestion.value) return;
  analysisVisible.value = !analysisVisible.value;
}

function handleSubmitConfirm() {
  submitConfirmOpen.value = false;
  console.log("解析页面交卷确认", currentQuestion.value?.answerKey ?? "");
}

function handleBack() {
  if (typeof window !== "undefined" && window.history.length > 1) {
    window.history.back();
  }
}

const swipeMeta = reactive({
  startX: 0,
  startTime: 0,
});

function onTouchStart(event: TouchEvent) {
  if (event.touches.length === 0) return;
  const touch = event.touches[0];
  swipeMeta.startX = touch.clientX;
  swipeMeta.startTime = Date.now();
}

function onTouchEnd(event: TouchEvent) {
  if (event.changedTouches.length === 0) return;
  const deltaX = event.changedTouches[0].clientX - swipeMeta.startX;
  const deltaTime = Date.now() - swipeMeta.startTime;
  if (Math.abs(deltaX) > 50 && deltaTime < 600) {
    if (deltaX < 0) {
      goNext();
    } else {
      goPrev();
    }
  }
}

function onPointerDown(event: PointerEvent) {
  if (event.pointerType !== "mouse" || event.button !== 0) return;
  swipeMeta.startX = event.clientX;
  swipeMeta.startTime = Date.now();
}

function onPointerUp(event: PointerEvent) {
  if (event.pointerType !== "mouse") return;
  const deltaX = event.clientX - swipeMeta.startX;
  const deltaTime = Date.now() - swipeMeta.startTime;
  if (Math.abs(deltaX) > 50 && deltaTime < 600) {
    deltaX < 0 ? goNext() : goPrev();
  }
}

function resolveOptionClasses(question: NormalizedQuestion, option: NormalizedOption) {
  const correctSet = getCorrectAnswerSet(question);
  return {
    "is-answer": correctSet.has(option.label.toUpperCase()),
  };
}

function hasRichText(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

function getEssayAnswerHtml(question: NormalizedQuestion) {
  if (typeof question.myAnswerOriginal === "string" && question.myAnswerOriginal.trim().length > 0) {
    return question.myAnswerOriginal;
  }
  return "<span class=\"analysis-empty\">未作答</span>";
}

function hasEssayAnswer(question: NormalizedQuestion) {
  return typeof question.myAnswerOriginal === "string" && question.myAnswerOriginal.trim().length > 0;
}

function getChoiceAnswerDisplay(question: NormalizedQuestion) {
  if (!isChoiceQuestion(question)) return "";
  const tokens = parseAnswerTokens(question.myAnswerOriginal);
  return tokens.length ? tokens.join("，") : "未作答";
}

function getAnswerFieldDisplay(value: string) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : "暂无";
}

function isQuestionAnswered(question: NormalizedQuestion): boolean {
  if (isCombinationQuestion(question) && question.children.length > 0) {
    return question.children.every(isQuestionAnswered);
  }
  if (isChoiceQuestion(question)) {
    return parseAnswerTokens(question.myAnswerOriginal).length > 0;
  }
  if (question.newTestType === 4) {
    return typeof question.myAnswerOriginal === "string" && question.myAnswerOriginal.trim().length > 0;
  }
  return false;
}

function getUserAnswerSet(question: NormalizedQuestion) {
  const tokens = parseAnswerTokens(question.myAnswerOriginal);
  return new Set(tokens.map((item) => item.toUpperCase()));
}

function getRenderedOptions(question: NormalizedQuestion): NormalizedOption[] {
  if (question.newTestType === 3) {
    const tokens = parseAnswerTokens(question.answer).map((t) => t.toUpperCase());
    const isA = tokens.some((t) => ["A", "T", "TRUE", "1", "正确", "对", "是"].includes(t));
    const isB = tokens.some((t) => ["B", "F", "FALSE", "0", "错误", "错", "否"].includes(t));
    return [
      { id: `${question.answerKey}-A`, label: "A", content: "正确", isAnswer: isA },
      { id: `${question.answerKey}-B`, label: "B", content: "错误", isAnswer: isB },
    ];
  }
  return question.answerList;
}

function isOptionChecked(question: NormalizedQuestion, option: NormalizedOption) {
  const set = getUserAnswerSet(question);
  const label = option.label.toUpperCase();
  if (question.newTestType === 3) {
    const synonyms = label === "A"
      ? ["A", "T", "TRUE", "1", "正确", "对", "是"]
      : ["B", "F", "FALSE", "0", "错误", "错", "否"];
    return synonyms.some((s) => set.has(s.toUpperCase()));
  }
  return set.has(label);
}

function getCorrectAnswerSet(question: NormalizedQuestion) {
  if (!isChoiceQuestion(question)) return new Set<string>();
  const tokens = parseAnswerTokens(question.answer).map((t) => t.toUpperCase());

  // 判断题：将多种表达归一到 A/B 以便样式判断
  if (question.newTestType === 3) {
    const set = new Set<string>();
    if (tokens.some((t) => ["A", "T", "TRUE", "1", "正确", "对", "是"].includes(t))) {
      set.add("A");
    }
    if (tokens.some((t) => ["B", "F", "FALSE", "0", "错误", "错", "否"].includes(t))) {
      set.add("B");
    }
    return set;
  }

  if (tokens.length) {
    return new Set(tokens.map((token) => token.toUpperCase()));
  }
  return new Set(
    question.answerList
      .filter((option) => option.isAnswer)
      .map((option) => option.label.toUpperCase()),
  );
}
</script>
<style scoped>
.exam-page {
  position: relative;
  --font-scale: 1;
  font-size: calc(16px * var(--font-scale));
  min-height: 100vh;
  background: #f7f8fa;
  color: #1f1f1f;
  display: flex;
  flex-direction: column;
}

.exam-header {
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 30;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}

.header-row:last-child {
  margin-bottom: 0;
}

/* 仅针对 exam-header 内的两行设置固定高度 */
/* 仅针对 exam-header 内的两行设置固定高度 */
.exam-header .header-row:first-child {
  height: 54px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 12px 10px;
  border-bottom: 0.5px solid rgba(229, 229, 229, 1);
}
.exam-header .header-row:last-child {
  height: 34px;
  padding: 12px 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.paper-title {
  font-size: 1.05em;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.test-type {
  width: fit-content;
  padding: 4px 6px;
  font-size: 12px;
  font-weight: 400;
  border-radius: 3px;
  color: rgba(255, 255, 255, 1);
  background: rgba(251, 176, 58, 1);
}
.test-progress {
  color: rgba(56, 56, 56, 1);
}

.test-progress .progress-current {
  color: rgba(237, 77, 68, 1);
}

.test-progress .progress-total {
  color: rgba(56, 56, 56, 1);
}

.question-wrapper {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
   -webkit-overflow-scrolling: touch; /* iOS/移动端顺滑滚动 */
  scrollbar-width: none; /* Firefox 隐藏滚动条 */
  -ms-overflow-style: none; /* IE/Edge 旧版隐藏滚动条 */
}

.question-content {
  background: transparent;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: none;
}

.question-text,
.combination-text {
  font-size: 15px;
  color: rgba(56, 56, 56, 1);
}
.question-text :deep(p),
.combination-text :deep(p) {
  margin: 0 0 8px;
  font-size: 15px;
  color: rgba(56, 56, 56, 1);
  line-height: 1.5;
}

/* 选项列表容器 */
.option-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-list.child {
  margin-top: 8px;
}

/* 隐藏原生输入的视觉 */
.option-input {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  pointer-events: none;
}

/* 统一选项基础样式（保持原有未选中为白底深字） */
.option-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid rgba(210, 210, 210, 1);
  border-radius: 10px;
  background: #fff;
  color: rgba(56, 56, 56, 1);
}

/* 选中：绿色底、白色文字 */
.option-item.is-selected {
  background: rgba(7, 193, 96, 1);
  border-color: rgba(7, 193, 96, 1);
  color: rgba(255, 255, 255, 1);
}

/* is-answer：绿色底、白色文字；左侧标识变成白底绿色对号 */
.option-item.is-answer {
  background: rgba(7, 193, 96, 1);
  border-color: rgba(7, 193, 96, 1);
  color: rgba(255, 255, 255, 1);
}
.option-item.is-answer .option-content {
  color: rgba(255, 255, 255, 1);
}
.option-item.is-answer .option-label {
  position: relative;
  background: rgba(255, 255, 255, 1);
  border-color: rgba(255, 255, 255, 1);
  color: rgba(7, 193, 96, 1);
  font-size: 0; /* 隐藏原有 A/B/C/D 文本 */
}
.option-item.is-answer .option-label::before {
  content: "✓";
  color: rgba(7, 193, 96, 1);
  font-size: 12px;
  line-height: 20px;
  display: block;
  text-align: center;
}
.option-item.is-correct {
  background: #e6fffb;
  border-color: #13c2c2;
}
.option-item.is-wrong {
  background: #fff2f0;
  border-color: #ff7875;
}

/* 左侧字母标识：固定尺寸，不因内容变形 */
.option-label {
  box-sizing: border-box;
  flex: 0 0 auto;
  width: 20px;
  height: 20px;
  border: 1px solid rgba(180, 180, 180, 1);
  background: #fff;
  color: rgba(56, 56, 56, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 12px;
  border-radius: 50%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0;
}

/* 多选方形 */
.option-list[data-type="2"] .option-label {
  border-radius: 6px;
}

/* 选中时标识：白字，背景与边框跟随绿色，保证统一视觉 */
.option-item.is-selected .option-label {
  background: rgba(7, 193, 96, 1);
  color: rgba(255, 255, 255, 1);
  border-color: rgba(7, 193, 96, 1);
}

/* 选项内容在选中时也为白字 */
.option-item.is-selected .option-content {
  color: rgba(255, 255, 255, 1);
}
.option-list[data-type="2"] .option-item.is-selected .option-label::before {
  content: "✓";
  color: #07c160;
  font-size: 16px;
  line-height: 1;
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-content {
  font-size: 14px;
  color: rgba(56, 56, 56, 1);
}
/* 选项内容段落 */
.option-content :deep(p) {
  margin: 0;
  font-size: 14px;
  color: rgba(56, 56, 56, 1);
}

.rich-answer {
  min-height: 140px;
  border: 1px dashed #c6cad6;
  border-radius: 14px;
  padding: 12px;
  background: #fafafa;
  line-height: 1.5;
  overflow-y: auto;
}

.rich-answer.child {
  min-height: 100px;
}

.rich-answer.readonly {
  border: 1px solid #c6cad6;
  background: #ffffff;
}

.rich-answer :deep(p) {
  margin: 0 0 8px;
}

.combination-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.combination-item {
  border-radius: 12px;
  border: 1px solid #e5e6eb;
  padding: 12px;
  background: #fafbff;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.combination-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.92em;
  color: #4b5d7b;
}

.combination-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.combination-index {
  font-weight: 600;
}

.combination-type {
  background: #e6f4ff;
  color: #1677ff;
  padding: 2px 8px;
  border-radius: 12px;
}

.combination-analysis {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.analysis-panel {
  padding: 10px 16px 16px; 
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* 解析顶部“答案”灰底卡片 */
.analysis-answers {
  background: rgba(235, 235, 235, 1);
  border: 1px solid #edf0f5;
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.analysis-title {
  font-weight: 500;
  font-size: 15px;
  color: rgba(56, 56, 56, 1);
  display: flex;
  align-items: center;
  gap: 8px;
}
/* 同行展示 正确答案 / 我的答案 */
.analysis-row.answers {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.95em;
}
/* 颜色与强调 */
.analysis-value.correct {
  color: #07c160;
  font-weight: 600;
}
.analysis-value.my {
  color: #1f1f1f;
}
.analysis-value.my.empty {
  color: #ff4d4f;
}

/* 下方白底“试题解析”卡片 */
.analysis-rich-panel {
  background: #ffffff;
  border: 1px solid #edf0f5;
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.analysis-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.analysis-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 0.95em;
}

.analysis-label {
  color: #86909c;
}

.analysis-value {
  color: #1f1f1f;
}

.analysis-subtitle {
  font-weight: 500;
  font-size: 15px;
  color: rgba(56, 56, 56, 1);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.analysis-title::before,
.analysis-subtitle::before {
  content: "";
  display: inline-block;
  width: 1px;
  height: 10px;
  border: 1px solid rgba(166, 166, 166, 1);
  background: rgba(166, 166, 166, 1);
}

.analysis-rich {
  font-size: 14px;
  font-weight: 400;
  color: rgba(128, 128, 128, 1);
  line-height: 1.4;
}

.analysis-rich :deep(p) {
  margin: 0 0 6px;
}

.analysis-empty {
  color: #b0b7c3;
  font-size: 0.9em;
}

.bottom-actions {
  width: 420px;
  max-width: 100%;
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #ffffff;
  border-top: 1px solid #eeeeee;
  z-index: 10;
}

.bottom-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 65px;
  gap: 8px;
  margin: 12px 45px;
  color: #9aa0a6;
  background: transparent;
  border: none;
}

.bottom-action .action-icon {
  width: 28px;
  height: 28px;
  fill: none;
}

.bottom-action .action-label {
  font-size: 12px;
  line-height: 1;
}

.bottom-action.active {
  color: rgba(255, 82, 62, 1);
}

.action-button {
  flex: 1;
  border-radius: 24px;
  border: 1px solid #d9d9d9;
  background: #ffffff;
  padding: 10px 12px;
  font-size: 0.95em;
  color: #333333;
}

.action-button.primary {
  background: #1677ff;
  border-color: #1677ff;
  color: #ffffff;
}

.collect-icon {
  margin-right: 4px;
  font-size: 1.1em;
}

.icon-button {
  border: none;
  background: none;
  color: #1677ff;
  font-size: 0.95em;
}

.settings-panel {
  position: absolute;
  top: 54px;
  left: 0;
  right: 0;
  background: #fff;
  border-bottom: 1px solid #eee;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  padding: 12px 16px;
  z-index: 30;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.settings-label {
  font-size: 14px;
  color: #666;
}

.settings-options {
  display: flex;
  align-items: center;
  gap: 8px;
}

.settings-option {
  min-width: 40px;
    height: 28px;
    padding: 0 12px;
    border: 1px solid #ddd;
    border-radius: 14px;
    background: #f7f8fa;
    color: #666;
}

.settings-option.active {
  border-color: rgba(255, 82, 62, 1);
  background: #eef4ff;
  color: rgba(255, 82, 62, 1);
}

.settings-mask {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.18);
  z-index: 10;
  top:54px;
}

.sheet-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 30;
}

.answer-card-sheet {
  position: sticky;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ffffff;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 18px 16px 24px;
  z-index: 40;
  box-shadow: 0 -8px 24px rgba(15, 23, 42, 0.12);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.answer-card-groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.answer-card-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-group-title {
  font-weight: 600;
  color: #1f1f1f;
  font-size: 14px;
}

.answer-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
  gap: 12px;
}

.card-item {
  border-radius: 12px;
  border: 1px solid #d9d9d9;
  background: #ffffff;
  padding: 10px 0;
  color: #333333;
}

.card-item.done {
  border-color: #13c2c2;
  background: #e6fffb;
}

.card-item.active {
  border-color: #1677ff;
  background: #f0f5ff;
  color: #1677ff;
}

.dialog {
  width: 72vw;
  max-width: 480px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  overflow: hidden;
}

.dialog-title {
  padding: 14px 16px;
  border-bottom: 1px solid #eee;
  font-weight: 600;
  color: #333;
  text-align: center;
}

.dialog-content {
 padding: 16px;
  color: #333;
  text-align: center;
  line-height: 1.6;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 16px;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.slide-top-enter-active,
.slide-top-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.slide-top-enter-from,
.slide-top-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

.empty-state {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9aa5b5;
  font-size: 1em;
}

/* 同步 ExamAnswer.vue 的图标样式，确保圆点/箭头可见与随颜色变化 */
.header-icon {
  width: 22px;
  height: 22px;
  display: block;
  color: rgba(0, 0, 0, 1);
  stroke: currentColor;
  fill: currentColor !important;
}

/* 选中：绿色底白字（覆盖所有状态组合） */
.option-item.is-selected,
.option-item.is-selected.is-answer,
.option-item.is-selected.is-correct,
.option-item.is-selected.is-wrong {
  background: rgba(7, 193, 96, 1) !important;
  border-color: rgba(7, 193, 96, 1) !important;
  color: rgba(255, 255, 255, 1) !important;
}

.option-item.is-selected .option-label {
  background: rgba(7, 193, 96, 1) !important;
  border-color: rgba(7, 193, 96, 1) !important;
  color: rgba(255, 255, 255, 1) !important;
}

.option-item.is-selected .option-content {
  color: rgba(255, 255, 255, 1) !important;
}

/* 兜底：如果页面只设置了 input:checked 但没有 is-selected 类，也按选中样式处理 */
.option-item:has(.option-input:checked) {
  background: rgba(7, 193, 96, 1) !important;
  border-color: rgba(7, 193, 96, 1) !important;
  color: rgba(255, 255, 255, 1) !important;
}
.option-item:has(.option-input:checked) .option-label {
  background: rgba(7, 193, 96, 1) !important;
  border-color: rgba(7, 193, 96, 1) !important;
  color: rgba(255, 255, 255, 1) !important;
}
.option-item:has(.option-input:checked) .option-content {
  color: rgba(255, 255, 255, 1) !important;
}

</style>
