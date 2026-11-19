---
type: reference
native: NSLocale.alternateQuotationBeginDelimiter
---

# `NSLocale`：`alternateQuotationBeginDelimiter` 属性

**`alternateQuotationBeginDelimiter`** 属性是这个地区的引号里再套引号时用的开引号。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`，原值不变。
- `de_DE` 读到 `‚`。

## 示例

```js
console.log(new NSLocale('de_DE').alternateQuotationBeginDelimiter);
```

**结果**：输出 `‚`。

## 对应的 iOS API

`NSLocale.alternateQuotationBeginDelimiter`。

## 参见

- [`NSLocale`](../ns-locale.md)
