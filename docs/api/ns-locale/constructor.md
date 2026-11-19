---
type: reference
native: "-[NSLocale initWithLocaleIdentifier:]"
---

# `NSLocale()` 构造函数

**`NSLocale()`** 构造函数按地区标识建一个地区对象。

## 语法

```
new NSLocale(localeIdentifier)
```

## 参数

**`localeIdentifier`**

地区标识，字符串，形如 `'de_DE'`、`'zh_Hant_CN'`、`'en-US'`。下划线和短横线两种写法都认。照字符串转换：`null` 和 `undefined` 当空串。

标识的写法：语言代码在前，后面依次是文字代码、国家或地区代码、变体，最后可以带 `@calendar=japanese`、`@collation=phonebook` 这类选项。

## 返回值

一个新的 `NSLocale`。

## 异常

无。

## 说明

用下划线写时，系统会去掉这个语言和地区默认的文字，标识跟着变：`new NSLocale('zh_Hans_CN')` 的 [`localeIdentifier`](localeidentifier.md) 是 `'zh_CN'`，[`scriptCode`](scriptcode.md) 是 `null`。用短横线写（`'zh-Hant-TW'`）时文字留着。这是实测的行为，Apple 的文档没写。

## 示例

```js
const de = new NSLocale('de_DE');
console.log(de.currencyCode, de.decimalSeparator);
```

**结果**：输出 `EUR ,`。

## 对应的 iOS API

`-[NSLocale initWithLocaleIdentifier:]`。

## 参见

- [`NSLocale.localeWithLocaleIdentifier()`](localewithlocaleidentifier.md)
- [`NSLocale.currentLocale`](currentlocale.md)：用户自己的地区设置，不用自己建
