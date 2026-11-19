---
type: reference
native: "-[UIGestureRecognizer addTarget:action:]"
---

# `UIGestureRecognizer`：`addEventListener()` 方法

**`addEventListener()`** 方法给识别器注册一个事件的回调。识别器认出手势、手势进行或结束时派发事件，回调执行。

## 语法

```
addEventListener(type, callback)
addEventListener(type, callback, { once })
```

### 参数

**`type`**

事件名，字符串：[`began`](began-event.md)、[`changed`](changed-event.md)、[`ended`](ended-event.md)、[`cancelled`](cancelled-event.md) 之一。事件名是手势所处的阶段，哪种手势派发哪几个见[事件](../ui-gesture-recognizer.md#事件)。

没有 `'tap'`、`'longpress'`、`'swipe'` 这样的事件名。点按和轻扫监听 `'ended'`，长按监听 `'began'`。

监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

**`callback`**

回调函数，参数是事件对象，类型见各事件页。传 `null` 时什么都不做。

**`options.once`**

可选，布尔值。`true` 表示回调执行一次后自动移除。不传时是 `false`。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

`callback` 不是函数也不是 `null`：`Failed to execute 'addEventListener': parameter 2 is not of type 'Function'.`

## 说明

- 监听器加在识别器上，不加在视图上。识别器还要用视图的 `addGestureRecognizer()` 加到视图上才收得到触摸。监听和加到视图上的先后没有关系。
- 同一个事件名和同一个函数重复注册，只算一次。
- 回调在手势发生之后才执行，见[回调里读不到当时的状态](../ui-gesture-recognizer.md#回调里读不到当时的状态)。
- 回调里抛出异常不影响识别器，同一事件的其他回调照常执行。异常在 [`application`](../application.md#没处理的异常不会让-app-退出) 上派发 `error`；没有监听器取消时，控制台输出以 `Uncaught` 开头的日志。

## 示例

```js
const card = new UIView();
const tap = new UITapGestureRecognizer();
tap.addEventListener('ended', () => {
  console.log('点了');
});
card.addGestureRecognizer(tap);
```

**效果**：点一下 `card`，控制台输出 `点了`。

## 对应的 iOS API

`-[UIGestureRecognizer addTarget:action:]`。原生的一个 action 方法收到手势的所有阶段，再用 `state` 区分；这里每个阶段是一个事件名。

## 参见

- [`removeEventListener()`](removeeventlistener.md)
- [响应手势](../../guides/gestures.md)
