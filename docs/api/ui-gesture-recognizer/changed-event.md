---
type: reference
native: UIGestureRecognizerStateChanged
---

# `UIGestureRecognizer`：`changed` 事件

**`changed`** 事件在连续手势进行中、手指移动时派发。

## 语法

```
addEventListener('changed', (event) => { })
```

## 事件对象

[`UIGestureRecognizerEvent`](../ui-gesture-recognizer-event.md)。除了 `type` 和 `target`，还带两个只读字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| [`location`](../ui-gesture-recognizer-event/location.md) | [`CGPoint`](../structs.md) 或 `null` | 手势的位置，在识别器所在视图的坐标系里，单位 [pt](../units.md)。多根手指时是它们的中心点。要换算到别的视图，用视图的 `convertPoint()` |
| [`numberOfTouches`](../ui-gesture-recognizer-event/numberoftouches.md) | 数 | 事件发生时参与手势的手指个数 |

三种识别器的事件对象是它的子类，各多两个只读字段，都是事件发生那一刻的值：

| 识别器 | 事件对象的类型 | 字段 | 类型 | 含义 |
| --- | --- | --- | --- | --- |
| [`UIPanGestureRecognizer`](../ui-pan-gesture-recognizer.md)、[`UIScreenEdgePanGestureRecognizer`](../ui-screen-edge-pan-gesture-recognizer.md) | [`UIPanGestureRecognizerEvent`](../ui-pan-gesture-recognizer-event.md) | [`translation`](../ui-pan-gesture-recognizer-event/translation.md) | `CGPoint` | 从手势开始到这个事件为止手指移动了多少，在识别器所在视图的坐标系里，单位 pt |
| | | [`velocity`](../ui-pan-gesture-recognizer-event/velocity.md) | `CGPoint` | 手指移动的速度，坐标系同上，单位是 pt 每秒 |
| [`UIPinchGestureRecognizer`](../ui-pinch-gesture-recognizer.md) | [`UIPinchGestureRecognizerEvent`](../ui-pinch-gesture-recognizer-event.md) | [`scale`](../ui-pinch-gesture-recognizer-event/scale.md) | 数 | 两指的间距相对手势开始时的倍数 |
| | | [`velocity`](../ui-pinch-gesture-recognizer-event/velocity.md) | 数 | `scale` 每秒变化多少 |
| [`UIRotationGestureRecognizer`](../ui-rotation-gesture-recognizer.md) | [`UIRotationGestureRecognizerEvent`](../ui-rotation-gesture-recognizer-event.md) | [`rotation`](../ui-rotation-gesture-recognizer-event/rotation.md) | 数 | 相对手势开始时转过的角度，单位是弧度 |
| | | [`velocity`](../ui-rotation-gesture-recognizer-event/velocity.md) | 数 | 旋转的速度，单位是弧度每秒 |

这些值只能从事件对象上读：回调比手势晚执行，回头在识别器上读不到当时的值。

不能取消：`preventDefault()` 没有效果。事件只派发给识别器自己，不传给视图或父视图。

## 什么时候派发

- 长按、拖动、捏合、旋转、屏幕边缘拖动在 [`began`](began-event.md) 之后，手指每移动一次派发一次。
- 长按被认出之后按住不动，一次 `changed` 都不派发；按住之后分四步移动手指，收到 4 次 `changed`（实测）。
- 点按和轻扫不派发。
- 拖动、捏合、旋转、屏幕边缘拖动的派发**未在模拟器验证**。

## 示例

```js
const card = new UIView();
const drag = new UIPanGestureRecognizer();
let start = card.center;
drag.addEventListener('began', () => {
  start = card.center;
});
drag.addEventListener('changed', (e) => {
  const { translation } = e;
  card.center = new CGPoint(start.x + translation.x, start.y + translation.y);
});
card.addGestureRecognizer(drag);
```

**效果**：按住 `card` 并移动手指，`card` 跟着手指移动。松手后停在松手的位置。**未在模拟器验证。**

## 对应的 iOS API

`UIGestureRecognizerStateChanged`。原生的 action 方法收到所有阶段，在方法里判断 `state`；这里监听 `'changed'`。

## 参见

- [`began`](began-event.md)、[`ended`](ended-event.md)
- [响应手势](../../guides/gestures.md#拖动一个视图)
