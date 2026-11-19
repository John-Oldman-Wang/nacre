---
type: reference
native: UIControlEventTouchDownRepeat
---

# `UIControl`：`touchdownrepeat` 事件

**`touchdownrepeat`** 事件在用户短时间内连续点击控件时派发，从第二次按下起，每次按下派发一次。

## 语法

```
addEventListener('touchdownrepeat', (event) => { })
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

- 第二次及以后的每次按下派发一次，同时也派发 [`touchdown`](touchdown-event.md)。**未在模拟器验证。**
- 多短的间隔算「连续」由系统决定。
- 第几次点击从事件对象的 `tapCount` 读。**未在模拟器验证。**

## 示例

```js
const card = new UIControl();
card.addEventListener('touchdownrepeat', (e) => {
  const { tapCount } = /** @type {UIControlTouchEvent} */ (e);
  console.log('连击', tapCount);
});
```

**效果**：快速点两下 `card`，第二次按下时输出 `连击 2`。**未在模拟器验证。**

## 对应的 iOS API

`UIControlEventTouchDownRepeat`。原生用 `addTarget:action:forControlEvents:` 登记，这里用 [`addEventListener()`](addeventlistener.md)。

## 参见

- [`touchdown`](touchdown-event.md)
- [触点位置](../ui-control.md#触点位置)
- [回调的执行时机](../ui-control.md#回调的执行时机)
