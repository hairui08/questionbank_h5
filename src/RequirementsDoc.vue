<template>
  <div class="doc">
    <h1>模型管理需求文档</h1>
    <p>详细描述模型的结构、业务约束和功能交互，确保模型管理模块满足目标用户的个性化使用需求。</p>

    <!-- 业务需求 -->
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

    <!-- 字段约束（表格） -->
    <section class="section-card">
      <h2>字段约束</h2>
      <table class="fields-table">
        <thead>
          <tr>
            <th>字段名称</th>
            <th>类型</th>
            <th>必填</th>
            <th>约束说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>内部题库名称</td>
            <td>文本</td>
            <td>是</td>
            <td>
              <ul class="constraints">
                <li>长度：1–20 字符</li>
                <li>仅支持中文/英文、数字、下划线</li>
                <li>显示名称需唯一（忽略大小写）</li>
                <li>用于模块检索与关联展示</li>
              </ul>
            </td>
          </tr>
          <tr>
            <td>外部题库名称</td>
            <td>文本</td>
            <td>是</td>
            <td>
              <ul class="constraints">
                <li>长度：1–50 字符</li>
                <li>名称唯一（大小写不敏感）</li>
                <li>建议保持与外部来源一致</li>
                <li>用于内部与外部数据映射</li>
              </ul>
            </td>
          </tr>
          <tr>
            <td>标签组</td>
            <td>文本</td>
            <td>否</td>
            <td>
              <ul class="constraints">
                <li>长度：0–200 字符</li>
                <li>用于检索与权限控制</li>
                <li>支持多标签，逗号分隔</li>
                <li>支持字符不限</li>
              </ul>
            </td>
          </tr>
          <tr>
            <td>排序号</td>
            <td>数值</td>
            <td>是</td>
            <td>
              <ul class="constraints">
                <li>必须为正整数</li>
                <li>值越小越靠前</li>
                <li>用于同层级列表展示顺序</li>
              </ul>
            </td>
          </tr>
          <tr>
            <td>状态</td>
            <td>枚举</td>
            <td>是</td>
            <td>
              <ul class="constraints">
                <li>取值范围：active（启用）、disabled（禁用）</li>
                <li>禁用时不可编辑；启用时允许编辑</li>
                <li>禁用在管理界面不可选</li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- 验收标准（AC 场景） -->
    <section class="section-card">
      <h2>验收标准</h2>

      <table class="ac-table">
        <thead>
          <tr>
            <th>测试编号</th>
            <th>验收条件</th>
          </tr>
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
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.doc {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 20px;
  line-height: 1.6;
  margin: 0 auto;
}
h1 {
  font-size: 20px;
  margin: 0 0 12px;
}
h2 {
  font-size: 16px;
  margin: 18px 0 8px;
}

.section-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 16px;
}

.subsection {
  margin-top: 8px;
}
.subsection h3 {
  font-size: 14px;
  margin: 10px 0 6px;
  color: #333;
}

.fields-table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  overflow: hidden;
  border-radius: 12px;
}
.fields-table thead tr {
  background: linear-gradient(90deg, #6c63ff 0%, #9d8cff 100%);
  color: #fff;
}
.fields-table th, .fields-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #eef0f5;
  vertical-align: top;
  text-align: left;
  font-size: 13px;
  line-height: 1.6;
}
.fields-table th:first-child, .fields-table td:first-child { width: 18%; }
.fields-table th:nth-child(2), .fields-table td:nth-child(2) { width: 10%; }
.fields-table th:nth-child(3), .fields-table td:nth-child(3) { width: 8%; }
.fields-table th:nth-child(4), .fields-table td:nth-child(4) { width: 64%; }

.constraints {
  margin: 0;
  padding-left: 18px;
}

.ac-table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  overflow: hidden;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
}
.ac-table thead tr {
  background: linear-gradient(90deg, #ff6f91 0%, #f78da7 100%);
  color: #fff;
}
.ac-table th,
.ac-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #eef0f5;
  vertical-align: top;
  text-align: left;
  font-size: 13px;
  line-height: 1.6;
}
.ac-table th:first-child,
.ac-table td:first-child {
  width: 16%;
}
.ac-table td p {
  margin: 4px 0;
}
.gherkin {
  color: #1e88e5;
  font-weight: 600;
}
</style>