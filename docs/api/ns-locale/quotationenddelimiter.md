---
type: reference
native: NSLocale.quotationEndDelimiter
---

# `NSLocale`：`quotationEndDelimiter` 属性

**`quotationEndDelimiter`** 属性是这个地区的闭引号。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`，原值不变。
- `de_DE` 读到 `“`。

## 示例

```js
console.log(new NSLocale('de_DE').quotationEndDelimiter);
```

**结果**：输出 `“`。

## 对应的 iOS API

`NSLocale.quotationEndDelimiter`。

## 参见

- [`NSLocale`](../ns-locale.md)
