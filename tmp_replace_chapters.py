from pathlib import Path

path = Path("src/pages/WrongList.vue")
text = path.read_text(encoding="utf-8")
marker = "const chapters: Chapter[] = ["
start = text.find(marker)
if start == -1:
    raise SystemExit("chapters marker not found")
end = text.find("\n];", start)
if end == -1:
    end = text.find("];", start)
    if end == -1:
        raise SystemExit("chapters closing not found")
end += len("\n];") if text[end:end+3] == "\n];" else len("];")
replacement = """const chapters: Chapter[] = [\n  {\n    id: \"ch1\",\n    order: \"第一章\",\n    title: \"社会工作的内涵、原则及主要领域\",\n    wrongCount: 4,\n    sections: [\n      { id: \"ch1-sec1\", title: \"第一节 社会工作的内涵\", wrongCount: 2 },\n      { id: \"ch1-sec2\", title: \"第二节 社会工作的基本原则\", wrongCount: 1 },\n      { id: \"ch1-sec3\", title: \"第三节 社会工作的主要领域\", wrongCount: 1 },\n    ],\n  },\n  {\n    id: \"ch2\",\n    order: \"第二章\",\n    title: \"社会工作价值观与专业伦理\",\n    wrongCount: 1,\n    sections: [\n      { id: \"ch2-sec1\", title: \"第一节 社会工作价值观\", wrongCount: 1 },\n      { id: \"ch2-sec2\", title: \"第二节 社会工作伦理原则\", wrongCount: 0 },\n    ],\n  },\n  {\n    id: \"ch3\",\n    order: \"第三章\",\n    title: \"人类行为与社会环境\",\n    wrongCount: 5,\n    sections: [\n      { id: \"ch3-sec1\", title: \"第一节 人类行为基础\", wrongCount: 3 },\n      { id: \"ch3-sec2\", title: \"第二节 社会环境概述\", wrongCount: 2 },\n    ],\n  },\n  {\n    id: \"ch4\",\n    order: \"第四章\",\n    title: \"个案工作方法\",\n    wrongCount: 1,\n    sections: [\n      { id: \"ch4-sec1\", title: \"第一节 个案工作的过程\", wrongCount: 1 },\n      { id: \"ch4-sec2\", title: \"第二节 个案工作技巧\", wrongCount: 0 },\n    ],\n  },\n];"""
text = text[:start] + replacement + text[end:]
path.write_text(text, encoding="utf-8")
