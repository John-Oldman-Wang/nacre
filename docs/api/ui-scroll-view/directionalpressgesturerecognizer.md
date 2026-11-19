---
type: reference
native: UIScrollView.directionalPressGestureRecognizer
---

# `UIScrollView`：`directionalPressGestureRecognizer` 属性

**`directionalPressGestureRecognizer`** 属性是识别方向键按下的手势识别器。按 Apple 的文档，它用于 tvOS 的遥控器。

## 值

[`UIGestureRecognizer`](../ui-gesture-recognizer.md)，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 这个属性是按 iOS 的头文件补上的。验收用例验证过它读得出来、类型对、效果**未在模拟器验证**，用法照 Apple 的文档。

## 示例

```js
const scroller = new UIScrollView();
console.log(scroller.directionalPressGestureRecognizer === null);
```

**结果**：输出 `true` 或 `false`。**未在模拟器验证。**

## 对应的 iOS API

`UIScrollView.directionalPressGestureRecognizer`。
