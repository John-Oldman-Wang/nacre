---
type: reference
native: UIPanGestureRecognizerEvent()
---

# `UIPanGestureRecognizerEvent()` 构造函数

**`UIPanGestureRecognizerEvent()`** 构造函数创建一个 `UIPanGestureRecognizerEvent`。

## 语法

```
new UIPanGestureRecognizerEvent(type)
new UIPanGestureRecognizerEvent(type, { location, numberOfTouches, translation, velocity, cancelable })
```

### 参数

**`type`**

事件名，字符串。

**`options.location`**

可选，对应 [`location`](../ui-gesture-recognizer-event/location.md) 属性。一个 `CGPoint`，或者带 `x`、`y` 的普通对象（照结构体的规则转成 `CGPoint`），也可以是 `null`；别的抛 `TypeError`。不传是 `null`。

**`options.numberOfTouches`**

可选，对应 [`numberOfTouches`](../ui-gesture-recognizer-event/numberoftouches.md) 属性。按数转再向零取整，转不出有限数抛 `TypeError`。不传是 `0`。

**`options.translation`**

可选，对应 [`translation`](translation.md) 属性。一个 `CGPoint`，或者带 `x`、`y` 的普通对象（照结构体的规则转成 `CGPoint`），也可以是 `null`；别的抛 `TypeError`。不传是 `null`。

**`options.velocity`**

可选，对应 [`velocity`](velocity.md) 属性。一个 `CGPoint`，或者带 `x`、`y` 的普通对象（照结构体的规则转成 `CGPoint`），也可以是 `null`；别的抛 `TypeError`。不传是 `null`。

**`options.cancelable`**

布尔值，可选，默认 `false`。

### 返回值

新建的 `UIPanGestureRecognizerEvent`。

### 异常

**`TypeError`**

- 某个字段的值转换不了，见上面各个参数。
- 没传事件名：`Failed to construct 'UIPanGestureRecognizerEvent': 1 argument required, but only 0 present.`
- 不带 `new`，当成函数调用。

## 示例

```js
const event = new UIPanGestureRecognizerEvent('changed', { translation: new CGPoint(30, 0), velocity: new CGPoint(200, 0) });
console.log(event instanceof UIGestureRecognizerEvent, event.translation.x, event.location);
```

**结果**：控制台输出 `true 30 null`。

## 对应的 iOS API

没有对应的系统 API。系统的通知到来时，运行时把通知带的值放进事件对象。

## 参见

- [`UIPanGestureRecognizerEvent`](../ui-pan-gesture-recognizer-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md)：把自己建的事件派发出去
