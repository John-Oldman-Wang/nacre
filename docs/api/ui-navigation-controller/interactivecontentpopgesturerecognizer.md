---
type: reference
native: UINavigationController.interactiveContentPopGestureRecognizer
---

# `UINavigationController`：`interactiveContentPopGestureRecognizer` 属性

**`interactiveContentPopGestureRecognizer`** 属性是 iOS 26 加的另一个返回手势：手指在页面内容区的任意位置向右划，也能返回上一页，不用从左边缘开始。

## 值

[`UIGestureRecognizer`](../ui-gesture-recognizer.md)，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 每次读到的是同一个对象。它和 [`interactivePopGestureRecognizer`](interactivepopgesturerecognizer.md) 是两个不同的识别器。
- 导航控制器的视图建出来之后才有值，见 [`interactivePopGestureRecognizer`](interactivepopgesturerecognizer.md)。
- 类型上它可能是 `null`，用之前先判断。

要完全关掉左滑返回，两个识别器的 `isEnabled` 都设成 `false`。

## 示例

```js
const nav = new UINavigationController(new UIViewController());
void nav.view;
for (const recognizer of [nav.interactivePopGestureRecognizer, nav.interactiveContentPopGestureRecognizer]) {
  if (recognizer !== null) {
    recognizer.isEnabled = false;
  }
}
```

**效果**：从边缘划和在内容区划都不再返回上一页。**未在模拟器验证。**

## 对应的 iOS API

`UINavigationController.interactiveContentPopGestureRecognizer`（iOS 26 起）。

## 参见

- [`interactivePopGestureRecognizer`](interactivepopgesturerecognizer.md)
- [左滑返回](../ui-navigation-controller.md#左滑返回)
