---
type: reference
native: NSLocale.autoupdatingCurrentLocale
---

# `NSLocale.autoupdatingCurrentLocale` 静态属性

**`autoupdatingCurrentLocale`** 静态属性是 App 所用的地区，它的值跟着用户的设置变。

## 值

[`NSLocale`](../ns-locale.md)。

- 只读。给它赋值抛 `TypeError`，原值不变。
- 值和 [`currentLocale`](currentlocale.md) 相同，区别是用户改了地区设置之后，再读这个对象的属性得到的是新的值。**跟着变这一点未在模拟器验证**，来自 Apple 的文档。
- 它自己不派发事件。要在设置变了的时候刷新界面，监听 [`localechange`](../application/localechange-event.md)。

## 示例

```js
console.log(NSLocale.autoupdatingCurrentLocale.localeIdentifier);
```

**结果**：在 iPhone Air 模拟器（iOS 27.2，系统语言简体中文、地区中国）上输出 `en_CN`。

## 对应的 iOS API

`NSLocale.autoupdatingCurrentLocale`（类属性）。

## 参见

- [`currentLocale`](currentlocale.md)
- [`localechange`](../application/localechange-event.md)
