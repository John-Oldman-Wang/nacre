---
type: reference
native: UIScreen.bounds
---

# `UIScreen`：`bounds` 属性

**`bounds`** 属性是整块屏幕的范围，单位 [pt](../units.md)。

## 值

[`CGRect`](../cg-rect.md)，单位 pt。

- 只读。给它赋值抛 `TypeError`。
- 原点是 `(0, 0)`，宽和高是屏幕的点尺寸。在 iPhone Air 模拟器（iOS 27.2）上是 `420 × 912`。
- 竖着拿手机时高比宽大。横屏时宽和高会不会互换**未在模拟器验证**。
- 没有变化通知。屏幕的大小只在横竖屏切换时变，屏幕方向的事件还没做，见[还不能做的](../ui-screen.md#还不能做的)。

它是整块屏幕，包括状态栏和底部横条占住的地方。放内容要避开它们，用视图的安全区（[`safeAreaLayoutGuide`](../ui-view/safearealayoutguide.md)），不要用屏幕的大小去算。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.bounds.width, screen.bounds.height);
});
```

**结果**：在 iPhone Air 模拟器（iOS 27.2）上输出 `420 912`。

## 对应的 iOS API

`UIScreen.bounds`。

## 参见

- [`nativeBounds`](nativebounds.md)：同一块屏幕的像素尺寸
- [单位](../units.md)
