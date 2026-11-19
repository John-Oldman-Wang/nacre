---
type: reference
native: NSLocale.commonISOCurrencyCodes
---

# `NSLocale.commonISOCurrencyCodes` 静态属性

**`commonISOCurrencyCodes`** 静态属性是常用的货币代码。

## 值

字符串数组。

- 只读。给它赋值抛 `TypeError`，原值不变。
- 每次读给一个新数组。
- 里面有 `'USD'`。

## 示例

```js
console.log(NSLocale.commonISOCurrencyCodes.includes('USD'));
```

**结果**：输出 `true`。

## 对应的 iOS API

`NSLocale.commonISOCurrencyCodes`（类属性）。

## 参见

- [`NSLocale`](../ns-locale.md)
