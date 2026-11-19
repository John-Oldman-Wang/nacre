---
type: reference
native: NSLocale.ISOCountryCodes
---

# `NSLocale.ISOCountryCodes` 静态属性

**`ISOCountryCodes`** 静态属性是全部 ISO 3166 国家和地区代码。

## 值

字符串数组。

- 只读。给它赋值抛 `TypeError`，原值不变。
- 每次读给一个新数组。
- 里面有 `'CN'`。

## 示例

```js
console.log(NSLocale.ISOCountryCodes.includes('CN'));
```

**结果**：输出 `true`。

## 对应的 iOS API

`NSLocale.ISOCountryCodes`（类属性）。

## 参见

- [`NSLocale`](../ns-locale.md)
