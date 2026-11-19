---
type: reference
native: "-[NSLocale localizedStringForCalendarIdentifier:]"
---

# `NSLocale`：`localizedStringForCalendarIdentifier()` 方法

**`localizedStringForCalendarIdentifier()`** 方法用这个地区的语言说出一个日历标识的名字。

## 语法

```
localizedStringForCalendarIdentifier(calendarIdentifier)
```

## 参数

**`calendarIdentifier`**

日历标识，字符串。照字符串转换：数会转成字符串，`null` 和 `undefined` 当空串。

## 返回值

字符串：这个代码的名字，用这个地区的语言写。认不出这个代码时可能是 `null`。**哪些代码给 `null` 未在模拟器验证。**

## 异常

无。

## 示例

```js
console.log(new NSLocale('en_US').localizedStringForCalendarIdentifier('gregorian'));
```

**结果**：输出 `Gregorian Calendar`。

## 对应的 iOS API

`-[NSLocale localizedStringForCalendarIdentifier:]`。

## 参见

- [`NSLocale`](../ns-locale.md)
- [`calendarIdentifier`](calendaridentifier.md)
