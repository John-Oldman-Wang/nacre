---
type: reference
native: UIControlEventTouchDragInside
---

# `UIControl`：`touchdraginside` 事件

**`touchdraginside`** 事件在手指按住、在控件范围内移动时派发。

## 语法

```
addEventListener('touchdraginside', (event) => { })
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

- 手指在控件内每移动一次派发一次，移动期间持续派发（实测）。
- 所有控件都派发。

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
card.addEventListener('touchdraginside', (e) => {
  const { location } = /** @type {UIControlTouchEvent} */ (e);
  if (location !== null) {
    console.log(location.x, location.y);
  }
});
```

**效果**：手指按住在 `card` 里移动，控制台持续输出手指的坐标。

## 对应的 iOS API

`UIControlEventTouchDragInside`。原生用 `addTarget:action:forControlEvents:` 登记，这里用 [`addEventListener()`](addeventlistener.md)。

## 参见

- [`touchdragoutside`](touchdragoutside-event.md)：在控件外移动
- [触点位置](../ui-control.md#触点位置)
- [回调的执行时机](../ui-control.md#回调的执行时机)
