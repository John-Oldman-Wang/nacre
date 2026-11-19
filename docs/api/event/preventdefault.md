---
type: reference
native: Event.preventDefault
---

# `Event`：`preventDefault()` 方法

**`preventDefault()`** 方法取消事件的默认动作。

## 语法

```
preventDefault()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。

## 说明

- [`cancelable`](cancelable.md) 是 `true` 时，把 [`defaultPrevented`](defaultprevented.md) 设为 `true`，派发它的 `dispatchEvent()` 返回 `false`。
- `cancelable` 是 `false` 时什么都不做，不报错（实测）。
- 「默认动作」是什么由各个事件定。比如 `application` 的 `error` 事件，默认动作是运行时输出一条错误日志。

## 示例

```js
application.addEventListener('ask', (e) => e.preventDefault());
console.log(application.dispatchEvent(new Event('ask', { cancelable: true })));
console.log(application.dispatchEvent(new Event('ask')));
```

**结果**：依次输出 `false` 和 `true`。

## 参见

- [`defaultPrevented`](defaultprevented.md)
