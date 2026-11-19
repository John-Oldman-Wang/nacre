---
type: reference
native: "-[NSLocale localizedStringForLocaleIdentifier:]"
---

# `NSLocale`：`localizedStringForLocaleIdentifier()` 方法

**`localizedStringForLocaleIdentifier()`** 方法用这个地区的语言说出一个地区标识的名字。

## 语法

```
localizedStringForLocaleIdentifier(localeIdentifier)
```

## 参数

**`localeIdentifier`**

地区标识，字符串。照字符串转换：数会转成字符串，`null` 和 `undefined` 当空串。

## 返回值

字符串：这个代码的名字，用这个地区的语言写。

## 异常

无。

## 示例

```js
console.log(new NSLocale('en_US').localizedStringForLocaleIdentifier('fr_FR'));
```

**结果**：输出 `French (France)`。

## 对应的 iOS API

`-[NSLocale localizedStringForLocaleIdentifier:]`。

## 参见

- [`NSLocale`](../ns-locale.md)
- [`localeIdentifier`](localeidentifier.md)
