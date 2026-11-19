---
type: reference
native: UIScreenModeDidChangeNotification
---

# `UIScreen`：`modechange` 事件

**`modechange`** 事件在屏幕的显示模式变了时派发。

## 语法

```
screen.addEventListener('modechange', (event) => { })
```

## 事件对象

`Event`。`type` 是 `'modechange'`，`target` 是这块屏幕。事件对象不带新的值，在回调里读屏幕的属性。不能取消，`event.cancelable` 是 `false`。

## 什么时候派发

[`currentMode`](currentmode.md) 变了时派发，一般发生在外接显示器换分辨率时。手机自己的屏幕只有一种模式，不会派发。**未在模拟器验证。**

- 回调不是在变化的那一刻同步执行，而是稍后执行，见[运行时怎么工作](../how-it-works.md#事件)。
- 没有监听器时没有开销。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  screen.addEventListener('modechange', () => {
    const mode = screen.currentMode;
    if (mode !== null) console.log(mode.size.width, mode.size.height);
  });
});
```

**效果**：屏幕换了显示模式时，输出新模式的像素大小。**未在模拟器验证。**

## 对应的 iOS API

`UIScreenModeDidChangeNotification`。

## 参见

- [`currentMode`](currentmode.md)
- [`UIScreenMode`](../ui-screen-mode.md)
