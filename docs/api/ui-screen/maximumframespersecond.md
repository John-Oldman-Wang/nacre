---
type: reference
native: UIScreen.maximumFramesPerSecond
---

# `UIScreen`：`maximumFramesPerSecond` 属性

**`maximumFramesPerSecond`** 属性是这块屏幕每秒最多刷新几帧。

## 值

整数，单位是帧每秒。

- 只读。给它赋值抛 `TypeError`。
- 在 iPhone Air 模拟器（iOS 27.2）上是 `60`。真机上是屏幕硬件的上限，**未在真机验证**。
- 没有变化通知。

[`CADisplayLink`](../ca-display-link.md) 要的帧率不会超过它。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.maximumFramesPerSecond);
});
```

**结果**：在 iPhone Air 模拟器（iOS 27.2）上输出 `60`。

## 对应的 iOS API

`UIScreen.maximumFramesPerSecond`。

## 参见

- [`CADisplayLink`](../ca-display-link.md)
- [`CAFrameRateRange`](../ca-frame-rate-range.md)
