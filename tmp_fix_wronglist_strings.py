from pathlib import Path

path = Path("src/pages/WrongList.vue")
text = path.read_text(encoding="utf-8")
replacements = {
    "''�����½�''": "'收起章节'",
    "''չ���½�''": "'展开章节'",
    "`${chapter.title}С���б�`": "`${chapter.title}小节列表`",
    "章节-sections\"\n            role\"": "章节-sections\"\n            role\"",  # placeholder
}
for old, new in replacements.items():
    text = text.replace(old, new)

text = text.replace('章节-sections"\n            role"', 'chapter-sections"\n            role"')
text = text.replace('章节-sections', 'chapter-sections')
text = text.replace('章节-section-list', 'chapter-section-list')
text = text.replace('章节-section-item', 'chapter-section-item')
text = text.replace('章节-section-bullet', 'chapter-section-bullet')
text = text.replace('章节-section-content', 'chapter-section-content')
text = text.replace('章节-section-title', 'chapter-section-title')
text = text.replace('章节-section-meta', 'chapter-section-meta')
text = text.replace('章节-section-actions', 'chapter-section-actions')
text = text.replace('错题 {{ section.wrongCount }}', '错题 {{ section.wrongCount }}')
text = text.replace('错题 {{ section.wrongCount }}', '错题 {{ section.wrongCount }}')
text = text.replace('>�鿴<', '>查看<')
text = text.replace('>����<', '>重做<')
text = text.replace('章节-section-meta">����', 'chapter-section-meta">错题')
text = text.replace('章节-sections', 'chapter-sections')
text = text.replace('������', '错题数')
path.write_text(text, encoding="utf-8")
