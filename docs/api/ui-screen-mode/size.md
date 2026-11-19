---
type: reference
native: UIScreenMode.size
---

# `UIScreenMode`：`size` 属性

**`size`** 属性是这种显示模式的大小，单位是像素。

## 值

[`CGSize`](../cg-size.md)，单位是像素。

- 只读。给它赋值抛 `TypeError`。
- 在 iPhone Air 模拟器（iOS 27.2）上，屏幕的 `currentMode` 的 `size` 是 `1260 × 2736`，和屏幕的 [`nativeBounds`](../ui-screen/nativebounds.md) 一样大。
- 一个显示模式对象的值不变。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.currentMode !== null && screen.currentMode.size.height);
});
```

**结果**：在 iPhone Air 模拟器（iOS 27.2）上输出 `2736`。

## 对应的 iOS API

`UIScreenMode.size`。

## 参见

- [`UIScreenMode`](../ui-screen-mode.md)
