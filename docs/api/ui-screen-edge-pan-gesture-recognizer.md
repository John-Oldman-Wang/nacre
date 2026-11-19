---
type: reference
native: UIScreenEdgePanGestureRecognizer
status: partial
---

# `UIScreenEdgePanGestureRecognizer`

**`UIScreenEdgePanGestureRecognizer`** 表示一个屏幕边缘拖动识别器：只识别从屏幕边缘开始、向内的拖动。其余和 [`UIPanGestureRecognizer`](ui-pan-gesture-recognizer.md) 相同，事件对象也带 `translation` 和 `velocity`。

[`edges`](ui-screen-edge-pan-gesture-recognizer/edges.md) 默认是空数组，不设就认不出任何手势。识别器要加在包含屏幕边缘的视图上，通常是占满屏幕的页面视图。

三个默认值和父类不同：

| 属性 | `UIPanGestureRecognizer` | `UIScreenEdgePanGestureRecognizer` |
| --- | --- | --- |
| [`maximumNumberOfTouches`](ui-pan-gesture-recognizer/maximumnumberoftouches.md) | `4294967295` | `1` |
| [`delaysTouchesBegan`](ui-gesture-recognizer/delaystouchesbegan.md) | `false` | `true` |
| [`edges`](ui-screen-edge-pan-gesture-recognizer/edges.md) | 没有这个属性 | `[]` |

**屏幕边缘拖动还没有用真实触摸核对过**，手势本身**未在模拟器验证**。

**继承关系**：`EventTarget` → `NSObject` → [`UIGestureRecognizer`](ui-gesture-recognizer.md) → [`UIPanGestureRecognizer`](ui-pan-gesture-recognizer.md) → `UIScreenEdgePanGestureRecognizer`

怎么用它，见指南[响应手势](../guides/gestures.md)。

## 构造函数

[`UIScreenEdgePanGestureRecognizer()`](ui-screen-edge-pan-gesture-recognizer/constructor.md)

创建一个屏幕边缘拖动识别器。要先设 `edges` 才能认出手势。

## 实例属性

还继承 [`UIPanGestureRecognizer`](ui-pan-gesture-recognizer.md) 和 [`UIGestureRecognizer`](ui-gesture-recognizer.md) 的属性和方法，包括 `translationInView()`、`velocityInView()`、`setTranslation()`。

| 属性 | 说明 |
| --- | --- |
| [`edges`](ui-screen-edge-pan-gesture-recognizer/edges.md) | 识别从哪几条屏幕边缘开始的拖动 |

## 事件

事件来自 [`UIGestureRecognizer`](ui-gesture-recognizer.md#事件)，用 `addEventListener()` 监听。它 派发的是：

| 事件 | 什么时候派发 |
| --- | --- |
| [`began`](ui-gesture-recognizer/began-event.md) | 从边缘开始的拖动被认出时 |
| [`changed`](ui-gesture-recognizer/changed-event.md) | 之后手指每移动一次 |
| [`ended`](ui-gesture-recognizer/ended-event.md) | 手指抬起时 |
| [`cancelled`](ui-gesture-recognizer/cancelled-event.md) | 被打断时 |

## 示例

```js
const page = new UIView();
const fromRight = new UIScreenEdgePanGestureRecognizer();
fromRight.edges = ['right'];
fromRight.addEventListener('began', () => {
  console.log('从右边缘拖进来了');
});
page.addGestureRecognizer(fromRight);
```

**效果**：`page` 占满屏幕时，手指从屏幕右边缘向左拖，输出 `从右边缘拖进来了`。从屏幕中间开始拖没有输出。**未在模拟器验证。**

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `edgePan.edges = UIRectEdgeRight` | `edgePan.edges = ['right']` |
| `edgePan.edges = UIRectEdgeAll` | `edgePan.edges = ['top', 'left', 'bottom', 'right']` |

## 参见

- [响应手势](../guides/gestures.md#从屏幕边缘向内拖)
- [`UIPanGestureRecognizer`](ui-pan-gesture-recognizer.md)：父类
- [`UINavigationController`](ui-navigation-controller.md)：它占用了屏幕左边缘的拖动，用来返回上一页
