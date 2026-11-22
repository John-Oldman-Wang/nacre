---
type: reference
native: UIScrollViewDragEndEvent()
---

# `UIScrollViewDragEndEvent()` 构造函数

**`UIScrollViewDragEndEvent()`** 构造函数创建一个 `UIScrollViewDragEndEvent`。

## 语法

```
new UIScrollViewDragEndEvent(type)
new UIScrollViewDragEndEvent(type, { velocity, targetContentOffset, cancelable })
```

### 参数

**`type`**

事件名，字符串。

**`options.velocity`**

可选，对应 [`velocity`](velocity.md) 属性。一个 `CGPoint`，或者带 `x`、`y` 的普通对象（照结构体的规则转成 `CGPoint`），也可以是 `null`；别的抛 `TypeError`。不传是 `null`。

**`options.targetContentOffset`**

可选，对应 [`targetContentOffset`](targetcontentoffset.md) 属性。一个 `CGPoint`，或者带 `x`、`y` 的普通对象（照结构体的规则转成 `CGPoint`），也可以是 `null`；别的抛 `TypeError`。不传是 `null`。

**`options.cancelable`**

布尔值，可选，默认 `false`。

### 返回值

新建的 `UIScrollViewDragEndEvent`。

### 异常

**`TypeError`**

- 某个字段的值转换不了，见上面各个参数。
- 没传事件名：`Failed to construct 'UIScrollViewDragEndEvent': 1 argument required, but only 0 present.`
- 不带 `new`，当成函数调用。

## 示例

```js
const event = new UIScrollViewDragEndEvent('beforedragend', { velocity: new CGPoint(0, 1.5) });
event.targetContentOffset = new CGPoint(0, 240);
console.log(event.velocity.y, event.targetContentOffset.y);
```

**结果**：控制台输出 `1.5 240`。

## 对应的 iOS API

没有对应的系统 API。系统的通知到来时，运行时把通知带的值放进事件对象。

## 参见

- [`UIScrollViewDragEndEvent`](../ui-scroll-view-drag-end-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md)：把自己建的事件派发出去
