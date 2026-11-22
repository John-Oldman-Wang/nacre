---
type: reference
native: UIGestureRecognizerStateCancelled
---

# `UIGestureRecognizer`：`cancelled` 事件

**`cancelled`** 事件在连续手势被打断时派发。

## 语法

```
addEventListener('cancelled', (event) => { })
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

- 长按进行中 App 退到后台时派发（真机实测）。
- 长按进行中识别器的 [`isEnabled`](isenabled.md) 被设成 `false` 时也应当派发，**未在模拟器验证**。
- 点按和轻扫不派发。
- 派发了 `cancelled` 的手势不再派发 [`ended`](ended-event.md)。手势进行中改了界面的，在这里恢复。

## 示例

```js
const card = new UIView();
const press = new UILongPressGestureRecognizer();
press.addEventListener('began', () => {
  card.alpha = 0.6;
});
const restore = () => {
  card.alpha = 1;
};
press.addEventListener('ended', restore);
press.addEventListener('cancelled', restore);
card.addGestureRecognizer(press);
```

**效果**：按住 `card` 0.5 秒后它变淡。松手，或者长按被打断，都恢复不透明。**透明度的变化未在模拟器验证。**

## 对应的 iOS API

`UIGestureRecognizerStateCancelled`。原生的 action 方法收到所有阶段，在方法里判断 `state`；这里监听 `'cancelled'`。

## 参见

- [`ended`](ended-event.md)
- [`isEnabled`](isenabled.md)
