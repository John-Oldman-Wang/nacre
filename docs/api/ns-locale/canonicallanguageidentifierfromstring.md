---
type: reference
native: "+[NSLocale canonicalLanguageIdentifierFromString:]"
---

# `NSLocale.canonicalLanguageIdentifierFromString()` 静态方法

**`canonicalLanguageIdentifierFromString()`** 静态方法把一个地区标识改成标准的语言标识写法。

## 语法

```
NSLocale.canonicalLanguageIdentifierFromString(string)
```

## 参数

**`string`**

地区标识，字符串。照字符串转换：数会转成字符串，`null` 和 `undefined` 当空串。

## 返回值

字符串：标准写法的语言标识，用短横线分隔。

## 异常

无。

## 示例

```js
console.log(NSLocale.canonicalLanguageIdentifierFromString('en_US'));
```

**结果**：输出 `en-US`。

## 对应的 iOS API

`+[NSLocale canonicalLanguageIdentifierFromString:]`。

## 参见

- [`canonicalLocaleIdentifierFromString()`](canonicallocaleidentifierfromstring.md)
