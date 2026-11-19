---
type: reference
native: NSBundle.resourcePath
---

# `NSBundle`：`resourcePath` 属性

**`resourcePath`** 属性是包里放资源的目录的绝对路径。

## 值

字符串或 `null`。

- 只读。给它赋值抛 `TypeError`。
- App 的包里，它和 [`bundlePath`](bundlepath.md) 相同（实测）。

## 示例

```js
const main = NSBundle.mainBundle;
console.log(main.resourcePath === main.bundlePath);
```

**结果**：输出 `true`。

## 对应的 iOS API

`NSBundle.resourcePath`。

## 参见

- [`NSBundle`](../ns-bundle.md)
