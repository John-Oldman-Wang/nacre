---
type: reference
native: NSLocale.ISOCurrencyCodes
---

# `NSLocale.ISOCurrencyCodes` 静态属性

**`ISOCurrencyCodes`** 静态属性是全部 ISO 4217 货币代码。

## 值

字符串数组。

- 只读。给它赋值抛 `TypeError`，原值不变。
- 每次读给一个新数组。
- 里面有 `'CNY'`。

## 示例

```js
console.log(NSLocale.ISOCurrencyCodes.includes('CNY'));
```

**结果**：输出 `true`。

## 对应的 iOS API

`NSLocale.ISOCurrencyCodes`（类属性）。

## 参见

- [`NSLocale`](../ns-locale.md)
