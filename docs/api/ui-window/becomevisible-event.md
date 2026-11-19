---
type: reference
native: UIWindowDidBecomeVisibleNotification
---

# `UIWindow`：`becomevisible` 事件

**`becomevisible`** 事件在窗口从隐藏变为显示时派发：`isHidden` 变为 `false`。

## 语法

```
win.addEventListener('becomevisible', (event) => { })
```

## 事件对象

`Event`。只有 `type` 和 `target` 两个字段，`target` 是这个窗口。

不能取消。

## 什么时候派发

- 调 [`makeKeyAndVisible()`](../ui-window/makekeyandvisible.md) 时派发，接着派发 [`becomekey`](becomekey-event.md)。
- 把 `isHidden` 从 `true` 设成 `false` 时派发。**未在模拟器验证。**
- **监听器要在 `makeKeyAndVisible()` 之前注册。** 之后注册的收不到已经派发过的事件。
- 回调不是在变化发生的那一刻同步执行，而是稍后执行，见[运行时怎么工作](../how-it-works.md)。回调里读到的属性是执行回调时的值。实测：这个回调里 `isKeyWindow` 已经是 `true`，因为那时窗口也已经成为 key window 了。
- 事件只表示窗口显示了。页面的内容在调 `makeKeyAndVisible()` 之前就可以加，不需要等这个事件。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  win.rootViewController = new UIViewController();
  win.addEventListener('becomevisible', () => {
    console.log('窗口显示了，isHidden =', win.isHidden);
  });
  win.makeKeyAndVisible();
});
```

**效果**：控制台输出 `窗口显示了，isHidden = false`。

## 对应的 iOS API

`UIWindowDidBecomeVisibleNotification`。

## 参见

- [`becomehidden`](becomehidden-event.md)
