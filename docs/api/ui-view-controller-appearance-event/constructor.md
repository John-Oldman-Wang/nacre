---
type: reference
native: UIViewControllerAppearanceEvent()
---

# `UIViewControllerAppearanceEvent()` 构造函数

**`UIViewControllerAppearanceEvent()`** 构造函数创建一个 `UIViewControllerAppearanceEvent`。

## 语法

```
new UIViewControllerAppearanceEvent(type)
new UIViewControllerAppearanceEvent(type, { animated, cancelable })
```

### 参数

**`type`**

事件名，字符串。

**`options.animated`**

可选，对应 [`animated`](animated.md) 属性。按 JS 的真假值转（`Boolean()`）。不传是 `false`。

**`options.cancelable`**

布尔值，可选，默认 `false`。

### 返回值

新建的 `UIViewControllerAppearanceEvent`。

### 异常

**`TypeError`**

- 某个字段的值转换不了，见上面各个参数。
- 没传事件名：`Failed to construct 'UIViewControllerAppearanceEvent': 1 argument required, but only 0 present.`
- 不带 `new`，当成函数调用。

## 示例

```js
const event = new UIViewControllerAppearanceEvent('appear', { animated: true });
console.log(event.type, event.animated);
```

**结果**：控制台输出 `appear true`。

## 对应的 iOS API

没有对应的系统 API。系统的通知到来时，运行时把通知带的值放进事件对象。

## 参见

- [`UIViewControllerAppearanceEvent`](../ui-view-controller-appearance-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md)：把自己建的事件派发出去
