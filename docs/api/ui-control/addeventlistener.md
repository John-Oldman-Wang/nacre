---
type: reference
native: "-[UIControl addTarget:action:forControlEvents:]"
---

# `UIControl`：`addEventListener()` 方法

**`addEventListener()`** 方法给控件注册一个事件的回调。控件派发这个事件时，回调执行。

## 语法

```
addEventListener(type, callback)
addEventListener(type, callback, { once })
```

### 参数

**`type`**

事件名，字符串，区分大小写。系统会派发的是 16 个[控件事件](../ui-control.md#事件)和所有视图都有的 [`traitchange`](../ui-trait-collection.md)。

别的名字不报错，当作自定义事件：只有自己用 `dispatchEvent()` 派发时才会触发。所以事件名拼错时没有任何提示，监听器只是永远不被调用。在控件不派发的事件上监听，比如在输入框上监听 `change`，也不报错，回调不会执行。

**`callback`**

回调函数，参数是事件对象，见[事件对象](#事件对象)。传 `null` 时什么都不做。

**`options.once`**

可选，布尔值。`true` 表示回调执行一次后自动移除，移除发生在回调执行之前。不传时是 `false`。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 事件名以 `@` 开头：`addEventListener has no value "@x"; names starting with @ are reserved for the runtime`
- `callback` 不是函数也不是 `null`：`Failed to execute 'addEventListener': parameter 2 is not of type 'Function'.`

## 说明

- 同一个事件名和同一个函数重复注册，只算一次。
- 一次只能监听一个事件名。要监听多个，分别调用。
- 回调排在当前这一轮代码之后执行，见[回调的执行时机](../ui-control.md#回调的执行时机)。
- 回调里抛出的异常不影响同一事件的其他回调。异常在 [`application`](../application.md#没处理的异常不会让-app-退出) 上派发 `error`；没有监听器取消时，控制台输出以 `Uncaught` 开头的日志。

### 事件对象

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `type` | 字符串 | 事件名 |
| `target` | 控件 | 派发事件的控件。`currentTarget` 和它相同 |
| `location` | [`CGPoint`](../structs.md) 或 `null` | 只有 `touch` 开头的九个事件有，见[触点位置](../ui-control.md#触点位置) |
| `tapCount` | 数 | 只有 `touch` 开头的九个事件有，见[触点位置](../ui-control.md#触点位置) |
| `cancelable` | 布尔 | 固定是 `false` |
| `defaultPrevented` | 布尔 | 固定是 `false` |
| `preventDefault()` | 方法 | 可以调用，没有效果 |
| `stopPropagation()` | 方法 | 可以调用，没有效果。事件本来就只派发给这个控件 |
| `stopImmediatePropagation()` | 方法 | 同一个事件里排在后面的回调不再执行 |

## 示例

### 监听一次点击

```js
const card = new UIControl();
card.addEventListener('touchupinside', (e) => {
  console.log(e.type);
  console.log(e.target === card);
});
```

**效果**：手指在 `card` 上松开时，依次输出 `touchupinside` 和 `true`。

### 只响应一次

```js
const card = new UIControl();
card.addEventListener('touchupinside', () => {
  console.log('只输出一次');
}, { once: true });
```

**效果**：第一次点击输出 `只输出一次`。之后再点不输出。

## 对应的 iOS API

`-[UIControl addTarget:action:forControlEvents:]`。原生给控件登记一个对象和它的一个方法，事件发生时控件调用这个方法；这里直接传一个函数。原生一次可以登记几个事件的位掩码，这里一次一个事件名。

## 参见

- [`removeEventListener()`](removeeventlistener.md)
- [`sendActionsForControlEvents()`](sendactionsforcontrolevents.md)：在代码里让控件派发事件
