---
type: reference
native: UIScreen.scale
---

# `UIScreen`：`scale` 属性

**`scale`** 属性是这块屏幕上一个 pt 对应几个像素。

## 值

数，没有单位：每 pt 的像素数。

- 只读。给它赋值抛 `TypeError`。
- 在 iPhone Air 模拟器（iOS 27.2）上是 `3`：1 pt 宽是 3 个像素。
- 和 [`traitCollection.displayScale`](../ui-trait-collection.md) 相同。
- 没有变化通知：同一块屏幕的 `scale` 不变。

要画出清楚的位图（比如图层的 [`contentsScale`](../ca-layer/contentsscale.md)），设成这个值。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.scale);
});
```

**结果**：在 iPhone Air 模拟器（iOS 27.2）上输出 `3`。

## 对应的 iOS API

`UIScreen.scale`。iOS 26 起 Apple 推荐从 `traitCollection.displayScale` 读，两个值相同。

## 参见

- [`UIScreen`](../ui-screen.md)
- [`nativeScale`](nativescale.md)
- [单位](../units.md)
