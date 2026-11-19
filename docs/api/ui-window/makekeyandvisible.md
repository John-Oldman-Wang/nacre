---
type: reference
native: "-[UIWindow makeKeyAndVisible]"
---

# `UIWindow`：`makeKeyAndVisible()` 方法

**`makeKeyAndVisible()`** 方法显示窗口，并让它成为 [key window](../ui-window.md#key-window)。

## 语法

```
makeKeyAndVisible()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

窗口还没放进场景：`makeKeyAndVisible(): this object is not connected to a scene yet, so no native object exists`。

## 说明

- 执行后，窗口的 `isHidden` 变成 `false`，[`isKeyWindow`](iskeywindow.md) 变成 `true`，依次派发 [`becomevisible`](becomevisible-event.md) 和 [`becomekey`](becomekey-event.md)。**这两个事件的先后顺序未在模拟器验证。**
- 监听这两个事件要在调它之前注册。
- 这一步最容易漏。漏了之后窗口已经在场景里，`rootViewController` 也读得到，`isHidden` 是 `true`，屏幕是黑的，没有任何报错。
- 和设 [`rootViewController`](rootviewcontroller.md) 的先后可以调换，**未在模拟器验证**。先设根页面再调它。
- 对已经显示的窗口再调一次的结果，**未在模拟器验证**。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;

  win.addEventListener('becomekey', () => {
    console.log('isKeyWindow =', win.isKeyWindow);
  });
  win.makeKeyAndVisible();
});
```

**效果**：屏幕显示页面，控制台输出 `isKeyWindow = true`。

## 对应的 iOS API

`-[UIWindow makeKeyAndVisible]`。

## 参见

- [`makeKeyWindow()`](makekeywindow.md)
