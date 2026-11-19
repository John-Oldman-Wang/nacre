---
type: reference
native: NSTextContainer.lineFragmentPadding
---

# `NSTextContainer`：`lineFragmentPadding` 属性

**`lineFragmentPadding`** 属性是每一行文字左右各空出多少。

## 值

数，单位是 [pt](../units.md)。

- 可读，可写。
- 默认值是 `5`。
- 它加在 `UITextView` 的 [`textContainerInset`](../ui-text-view/textcontainerinset.md) 的左、右之上。要和别的视图左对齐时设成 `0`，左右的距离就只由 `textContainerInset` 决定。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const input = new UITextView();
input.textContainerInset = new UIEdgeInsets(12, 12, 12, 12);
input.textContainer.lineFragmentPadding = 0;
```

**效果**：文字离四边各 12 pt。

## 对应的 iOS API

`NSTextContainer.lineFragmentPadding`。

## 参见

- [`textContainerInset`](../ui-text-view/textcontainerinset.md)
