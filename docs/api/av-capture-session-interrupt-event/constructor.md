---
type: reference
native: AVCaptureSessionInterruptEvent()
---

# `AVCaptureSessionInterruptEvent()` 构造函数

**`AVCaptureSessionInterruptEvent()`** 构造函数创建一个 `AVCaptureSessionInterruptEvent`。

## 语法

```
new AVCaptureSessionInterruptEvent(type)
new AVCaptureSessionInterruptEvent(type, { reason, cancelable })
```

### 参数

**`type`**

事件名，字符串。

**`options.reason`**

可选，对应 [`reason`](reason.md) 属性。按字符串转（`String()`），`null` 是 `null`。不传是 `null`。

**`options.cancelable`**

布尔值，可选，默认 `false`。

### 返回值

新建的 `AVCaptureSessionInterruptEvent`。

### 异常

**`TypeError`**

- 某个字段的值转换不了，见上面各个参数。
- 没传事件名：`Failed to construct 'AVCaptureSessionInterruptEvent': 1 argument required, but only 0 present.`
- 不带 `new`，当成函数调用。

## 示例

```js
const event = new AVCaptureSessionInterruptEvent('interrupt', { reason: 'videoDeviceNotAvailableInBackground' });
console.log(event.reason);
```

**结果**：控制台输出 `videoDeviceNotAvailableInBackground`。

## 对应的 iOS API

没有对应的系统 API。系统的通知到来时，运行时把通知带的值放进事件对象。

## 参见

- [`AVCaptureSessionInterruptEvent`](../av-capture-session-interrupt-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md)：把自己建的事件派发出去
