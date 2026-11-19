---
type: reference
native: Event.type
---

# `Event`：`type` 属性

**`type`** 属性是事件名。

## 值

字符串。系统派发的事件名全小写。

- 只读。给它赋值抛 `TypeError`。
- 值是构造时给的事件名。

## 示例

```js
console.log(new Event('login').type);
```

**结果**：控制台输出 `login`。

## 参见

- [`Event()`](constructor.md)
