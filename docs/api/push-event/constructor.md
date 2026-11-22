---
type: reference
native: PushEvent()
---

# `PushEvent()` 构造函数

**`PushEvent()`** 构造函数创建一个 `PushEvent`。

## 语法

```
new PushEvent(type)
new PushEvent(type, { data })
```

### 参数

**`type`**

事件名，字符串。模拟静默推送时写 `'push'`。

**`options.data`**

可选，对应 [`data`](data.md) 属性：推送的内容，一个普通对象。不传是一个空对象。

### 返回值

新建的 `PushEvent`。

### 异常

**`TypeError`**

- 某个字段的值转换不了，见上面各个参数。
- 没传事件名：`Failed to construct 'PushEvent': 1 argument required, but only 0 present.`
- 不带 `new`，当成函数调用。

## 示例

```js
const push = application.remoteNotifications;
push.addEventListener('push', (event) => {
  console.log('收到', event.data.orderId);
});
push.dispatchEvent(new PushEvent('push', { data: { orderId: 42 } }));
```

**结果**：输出 `收到 42`。系统那边什么都不发生。

> **注意**：自己派发的 `PushEvent` 上调 [`waitUntil()`](waituntil.md) 抛 `InvalidStateError`：只有运行时派发的静默推送能用它。

## 对应的 iOS API

没有对应的系统 API。对应浏览器的 `new PushEvent()`。

## 参见

- [`PushEvent`](../push-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md)：把自己建的事件派发出去
