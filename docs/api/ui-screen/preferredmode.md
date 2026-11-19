---
type: reference
native: UIScreen.preferredMode
---

# `UIScreen`：`preferredMode` 属性

**`preferredMode`** 属性是这块屏幕最合适的显示模式。

## 值

[`UIScreenMode`](../ui-screen-mode.md) 或 `null`。

- 只读。给它赋值抛 `TypeError`。
- 在 iPhone Air 模拟器（iOS 27.2）上读到一个 `UIScreenMode`。什么时候是 `null` **未在模拟器验证**。
- 没有变化通知。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.preferredMode !== null);
});
```

**结果**：输出 `true`。

## 对应的 iOS API

`UIScreen.preferredMode`。

## 参见

- [`currentMode`](currentmode.md)
