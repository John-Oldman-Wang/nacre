---
type: reference
native: NSLocale.alternateQuotationEndDelimiter
---

# `NSLocale`：`alternateQuotationEndDelimiter` 属性

**`alternateQuotationEndDelimiter`** 属性是这个地区的引号里再套引号时用的闭引号。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`，原值不变。
- `de_DE` 读到 `‘`。

## 示例

```js
console.log(new NSLocale('de_DE').alternateQuotationEndDelimiter);
```

**结果**：输出 `‘`。

## 对应的 iOS API

`NSLocale.alternateQuotationEndDelimiter`。

## 参见

- [`NSLocale`](../ns-locale.md)
