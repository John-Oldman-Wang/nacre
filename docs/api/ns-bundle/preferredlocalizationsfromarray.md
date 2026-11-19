---
type: reference
native: "+[NSBundle preferredLocalizationsFromArray:forPreferences:]"
---

# `NSBundle.preferredLocalizationsFromArray()` 静态方法

**`preferredLocalizationsFromArray()`** 静态方法从一组语言里挑出最合用户偏好的那几种。

## 语法

```
NSBundle.preferredLocalizationsFromArray(localizationsArray[, { forPreferences }])
```

## 参数

**`localizationsArray`**

可选的语言，字符串数组，形如 `['en', 'zh-Hans']`。每一项照字符串转换。

**`options.forPreferences`**

按哪一组偏好挑，字符串数组，形如 `['zh-Hans-CN']`。不给或者是 `null` 时，按用户在系统设置里的偏好。

## 返回值

字符串数组：挑出来的语言，最合的在前，至少一项。

## 异常

**`TypeError`**

- `localizationsArray` 不是数组：`preferredLocalizationsFromArray needs an array of strings`。
- `forPreferences` 不是数组也不是 `null`：`forPreferences needs an array of strings`。

## 说明

App 自己带了几种语言的文案时，用它挑界面语言：把带了的语言传进去，取第一项。它和系统给 App 挑语言用的是同一套规则。

## 示例

```js
console.log(NSBundle.preferredLocalizationsFromArray(['en', 'zh-Hans'], { forPreferences: ['zh-Hans-CN'] })[0]);
```

**结果**：输出 `zh-Hans`。

## 对应的 iOS API

按带没带 `forPreferences` 调：`preferredLocalizationsFromArray:`、`preferredLocalizationsFromArray:forPreferences:`。

## 参见

- [`NSBundle`](../ns-bundle.md)
