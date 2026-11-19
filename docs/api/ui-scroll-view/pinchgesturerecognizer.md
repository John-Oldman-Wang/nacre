---
type: reference
native: UIScrollView.pinchGestureRecognizer
---

# `UIScrollView`：`pinchGestureRecognizer` 属性

**`pinchGestureRecognizer`** 属性是滚动视图用来识别双指捏合的手势识别器。

## 值

[`UIPinchGestureRecognizer`](../ui-gesture-recognizer.md)，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 不能缩放时（最小和最大比例都是 `1`）可能是 `null`。验收用例两种都接受。
- 双指捏合缩放还不能用：系统要当场问「缩放的是哪个子视图」，这一问还没接。

## 示例

```js
const scroller = new UIScrollView();
console.log(scroller.pinchGestureRecognizer === null);
```

**结果**：新建的滚动视图上输出 `true` 或 `false`。**未在模拟器验证。**

## 对应的 iOS API

`UIScrollView.pinchGestureRecognizer`。

## 参见

- [`zoomScale`](zoomscale.md)
