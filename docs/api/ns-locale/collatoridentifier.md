---
type: reference
native: NSLocale.collatorIdentifier
---

# `NSLocale`：`collatorIdentifier` 属性

**`collatorIdentifier`** 属性是这个地区排序文字时用的标识。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`，原值不变。
- `new NSLocale('de_DE')` 读到 `'de_DE'`。

## 示例

```js
console.log(new NSLocale('de_DE').collatorIdentifier);
```

**结果**：输出 `de_DE`。

## 对应的 iOS API

`NSLocale.collatorIdentifier`。

## 参见

- [`NSLocale`](../ns-locale.md)
- [`localizedStringForCollatorIdentifier()`](localizedstringforcollatoridentifier.md)
