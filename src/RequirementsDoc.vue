<template>
  <div class="doc">
    <!-- 题库首页 -->
    <template v-if="docKey === 'home'">
      <h1>题库首页需求文档</h1>
      <p class="doc-intro">{{ introText }}</p>
      <section class="section-card">
        <h2>业务需求</h2>
        <div class="subsection">
          <h3>核心目标</h3>
          <ul>
            <li>展示题库入口与分类导航。</li>
            <li>支持关键字搜索题目或章节。</li>
            <li>呈现最近练习和快速继续入口。</li>
            <li>入口引导至练习、答题、收藏与错题。</li>
          </ul>
        </div>
      </section>
      <FieldConstraintsSection />
      <section class="section-card">
        <h2>验收标准</h2>
        <table class="ac-table">
          <thead>
            <tr><th>测试编号</th><th>验收条件</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>AC-01</td>
              <td>Given 进入首页；When 输入关键字并搜索；Then 命中题目/章节并可跳转。</td>
            </tr>
            <tr>
              <td>AC-02</td>
              <td>Given 最近练习存在；When 点击继续；Then 进入对应练习进度。</td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>

    <!-- 试卷答题页 -->
    <template v-else-if="docKey === 'answer'">
      <h1>试卷答题页需求文档</h1>
      <p class="doc-intro">{{ introText }}</p>
      <section class="section-card">
        <h2>业务需求</h2>
        <div class="subsection">
          <h3>核心目标</h3>
          <ul>
            <li>题目分页与题号导航。</li>
            <li>支持单选/多选/判断/填空的作答交互。</li>
            <li>支持计时与交卷确认。</li>
            <li>作答进度与草稿本地缓存。</li>
          </ul>
        </div>
      </section>
      <FieldConstraintsSection />
      <section class="section-card">
        <h2>验收标准</h2>
        <table class="ac-table">
          <thead>
            <tr><th>测试编号</th><th>验收条件</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>AC-01</td>
              <td>Given 已作答部分；When 切换题号；Then 保留当前题作答状态。</td>
            </tr>
            <tr>
              <td>AC-02</td>
              <td>Given 计时开启；When 点击交卷并确认；Then 生成成绩与解析入口。</td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>

    <!-- 练习答题页 -->
    <template v-else-if="docKey === 'chapter'">
      <h1>练习答题页需求文档</h1>
      <p class="doc-intro">{{ introText }}</p>
      <section class="section-card">
        <h2>业务需求</h2>
        <div class="subsection">
          <h3>核心目标</h3>
          <ul>
            <li>按章节/知识点练习，支持顺序与随机。</li>
            <li>即时判分/延迟判分可配置。</li>
            <li>练习进度可保存并继续。</li>
            <li>支持错题再练与解析查看。</li>
          </ul>
        </div>
      </section>
      <FieldConstraintsSection />
      <section class="section-card">
        <h2>验收标准</h2>
        <table class="ac-table">
          <thead>
            <tr><th>测试编号</th><th>验收条件</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>AC-01</td>
              <td>Given 选择章节；When 开始练习；Then 按配置出题并记录进度。</td>
            </tr>
            <tr>
              <td>AC-02</td>
              <td>Given 练习中；When 查看解析；Then 展示答案与解析内容。</td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>

    <!-- 答题记录 -->
    <template v-else-if="docKey === 'examresult'">
      <h1>答题记录需求文档</h1>
      <p class="doc-intro">{{ introText }}</p>
      <section class="section-card">
        <h2>业务需求</h2>
        <div class="subsection">
          <h3>核心目标</h3>
          <ul>
            <li>展示历史成绩列表与统计。</li>
            <li>支持按时间/类型筛选。</li>
            <li>支持查看详情与解析入口。</li>
          </ul>
        </div>
      </section>
      <FieldConstraintsSection />
      <section class="section-card">
        <h2>验收标准</h2>
        <table class="ac-table">
          <thead>
            <tr><th>测试编号</th><th>验收条件</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>AC-01</td>
              <td>Given 有历史记录；When 筛选条件变化；Then 列表正确更新。</td>
            </tr>
            <tr>
              <td>AC-02</td>
              <td>Given 点击详情；When 进入详情页；Then 展示题目作答与解析入口。</td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>

    <!-- 答案解析 -->
    <template v-else-if="docKey === 'analysis'">
      <h1>答案解析需求文档</h1>
      <p class="doc-intro">{{ introText }}</p>
      <section class="section-card">
        <h2>业务需求</h2>
        <div class="subsection">
          <h3>核心目标</h3>
          <ul>
            <li>展示正确答案与解析说明。</li>
            <li>标注用户作答与差异。</li>
            <li>支持知识点跳转与再练。</li>
          </ul>
        </div>
      </section>
      <FieldConstraintsSection />
      <section class="section-card">
        <h2>验收标准</h2>
        <table class="ac-table">
          <thead>
            <tr><th>测试编号</th><th>验收条件</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>AC-01</td>
              <td>Given 选择题；When 查看解析；Then 展示正确选项与解析文字/图片。</td>
            </tr>
            <tr>
              <td>AC-02</td>
              <td>Given 用户答错；When 对比；Then 高亮差异并提供再练入口。</td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>

    <!-- 错题集 -->
    <template v-else-if="docKey === 'wronglist'">
      <h1>错题集需求文档</h1>
      <p class="doc-intro">{{ introText }}</p>
      <section class="section-card">
        <h2>业务需求</h2>
        <div class="subsection">
          <h3>核心目标</h3>
          <ul>
            <li>集中展示错题并支持筛选/分组。</li>
            <li>支持错题再练和移除（答对或手动）。</li>
            <li>支持标签管理与检索。</li>
          </ul>
        </div>
      </section>
      <FieldConstraintsSection />
      <section class="section-card">
        <h2>验收标准</h2>
        <table class="ac-table">
          <thead>
            <tr><th>测试编号</th><th>验收条件</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>AC-01</td>
              <td>Given 错题存在；When 选择再练；Then 进入练习并统计结果。</td>
            </tr>
            <tr>
              <td>AC-02</td>
              <td>Given 再练答对；When 完成；Then 自动移除或标记为已掌握。</td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>

    <!-- 收藏夹 -->
    <template v-else-if="docKey === 'collectlist'">
      <h1>收藏夹需求文档</h1>
      <p class="doc-intro">{{ introText }}</p>
      <section class="section-card">
        <h2>业务需求</h2>
        <div class="subsection">
          <h3>核心目标</h3>
          <ul>
            <li>展示收藏题目列表，支持分组与备注。</li>
            <li>支持快速练习与取消收藏。</li>
            <li>支持搜索与排序。</li>
          </ul>
        </div>
      </section>
      <FieldConstraintsSection />
      <section class="section-card">
        <h2>验收标准</h2>
        <table class="ac-table">
          <thead>
            <tr><th>测试编号</th><th>验收条件</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>AC-01</td>
              <td>Given 已收藏；When 搜索关键字；Then 命中题目并可进入练习。</td>
            </tr>
            <tr>
              <td>AC-02</td>
              <td>Given 点击取消收藏；When 确认；Then 列表即时更新。</td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>

    <!-- 默认：显示现有模型管理需求文档 -->
    <template v-else>
      <h1>模型管理需求文档</h1>
      <p class="doc-intro">详细描述模型的结构、业务约束和功能交互，确保模型管理模块满足目标用户的个性化使用需求。</p>
      <section class="section-card">
        <h2>业务需求</h2>
        <div class="subsection">
          <h3>核心目标</h3>
          <ul>
            <li>允许用户快速创建和配置模型。</li>
            <li>为不同角色提供不同视角和使用流程。</li>
            <li>支持模型模板下载与导入。</li>
            <li>保证相同数据源的一致性。</li>
            <li>提供界面与接口的标准化 CRUD 流程。</li>
          </ul>
        </div>
        <div class="subsection">
          <h3>用户需求</h3>
          <ul>
            <li>字段展示：支持“内部题库名称”“外部题库名称”“标签组”“排序号”“状态”等的必填/选填管理。</li>
            <li>操作流程：提供新增、编辑、预览、导入、导出等入口。</li>
            <li>校验与提示：包含长度范围、字符类型、唯一性与禁用提示。</li>
            <li>权限与检索：支持按名称/标签检索；禁用项不可编辑。</li>
          </ul>
        </div>
        <div class="subsection">
          <h3>核心概念</h3>
          <ul>
            <li>内部题库名称：系统内唯一标识，便于模块检索和关联。</li>
            <li>外部题库名称：与外部来源映射的显示名称，便于信息同步。</li>
            <li>标签组：用于分类检索与权限控制的标签集合。</li>
            <li>排序号：列表排序依据，数值越小越靠前。</li>
            <li>状态：active（启用）/ disabled（禁用），控制可编辑与展示。</li>
          </ul>
        </div>
      </section>

      <FieldConstraintsSection />

      <section class="section-card">
        <h2>验收标准</h2>
        <table class="ac-table">
          <thead>
            <tr><th>测试编号</th><th>验收条件</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>AC-01</td>
              <td>
                <p><span class="gherkin">Given</span> 用户已进入模型管理页</p>
                <p><span class="gherkin">When</span> 用户按规范填完所有必填字段并点击保存</p>
                <p><span class="gherkin">Then</span> 保存成功并呈现在列表；排序号生效；支持名称/标签检索；提供预览、外部映射、导出等功能。</p>
              </td>
            </tr>
            <tr>
              <td>AC-02</td>
              <td>
                <p><span class="gherkin">Given</span> 用户已将条目设为禁用</p>
                <p><span class="gherkin">When</span> 用户保存</p>
                <p><span class="gherkin">Then</span> 条目在列表标记为禁用且不可编辑；仅在启用后可继续修改。</p>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import FieldConstraintsSection from "./FieldConstraintsSection.vue";
const props = defineProps<{ docKey: string }>();
const introText = computed(() => {
  switch (props.docKey) {
    case "home": return "展示题库入口与分类导航，支持检索与继续练习等入口。";
    case "answer": return "支持试卷作答、题号导航、计时与交卷确认等流程。";
    case "chapter": return "按章节/知识点练习，支持顺序/随机与进度保存。";
    case "analysis": return "展示答案与解析，支持知识点跳转与再练。";
    case "wronglist": return "集中管理错题，支持筛选、再练与移除。";
    case "collectlist": return "管理收藏题目，支持分组、备注、搜素与练习入口。";
    case "examresult": return "查看历史成绩与详情解析，支持筛选统计。";
    default: return "详细描述模型的结构、业务约束和功能交互。";
  }
});
</script>

<style scoped>
.doc {
  margin: 0 auto;
  padding: 40px 48px 56px;
  background: #fff;
  border-radius: 20px;
  border: 1px solid #eef0f5;
  box-shadow: 0 18px 40px rgba(31, 35, 53, 0.08);
  line-height: 1.7;
  color: #2f3241;
}

h1 {
  margin: 0 0 24px;
  font-size: 26px;
  font-weight: 600;
  color: #1e2445;
  letter-spacing: 0.01em;
}

.doc-intro {
  margin: 0 0 32px;
  padding: 16px 20px;
  border-radius: 12px;
  border-left: 4px solid #5663ff;
  background: linear-gradient(90deg, rgba(82, 102, 255, 0.12) 0%, rgba(82, 102, 255, 0.02) 100%);
  color: #4a566d;
  line-height: 1.7;
}

.section-card {
  margin-bottom: 28px;
  padding: 28px 32px;
  background: #fff;
  border-radius: 18px;
  border: 1px solid #e4e8f5;
  box-shadow: 0 16px 32px rgba(31, 35, 53, 0.08);
}

.section-card h2 {
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: 600;
  color: #27315a;
  position: relative;
  padding-left: 16px;
}

.section-card h2::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  width: 6px;
  height: 22px;
  border-radius: 3px;
  background: linear-gradient(180deg, #4f46e5 0%, #4338ca 100%);
  transform: translateY(-50%);
}

.subsection {
  margin-top: 14px;
}

.subsection h3 {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 600;
  color: #36415f;
}

.subsection ul {
  margin: 0;
  padding-left: 22px;
  color: #505a74;
}

.subsection li {
  margin-bottom: 6px;
}

.ac-table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: inset 0 0 0 1px #f3d9e5;
}

.ac-table thead tr {
  background: linear-gradient(90deg, #b254ff 0%, #ff5c93 100%);
  color: #fff;
  letter-spacing: 0.02em;
}

.ac-table th {
  padding: 14px 18px;
  font-size: 14px;
  font-weight: 600;
  text-align: left;
}

.ac-table td {
  padding: 16px 18px;
  font-size: 13px;
  line-height: 1.7;
  color: #3e2f4f;
  background: #fff;
  border-bottom: 1px solid #f5e1ec;
  vertical-align: top;
}

.ac-table tbody tr:nth-child(even) td {
  background: #fff5f7;
}

.ac-table td:first-child {
  width: 18%;
  font-weight: 600;
  color: #7c2a70;
  background: rgba(236, 72, 153, 0.12);
  border-right: 1px solid #f5e1ec;
  white-space: nowrap;
}

.ac-table tbody tr:last-child td {
  border-bottom: none;
}

.ac-table td p {
  margin: 4px 0;
}

.gherkin {
  display: inline-block;
  min-width: 54px;
  padding: 2px 12px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.14);
  color: #1d4ed8;
  font-weight: 700;
  text-transform: capitalize;
  margin-right: 6px;
}

@media (max-width: 768px) {
  .doc {
    padding: 28px 20px 36px;
  }

  .section-card {
    padding: 24px 20px;
  }

  .fields-table th,
  .fields-table td,
  .ac-table th,
  .ac-table td {
    padding: 12px 14px;
  }
}
</style>
