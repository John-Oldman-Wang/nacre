---
type: reference
native: UIControlEventTouchUpInside
---

# `UIControl`：`touchupinside` 事件

**`touchupinside`** 事件在手指在控件范围内松开时派发。直接创建的 [`UIControl`](../ui-control.md) 用它响应点击。

## 语法

```
addEventListener('touchupinside', (event) => { })
```

## 事件对象

[`UIControlTouchEvent`](../ui-control-touch-event.md)。除了 `type` 和 `target`，还带两个只读字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| [`location`](../ui-control-touch-event/location.md) | [`CGPoint`](../structs.md) 或 `null` | 手指的位置，在这个控件自己的坐标系里，单位 [pt](../units.md)。由 [`sendActionsForControlEvents()`](sendactionsforcontrolevents.md) 派发时是 `null` |
| [`tapCount`](../ui-control-touch-event/tapcount.md) | 数 | 连击次数，单位是次。由 `sendActionsForControlEvents()` 派发时是 0 |

不能取消：`cancelable` 是 `false`，`preventDefault()` 没有效果。

## 什么时候派发

- 手指在控件范围内松开时派发，每次触摸最多一次（实测）。
- 手指按下后滑到控件外面再松开，派发的是 [`touchupoutside`](touchupoutside-event.md)，不派发这个。**未在模拟器验证。**
- 所有控件都派发。

### 和 `click` 选哪个

| 控件 | 用哪个事件 |
| --- | --- |
| [`UIButton`](../ui-button.md) | [`click`](click-event.md)。它表示「用户触发了这个按钮」，不限定触发方式 |
| 直接创建的 `UIControl` | `touchupinside`。它不派发 `click`（实测） |

按钮被点击时两个事件都派发，**两者的先后未在模拟器验证**。在按钮上两个事件选一个监听，同时监听会让一次点击执行两遍代码。按钮上需要触点位置时监听 `touchupinside`，`click` 的事件对象不带 `location`。

对按钮调用 `sendActionsForControlEvents(['touchupinside'])` 时，按钮的 `click` 也会派发（实测）。

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
card.addEventListener('touchupinside', (e) => {
  const { location, tapCount } = e;
  if (location !== null) {
    console.log(location.x, location.y, tapCount);
  }
});
```

**效果**：手指在 `card` 上松开时，控制台输出手指在 `card` 里的横坐标、纵坐标和连击次数。

## 对应的 iOS API

`UIControlEventTouchUpInside`。原生用 `addTarget:action:forControlEvents:` 登记，这里用 [`addEventListener()`](addeventlistener.md)。

## 参见

- [`click`](click-event.md)：按钮的点击
- [`touchupoutside`](touchupoutside-event.md)：在控件外松开
- [触点位置](../ui-control.md#触点位置)
- [回调的执行时机](../ui-control.md#回调的执行时机)
