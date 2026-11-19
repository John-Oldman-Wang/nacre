---
type: reference
native: NSRange.location
---

# `NSRange`：`location` 属性

**`location`** 属性是这一段的起点，单位是 UTF-16 码元。

## 值

非负整数，单位是 UTF-16 码元。0 是第一个字符之前。`text.length` 是最后一个字符之后。

- 只读。给它赋值抛 `TypeError: location is read-only: structs are values, assign a whole new one instead`。要改就整体换一个新的 `NSRange`。

## 示例

```js
const text = 'hello world';
const r = new NSRange(6, 5);
console.log(r.location, text.slice(r.location, r.location + r.length));
```

**结果**：输出 `6 world`。

## 对应的 iOS API

`NSRange.location`。

## 参见

- [`NSRange`](../ns-range.md)
