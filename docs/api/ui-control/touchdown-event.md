---
type: reference
native: UIControlEventTouchDown
---

# `UIControl`：`touchdown` 事件

**`touchdown`** 事件在手指按在控件上时派发。它是一次触摸的第一个事件。

## 语法

```
addEventListener('touchdown', (event) => { })
```

## 事件对象

[`UIControlTouchEvent`](../ui-control-touch-event.md)。除了 `type` 和 `target`，还带两个只读字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| [`location`](../ui-control-touch-event/location.md) | [`CGPoint`](../structs.md) 或 `null` | 手指的位置，在这个控件自己的坐标系里，单位 [pt](../units.md)。由 [`sendActionsForControlEvents()`](sendactionsforcontrolevents.md) 派发时是 `null` |
| [`tapCount`](../ui-control-touch-event/tapcount.md) | 数 | 连击次数，单位是次。由 `sendActionsForControlEvents()` 派发时是 0 |

不能取消：`cancelable` 是 `false`，`preventDefault()` 没有效果。

## 什么时候派发

- 手指接触控件的那一刻派发，比松手早。每次触摸一次。
- 所有控件都派发。
- 用户连点两下是两次触摸，各派发一次（实测连点两次收到两次 `touchdown`）。
- 回调排在触摸之后执行，回调里读 [`isHighlighted`](ishighlighted.md) 可能已经是 `false`，见[回调的执行时机](../ui-control.md#回调的执行时机)。按下时要改外观，在回调里直接改，在 [`touchupinside`](touchupinside-event.md)、[`touchupoutside`](touchupoutside-event.md)、[`touchcancel`](touchcancel-event.md) 里恢复。
- 禁用的控件不派发。**未在模拟器验证。**

### 一次触摸的事件序列

普通点击（按下，不移动，松开），在直接创建的 `UIControl` 上实测：

```
touchdown → touchupinside
```

按下后滑出去再松手，前四步实测，最后一步 `touchupoutside` **未在模拟器验证**：

```
touchdown
→ touchdraginside（手指在内部每移动一次派发一次）
→ touchdragexit（一次）
→ touchdragoutside（手指在外部每移动一次派发一次）
→ touchupoutside
```

滑出去又滑回来再松手：在 `touchdragoutside` 之后是 `touchdragenter`、`touchdraginside`，最后是 `touchupinside`。**未在模拟器验证。**

## 示例

```js
const card = new UIControl();
card.backgroundColor = 'systemGreen';
card.addEventListener('touchdown', (e) => {
  const { location } = e;
  card.alpha = 0.6;
  if (location !== null) {
    console.log('按在', location.x, location.y);
  }
});
card.addEventListener('touchupinside', () => {
  card.alpha = 1;
});
```

**效果**：手指按下，`card` 变淡，控制台输出手指在 `card` 里的坐标。手指在 `card` 内松开，恢复不透明。**透明度的变化未在模拟器验证。**

## 对应的 iOS API

`UIControlEventTouchDown`。原生用 `addTarget:action:forControlEvents:` 登记，这里用 [`addEventListener()`](addeventlistener.md)。

## 参见

- [`touchupinside`](touchupinside-event.md)、[`touchupoutside`](touchupoutside-event.md)、[`touchcancel`](touchcancel-event.md)：触摸的三种结束
- [触点位置](../ui-control.md#触点位置)
- [回调的执行时机](../ui-control.md#回调的执行时机)
