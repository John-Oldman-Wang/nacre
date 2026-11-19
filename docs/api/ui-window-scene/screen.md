---
type: reference
native: UIWindowScene.screen
---

# `UIWindowScene`：`screen` 属性

**`screen`** 属性是这个场景显示在哪块屏幕上。

## 值

[`UIScreen`](../ui-screen.md)。

- 只读。给它赋值抛 `TypeError`。
- 同一个场景每次读到的是同一个对象。
- 它是 JS 拿到屏幕的唯一途径。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen === e.scene.screen, screen.scale);
});
```

**结果**：在 iPhone Air 模拟器（iOS 27.2）上输出 `true 3`。

## 对应的 iOS API

`UIWindowScene.screen`。ObjC 里的 `UIScreen.mainScreen` 在 iOS 26 废弃了，这里不提供，从场景读。

## 参见

- [`UIScreen`](../ui-screen.md)
