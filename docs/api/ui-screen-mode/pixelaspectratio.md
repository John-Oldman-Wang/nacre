---
type: reference
native: UIScreenMode.pixelAspectRatio
---

# `UIScreenMode`：`pixelAspectRatio` 属性

**`pixelAspectRatio`** 属性是这种显示模式下一个像素的宽高比。

## 值

数，没有单位：一个像素的宽除以高。

- 只读。给它赋值抛 `TypeError`。
- `1` 表示像素是正方形。在 iPhone Air 模拟器（iOS 27.2）上是 `1`。
- 一个显示模式对象的值不变。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.currentMode !== null && screen.currentMode.pixelAspectRatio);
});
```

**结果**：在 iPhone Air 模拟器（iOS 27.2）上输出 `1`。

## 对应的 iOS API

`UIScreenMode.pixelAspectRatio`。

## 参见

- [`UIScreenMode`](../ui-screen-mode.md)
