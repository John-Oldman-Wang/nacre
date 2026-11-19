---
type: reference
native: NSLocale.regionCode
---

# `NSLocale`：`regionCode` 属性

**`regionCode`** 属性是这个地区的国家或地区代码。

## 值

字符串或 `null`。字符串是 ISO 3166 代码，形如 `'DE'`、`'CN'`。

- 只读。给它赋值抛 `TypeError`，原值不变。
- 标识里没有国家或地区时是 `null`：`new NSLocale('fr')` 读到 `null`。
- 在 iPhone Air 模拟器（iOS 27.2，系统语言简体中文、地区中国）上，`NSLocale.currentLocale`读到 `'CN'`，就是用户在系统设置里选的地区。

## 示例

```js
console.log(NSLocale.currentLocale.regionCode);
```

**结果**：在 iPhone Air 模拟器（iOS 27.2，系统语言简体中文、地区中国）上输出 `CN`。

## 对应的 iOS API

`NSLocale.regionCode`。旧名 `countryCode` 没有提供，值和它相同。

## 参见

- [`NSLocale`](../ns-locale.md)
- [`localizedStringForCountryCode()`](localizedstringforcountrycode.md)
