---
type: reference
native: NSLocale.systemLocale
---

# `NSLocale.systemLocale` 静态属性

**`systemLocale`** 静态属性是一个不属于任何语言和地区的通用地区。

## 值

[`NSLocale`](../ns-locale.md)。

- 只读。给它赋值抛 `TypeError`，原值不变。
- 它的 [`localeIdentifier`](localeidentifier.md) 是空串 `''`。
- 它不是用户的设置。要用户的设置读 [`currentLocale`](currentlocale.md)。

## 示例

```js
console.log(JSON.stringify(NSLocale.systemLocale.localeIdentifier));
```

**结果**：输出 `""`。

## 对应的 iOS API

`NSLocale.systemLocale`（类属性）。

## 参见

- [`NSLocale`](../ns-locale.md)
