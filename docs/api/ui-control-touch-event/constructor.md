---
type: reference
native: UIControlTouchEvent()
---

# `UIControlTouchEvent()` 构造函数

**`UIControlTouchEvent()`** 构造函数创建一个 `UIControlTouchEvent`。

## 语法

```
new UIControlTouchEvent(type)
new UIControlTouchEvent(type, { location, tapCount, cancelable })
```

### 参数

**`type`**

事件名，字符串。

**`options.location`**

可选，对应 [`location`](location.md) 属性。一个 `CGPoint`，或者带 `x`、`y` 的普通对象（照结构体的规则转成 `CGPoint`），也可以是 `null`；别的抛 `TypeError`。不传是 `null`。

**`options.tapCount`**

可选，对应 [`tapCount`](tapcount.md) 属性。按数转再向零取整，转不出有限数抛 `TypeError`。不传是 `0`。

**`options.cancelable`**

布尔值，可选，默认 `false`。

### 返回值

新建的 `UIControlTouchEvent`。

### 异常

**`TypeError`**

- 某个字段的值转换不了，见上面各个参数。
- 没传事件名：`Failed to construct 'UIControlTouchEvent': 1 argument required, but only 0 present.`
- 不带 `new`，当成函数调用。

## 示例

```js
const event = new UIControlTouchEvent('touchupinside', { location: new CGPoint(10, 20), tapCount: 1 });
console.log(event.location?.x, event.tapCount, event.cancelable);
```

**结果**：控制台输出 `10 1 false`。

## 对应的 iOS API

没有对应的系统 API。系统的通知到来时，运行时把通知带的值放进事件对象。

## 参见

- [`UIControlTouchEvent`](../ui-control-touch-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md)：把自己建的事件派发出去
