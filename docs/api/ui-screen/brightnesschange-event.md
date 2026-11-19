---
type: reference
native: UIScreenBrightnessDidChangeNotification
---

# `UIScreen`：`brightnesschange` 事件

**`brightnesschange`** 事件在屏幕亮度变了时派发。

## 语法

```
screen.addEventListener('brightnesschange', (event) => { })
```

## 事件对象

`Event`。`type` 是 `'brightnesschange'`，`target` 是这块屏幕。事件对象不带新的值，在回调里读屏幕的属性。不能取消，`event.cancelable` 是 `false`。

## 什么时候派发

| 什么引起的 | 派发吗 |
| --- | --- |
| 用户在控制中心或系统设置里调亮度 | 派发。**未在模拟器验证** |
| 自动亮度随环境光调整 | **未在模拟器验证** |
| App 自己写 [`brightness`](brightness.md) | **未在模拟器验证**，不要依赖它派发或者不派发 |

- 回调不是在变化的那一刻同步执行，而是稍后执行，见[运行时怎么工作](../how-it-works.md#事件)。
- 没有监听器时没有开销。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  screen.addEventListener('brightnesschange', () => {
    console.log(screen.brightness);
  });
});
```

**效果**：用户在控制中心拖动亮度条，输出新的亮度。**未在模拟器验证。**

## 对应的 iOS API

`UIScreenBrightnessDidChangeNotification`。

## 参见

- [`brightness`](brightness.md)
