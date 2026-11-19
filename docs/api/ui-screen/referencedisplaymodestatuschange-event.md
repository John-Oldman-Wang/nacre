---
type: reference
native: UIScreenReferenceDisplayModeStatusDidChangeNotification
---

# `UIScreen`：`referencedisplaymodestatuschange` 事件

**`referencedisplaymodestatuschange`** 事件在屏幕的参考显示模式的状态变了时派发。

## 语法

```
screen.addEventListener('referencedisplaymodestatuschange', (event) => { })
```

## 事件对象

`Event`。`type` 是 `'referencedisplaymodestatuschange'`，`target` 是这块屏幕。事件对象不带新的值，在回调里读屏幕的属性。不能取消，`event.cancelable` 是 `false`。

## 什么时候派发

[`referenceDisplayModeStatus`](referencedisplaymodestatus.md) 变了时派发：用户在系统设置里打开或关闭参考显示模式，或者设备过热、电量不足让它暂时做不到准确显示。不支持参考显示模式的屏幕不会派发。**未在模拟器验证。**

- 回调不是在变化的那一刻同步执行，而是稍后执行，见[运行时怎么工作](../how-it-works.md#事件)。
- 没有监听器时没有开销。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  screen.addEventListener('referencedisplaymodestatuschange', () => {
    console.log(screen.referenceDisplayModeStatus, screen.potentialEDRHeadroom);
  });
});
```

**效果**：状态变了时，输出新的状态和最多能有的亮度余量。**未在模拟器验证。**

## 对应的 iOS API

`UIScreenReferenceDisplayModeStatusDidChangeNotification`。

## 参见

- [`referenceDisplayModeStatus`](referencedisplaymodestatus.md)
- [`potentialEDRHeadroom`](potentialedrheadroom.md)
