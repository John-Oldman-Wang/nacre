---
type: reference
native: UIControlEventTouchUpOutside
---

# `UIControl`：`touchupoutside` 事件

**`touchupoutside`** 事件在手指按下后滑到控件范围外、在外面松开时派发。它表示用户放弃了这次点击。

## 语法

```
addEventListener('touchupoutside', (event) => { })
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

- 每次触摸最多一次。**未在模拟器验证。**
- 一次触摸只派发 `touchupinside` 和 `touchupoutside` 中的一个。
- 所有控件都派发。
- 按下时改了外观的，要在这里恢复。

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
card.addEventListener('touchupinside', () => {
  console.log('确认');
});
card.addEventListener('touchupoutside', () => {
  console.log('放弃');
});
```

**效果**：手指按下后在 `card` 内松开，输出 `确认`；滑到外面再松开，输出 `放弃`。**`放弃` 未在模拟器验证。**

## 对应的 iOS API

`UIControlEventTouchUpOutside`。原生用 `addTarget:action:forControlEvents:` 登记，这里用 [`addEventListener()`](addeventlistener.md)。

## 参见

- [`touchupinside`](touchupinside-event.md)
- [`touchcancel`](touchcancel-event.md)
- [触点位置](../ui-control.md#触点位置)
- [回调的执行时机](../ui-control.md#回调的执行时机)
