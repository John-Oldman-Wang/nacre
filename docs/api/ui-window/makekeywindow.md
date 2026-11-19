---
type: reference
native: "-[UIWindow makeKeyWindow]"
---

# `UIWindow`：`makeKeyWindow()` 方法

**`makeKeyWindow()`** 方法让这个窗口成为 [key window](../ui-window.md#key-window)，不改变它是否显示。

## 语法

```
makeKeyWindow()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

窗口还没放进场景：`makeKeyWindow(): this object is not connected to a scene yet, so no native object exists`。

## 说明

- 有多个窗口时用它指定哪一个是 key window。只有一个窗口的 App 不需要调它。
- [`canBecomeKeyWindow`](canbecomekeywindow.md) 是 `false` 的窗口，调它不起作用。
- 成为 key window 时派发 [`becomekey`](becomekey-event.md)；原来的 key window 派发 [`resignkey`](resignkey-event.md)。
- 整个方法的效果**未在模拟器验证**。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const overlay = new UIWindow(e.scene);
  overlay.rootViewController = new UIViewController();
  overlay.isHidden = false;
  overlay.makeKeyWindow();
});
```

**效果**：`overlay` 显示出来并成为 key window。**未在模拟器验证。**

## 对应的 iOS API

`-[UIWindow makeKeyWindow]`。`becomeKeyWindow` 和 `resignKeyWindow` 是系统通知窗口用的，没有对应的方法。

## 参见

- [`makeKeyAndVisible()`](makekeyandvisible.md)
