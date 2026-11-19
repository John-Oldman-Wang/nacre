---
type: reference
native: NSBundle.mainBundle
---

# `NSBundle.mainBundle` 静态属性

**`mainBundle`** 静态属性是 App 自己的包。

## 值

[`NSBundle`](../ns-bundle.md)。

- 只读。给它赋值抛 `TypeError`。
- 每次读得到同一个对象。

## 示例

```js
console.log(NSBundle.mainBundle === NSBundle.mainBundle, NSBundle.mainBundle.bundlePath.endsWith('.app'));
```

**结果**：输出 `true true`。

## 对应的 iOS API

`NSBundle.mainBundle`。

## 参见

- [`NSBundle`](../ns-bundle.md)
