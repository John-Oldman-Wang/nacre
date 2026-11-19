---
type: reference
native: NSLocale.decimalSeparator
---

# `NSLocale`：`decimalSeparator` 属性

**`decimalSeparator`** 属性是这个地区写数字用的小数点。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`，原值不变。
- `de_DE` 读到 `,`。`en_US` 读到 `.`。

把数字写成文字时用 [`Intl.NumberFormat`](../intl.md)，它会按地区放好小数点和千分位，不用自己拼。

## 示例

```js
console.log(new NSLocale('de_DE').decimalSeparator);
```

**结果**：输出 `,`。

## 对应的 iOS API

`NSLocale.decimalSeparator`。

## 参见

- [`NSLocale`](../ns-locale.md)
- [`Intl.NumberFormat`](../intl.md)
