from pathlib import Path

path = Path("src/pages/WrongList.vue")
text = path.read_text(encoding="utf-8")
insertion_point = text.find('.chapter-footer {')
if insertion_point == -1:
    raise SystemExit('chapter-footer block not found')
addition = """
.chapter-sections {
  margin: 8px 0 0 48px;
  padding: 12px 0 0 12px;
  border-left: 2px solid rgba(255, 109, 92, 0.18);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chapter-section-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chapter-section-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(255, 245, 243, 0.85);
  border: 1px solid rgba(255, 109, 92, 0.2);
}

.chapter-section-bullet {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ff6d5c;
  box-shadow: 0 0 0 4px rgba(255, 109, 92, 0.2);
}

.chapter-section-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chapter-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.chapter-section-meta {
  font-size: 12px;
  color: #ff6d5c;
  font-weight: 500;
}

.chapter-section-actions {
  display: flex;
  gap: 8px;
}

.mini-button {
  min-width: 60px;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid #ff6d5c;
  background: #fff;
  color: #ff6d5c;
  font-size: 12px;
  font-weight: 500;
}

.mini-button.primary {
  background: #ff6d5c;
  color: #fff;
}

.chapter-slide-enter-active,
.chapter-slide-leave-active {
  transition: all 0.2s ease;
}

.chapter-slide-enter-from,
.chapter-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

"""
text = text[:insertion_point] + addition + text[insertion_point:]
path.write_text(text, encoding="utf-8")
