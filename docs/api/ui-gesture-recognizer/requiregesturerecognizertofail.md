---
type: reference
native: "-[UIGestureRecognizer requireGestureRecognizerToFail:]"
---

# `UIGestureRecognizer`：`requireGestureRecognizerToFail()` 方法

**`requireGestureRecognizerToFail()`** 方法让这个识别器等另一个识别器确定认不出手势之后再认。另一个识别器认出了手势，这个识别器就不认。典型的用法是让单击等双击失败。

## 语法

```
requireGestureRecognizerToFail(otherGestureRecognizer)
```

### 参数

**`otherGestureRecognizer`**

另一个识别器，可以是任何一种。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

参数不是识别器（包括 `null`）：`requireGestureRecognizerToFail needs a UIGestureRecognizer`

## 说明

- 建立的关系不能撤销。
- 这个关系不保管识别器。`a.requireGestureRecognizerToFail(b)` 之后，`a` 和 `b` 仍然各自由它所在的视图保管，两个都要加在视图上才有效。其中一个没有加到视图上、App 的代码也没有保存它时，它会被回收，这个关系随之失效。
- 等待会让这个识别器认出得晚一些：系统要先确定另一个识别器认不出。

## 示例

```js
const card = new UIView();

const doubleTap = new UITapGestureRecognizer();
doubleTap.numberOfTapsRequired = 2;
doubleTap.addEventListener('ended', () => {
  console.log('双击');
});
card.addGestureRecognizer(doubleTap);

const singleTap = new UITapGestureRecognizer();
singleTap.addEventListener('ended', () => {
  console.log('单击');
});
singleTap.requireGestureRecognizerToFail(doubleTap);
card.addGestureRecognizer(singleTap);
```

**效果**：快速连点两下 `card`，只输出 `双击`。点一下，输出 `单击`；这一行比没有这层关系时出现得晚，因为系统要先等一小段时间，确定没有第二下。**未在模拟器验证。**

## 对应的 iOS API

`-[UIGestureRecognizer requireGestureRecognizerToFail:]`。

## 参见

- [响应手势](../../guides/gestures.md#让单击等双击失败)
- [所有权](../ui-gesture-recognizer.md#所有权)
