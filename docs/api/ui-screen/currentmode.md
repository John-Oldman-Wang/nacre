---
type: reference
native: UIScreen.currentMode
---

# `UIScreen`：`currentMode` 属性

**`currentMode`** 属性是这块屏幕此刻用的显示模式。

## 值

[`UIScreenMode`](../ui-screen-mode.md) 或 `null`。

- 可读，可写。
- 在 iPhone Air 模拟器（iOS 27.2）上读到一个 `UIScreenMode`，它的 [`size`](../ui-screen-mode/size.md) 和 [`nativeBounds`](nativebounds.md) 一样大。
- 写入用来给外接显示器换分辨率，值从 [`availableModes`](availablemodes.md) 里挑。手机自己的屏幕只有一种模式，写入没有可换的。写入的效果**未在模拟器验证**。
- 变了派发 [`modechange`](modechange-event.md) 事件。

### 写错时

写不是原生对象的值抛 `TypeError`：

```
TypeError: currentMode needs a native object or null, got "mode"
```

写别的原生对象（比如一个视图）也抛 `TypeError`，报错是 `currentMode needs a UIScreenMode or null`。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.currentMode !== null && screen.currentMode.size.width);
});
```

**结果**：在 iPhone Air 模拟器（iOS 27.2）上输出 `1260`。

## 对应的 iOS API

`UIScreen.currentMode`。

## 参见

- [`availableModes`](availablemodes.md)
- [`modechange`](modechange-event.md)
