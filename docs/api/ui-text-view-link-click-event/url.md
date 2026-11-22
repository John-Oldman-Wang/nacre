---
type: reference
native: UITextViewLinkClickEvent.url
---

# `UITextViewLinkClickEvent`：`url` 属性

**`url`** 属性是链接的地址。

## 值

字符串，是富文本里 `link` 属性写的那个地址。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 空串。

## 示例

```js
const terms = new UITextView();
terms.isEditable = false;
terms.attributedText = new NSAttributedString('阅读《用户协议》', { link: 'https://example.com/terms' });
terms.addEventListener('linkclick', (e) => {
  console.log(e.url);
});
```

**效果**：点 `《用户协议》`，输出 `https://example.com/terms`，然后系统打开这个网址。真实的点按**未在真机验证**。

## 对应的 iOS API

`textView:primaryActionForTextItem:defaultAction:` 里 `textItem.link`。

## 参见

- [`UITextViewLinkClickEvent`](../ui-text-view-link-click-event.md)
