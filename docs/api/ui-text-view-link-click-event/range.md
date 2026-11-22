---
type: reference
native: UITextViewLinkClickEvent.range
---

# `UITextViewLinkClickEvent`：`range` 属性

**`range`** 属性是链接在文字里的那一段。

## 值

[`NSRange`](../ns-range.md)。`location` 是起点，`length` 是长度，单位都是 UTF-16 码元，和 JS 字符串的下标一致。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
const terms = new UITextView();
terms.isEditable = false;
terms.attributedText = new NSAttributedString('阅读《用户协议》', { link: 'https://example.com/terms' });
terms.addEventListener('linkclick', (e) => {
  console.log(terms.text.slice(e.range.location, e.range.location + e.range.length));
});
```

**效果**：点链接，输出链接那一段文字 `阅读《用户协议》`。

## 对应的 iOS API

`textView:primaryActionForTextItem:defaultAction:` 里 `textItem.range`。

## 参见

- [`UITextViewLinkClickEvent`](../ui-text-view-link-click-event.md)
