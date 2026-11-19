---
type: reference
native: NSLocale.ISOLanguageCodes
---

# `NSLocale.ISOLanguageCodes` 静态属性

**`ISOLanguageCodes`** 静态属性是全部 ISO 639 语言代码。

## 值

字符串数组。

- 只读。给它赋值抛 `TypeError`，原值不变。
- 每次读给一个新数组。
- 里面有 `'en'`。

## 示例

```js
console.log(NSLocale.ISOLanguageCodes.includes('en'));
```

**结果**：输出 `true`。

## 对应的 iOS API

`NSLocale.ISOLanguageCodes`（类属性）。

## 参见

- [`NSLocale`](../ns-locale.md)
