---
type: reference
native: UITapGestureRecognizer
status: partial
---

# `UITapGestureRecognizer`

**`UITapGestureRecognizer`** 表示一个点按识别器：手指按下后很快抬起时认出手势。要连点几下、要几根手指，都可以设，默认是单指点一下。

点按是离散手势：认出来就结束，只派发一次 [`ended`](ui-gesture-recognizer/ended-event.md)。

**继承关系**：`EventTarget` → `NSObject` → [`UIGestureRecognizer`](ui-gesture-recognizer.md) → `UITapGestureRecognizer`

怎么用它，见指南[响应手势](../guides/gestures.md)。

## 构造函数

[`UITapGestureRecognizer()`](ui-tap-gesture-recognizer/constructor.md)

创建一个识别单指点一下的识别器。

## 实例属性

还继承 [`UIGestureRecognizer`](ui-gesture-recognizer.md) 的属性，常用的是 [`isEnabled`](ui-gesture-recognizer/isenabled.md)、[`view`](ui-gesture-recognizer/view.md)、[`cancelsTouchesInView`](ui-gesture-recognizer/cancelstouchesinview.md)。方法也都继承自它：[`addEventListener()`](ui-gesture-recognizer/addeventlistener.md)、[`removeEventListener()`](ui-gesture-recognizer/removeeventlistener.md)、[`requireGestureRecognizerToFail()`](ui-gesture-recognizer/requiregesturerecognizertofail.md)。

| 属性 | 说明 |
| --- | --- |
| [`numberOfTapsRequired`](ui-tap-gesture-recognizer/numberoftapsrequired.md) | 要连点几下才算。`2` 是双击 |
| [`numberOfTouchesRequired`](ui-tap-gesture-recognizer/numberoftouchesrequired.md) | 要几根手指同时点 |

## 事件

事件来自 [`UIGestureRecognizer`](ui-gesture-recognizer.md#事件)，用 `addEventListener()` 监听。它 派发的是：

| 事件 | 什么时候派发 |
| --- | --- |
| [`ended`](ui-gesture-recognizer/ended-event.md) | 点按被认出时。点按只派发这一个事件 |

## 示例

```js
const card = new UIView();
const tap = new UITapGestureRecognizer();
tap.addEventListener('ended', (e) => {
  const { location } = e;
  if (location !== null) {
    console.log('点在', location.x, location.y);
  }
});
card.addGestureRecognizer(tap);
```

**效果**：点 `card`，控制台输出点在 `card` 里的坐标。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(onTap:)]` | `new UITapGestureRecognizer()`，再 `addEventListener('ended', onTap)` |
| `tap.numberOfTapsRequired = 2` | `tap.numberOfTapsRequired = 2` |
| `tap.numberOfTouchesRequired = 2` | `tap.numberOfTouchesRequired = 2` |

## 参见

- [响应手势](../guides/gestures.md)：拿到点的位置、响应双击、让单击等双击失败
- [`UIGestureRecognizer`](ui-gesture-recognizer.md)：父类，事件和共同的属性
