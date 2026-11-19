---
type: reference
native: NSRange.length
---

# `NSRange`：`length` 属性

**`length`** 属性是这一段的长度，单位是 UTF-16 码元。

## 值

非负整数，单位是 UTF-16 码元。0 表示一个位置，没有内容。在输入框里就是光标。

- 只读。给它赋值抛 `TypeError: length is read-only: structs are values, assign a whole new one instead`。要改就整体换一个新的 `NSRange`。

## 示例

```js
const text = 'hello world';
const r = new NSRange(6, 5);
console.log(r.length, text.slice(r.location, r.location + r.length));
```

**结果**：输出 `5 world`。

## 对应的 iOS API

`NSRange.length`。

## 参见

- [`NSRange`](../ns-range.md)
