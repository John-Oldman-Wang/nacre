---
type: reference
native: NSLocale.currencyCode
---

# `NSLocale`：`currencyCode` 属性

**`currencyCode`** 属性是这个地区的货币代码。

## 值

字符串或 `null`。字符串是 ISO 4217 代码，形如 `'EUR'`、`'CNY'`。

- 只读。给它赋值抛 `TypeError`，原值不变。
- `de_DE` 读到 `'EUR'`，`en_US` 读到 `'USD'`，`zh_Hans_CN` 读到 `'CNY'`。在 iPhone Air 模拟器（iOS 27.2，系统语言简体中文、地区中国）上，`NSLocale.currentLocale`读到 `'CNY'`。
- 没有货币时是 `null`。什么地区没有货币**未在模拟器验证**。

按用户的地区写金额：把它传给 `Intl.NumberFormat` 的 `currency` 选项。

## 示例

```js
const code = NSLocale.currentLocale.currencyCode;
if (code !== null) {
  console.log(new Intl.NumberFormat(undefined, { style: 'currency', currency: code }).format(1234.5));
}
```

**结果**：在 iPhone Air 模拟器（iOS 27.2，系统语言简体中文、地区中国）上输出按首选语言写的人民币金额，形如 `¥1,234.50`。**这一句的格式未在模拟器验证。**

## 对应的 iOS API

`NSLocale.currencyCode`。

## 参见

- [`NSLocale`](../ns-locale.md)
- [`Intl.NumberFormat`](../intl.md)
- [`localizedStringForCurrencyCode()`](localizedstringforcurrencycode.md)
