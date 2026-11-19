---
type: reference
native: UIWindowDidBecomeKeyNotification
---

# `UIWindow`：`becomekey` 事件

**`becomekey`** 事件在窗口成为 [key window](../ui-window.md#key-window) 时派发：`isKeyWindow` 变为 `true`。

## 语法

```
win.addEventListener('becomekey', (event) => { })
```

## 事件对象

`Event`。只有 `type` 和 `target` 两个字段，`target` 是这个窗口。

不能取消。

## 什么时候派发

- 调 [`makeKeyAndVisible()`](makekeyandvisible.md) 或 [`makeKeyWindow()`](makekeywindow.md) 时派发。
- **监听器要在 `makeKeyAndVisible()` 之前注册。**
- 回调稍后执行，见[运行时怎么工作](../how-it-works.md)。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  win.rootViewController = new UIViewController();
  win.addEventListener('becomekey', (event) => {
    console.log(event.type, event.target === win);
  });
  win.makeKeyAndVisible();
});
```

**效果**：窗口显示后，控制台输出 `becomekey true`。

## 对应的 iOS API

`UIWindowDidBecomeKeyNotification`。

## 参见

- [`resignkey`](resignkey-event.md)
- [`isKeyWindow`](iskeywindow.md)
