---
type: reference
native: NSBundle.bundleIdentifier
---

# `NSBundle`：`bundleIdentifier` 属性

**`bundleIdentifier`** 属性是包名。

## 值

字符串或 `null`，形如 `com.example.shop`。

- 只读。给它赋值抛 `TypeError`。
- App 的包读到的和 [`application.bundleIdentifier`](../application/bundleidentifier.md) 相同。

## 示例

```js
console.log(NSBundle.mainBundle.bundleIdentifier);
```

**结果**：输出 App 的包名。

## 对应的 iOS API

`NSBundle.bundleIdentifier`。

## 参见

- [`NSBundle`](../ns-bundle.md)
