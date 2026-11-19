---
type: reference
native: "+[NSLocale lineDirectionForLanguage:]"
---

# `NSLocale.lineDirectionForLanguage()` 静态方法

**`lineDirectionForLanguage()`** 静态方法给出一种语言的一行一行朝哪个方向排。

## 语法

```
NSLocale.lineDirectionForLanguage(isoLangCode)
```

## 参数

**`isoLangCode`**

语言代码，形如 `'en'`。字符串。照字符串转换：数会转成字符串，`null` 和 `undefined` 当空串。

## 返回值

字符串，取值和 [`characterDirectionForLanguage()`](characterdirectionforlanguage.md) 相同。

## 异常

无。

## 示例

```js
console.log(NSLocale.lineDirectionForLanguage('en'));
```

**结果**：输出 `topToBottom`。

## 对应的 iOS API

`+[NSLocale lineDirectionForLanguage:]`。

## 参见

- [`characterDirectionForLanguage()`](characterdirectionforlanguage.md)
