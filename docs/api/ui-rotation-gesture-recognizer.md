---
type: reference
native: UIRotationGestureRecognizer
status: partial
---

# `UIRotationGestureRecognizer`

**`UIRotationGestureRecognizer`** 表示一个旋转识别器：两根手指绕着彼此转动时认出手势。用它做两指旋转。

旋转是连续手势，派发 [`began`](ui-gesture-recognizer/began-event.md)、[`changed`](ui-gesture-recognizer/changed-event.md)、[`ended`](ui-gesture-recognizer/ended-event.md)、[`cancelled`](ui-gesture-recognizer/cancelled-event.md)。事件对象带相对手势开始时转过的角度 `rotation`（弧度）和旋转速度 `velocity`。每次手势的 `rotation` 都从 0 开始。

**旋转还没有用真实触摸核对过**，手势本身和事件带的数据都**未在模拟器验证**。

**继承关系**：`EventTarget` → `NSObject` → [`UIGestureRecognizer`](ui-gesture-recognizer.md) → `UIRotationGestureRecognizer`

怎么用它，见指南[响应手势](../guides/gestures.md)。

## 构造函数

[`UIRotationGestureRecognizer()`](ui-rotation-gesture-recognizer/constructor.md)

创建一个识别两指旋转的识别器。

## 实例属性

还继承 [`UIGestureRecognizer`](ui-gesture-recognizer.md) 的属性，常用的是 [`isEnabled`](ui-gesture-recognizer/isenabled.md)、[`view`](ui-gesture-recognizer/view.md)、[`cancelsTouchesInView`](ui-gesture-recognizer/cancelstouchesinview.md)。方法也都继承自它：[`addEventListener()`](ui-gesture-recognizer/addeventlistener.md)、[`removeEventListener()`](ui-gesture-recognizer/removeeventlistener.md)、[`requireGestureRecognizerToFail()`](ui-gesture-recognizer/requiregesturerecognizertofail.md)。

| 属性 | 说明 |
| --- | --- |
| [`rotation`](ui-rotation-gesture-recognizer/rotation.md) | 相对手势开始时转过的角度，单位是弧度 |
| [`velocity`](ui-rotation-gesture-recognizer/velocity.md) <small>只读</small> | 旋转的速度，单位是弧度每秒 |

## 事件

事件来自 [`UIGestureRecognizer`](ui-gesture-recognizer.md#事件)，用 `addEventListener()` 监听。它 派发的是：

| 事件 | 什么时候派发 |
| --- | --- |
| [`began`](ui-gesture-recognizer/began-event.md) | 旋转被认出时 |
| [`changed`](ui-gesture-recognizer/changed-event.md) | 之后角度每变化一次 |
| [`ended`](ui-gesture-recognizer/ended-event.md) | 手指抬起时 |
| [`cancelled`](ui-gesture-recognizer/cancelled-event.md) | 被打断时 |

## 示例

```js
const card = new UIView();
const twist = new UIRotationGestureRecognizer();
let baseAngle = 0;
twist.addEventListener('changed', (e) => {
  const { rotation } = e;
  card.transform = CGAffineTransform.rotation(baseAngle + rotation);
});
twist.addEventListener('ended', (e) => {
  const { rotation } = e;
  baseAngle = baseAngle + rotation;
});
card.addGestureRecognizer(twist);
```

**效果**：两根手指在 `card` 上转动，`card` 跟着转，松手后保持角度。**未在模拟器验证。**

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `rotation.rotation` | 事件对象的 `rotation`，或 `twist.rotation` |
| `rotation.velocity` | 事件对象的 `velocity`，或 `twist.velocity` |

## 参见

- [响应手势](../guides/gestures.md#两指旋转)
- [`CGAffineTransform`](cg-affine-transform.md)
- [`UIGestureRecognizer`](ui-gesture-recognizer.md)：父类，事件和共同的属性
