---
type: reference
native: UIControlEventTouchDragExit
---

# `UIControl`：`touchdragexit` 事件

**`touchdragexit`** 事件在手指按住、从控件内移到控件外，越过边界的那一刻派发。

## 语法

```
addEventListener('touchdragexit', (event) => { })
```

## 事件对象

事件对象的类型是 [`UIControlTouchEvent`](../ui-control.md#触点位置)，除了 `type` 和 `target`，还带两个只读字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `location` | [`CGPoint`](../structs.md) 或 `null` | 手指的位置，在这个控件自己的坐标系里，单位 [pt](../units.md)。由 [`sendActionsForControlEvents()`](sendactionsforcontrolevents.md) 派发时是 `null` |
| `tapCount` | 数 | 连击次数，单位是次。由 `sendActionsForControlEvents()` 派发时是 0 |

回调参数的类型声明是 `Event`，读这两个字段要转成 `UIControlTouchEvent`，见示例。

不能取消：`cancelable` 是 `false`，`preventDefault()` 没有效果。

## 什么时候派发

- 每次越过边界派发一次（实测）。
- 所有控件都派发。
- 之后手指在控件外移动派发 [`touchdragoutside`](touchdragoutside-event.md)，移回控件内派发 [`touchdragenter`](touchdragenter-event.md)。

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
card.addEventListener('touchdown', () => {
  card.alpha = 0.6;
});
card.addEventListener('touchdragexit', () => {
  card.alpha = 1;
});
card.addEventListener('touchdragenter', () => {
  card.alpha = 0.6;
});
```

**效果**：按住 `card` 时变淡。手指滑出 `card`，恢复不透明；不松开滑回来，再次变淡。**`touchdragenter` 和透明度的变化未在模拟器验证。**

## 对应的 iOS API

`UIControlEventTouchDragExit`。原生用 `addTarget:action:forControlEvents:` 登记，这里用 [`addEventListener()`](addeventlistener.md)。

## 参见

- [`touchdragenter`](touchdragenter-event.md)：移回控件内
- [触点位置](../ui-control.md#触点位置)
- [回调的执行时机](../ui-control.md#回调的执行时机)
