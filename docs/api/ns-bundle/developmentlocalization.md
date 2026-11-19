---
type: reference
native: NSBundle.developmentLocalization
---

# `NSBundle`：`developmentLocalization` 属性

**`developmentLocalization`** 属性是开发时用的语言。

## 值

字符串或 `null`。

- 只读。给它赋值抛 `TypeError`。
- 用户的偏好里没有一种是包支持的时，系统用这一种。在 iPhone Air 模拟器（iOS 27.2）上运行验收 App 时是 `'en'`。

## 示例

```js
console.log(NSBundle.mainBundle.developmentLocalization);
```

**结果**：在 iPhone Air 模拟器（iOS 27.2）上运行验收 App 时输出 `en`。

## 对应的 iOS API

`NSBundle.developmentLocalization`。

## 参见

- [`NSBundle`](../ns-bundle.md)
