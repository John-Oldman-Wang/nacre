---
type: reference
native: NSLocale.preferredLanguages
---

# `NSLocale.preferredLanguages` 静态属性

**`preferredLanguages`** 静态属性是用户在系统设置里排好序的语言。

## 值

字符串数组，每一项是一个语言标识，形如 `'zh-Hans-CN'`、`'en-US'`。

- 只读。给它赋值抛 `TypeError`，原值不变。
- 第一项是用户的首选语言。至少有一项。在 iPhone Air 模拟器（iOS 27.2，系统语言简体中文、地区中国）上是 `['zh-Hans-CN']`。
- 每次读给一个新数组。
- 用户改了系统语言时，iOS 会结束正在运行的 App，下次启动读到新的列表。**未在模拟器验证。**

它是用户的偏好，不是 App 实际在用的语言。App 实际用哪种语言，系统从 App 声明支持的语言里挑：用户首选中文、App 只支持英文时，App 用英文。[`NSLocale.currentLocale`](currentlocale.md) 的语言就是挑出来的那一种。

`Intl.NumberFormat`、`Intl.DateTimeFormat` 不指定地区时，用的是这个列表的第一项。

## 示例

```js
console.log(NSLocale.preferredLanguages);
```

**结果**：在 iPhone Air 模拟器（iOS 27.2，系统语言简体中文、地区中国）上输出 `['zh-Hans-CN']`。

## 对应的 iOS API

`NSLocale.preferredLanguages`（类属性）。

## 参见

- [`currentLocale`](currentlocale.md)：App 实际用的语言和用户的地区
- [`Intl.NumberFormat`](../intl.md)
