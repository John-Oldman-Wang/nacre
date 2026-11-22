---
type: reference
native: UIControlEventTouchCancel
---

# `UIControl`：`touchcancel` 事件

**`touchcancel`** 事件在触摸被系统取消、手指没有正常松开时派发。

## 语法

```
addEventListener('touchcancel', (event) => { })
```

## 事件对象

[`UIControlTouchEvent`](../ui-control-touch-event.md)。除了 `type` 和 `target`，还带两个只读字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| [`location`](../ui-control-touch-event/location.md) | [`CGPoint`](../structs.md) 或 `null` | 手指的位置，在这个控件自己的坐标系里，单位 [pt](../units.md)。由 [`sendActionsForControlEvents()`](sendactionsforcontrolevents.md) 派发时是 `null` |
| [`tapCount`](../ui-control-touch-event/tapcount.md) | 数 | 连击次数，单位是次。由 `sendActionsForControlEvents()` 派发时是 0 |

不能取消：`cancelable` 是 `false`，`preventDefault()` 没有效果。

## 什么时候派发

- 例如触摸被手势识别器接管。手势识别器是 iOS 里另一套识别滑动、长按等动作的机制，它识别成功后可以取消视图上正在进行的触摸，见[手势识别器](../ui-gesture-recognizer.md)。来电这类系统打断也会取消触摸。
- 每次触摸最多一次。**未在模拟器验证。**
- 所有控件都派发。
- 一次触摸以 `touchupinside`、`touchupoutside`、`touchcancel` 三者之一结束。按下时改了外观的，三个都要恢复。

## 示例

```js
const card = new UIControl();
const restore = () => {
  card.alpha = 1;
};
card.addEventListener('touchdown', () => {
  card.alpha = 0.6;
});
card.addEventListener('touchupinside', restore);
card.addEventListener('touchupoutside', restore);
card.addEventListener('touchcancel', restore);
```

**效果**：按住 `card` 时变淡。不论正常松开、滑出去松开，还是触摸被系统取消，`card` 都恢复不透明。**`touchcancel` 的派发未在模拟器验证。**

## 对应的 iOS API

`UIControlEventTouchCancel`。原生用 `addTarget:action:forControlEvents:` 登记，这里用 [`addEventListener()`](addeventlistener.md)。

## 参见

- [`touchdown`](touchdown-event.md)
- [触点位置](../ui-control.md#触点位置)
- [回调的执行时机](../ui-control.md#回调的执行时机)
