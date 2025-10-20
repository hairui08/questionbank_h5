from pathlib import Path

path = Path("src/pages/WrongList.vue")
text = path.read_text(encoding="utf-8")
start_marker = "        <div class=\"chapter-main\">\n"
start = text.find(start_marker)
if start == -1:
    raise SystemExit("start marker not found")
footer_marker = "        <div class=\"chapter-footer\">\n"
footer = text.find(footer_marker, start)
if footer == -1:
    raise SystemExit("footer marker not found")
new_block = """        <div class=\"chapter-main\">\n          <button\n            type=\"button\"\n            class=\"chapter-toggle\"\n            :aria-label=\"isChapterExpanded(chapter.id) ? '收起章节' : '展开章节'\"\n            @click=\"toggleChapter(chapter.id)\"\n          >\n            <span class=\"chapter-toggle-icon\" :class=\"{ expanded: isChapterExpanded(chapter.id) }\" />\n          </button>\n          <div class=\"chapter-title\">\n            <span class=\"chapter-order\">{{ chapter.order }}</span>\n            <span class=\"chapter-name\">{{ chapter.title }}</span>\n          </div>\n        </div>\n        <transition name=\"chapter-slide\">\n          <div\n            v-if=\"isChapterExpanded(chapter.id) && chapter.sections?.length\"\n            class=\"chapter-sections\"\n            role=\"region\"\n            :aria-label=\"`${chapter.title}小节列表`\"\n          >\n            <ul class=\"chapter-section-list\">\n              <li\n                v-for=\"section in chapter.sections\"\n                :key=\"section.id\"\n                class=\"chapter-section-item\"\n              >\n                <div class=\"chapter-section-bullet\" />\n                <div class=\"chapter-section-content\">\n                  <div class=\"chapter-section-title\">{{ section.title }}</div>\n                  <div class=\"chapter-section-meta\">错题 {{ section.wrongCount }}</div>\n                </div>\n                <div class=\"chapter-section-actions\">\n                  <button type=\"button\" class=\"mini-button\" @click=\"handlePeriodAction('analysis', section.id)\">查看</button>\n                  <button type=\"button\" class=\"mini-button primary\" @click=\"handlePeriodAction('redo', section.id)\">重做</button>\n                </div>\n              </li>\n            </ul>\n          </div>\n        </transition>\n"""
text = text[:start] + new_block + text[footer:]
path.write_text(text, encoding="utf-8")
