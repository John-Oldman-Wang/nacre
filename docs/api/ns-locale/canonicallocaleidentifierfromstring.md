---
type: reference
native: "+[NSLocale canonicalLocaleIdentifierFromString:]"
---

# `NSLocale.canonicalLocaleIdentifierFromString()` 静态方法

**`canonicalLocaleIdentifierFromString()`** 静态方法把一个地区标识改成标准的大小写写法。

## 语法

```
NSLocale.canonicalLocaleIdentifierFromString(string)
```

## 参数

**`string`**

地区标识，字符串。照字符串转换：数会转成字符串，`null` 和 `undefined` 当空串。

## 返回值

字符串：标准写法的地区标识。

## 异常

无。

## 说明

它改大小写，不换分隔符：下划线写的给下划线，短横线写的给短横线。这是实测的结果，Apple 的文档没写。

## 示例

```js
console.log(NSLocale.canonicalLocaleIdentifierFromString('en_us'));
console.log(NSLocale.canonicalLocaleIdentifierFromString('zh-hans-cn'));
console.log(NSLocale.canonicalLocaleIdentifierFromString('en-US'));
```

**结果**：依次输出 `en_US`、`zh-Hans-CN`、`en-US`。

## 对应的 iOS API

`+[NSLocale canonicalLocaleIdentifierFromString:]`。

## 参见

- [`canonicalLanguageIdentifierFromString()`](canonicallanguageidentifierfromstring.md)
