---
type: reference
native: "-[UIPanGestureRecognizer setTranslation:inView:]"
---

# `UIPanGestureRecognizer`：`setTranslation()` 方法

**`setTranslation()`** 方法把识别器累计的位移改成指定的值，之后的移动从这个值接着累计。

## 语法

```
setTranslation(translation, { inView })
```

### 参数

**`translation`**

新的位移，[`CGPoint`](../structs.md) 或 `{ x, y }`，在 `inView` 的坐标系里，单位 [pt](../units.md)。

**`options.inView`**

必填。[`UIView`](../ui-view.md) 或 `null`，`null` 表示窗口的坐标系。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 没有写 `inView`：`setTranslation needs { inView }`
- `translation` 缺少字段或字段不是数：`setTranslation is missing y, or it is not a finite number`
- `inView` 不是视图也不是 `null`。

## 说明

- 没有手势在进行时调用不生效，读回来仍是 `(0, 0)`。
- 推荐的拖动写法不需要它：在 `began` 里记下视图的起始位置，在 `changed` 里用「起始位置 + 事件的 `translation`」算新位置，见[拖动一个视图](../../guides/gestures.md#拖动一个视图)。

## 示例

```js
const card = new UIView();
const drag = new UIPanGestureRecognizer();
drag.addEventListener('changed', () => {
  const moved = drag.translationInView(card.superview);
  card.center = new CGPoint(card.center.x + moved.x, card.center.y + moved.y);
  drag.setTranslation(new CGPoint(0, 0), { inView: card.superview });
});
card.addGestureRecognizer(drag);
```

**效果**：每次移动后把位移清零，下一次读到的是这一小段的位移，`card` 跟着手指移动。**未在模拟器验证。**

## 对应的 iOS API

`-[UIPanGestureRecognizer setTranslation:inView:]`。`[pan setTranslation:CGPointZero inView:view]` 写成 `pan.setTranslation(new CGPoint(0, 0), { inView: view })`。

## 参见

- [`translationInView()`](translationinview.md)
