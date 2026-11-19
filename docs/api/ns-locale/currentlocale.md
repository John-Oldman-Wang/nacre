---
type: reference
native: NSLocale.currentLocale
---

# `NSLocale.currentLocale` 静态属性

**`currentLocale`** 静态属性是读的那一刻 App 所用的地区：语言是 App 实际在用的语言，国家或地区、货币、数字和日期的格式是用户在系统设置里设的。

## 值

[`NSLocale`](../ns-locale.md)。

- 只读。给它赋值抛 `TypeError`，原值不变。
- 语言取 App 声明支持的语言里，用户最想要的那一种。不写 `ios.languages` 的 App 是英文。在 iPhone Air 模拟器（iOS 27.2，系统语言简体中文、地区中国）上，验收 App 只有英文，读到 `en_CN`：语言英文，地区中国，货币 `CNY`。
- 读到的对象不跟着设置变：用户之后改了地区设置，这个对象的值还是读的那一刻的。要最新的值，在 [`localechange`](../application/localechange-event.md) 事件里重新读，或者用 [`autoupdatingCurrentLocale`](autoupdatingcurrentlocale.md)。

App 声明支持哪些语言，写在 `nacre.config.json` 的 `ios.languages` 里，见[配置 App](../../guides/project-config.md)。

## 示例

```js
const locale = NSLocale.currentLocale;
console.log(locale.localeIdentifier, locale.regionCode, locale.currencyCode);
```

**结果**：在 iPhone Air 模拟器（iOS 27.2，系统语言简体中文、地区中国）上输出 `en_CN CN CNY`。

## 对应的 iOS API

`NSLocale.currentLocale`（类属性）。

## 参见

- [`autoupdatingCurrentLocale`](autoupdatingcurrentlocale.md)
- [`preferredLanguages`](preferredlanguages.md)
- [`localechange`](../application/localechange-event.md)
