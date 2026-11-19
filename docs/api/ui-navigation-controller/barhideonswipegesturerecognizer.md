---
type: reference
native: UINavigationController.barHideOnSwipeGestureRecognizer
---

# `UINavigationController`：`barHideOnSwipeGestureRecognizer` 属性

**`barHideOnSwipeGestureRecognizer`** 属性是 [`hidesBarsOnSwipe`](hidesbarsonswipe.md) 用的那个手势。打开 `hidesBarsOnSwipe` 之后，藏起和显示导航条就是它驱动的。

## 值

[`UIPanGestureRecognizer`](../ui-pan-gesture-recognizer.md)，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 每次读到的是同一个对象。
- 类型上它可能是 `null`，用之前先判断。

拿到它，可以设置它和页面里其他手势谁优先，或者用 `isEnabled` 临时停用。

## 示例

```js
const nav = new UINavigationController(new UIViewController());
nav.hidesBarsOnSwipe = true;
console.log(nav.barHideOnSwipeGestureRecognizer instanceof UIPanGestureRecognizer);
```

**结果**：输出 `true`。

## 对应的 iOS API

`UINavigationController.barHideOnSwipeGestureRecognizer`。

## 参见

- [`hidesBarsOnSwipe`](hidesbarsonswipe.md)
- [`UIPanGestureRecognizer`](../ui-pan-gesture-recognizer.md)
