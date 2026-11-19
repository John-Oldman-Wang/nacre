---
type: reference
native: "+[NSLocale localeWithLocaleIdentifier:]"
---

# `NSLocale.localeWithLocaleIdentifier()` 静态方法

**`localeWithLocaleIdentifier()`** 静态方法按地区标识建一个地区对象，和 [`new NSLocale()`](constructor.md) 一样。

## 语法

```
NSLocale.localeWithLocaleIdentifier(localeIdentifier)
```

## 参数

**`localeIdentifier`**

地区标识，字符串。照字符串转换：数会转成字符串，`null` 和 `undefined` 当空串。写法见[构造函数](constructor.md)。

## 返回值

一个新的 `NSLocale`。

## 异常

无。

## 示例

```js
console.log(NSLocale.localeWithLocaleIdentifier('fr_FR').languageCode);
```

**结果**：输出 `fr`。

## 对应的 iOS API

`+[NSLocale localeWithLocaleIdentifier:]`。

## 参见

- [`NSLocale`](../ns-locale.md)
