---
type: reference
native: UIListContentConfiguration.secondaryText
---

# `UIListContentConfiguration`：`secondaryText` 属性

**`secondaryText`** 属性是一行的副文字。在哪里显示由样式决定：主文字下面，或者右边。

## 值

字符串，或者 `null`。

- 可读，可写。
- 默认值是 `null`。
- 写 `null` 清掉。

## 示例

```js
const content = UIListContentConfiguration.subtitleCellConfiguration();
content.text = '手冲壶';
content.secondaryText = '待付款';
```

**效果**：主文字「手冲壶」下面一行灰色的「待付款」。

## 对应的 iOS API

`UIListContentConfiguration.secondaryText`。

## 参见

- [`text`](text.md)
