---
type: reference
native: UIPinchGestureRecognizer
status: partial
---

# `UIPinchGestureRecognizer`

**`UIPinchGestureRecognizer`** 表示一个捏合识别器：两根手指张开或捏拢时认出手势。用它做两指缩放。

捏合是连续手势，派发 [`began`](ui-gesture-recognizer/began-event.md)、[`changed`](ui-gesture-recognizer/changed-event.md)、[`ended`](ui-gesture-recognizer/ended-event.md)、[`cancelled`](ui-gesture-recognizer/cancelled-event.md)。事件对象带两指间距相对手势开始时的倍数 `scale` 和它的变化速度 `velocity`。每次手势的 `scale` 都从 1 开始。

**捏合还没有用真实触摸核对过**，手势本身和事件带的数据都**未在模拟器验证**。

**继承关系**：`EventTarget` → `NSObject` → [`UIGestureRecognizer`](ui-gesture-recognizer.md) → `UIPinchGestureRecognizer`

怎么用它，见指南[响应手势](../guides/gestures.md)。

## 构造函数

[`UIPinchGestureRecognizer()`](ui-pinch-gesture-recognizer/constructor.md)

创建一个识别两指捏合的识别器。

## 实例属性

还继承 [`UIGestureRecognizer`](ui-gesture-recognizer.md) 的属性，常用的是 [`isEnabled`](ui-gesture-recognizer/isenabled.md)、[`view`](ui-gesture-recognizer/view.md)、[`cancelsTouchesInView`](ui-gesture-recognizer/cancelstouchesinview.md)。方法也都继承自它：[`addEventListener()`](ui-gesture-recognizer/addeventlistener.md)、[`removeEventListener()`](ui-gesture-recognizer/removeeventlistener.md)、[`requireGestureRecognizerToFail()`](ui-gesture-recognizer/requiregesturerecognizertofail.md)。

| 属性 | 说明 |
| --- | --- |
| [`scale`](ui-pinch-gesture-recognizer/scale.md) | 两指的间距相对手势开始时的倍数 |
| [`velocity`](ui-pinch-gesture-recognizer/velocity.md) <small>只读</small> | `scale` 每秒变化多少 |

## 事件

事件来自 [`UIGestureRecognizer`](ui-gesture-recognizer.md#事件)，用 `addEventListener()` 监听。它 派发的是：

| 事件 | 什么时候派发 |
| --- | --- |
| [`began`](ui-gesture-recognizer/began-event.md) | 捏合被认出时 |
| [`changed`](ui-gesture-recognizer/changed-event.md) | 之后两指间距每变化一次 |
| [`ended`](ui-gesture-recognizer/ended-event.md) | 手指抬起时 |
| [`cancelled`](ui-gesture-recognizer/cancelled-event.md) | 被打断时 |

## 示例

```js
const card = new UIView();
const pinch = new UIPinchGestureRecognizer();
let baseScale = 1;
pinch.addEventListener('changed', (e) => {
  const { scale } = /** @type {UIPinchGestureRecognizerEvent} */ (e);
  card.transform = CGAffineTransform.scale(baseScale * scale);
});
pinch.addEventListener('ended', (e) => {
  const { scale } = /** @type {UIPinchGestureRecognizerEvent} */ (e);
  baseScale = baseScale * scale;
});
card.addGestureRecognizer(pinch);
```

**效果**：两根手指在 `card` 上张开，`card` 变大；捏拢，变小。松手后保持大小，再次捏合时从当前大小继续。**未在模拟器验证。**

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `pinch.scale` | 事件对象的 `scale`，或 `pinch.scale` |
| `pinch.velocity` | 事件对象的 `velocity`，或 `pinch.velocity` |

## 参见

- [响应手势](../guides/gestures.md#两指缩放)
- [`CGAffineTransform`](cg-affine-transform.md)：把倍数应用到视图上的 `CGAffineTransform`
- [`UIGestureRecognizer`](ui-gesture-recognizer.md)：父类，事件和共同的属性
