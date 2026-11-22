---
type: reference
native: UIPanGestureRecognizer
status: partial
---

# `UIPanGestureRecognizer`

**`UIPanGestureRecognizer`** 表示一个拖动识别器：手指按下并移动时认出手势。用它让视图跟着手指移动，或者在松手时根据速度做惯性动画。

拖动是连续手势：手指移动了一小段距离时派发 [`began`](ui-gesture-recognizer/began-event.md)，之后每次移动派发 [`changed`](ui-gesture-recognizer/changed-event.md)，全部手指抬起时派发 [`ended`](ui-gesture-recognizer/ended-event.md)。事件对象带从手势开始累计的位移 `translation` 和速度 `velocity`。

**拖动还没有用真实触摸核对过**，手势本身和事件带的数据都**未在模拟器验证**。

[`UIScrollView`](ui-scroll-view.md) 自己就是用一个拖动识别器来滚动的，它的 `gestureRecognizers` 里有一个 `UIPanGestureRecognizer`（验收用例里核对过）。子类 [`UIScreenEdgePanGestureRecognizer`](ui-screen-edge-pan-gesture-recognizer.md) 只认从屏幕边缘开始的拖动。

**继承关系**：`EventTarget` → `NSObject` → [`UIGestureRecognizer`](ui-gesture-recognizer.md) → `UIPanGestureRecognizer`

怎么用它，见指南[响应手势](../guides/gestures.md)。

## 构造函数

[`UIPanGestureRecognizer()`](ui-pan-gesture-recognizer/constructor.md)

创建一个识别单指及以上拖动的识别器。

## 实例属性

还继承 [`UIGestureRecognizer`](ui-gesture-recognizer.md) 的属性，常用的是 [`isEnabled`](ui-gesture-recognizer/isenabled.md)、[`view`](ui-gesture-recognizer/view.md)、[`cancelsTouchesInView`](ui-gesture-recognizer/cancelstouchesinview.md)。

| 属性 | 说明 |
| --- | --- |
| [`minimumNumberOfTouches`](ui-pan-gesture-recognizer/minimumnumberoftouches.md) | 最少要几根手指按着才算拖动 |
| [`maximumNumberOfTouches`](ui-pan-gesture-recognizer/maximumnumberoftouches.md) | 最多能有几根手指按着 |
| [`allowedScrollTypesMask`](ui-pan-gesture-recognizer/allowedscrolltypesmask.md) | 哪几种滚动输入（鼠标滚轮、触控板）也算拖动 |

## 实例方法

还继承 [`UIGestureRecognizer`](ui-gesture-recognizer.md) 的方法。

| 方法 | 说明 |
| --- | --- |
| [`translationInView()`](ui-pan-gesture-recognizer/translationinview.md) | 从手势开始到现在手指移动了多少，换算到指定视图的坐标系里 |
| [`setTranslation()`](ui-pan-gesture-recognizer/settranslation.md) | 把累计的位移改成指定的值 |
| [`velocityInView()`](ui-pan-gesture-recognizer/velocityinview.md) | 手指此刻的移动速度，换算到指定视图的坐标系里 |

在事件回调里调这三个方法，读到和改到的是回调执行那一刻的值。事件发生那一刻的位移和速度在事件对象上。

## 事件

事件来自 [`UIGestureRecognizer`](ui-gesture-recognizer.md#事件)，用 `addEventListener()` 监听。它 派发的是：

| 事件 | 什么时候派发 |
| --- | --- |
| [`began`](ui-gesture-recognizer/began-event.md) | 手指移动了一小段距离、拖动被认出时 |
| [`changed`](ui-gesture-recognizer/changed-event.md) | 之后手指每移动一次 |
| [`ended`](ui-gesture-recognizer/ended-event.md) | 全部手指抬起时。`velocity` 是松手那一刻的速度 |
| [`cancelled`](ui-gesture-recognizer/cancelled-event.md) | 被打断时 |

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

| ObjC | JS |
| --- | --- |
| `[pan translationInView:view]` | 事件对象的 `translation`，或 `pan.translationInView(view)` |
| `[pan velocityInView:view]` | 事件对象的 `velocity`，或 `pan.velocityInView(view)` |
| `[pan setTranslation:CGPointZero inView:view]` | `pan.setTranslation(new CGPoint(0, 0), { inView: view })` |
| `pan.maximumNumberOfTouches = 2` | `pan.maximumNumberOfTouches = 2` |
| `pan.allowedScrollTypesMask = UIScrollTypeMaskAll` | `pan.allowedScrollTypesMask = ['discrete', 'continuous']` |

## 参见

- [响应手势](../guides/gestures.md)：拖动一个视图、松手时读速度
- [`UIScreenEdgePanGestureRecognizer`](ui-screen-edge-pan-gesture-recognizer.md)：子类
- [`UIGestureRecognizer`](ui-gesture-recognizer.md)：父类，事件和共同的属性
