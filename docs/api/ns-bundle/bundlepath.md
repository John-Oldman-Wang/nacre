---
type: reference
native: NSBundle.bundlePath
---

# `NSBundle`：`bundlePath` 属性

**`bundlePath`** 属性是包的绝对路径。

## 值

字符串。App 的包以 `.app` 结尾。

- 只读。给它赋值抛 `TypeError`。

## 示例

```js
console.log(NSBundle.mainBundle.bundlePath.endsWith('.app'));
```

**结果**：输出 `true`。

## 对应的 iOS API

`NSBundle.bundlePath`。

## 参见

- [`NSBundle`](../ns-bundle.md)
- [`application.fileSystem.assets`](../filesystem/assets.md)
