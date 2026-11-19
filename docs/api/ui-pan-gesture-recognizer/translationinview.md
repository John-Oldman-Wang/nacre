---
type: reference
native: "-[UIPanGestureRecognizer translationInView:]"
---

# `UIPanGestureRecognizer`：`translationInView()` 方法

**`translationInView()`** 方法返回从手势开始到现在手指移动了多少，换算到指定视图的坐标系里。

## 语法

```
translationInView(view)
```

### 参数

**`view`**

[`UIView`](../ui-view.md) 或 `null`。位移换算到这个视图的坐标系里。`null` 表示窗口的坐标系。

### 返回值

[`CGPoint`](../structs.md)，单位 [pt](../units.md)。`x` 向右为正，`y` 向下为正。没有手势在进行时是 `(0, 0)`。

### 异常

**`TypeError`**

`view` 不是视图也不是 `null`：`translationInView needs a UIView or null`

## 说明

在事件回调里调它，读到的是回调执行那一刻的值，不是事件发生那一刻的值。事件发生那一刻的位移在事件对象的 `translation` 上，坐标系是识别器所在的视图，见 [`changed`](../ui-gesture-recognizer/changed-event.md)。

需要别的坐标系时才调它。比如被拖的视图设置了缩放或旋转的 `transform`，事件里的位移和父视图坐标系里的位移不同，这时调 `translationInView(父视图)`。

## 示例

```js
const page = new UIView();
const card = new UIView();
page.addSubview(card);
const drag = new UIPanGestureRecognizer();
drag.addEventListener('changed', () => {
  const moved = drag.translationInView(page);
  console.log(moved.x, moved.y);
});
card.addGestureRecognizer(drag);
```

**效果**：拖动 `card` 时，控制台输出在 `page` 坐标系里累计的位移。**未在模拟器验证。**

## 对应的 iOS API

`-[UIPanGestureRecognizer translationInView:]`。

## 参见

- [`setTranslation()`](settranslation.md)：把位移清零或改成别的值
- [`velocityInView()`](velocityinview.md)
