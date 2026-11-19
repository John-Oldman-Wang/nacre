---
type: reference
native: UIPasteboard.hasStrings
---

# `UIPasteboard`：`hasStrings` 属性

**`hasStrings`** 属性表示剪贴板里有没有文字。它只查询，不取内容，不会弹出系统提示。

## 值

布尔。

- 只读。给它赋值抛 `TypeError`。
- `true`：剪贴板里有文字。
- `false`：没有。
- 这个 App 自己写 [`string`](string.md) 改变它时，派发 [`change`](change-event.md) 事件。别的 App 改变它时没有事件，回到前台后重新读。

读到 `true` 之后再读 `string`，仍然要判断是不是 `null`：两次读之间内容可能变了。

## 示例

```js
const pasteboard = UIPasteboard.generalPasteboard;
if (pasteboard.hasStrings) {
  console.log('可以粘贴');
}
```

**结果**：剪贴板里有文字时输出 `可以粘贴`。不会有系统提示。

## 对应的 iOS API

`UIPasteboard.hasStrings`。

## 参见

- [`string`](string.md)
- [读取时的系统提示](../ui-pasteboard.md#读取时的系统提示)
