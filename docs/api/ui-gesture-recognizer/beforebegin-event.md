---
type: reference
native: "UIGestureRecognizerDelegate gestureRecognizerShouldBegin:"
---

# `UIGestureRecognizer`：`beforebegin` 事件

**`beforebegin`** 事件在系统问这个识别器要不要开始认手势时派发。监听器里调 `preventDefault()`，这一次手势不开始。

## 语法

```
addEventListener('beforebegin', (event) => { })
```

## 事件对象

[`UIGestureRecognizerEvent`](../ui-gesture-recognizer-event.md)。除了 `type` 和 `target`（这个识别器），还带两个只读字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| [`location`](../ui-gesture-recognizer-event/location.md) | [`CGPoint`](../cg-point.md) 或 `null` | 这一刻手势的位置，在识别器所在视图的坐标系里，单位 [pt](../units.md)。多根手指时是它们的中心点 |
| [`numberOfTouches`](../ui-gesture-recognizer-event/numberoftouches.md) | 数 | 这一刻参与手势的手指个数 |

拖动、捏合、旋转识别器的 `beforebegin` 也是这个类：手势还没开始，没有移动的距离、缩放的倍数这些值。

可以取消：`event.cancelable` 是 `true`。调了 `preventDefault()`，这一次手势不开始，识别器不派发 [`began`](began-event.md)、[`ended`](ended-event.md) 这些事件。

## 什么时候派发

- 识别器即将认出手势时派发，在 [`began`](began-event.md)（离散手势是 [`ended`](ended-event.md)）之前。每次手势最多一次（来自 iOS 的定义）。
- 当场派发。系统派发事件之后等监听器全部执行完，再决定开不开始。这一点和识别器的另外四个事件不同：它们在事情发生之后、当前这段 JS 执行完之后才派发。
- 同一个事件有多个监听器时，只要有一个调了 `preventDefault()`，手势就不开始。
- 监听器里抛出异常时，同一事件的其他监听器照常执行。异常在 [`application`](../application.md#没处理的异常不会让-app-退出) 上派发 `error`。抛异常不等于 `preventDefault()`。
- 没有监听器时，系统不问，手势照常开始。移除最后一个监听器之后也一样。
- 派发、`preventDefault()` 的效果、移除监听器之后照常开始，都在验收用例里验证过：用例照系统的做法去问识别器要不要开始，断言了它的回答。用真实的手指触发时的表现**未用真实的手指验证**。

> **注意**：监听器执行期间系统在等。在监听器里只做判断，不做耗时的事。

### 只能用在自己创建的识别器上

只有 App 用 `new` 创建的识别器能监听 `beforebegin`。UIKit 自带的识别器，比如滚动视图的 [`panGestureRecognizer`](../ui-scroll-view/pangesturerecognizer.md)，由系统自己决定要不要开始，在它上面监听抛 `TypeError`，监听器不会被加上，这个识别器的行为不变：

```
beforebegin is only available on gesture recognizers you create: this one belongs to UIKit (for example a scroll view's built-in pan) and its delegate cannot be replaced
```

## 示例

```js
const sheet = new UIView();
const pan = new UIPanGestureRecognizer();
pan.addEventListener('beforebegin', (event) => {
  const { location } = event;
  if (location === null || location.y > 44) event.preventDefault();
});
sheet.addGestureRecognizer(pan);
```

**效果**：拖动即将被认出时，手指在 `sheet` 顶部 44 pt 以内，拖动才开始；在下面的部分拖，`pan` 不派发事件。**未用真实的手指验证。**

## 对应的 iOS API

`UIGestureRecognizerDelegate` 的 `gestureRecognizerShouldBegin:` 返回 `NO`，对应这里调 `event.preventDefault()`。不用设识别器的 `delegate`，监听这个事件就行。

## 参见

- [`recognizesSimultaneouslyWith`](recognizessimultaneouslywith.md)：系统问的另一件事，能不能和别的识别器同时认
- [`began`](began-event.md)：手势开始之后派发
- [`requireGestureRecognizerToFail()`](requiregesturerecognizertofail.md)：等另一个识别器认不出之后再认
