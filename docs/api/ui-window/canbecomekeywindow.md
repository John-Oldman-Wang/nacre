---
type: reference
native: UIWindow.canBecomeKeyWindow
---

# `UIWindow`：`canBecomeKeyWindow` 属性

**`canBecomeKeyWindow`** 属性表示这个窗口能不能成为 key window。

## 值

布尔值。

| 取值 | 含义 |
| --- | --- |
| `true` | 可以成为 key window |
| `false` | 不可以，对它调 [`makeKeyWindow()`](makekeywindow.md) 不起作用 |

- 只读。给它赋值抛 `TypeError`。
- 这个值由系统决定，不会变化，所以没有变化事件。
- 实际取值**未在模拟器验证**。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  console.log(win.canBecomeKeyWindow);
});
```

**结果**：输出这个窗口能不能成为 key window。**未在模拟器验证。**

## 对应的 iOS API

`UIWindow.canBecomeKeyWindow`。

## 参见

- [`isKeyWindow`](iskeywindow.md)
