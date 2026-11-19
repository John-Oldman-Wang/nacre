---
type: reference
native: Event.target
---

# `Event`：`target` 属性

**`target`** 属性是事件派发到的对象。

## 值

[`EventTarget`](../event-target.md)，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 还没派发过是 `null`。
- 系统派发的事件里，它是发生事件的那个对象，比如被点的按钮、`application`。

## 示例

```js
application.addEventListener('ping', (e) => {
  console.log(e.target === application);
});
application.dispatchEvent(new Event('ping'));
```

**结果**：控制台输出 `true`。

## 参见

- [`currentTarget`](currenttarget.md)
