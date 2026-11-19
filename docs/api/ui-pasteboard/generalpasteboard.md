---
type: reference
native: UIPasteboard.generalPasteboard
---

# `UIPasteboard.generalPasteboard` 静态属性

**`UIPasteboard.generalPasteboard`** 静态属性是整个系统共用的剪贴板。

## 值

`UIPasteboard`。

- 只读。
- 每次读得到同一个对象。
- `UIPasteboard` 不能用 `new` 创建，这是拿到实例的唯一途径。`new UIPasteboard()` 抛 `TypeError: Illegal constructor: UIPasteboard is created by the runtime, not by new`。

## 示例

```js
const pasteboard = UIPasteboard.generalPasteboard;
console.log(pasteboard === UIPasteboard.generalPasteboard);
```

**结果**：输出 `true`。

## 对应的 iOS API

`UIPasteboard.generalPasteboard`。

## 参见

- [`UIPasteboard`](../ui-pasteboard.md)
