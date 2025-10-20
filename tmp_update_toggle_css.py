from pathlib import Path

path = Path("src/pages/WrongList.vue")
text = path.read_text(encoding="utf-8")
old = ".chapter-toggle {\n  width: 36px;\n  height: 36px;\n  border-radius: 50%;\n  border: 1px solid #ff6d5c;\n  background: #fff5f3;\n  color: #ff6d5c;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 22px;\n  line-height: 1;\n  font-weight: 500;\n  cursor: pointer;\n}\n"
new = ".chapter-toggle {\n  width: 36px;\n  height: 36px;\n  border-radius: 50%;\n  border: 1px solid #ff6d5c;\n  background: #fff5f3;\n  color: #ff6d5c;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  cursor: pointer;\n  transition: background 0.2s ease, color 0.2s ease;\n}\n\n.chapter-toggle:active {\n  background: #ff6d5c;\n  color: #fff;\n}\n\n.chapter-toggle-icon {\n  position: relative;\n  width: 16px;\n  height: 2px;\n  background: currentColor;\n  border-radius: 999px;\n  transition: transform 0.2s ease;\n}\n\n.chapter-toggle-icon::after {\n  content: \"\";\n  position: absolute;\n  left: 50%;\n  top: 50%;\n  width: 2px;\n  height: 16px;\n  background: currentColor;\n  border-radius: 999px;\n  transform: translate(-50%, -50%);\n  transition: opacity 0.2s ease;\n}\n\n.chapter-toggle-icon.expanded::after {\n  opacity: 0;\n}\n"
if old not in text:
    raise SystemExit('chapter-toggle block not found')
text = text.replace(old, new)
path.write_text(text, encoding="utf-8")
