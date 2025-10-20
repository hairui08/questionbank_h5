from pathlib import Path

path = Path("src/pages/WrongList.vue")
text = path.read_text(encoding="utf-8")

text = text.replace("            <span class=\"meta-label\">错题�?/span>\n", "            <span class=\"meta-label\">错题数</span>\n")
text = text.replace("            <span class=\"meta-label\">������</span>\n", "            <span class=\"meta-label\">错题数</span>\n")

path.write_text(text, encoding="utf-8")
