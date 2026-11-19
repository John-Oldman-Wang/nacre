---
type: reference
native: UIGestureRecognizer.cancelsTouchesInView
---

# `UIGestureRecognizer`：`cancelsTouchesInView` 属性

**`cancelsTouchesInView`** 属性决定识别器认出手势之后，是否取消视图正在处理的这次触摸。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | 认出手势之后，系统取消视图正在处理的这次触摸。对[控件](../ui-control.md)来说，表现是派发 [`touchcancel`](../ui-control/touchcancel-event.md)，不派发 [`touchupinside`](../ui-control/touchupinside-event.md) |
| `false` | 视图照常收完这次触摸。识别器的事件和控件的事件都派发 |

- 可读，可写。
- 默认值是 `true`。
- 写入按 JS 的真假值转换。
- 两种取值的效果**未在模拟器验证**。

有一种情况系统已经处理好了：父视图上有一个单指单击的识别器，子视图里有 [`UIButton`](../ui-button.md)。这时点按钮只派发按钮自己的事件，父视图的识别器不触发（实测）。

### 怎么得知它变了

它变了不派发事件。只有 App 的代码会改它，不需要通知。

## 示例

```js
const row = new UIView();
const press = new UILongPressGestureRecognizer();
press.cancelsTouchesInView = false;
row.addGestureRecognizer(press);
```

**效果**：长按 `row` 里的控件时，识别器派发 `began`，控件也照常派发 `touchupinside`。**未在模拟器验证。**

## 对应的 iOS API

`UIGestureRecognizer.cancelsTouchesInView`。

## 参见

- [识别器和视图自己的触摸](../ui-gesture-recognizer.md#识别器和视图自己的触摸)
- [`delaysTouchesBegan`](delaystouchesbegan.md)、[`delaysTouchesEnded`](delaystouchesended.md)
