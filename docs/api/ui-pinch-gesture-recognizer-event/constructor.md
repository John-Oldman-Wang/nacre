---
type: reference
native: UIPinchGestureRecognizerEvent()
---

# `UIPinchGestureRecognizerEvent()` 构造函数

**`UIPinchGestureRecognizerEvent()`** 构造函数创建一个 `UIPinchGestureRecognizerEvent`。

## 语法

```
new UIPinchGestureRecognizerEvent(type)
new UIPinchGestureRecognizerEvent(type, { location, numberOfTouches, scale, velocity, cancelable })
```

### 参数

**`type`**

事件名，字符串。

**`options.location`**

可选，对应 [`location`](../ui-gesture-recognizer-event/location.md) 属性。一个 `CGPoint`，或者带 `x`、`y` 的普通对象（照结构体的规则转成 `CGPoint`），也可以是 `null`；别的抛 `TypeError`。不传是 `null`。

**`options.numberOfTouches`**

可选，对应 [`numberOfTouches`](../ui-gesture-recognizer-event/numberoftouches.md) 属性。按数转再向零取整，转不出有限数抛 `TypeError`。不传是 `0`。

**`options.scale`**

可选，对应 [`scale`](scale.md) 属性。按数转（`Number()`），转不出有限数抛 `TypeError`。不传是 `1`。

**`options.velocity`**

可选，对应 [`velocity`](velocity.md) 属性。按数转（`Number()`），转不出有限数抛 `TypeError`。不传是 `0`。

**`options.cancelable`**

布尔值，可选，默认 `false`。

### 返回值

新建的 `UIPinchGestureRecognizerEvent`。

### 异常

**`TypeError`**

- 某个字段的值转换不了，见上面各个参数。
- 没传事件名：`Failed to construct 'UIPinchGestureRecognizerEvent': 1 argument required, but only 0 present.`
- 不带 `new`，当成函数调用。

## 示例

```js
const event = new UIPinchGestureRecognizerEvent('changed', { scale: 2, velocity: 0.5 });
console.log(event.scale, event.velocity, event.numberOfTouches);
```

**结果**：控制台输出 `2 0.5 0`。

## 对应的 iOS API

没有对应的系统 API。系统的通知到来时，运行时把通知带的值放进事件对象。

## 参见

- [`UIPinchGestureRecognizerEvent`](../ui-pinch-gesture-recognizer-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md)：把自己建的事件派发出去
