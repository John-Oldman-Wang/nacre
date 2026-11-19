---
type: reference
native: UIScreen.nativeScale
---

# `UIScreen`：`nativeScale` 属性

**`nativeScale`** 属性是物理屏幕上一个 pt 对应几个像素。

## 值

数，没有单位：每 pt 的物理像素数。

- 只读。给它赋值抛 `TypeError`。
- 在 iPhone Air 模拟器（iOS 27.2）上是 `3`，和 [`scale`](scale.md) 相同。
- 用户在系统设置里打开「放大显示」时，它会和 `scale` 不同。这种情况**未在模拟器验证**。
- 没有变化通知。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.nativeScale);
});
```

**结果**：在 iPhone Air 模拟器（iOS 27.2）上输出 `3`。

## 对应的 iOS API

`UIScreen.nativeScale`。

## 参见

- [`scale`](scale.md)
- [`nativeBounds`](nativebounds.md)
