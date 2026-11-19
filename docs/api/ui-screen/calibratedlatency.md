---
type: reference
native: UIScreen.calibratedLatency
---

# `UIScreen`：`calibratedLatency` 属性

**`calibratedLatency`** 属性是这块屏幕的显示硬件的延迟。

## 值

数，单位是秒。

- 只读。给它赋值抛 `TypeError`。
- 用户没有校准过显示延迟时是 `0`。在 iPhone Air 模拟器（iOS 27.2）上是 `0`。
- 没有变化通知。

自己做视频播放、要让声音和画面对齐时用它。一般的 App 用不到。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.calibratedLatency);
});
```

**结果**：在 iPhone Air 模拟器（iOS 27.2）上输出 `0`。

## 对应的 iOS API

`UIScreen.calibratedLatency`。

## 参见

- [`UIScreen`](../ui-screen.md)
