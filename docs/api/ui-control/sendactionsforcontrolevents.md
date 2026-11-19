---
type: reference
native: "-[UIControl sendActionsForControlEvents:]"
---

# `UIControl`：`sendActionsForControlEvents()` 方法

**`sendActionsForControlEvents()`** 方法让控件派发指定的控件事件，途径和真实触摸相同。用来在代码里模拟一次用户操作。

## 语法

```
sendActionsForControlEvents(types)
```

### 参数

**`types`**

事件名的数组，可以一次给多个。可用的名字是 16 个[控件事件](../ui-control.md#事件)。空数组不派发任何事件。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- `types` 不是数组：`sendActionsForControlEvents needs an array of names; expected any of: touchdown / touchdownrepeat / …`
- 数组里有不认识的名字：`sendActionsForControlEvents has no value "tap"; expected one of: touchdown / touchdownrepeat / …`。这时一个事件都不派发。

## 说明

- **回调在下一轮任务里执行。** 方法返回时回调还没执行（实测）。
- **一次给多个事件时，它们到达的先后未在模拟器验证。**
- **系统自己的处理也会收到。** 对按钮发 `touchupinside`，按钮还会派发 [`click`](click-event.md)（实测）。
- **事件对象不带触点。** `touch` 开头的事件，`location` 是 `null`，`tapCount` 是 0，见[触点位置](../ui-control.md#触点位置)。
- **不改变控件的状态。** 它不改 `isHighlighted`，屏幕上没有按下的效果。

### 和 `dispatchEvent()` 的区别

两个方法都能让监听器的回调执行，途径不同。要模拟用户操作，用 `sendActionsForControlEvents()`。

| | `sendActionsForControlEvents()` | `dispatchEvent()` |
| --- | --- | --- |
| 途径 | 让控件自己派发，和真实触摸相同 | 直接调用注册的回调 |
| 谁会收到 | 这个控件上该事件的所有接收方，包括注册的回调和系统自己的处理 | 只有 `addEventListener()` 注册的回调 |
| 事件名 | 只能是 16 个控件事件 | 任意名字 |
| 回调什么时候执行 | 下一轮任务。方法返回时回调还没执行（实测） | 立刻。方法返回时回调已经执行完 |
| 参数 | 事件名的数组 | 一个 `Event` 对象 |
| 返回值 | 无 | 布尔值。有回调调用了 `preventDefault()` 并且事件可以取消时是 `false` |

两个方法都不改变控件的状态。`dispatchEvent()` 的参数不是 `Event` 对象时抛 `TypeError: Failed to execute 'dispatchEvent': parameter 1 is not of type 'Event'.`

## 示例

### 模拟一次点击

```js
const card = new UIControl();
card.addEventListener('touchdown', () => {
  console.log('touchdown');
});
card.addEventListener('touchupinside', () => {
  console.log('touchupinside');
});

card.sendActionsForControlEvents(['touchdown', 'touchupinside']);
console.log('已发出');
```

**结果**：控制台先输出 `已发出`，随后输出 `touchdown` 和 `touchupinside`。**`touchdown` 和 `touchupinside` 之间的先后未在模拟器验证。**

### 和 `dispatchEvent()` 对比

```js
const card = new UIControl();
card.addEventListener('touchupinside', () => {
  console.log('回调');
});

card.dispatchEvent(new Event('touchupinside'));
console.log('dispatchEvent 之后');

card.sendActionsForControlEvents(['touchupinside']);
console.log('sendActions 之后');
```

**结果**：依次输出 `回调`、`dispatchEvent 之后`、`sendActions 之后`、`回调`。**这个例子作为整体未在模拟器验证。**

## 对应的 iOS API

`-[UIControl sendActionsForControlEvents:]`。原生的位掩码 `UIControlEventTouchDown | UIControlEventTouchUpInside` 写成数组 `['touchdown', 'touchupinside']`。

## 参见

- [`addEventListener()`](addeventlistener.md)
- [回调的执行时机](../ui-control.md#回调的执行时机)
