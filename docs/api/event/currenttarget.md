---
type: reference
native: Event.currentTarget
---

# `Event`：`currentTarget` 属性

**`currentTarget`** 属性是正在执行监听器的那个对象。事件没有冒泡，所以它和 [`target`](target.md) 永远相同。

## 值

[`EventTarget`](../event-target.md)，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 和 `target` 相同。

## 示例

```js
application.addEventListener('ping', (e) => {
  console.log(e.currentTarget === e.target);
});
application.dispatchEvent(new Event('ping'));
```

**结果**：控制台输出 `true`。**未在模拟器验证。**

## 参见

- [`target`](target.md)
