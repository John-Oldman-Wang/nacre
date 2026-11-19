---
type: reference
native: NSLocale.variantCode
---

# `NSLocale`：`variantCode` 属性

**`variantCode`** 属性是这个地区的变体代码。

## 值

字符串或 `null`。

- 只读。给它赋值抛 `TypeError`，原值不变。
- 标识里没有变体时是 `null`。`new NSLocale('en_US_POSIX')` 读到 `'POSIX'`。

## 示例

```js
console.log(new NSLocale('en_US_POSIX').variantCode);
```

**结果**：输出 `POSIX`。

## 对应的 iOS API

`NSLocale.variantCode`。

## 参见

- [`NSLocale`](../ns-locale.md)
