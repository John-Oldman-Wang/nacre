---
type: reference
native: UISwipeGestureRecognizer
status: partial
---

# `UISwipeGestureRecognizer`

**`UISwipeGestureRecognizer`** 表示一个轻扫识别器：手指朝指定的方向快速划过时认出手势。默认识别单指向右的轻扫。慢慢移动不算轻扫。

轻扫是离散手势：认出来就结束，只派发一次 [`ended`](ui-gesture-recognizer/ended-event.md)。事件不说明认出的是哪个方向，要区分方向，每个方向创建一个识别器。

**轻扫还没有用真实触摸核对过**，手势本身**未在模拟器验证**。

**继承关系**：`EventTarget` → `NSObject` → [`UIGestureRecognizer`](ui-gesture-recognizer.md) → `UISwipeGestureRecognizer`

怎么用它，见指南[响应手势](../guides/gestures.md)。

## 构造函数

[`UISwipeGestureRecognizer()`](ui-swipe-gesture-recognizer/constructor.md)

创建一个识别单指向右轻扫的识别器。

## 实例属性

还继承 [`UIGestureRecognizer`](ui-gesture-recognizer.md) 的属性，常用的是 [`isEnabled`](ui-gesture-recognizer/isenabled.md)、[`view`](ui-gesture-recognizer/view.md)、[`cancelsTouchesInView`](ui-gesture-recognizer/cancelstouchesinview.md)。方法也都继承自它：[`addEventListener()`](ui-gesture-recognizer/addeventlistener.md)、[`removeEventListener()`](ui-gesture-recognizer/removeeventlistener.md)、[`requireGestureRecognizerToFail()`](ui-gesture-recognizer/requiregesturerecognizertofail.md)。

| 属性 | 说明 |
| --- | --- |
| [`numberOfTouchesRequired`](ui-swipe-gesture-recognizer/numberoftouchesrequired.md) | 要几根手指一起扫 |
| [`direction`](ui-swipe-gesture-recognizer/direction.md) | 识别哪几个方向的轻扫 |

## 事件

事件来自 [`UIGestureRecognizer`](ui-gesture-recognizer.md#事件)，用 `addEventListener()` 监听。它 派发的是：

| 事件 | 什么时候派发 |
| --- | --- |
| [`ended`](ui-gesture-recognizer/ended-event.md) | 轻扫被认出时。轻扫只派发这一个事件 |

## 示例

```js
const card = new UIView();
const swipeLeft = new UISwipeGestureRecognizer();
swipeLeft.direction = ['left'];
swipeLeft.addEventListener('ended', () => {
  console.log('向左扫');
});
card.addGestureRecognizer(swipeLeft);
```

**效果**：手指在 `card` 上向左快速划过，输出 `向左扫`。**未在模拟器验证。**

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `swipe.direction = UISwipeGestureRecognizerDirectionLeft` | `swipe.direction = ['left']` |
| `swipe.direction = UISwipeGestureRecognizerDirectionLeft \| UISwipeGestureRecognizerDirectionRight` | `swipe.direction = ['left', 'right']` |
| `swipe.numberOfTouchesRequired = 2` | `swipe.numberOfTouchesRequired = 2` |

## 参见

- [响应手势](../guides/gestures.md#响应轻扫)
- [`UIGestureRecognizer`](ui-gesture-recognizer.md)：父类，事件和共同的属性
