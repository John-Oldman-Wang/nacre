---
type: reference
native: Event.cancelable
---

# `Event`：`cancelable` 属性

**`cancelable`** 属性表示这个事件能不能被 [`preventDefault()`](preventdefault.md) 取消。

## 值

布尔值。

| 取值 | 含义 |
| --- | --- |
| `true` | `preventDefault()` 有效 |
| `false` | `preventDefault()` 没有效果，也不报错 |

- 只读。给它赋值抛 `TypeError`。
- 自己构造时不传就是 `false`。
- 系统通知派发的事件一律是 `false`，见[系统派发的事件不能取消](../event.md#系统派发的事件不能取消)。

## 示例

```js
console.log(new Event('a').cancelable, new Event('b', { cancelable: true }).cancelable);
```

**结果**：控制台输出 `false true`。

## 参见

- [`defaultPrevented`](defaultprevented.md)
