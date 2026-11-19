---
type: reference
native: NSLocale.quotationBeginDelimiter
---

# `NSLocale`：`quotationBeginDelimiter` 属性

**`quotationBeginDelimiter`** 属性是这个地区的开引号。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`，原值不变。
- `de_DE` 读到 `„`。

## 示例

```js
console.log(new NSLocale('de_DE').quotationBeginDelimiter);
```

**结果**：输出 `„`。

## 对应的 iOS API

`NSLocale.quotationBeginDelimiter`。

## 参见

- [`NSLocale`](../ns-locale.md)
