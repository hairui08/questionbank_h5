<template>
  <section class="section-card field-constraints">
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
          <td>功能页面标识</td>
          <td>枚举</td>
          <td>是</td>
          <td>
            <ul class="constraints">
              <li>取值范围：home、answer、chapter、analysis、wronglist、collectlist、examresult</li>
              <li>必须与路由名称保持一致，确保加载对应功能页面与需求文档</li>
              <li>用于判定展示的导航与内容区域</li>
              <li>默认值为 home，需保证在配置阶段即明确</li>
            </ul>
          </td>
        </tr>
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
</template>

<script setup lang="ts">
// purely presentational component
</script>

<style scoped>
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

.fields-table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: inset 0 0 0 1px #e4e8f5;
}

.fields-table thead tr {
  background: linear-gradient(90deg, #5b4cfe 0%, #7450fb 45%, #9759ff 100%);
  color: #fff;
  letter-spacing: 0.02em;
  text-align: left;
}

.fields-table th {
  padding: 14px 18px;
  font-size: 14px;
  font-weight: 600;
}

.fields-table td {
  padding: 16px 18px;
  font-size: 13px;
  line-height: 1.7;
  color: #3f4765;
  background: #fff;
  border-bottom: 1px solid #edf0f9;
  vertical-align: top;
}

.fields-table tbody tr:nth-child(even) td {
  background: #f7f8ff;
}

.fields-table th:first-child,
.fields-table td:first-child {
  width: 20%;
  font-weight: 600;
  color: #273070;
}

.fields-table th:nth-child(2),
.fields-table td:nth-child(2) {
  width: 12%;
}

.fields-table th:nth-child(3),
.fields-table td:nth-child(3) {
  width: 10%;
}

.fields-table th:nth-child(4),
.fields-table td:nth-child(4) {
  width: 58%;
}

.constraints {
  margin: 0;
  padding-left: 18px;
  color: #4f5874;
}

.constraints li {
  margin-bottom: 4px;
}

@media (max-width: 768px) {
  .section-card {
    padding: 24px 20px;
  }

  .fields-table th,
  .fields-table td {
    padding: 12px 14px;
  }
}
</style>
