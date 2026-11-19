---
type: reference
native: UILongPressGestureRecognizer
status: partial
---

# `UILongPressGestureRecognizer`

**`UILongPressGestureRecognizer`** 表示一个长按识别器：手指按住不动一段时间时认出手势，默认是 0.5 秒。

长按是连续手势：按够时间时派发 [`began`](ui-gesture-recognizer/began-event.md)，之后手指每移动一次派发 [`changed`](ui-gesture-recognizer/changed-event.md)，手指抬起时派发 [`ended`](ui-gesture-recognizer/ended-event.md)，被打断时派发 [`cancelled`](ui-gesture-recognizer/cancelled-event.md)。按够时间之前手指移动超过 [`allowableMovement`](ui-long-press-gesture-recognizer/allowablemovement.md) 就不算长按，不派发任何事件。

**继承关系**：`EventTarget` → `NSObject` → [`UIGestureRecognizer`](ui-gesture-recognizer.md) → `UILongPressGestureRecognizer`

怎么用它，见指南[响应手势](../guides/gestures.md)。

## 构造函数

[`UILongPressGestureRecognizer()`](ui-long-press-gesture-recognizer/constructor.md)

创建一个识别单指按住 0.5 秒的识别器。

## 实例属性

还继承 [`UIGestureRecognizer`](ui-gesture-recognizer.md) 的属性，常用的是 [`isEnabled`](ui-gesture-recognizer/isenabled.md)、[`view`](ui-gesture-recognizer/view.md)、[`cancelsTouchesInView`](ui-gesture-recognizer/cancelstouchesinview.md)。方法也都继承自它：[`addEventListener()`](ui-gesture-recognizer/addeventlistener.md)、[`removeEventListener()`](ui-gesture-recognizer/removeeventlistener.md)、[`requireGestureRecognizerToFail()`](ui-gesture-recognizer/requiregesturerecognizertofail.md)。

| 属性 | 说明 |
| --- | --- |
| [`minimumPressDuration`](ui-long-press-gesture-recognizer/minimumpressduration.md) | 要按住多久才算，单位是秒 |
| [`allowableMovement`](ui-long-press-gesture-recognizer/allowablemovement.md) | 认出之前手指最多能移动多远，单位 pt |
| [`numberOfTapsRequired`](ui-long-press-gesture-recognizer/numberoftapsrequired.md) | 按住之前要先完整地点几下 |
| [`numberOfTouchesRequired`](ui-long-press-gesture-recognizer/numberoftouchesrequired.md) | 要几根手指同时按住 |

## 事件

事件来自 [`UIGestureRecognizer`](ui-gesture-recognizer.md#事件)，用 `addEventListener()` 监听。它 派发的是：

| 事件 | 什么时候派发 |
| --- | --- |
| [`began`](ui-gesture-recognizer/began-event.md) | 按够时间时 |
| [`changed`](ui-gesture-recognizer/changed-event.md) | 被认出之后手指移动时 |
| [`ended`](ui-gesture-recognizer/ended-event.md) | 被认出之后手指抬起时 |
| [`cancelled`](ui-gesture-recognizer/cancelled-event.md) | 被打断时，比如 App 退到后台 |

## 示例

```js
const card = new UIView();
const press = new UILongPressGestureRecognizer();
press.addEventListener('began', () => {
  console.log('按住了');
});
press.addEventListener('ended', () => {
  console.log('松手');
});
card.addGestureRecognizer(press);
```

**效果**：按住 `card` 0.5 秒，控制台输出 `按住了`；手指抬起时输出 `松手`。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[UILongPressGestureRecognizer alloc] initWithTarget:self action:@selector(onPress:)]` | `new UILongPressGestureRecognizer()`，再 `addEventListener('began', onPress)` |
| `press.minimumPressDuration = 1.0` | `press.minimumPressDuration = 1` |
| `press.allowableMovement = 20` | `press.allowableMovement = 20` |

## 参见

- [响应手势](../guides/gestures.md)：改长按要按多久、长按之后跟着手指移动
- [`UIGestureRecognizer`](ui-gesture-recognizer.md)：父类，事件和共同的属性
