---
type: reference
native: UINavigationController.interactivePopGestureRecognizer
---

# `UINavigationController`：`interactivePopGestureRecognizer` 属性

**`interactivePopGestureRecognizer`** 属性是左滑返回用的那个手势：手指从左边缘向右划，栈顶的页面跟着手指移开，松手时返回上一页。见[左滑返回](../ui-navigation-controller.md#左滑返回)。

## 值

[`UIGestureRecognizer`](../ui-gesture-recognizer.md)，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 每次读到的是同一个对象。
- 它挂在导航控制器自己的视图上，`view` 就是导航控制器的 [`view`](../ui-view-controller/view.md)。
- 导航控制器的视图建出来之后才有值。读一次导航控制器的 `view` 就会把视图建出来；导航控制器显示到屏幕上之后一定有。
- 类型上它可能是 `null`，用之前先判断。

它是一个普通的识别器，[`UIGestureRecognizer`](../ui-gesture-recognizer.md) 的成员都能用。最常用的是 `isEnabled`：设成 `false` 就关掉了左滑返回，设回 `true` 恢复。默认是 `true`。

## 示例

```js
const nav = new UINavigationController(new UIViewController());
void nav.view;
const swipeBack = nav.interactivePopGestureRecognizer;
if (swipeBack !== null) {
  swipeBack.isEnabled = false;
}
```

**效果**：左滑不再返回上一页，点导航条上的返回按钮照样能返回。`isEnabled` 读回 `false`；**左滑没有反应这一点未在模拟器验证。** 提交订单这类进行中不该被打断的操作，开始时关掉、结束后再打开。

## 对应的 iOS API

`UINavigationController.interactivePopGestureRecognizer`。

## 参见

- [`interactiveContentPopGestureRecognizer`](interactivecontentpopgesturerecognizer.md)：在内容区任意位置向右划返回
- [左滑返回](../ui-navigation-controller.md#左滑返回)
- [`UIGestureRecognizer`](../ui-gesture-recognizer.md)
