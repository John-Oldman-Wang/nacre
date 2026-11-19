---
type: reference
native: "-[NSLocale localizedStringForLanguageCode:]"
---

# `NSLocale`：`localizedStringForLanguageCode()` 方法

**`localizedStringForLanguageCode()`** 方法用这个地区的语言说出一个语言代码的名字。

## 语法

```
localizedStringForLanguageCode(languageCode)
```

## 参数

**`languageCode`**

语言代码，字符串。照字符串转换：数会转成字符串，`null` 和 `undefined` 当空串。

## 返回值

字符串：这个代码的名字，用这个地区的语言写。认不出这个代码时可能是 `null`。**哪些代码给 `null` 未在模拟器验证。**

## 异常

无。

## 说明

用哪个地区的语言说，取决于调用它的地区对象：`new NSLocale('zh_Hans_CN').localizedStringForLanguageCode('en')` 给 `英语`。做语言切换菜单时，每种语言用它自己说出自己的名字，用户找得到：`new NSLocale(code).localizedStringForLanguageCode(code)`。

## 示例

```js
console.log(new NSLocale('en_US').localizedStringForLanguageCode('de'));
```

**结果**：输出 `German`。

## 对应的 iOS API

`-[NSLocale localizedStringForLanguageCode:]`。

## 参见

- [`NSLocale`](../ns-locale.md)
- [`languageCode`](languagecode.md)
