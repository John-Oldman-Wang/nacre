---
type: reference
native: UIWindow.keyWindow
---

# `UIWindow`：`isKeyWindow` 属性

**`isKeyWindow`** 属性表示这个窗口是不是 [key window](../ui-window.md#key-window)：键盘输入等不带位置的输入事件交给它。

## 值

布尔值。

| 取值 | 含义 |
| --- | --- |
| `true` | 这个窗口是 key window |
| `false` | 不是 |

- 只读。给它赋值抛 `TypeError`。
- 调 [`makeKeyAndVisible()`](makekeyandvisible.md) 之后是 `true`。
- 变化时派发 [`becomekey`](becomekey-event.md) 或 [`resignkey`](resignkey-event.md)。
- 窗口还没放进场景时访问它抛 `TypeError`。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  win.rootViewController = new UIViewController();
  console.log(win.isKeyWindow);
  win.makeKeyAndVisible();
  console.log(win.isKeyWindow);
});
```

**结果**：先输出 `false`，再输出 `true`。第一行的值**未在模拟器验证**。

## 对应的 iOS API

`UIWindow.keyWindow`（Swift 里是 `isKeyWindow`）。

## 参见

- [`makeKeyWindow()`](makekeywindow.md)
