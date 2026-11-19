---
type: reference
native: UIPasteboard.changeCount
---

# `UIPasteboard`：`changeCount` 属性

**`changeCount`** 属性是剪贴板内容变化的计数。它只查询，不取内容，不会弹出系统提示。

## 值

数，单位是次。

- 只读。给它赋值抛 `TypeError`。
- 内容每变一次它变大，包括别的 App 改的、App 在后台期间改的。写 `null` 清空也算一次变化。
- 它的具体数值没有意义，只用来和之前读到的值比较。
- 这个 App 自己写 [`string`](string.md) 时派发 [`change`](change-event.md) 事件。别的 App 修改时没有事件（真机实测），要在回到前台时比较它。

真机上核对过：在别的 App 里复制之后回来，`changeCount` 从 24 变成了 25，这期间没有收到 `change` 事件。

## 示例

```js
const pasteboard = UIPasteboard.generalPasteboard;
const before = pasteboard.changeCount;
pasteboard.string = '新的内容';
console.log(pasteboard.changeCount > before);
```

**结果**：输出 `true`。

## 对应的 iOS API

`UIPasteboard.changeCount`。

## 参见

- [用户离开 App 期间内容变了没有](../../guides/clipboard.md#用户离开-app-期间内容变了没有)
- [`change`](change-event.md)
