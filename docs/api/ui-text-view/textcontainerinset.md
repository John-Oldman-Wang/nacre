---
type: reference
native: UITextView.textContainerInset
---

# `UITextView`：`textContainerInset` 属性

**`textContainerInset`** 属性决定文字离多行输入四边多远。

## 值

[`UIEdgeInsets`](../structs.md)，四个字段 `top`、`left`、`bottom`、`right`，单位是 [pt](../units.md)。

- 可读，可写。
- 默认值是上下各 8，左右 0。
- 写入时可以给普通对象 `{ top, left, bottom, right }`。读出来是 `UIEdgeInsets`，字段只读。
- 文字到左右两边的距离是这里的左、右，再加上 [`textContainer.lineFragmentPadding`](../ns-text-container/linefragmentpadding.md)（默认 5）。所以新建的多行输入文字离左边 5 pt、离顶边 8 pt。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const input = new UITextView();
input.textContainerInset = new UIEdgeInsets(12, 12, 12, 12);
input.textContainer.lineFragmentPadding = 0;
```

**效果**：文字离四边各 12 pt。

## 对应的 iOS API

`UITextView.textContainerInset`。`UIEdgeInsetsMake(12, 12, 12, 12)` 写成 `new UIEdgeInsets(12, 12, 12, 12)`。

## 参见

- [`NSTextContainer`](../ns-text-container.md)
- [结构体](../structs.md)
