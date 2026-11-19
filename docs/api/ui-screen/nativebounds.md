---
type: reference
native: UIScreen.nativeBounds
---

# `UIScreen`：`nativeBounds` 属性

**`nativeBounds`** 属性是物理屏幕的范围，单位是像素。

## 值

[`CGRect`](../cg-rect.md)，单位是像素。

- 只读。给它赋值抛 `TypeError`。
- 在 iPhone Air 模拟器（iOS 27.2）上是 `1260 × 2736`，等于 [`bounds`](bounds.md) 乘 [`nativeScale`](nativescale.md)。
- 按 iOS 的定义，它总是按竖屏给，不随横竖屏变化。**未在模拟器验证。**
- 没有变化通知。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.nativeBounds.width, screen.nativeBounds.height);
});
```

**结果**：在 iPhone Air 模拟器（iOS 27.2）上输出 `1260 2736`。

## 对应的 iOS API

`UIScreen.nativeBounds`。

## 参见

- [`bounds`](bounds.md)
- [`nativeScale`](nativescale.md)
