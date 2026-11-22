---
type: reference
native: UIGestureRecognizerStateBegan
---

# `UIGestureRecognizer`：`began` 事件

**`began`** 事件在连续手势被认出的那一刻派发。

## 语法

```
addEventListener('began', (event) => { })
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

| 识别器 | 什么时候派发 |
| --- | --- |
| [`UILongPressGestureRecognizer`](../ui-long-press-gesture-recognizer.md) | 手指按够 `minimumPressDuration`，默认 0.5 秒（实测） |
| [`UIPanGestureRecognizer`](../ui-pan-gesture-recognizer.md)、[`UIScreenEdgePanGestureRecognizer`](../ui-screen-edge-pan-gesture-recognizer.md) | 手指按下并移动了一小段距离 |
| [`UIPinchGestureRecognizer`](../ui-pinch-gesture-recognizer.md)、[`UIRotationGestureRecognizer`](../ui-rotation-gesture-recognizer.md) | 两根手指的捏合或旋转被认出 |
| [`UITapGestureRecognizer`](../ui-tap-gesture-recognizer.md)、[`UISwipeGestureRecognizer`](../ui-swipe-gesture-recognizer.md) | 不派发。它们只派发 [`ended`](ended-event.md) |

- 每次手势一次。之后是零次或多次 [`changed`](changed-event.md)，最后是 [`ended`](ended-event.md) 或 [`cancelled`](cancelled-event.md)。
- 手势没被认出时不派发。比如长按没按够时间就抬起，或者按够之前手指移动超过了 `allowableMovement`。
- 拖动、捏合、旋转、屏幕边缘拖动的派发**未在模拟器验证**。

## 示例

```js
const card = new UIView();
const press = new UILongPressGestureRecognizer();
press.addEventListener('began', (e) => {
  const { location } = e;
  if (location !== null) {
    console.log('按住了', location.x, location.y);
  }
});
card.addGestureRecognizer(press);
```

**效果**：按住 `card` 0.5 秒，控制台输出 `按住了` 和手指在 `card` 里的坐标。

## 对应的 iOS API

`UIGestureRecognizerStateBegan`。原生的 action 方法收到所有阶段，在方法里判断 `state`；这里监听 `'began'`。

## 参见

- [`changed`](changed-event.md)、[`ended`](ended-event.md)、[`cancelled`](cancelled-event.md)
- [离散手势和连续手势](../ui-gesture-recognizer.md#离散手势和连续手势)
