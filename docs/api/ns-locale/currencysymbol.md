---
type: reference
native: NSLocale.currencySymbol
---

# `NSLocale`：`currencySymbol` 属性

**`currencySymbol`** 属性是这个地区的货币符号。

## 值

字符串，形如 `'€'`、`'$'`。

- 只读。给它赋值抛 `TypeError`，原值不变。

## 示例

```js
console.log(new NSLocale('de_DE').currencySymbol);
```

**结果**：输出 `€`。

## 对应的 iOS API

`NSLocale.currencySymbol`。

## 参见

- [`NSLocale`](../ns-locale.md)
- [`currencyCode`](currencycode.md)
