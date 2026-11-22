---
type: reference
native: UIGestureRecognizerStateEnded
---

# `UIGestureRecognizer`：`ended` 事件

**`ended`** 事件在手势正常结束时派发。离散手势（点按、轻扫）被认出时也派发这个事件，而且只派发这一个。

## 语法

```
addEventListener('ended', (event) => { })
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
| [`UITapGestureRecognizer`](../ui-tap-gesture-recognizer.md) | 点按被认出（实测） |
| [`UISwipeGestureRecognizer`](../ui-swipe-gesture-recognizer.md) | 轻扫被认出 |
| [`UILongPressGestureRecognizer`](../ui-long-press-gesture-recognizer.md) | 被认出之后手指抬起（实测）。`location` 是手指抬起时的位置 |
| 拖动、捏合、旋转、屏幕边缘拖动 | 被认出之后全部手指抬起 |

- 单指点按的 `ended` 和单指长按抬起时的 `ended` 里，`numberOfTouches` 都是 1（实测）。
- 拖动的 `ended` 里的 `velocity` 是松手那一刻的速度，要做惯性动画从这里读。回调执行时手势已经结束，再调 `velocityInView()` 读不到这个值。
- 轻扫、拖动、捏合、旋转、屏幕边缘拖动的派发**未在模拟器验证**。

## 示例

```js
const card = new UIView();
const tap = new UITapGestureRecognizer();
tap.addEventListener('ended', (e) => {
  const { location } = e;
  if (location !== null) {
    console.log(location.x, location.y);
  }
});
card.addGestureRecognizer(tap);
```

**效果**：点 `card`，控制台输出点的位置。验收用例里核对过：点在视图内距左边 28 pt、距上边 28 pt 的位置，`location` 是 `(28, 28)`。

## 对应的 iOS API

`UIGestureRecognizerStateEnded`。原生的 action 方法收到所有阶段，在方法里判断 `state`；这里监听 `'ended'`。

## 参见

- [`began`](began-event.md)
- [离散手势和连续手势](../ui-gesture-recognizer.md#离散手势和连续手势)
