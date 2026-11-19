---
type: reference
native: UIWindowDidResignKeyNotification
---

# `UIWindow`：`resignkey` 事件

**`resignkey`** 事件在窗口不再是 [key window](../ui-window.md#key-window) 时派发：`isKeyWindow` 变为 `false`。

## 语法

```
win.addEventListener('resignkey', (event) => { })
```

## 事件对象

`Event`。只有 `type` 和 `target` 两个字段，`target` 是这个窗口。

不能取消。

## 什么时候派发

- 另一个窗口成为 key window 时，原来的 key window 派发。
- 这个事件的派发**未在模拟器验证**。
- 回调稍后执行，见[运行时怎么工作](../how-it-works.md)。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  win.rootViewController = new UIViewController();
  win.addEventListener('resignkey', () => {
    console.log('不再是 key window');
  });
  win.makeKeyAndVisible();

  const overlay = new UIWindow(e.scene);
  overlay.rootViewController = new UIViewController();
  overlay.makeKeyAndVisible();
});
```

**效果**：`overlay` 成为 key window 后，控制台输出 `不再是 key window`。**未在模拟器验证。**

## 对应的 iOS API

`UIWindowDidResignKeyNotification`。

## 参见

- [`becomekey`](becomekey-event.md)
