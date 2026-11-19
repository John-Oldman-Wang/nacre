---
type: reference
native: NSLocale.calendarIdentifier
---

# `NSLocale`：`calendarIdentifier` 属性

**`calendarIdentifier`** 属性是这个地区用的日历。

## 值

字符串，形如 `'gregorian'`（公历）、`'japanese'`（日本年号）。

- 只读。给它赋值抛 `TypeError`，原值不变。
- 标识里用 `@calendar=` 指定的日历优先：`new NSLocale('ja_JP@calendar=japanese')` 读到 `'japanese'`。没指定时 `de_DE` 读到 `'gregorian'`。

## 示例

```js
console.log(new NSLocale('ja_JP@calendar=japanese').calendarIdentifier);
```

**结果**：输出 `japanese`。

## 对应的 iOS API

`NSLocale.calendarIdentifier`。

## 参见

- [`NSLocale`](../ns-locale.md)
- [`localizedStringForCalendarIdentifier()`](localizedstringforcalendaridentifier.md)
