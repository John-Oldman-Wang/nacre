---
type: reference
native: NSLocale.availableLocaleIdentifiers
---

# `NSLocale.availableLocaleIdentifiers` 静态属性

**`availableLocaleIdentifiers`** 静态属性是系统认得的全部地区标识。

## 值

字符串数组。

- 只读。给它赋值抛 `TypeError`，原值不变。
- 每次读给一个新数组。
- 里面有 `'de_DE'`。

## 示例

```js
console.log(NSLocale.availableLocaleIdentifiers.includes('de_DE'));
```

**结果**：输出 `true`。

## 对应的 iOS API

`NSLocale.availableLocaleIdentifiers`（类属性）。

## 参见

- [`NSLocale`](../ns-locale.md)
