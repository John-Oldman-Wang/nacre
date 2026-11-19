---
type: reference
native: Event.defaultPrevented
---

# `Event`：`defaultPrevented` 属性

**`defaultPrevented`** 属性表示有没有监听器调过 [`preventDefault()`](preventdefault.md) 并且生效了。

## 值

布尔值。

| 取值 | 含义 |
| --- | --- |
| `true` | 有监听器调过 `preventDefault()`，并且 `cancelable` 是 `true` |
| `false` | 没有，或者 `cancelable` 是 `false` |

- 只读。给它赋值抛 `TypeError`。

## 示例

```js
application.addEventListener('ask', (e) => e.preventDefault());
const event = new Event('ask', { cancelable: true });
application.dispatchEvent(event);
console.log(event.defaultPrevented);
```

**结果**：控制台输出 `true`。

## 参见

- [`cancelable`](cancelable.md)
