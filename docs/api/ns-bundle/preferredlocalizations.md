---
type: reference
native: NSBundle.preferredLocalizations
---

# `NSBundle`：`preferredLocalizations` 属性

**`preferredLocalizations`** 属性是包里的语言中这一次实际在用的，最合用户偏好的在前。

## 值

字符串数组，至少一项。

- 只读。给它赋值抛 `TypeError`。
- 第一项是 App 这一次用的语言。系统在启动时从 [`localizations`](localizations.md) 里按用户的偏好挑出来。
- 在 iPhone Air 模拟器（iOS 27.2）上运行验收 App 时（系统语言简体中文，验收 App 只有英文）是 `['en']`。
- 用户改了系统语言，或者在设置里给这个 App 单独选了语言，iOS 会结束正在运行的 App，下次启动读到新的值。**未在模拟器验证。**

App 自己的界面文案在 JS 里、要和系统挑的语言一致时，读它的第一项。

## 示例

```js
console.log(NSBundle.mainBundle.preferredLocalizations[0]);
```

**结果**：在 iPhone Air 模拟器（iOS 27.2）上运行验收 App 时输出 `en`。

## 对应的 iOS API

`NSBundle.preferredLocalizations`。

## 参见

- [`NSBundle`](../ns-bundle.md)
- `NSLocale.preferredLanguages`：用户的偏好，不管 App 支持不支持
