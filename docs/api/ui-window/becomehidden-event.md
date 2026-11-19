---
type: reference
native: UIWindowDidBecomeHiddenNotification
---

# `UIWindow`：`becomehidden` 事件

**`becomehidden`** 事件在窗口从显示变为隐藏时派发：`isHidden` 变为 `true`。

## 语法

```
win.addEventListener('becomehidden', (event) => { })
```

## 事件对象

`Event`。只有 `type` 和 `target` 两个字段，`target` 是这个窗口。

不能取消。

## 什么时候派发

- 把显示着的窗口的 `isHidden` 设成 `true` 时派发。
- 这个事件的派发**未在模拟器验证**。
- 回调稍后执行，见[运行时怎么工作](../how-it-works.md)。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  win.rootViewController = new UIViewController();
  win.makeKeyAndVisible();

  win.addEventListener('becomehidden', () => {
    console.log('窗口隐藏了');
  });
  win.isHidden = true;
});
```

**效果**：窗口和里面的所有内容从屏幕上消失，控制台输出 `窗口隐藏了`。**未在模拟器验证。**

## 对应的 iOS API

`UIWindowDidBecomeHiddenNotification`。

## 参见

- [`becomevisible`](becomevisible-event.md)
