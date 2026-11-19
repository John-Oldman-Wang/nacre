---
type: reference
native: "+[CADisplayLink displayLinkWithTarget:selector:]"
---

# `CADisplayLink()` 构造函数

**`CADisplayLink()`** 构造函数创建一个和屏幕刷新同步的定时器。创建之后不会自己开始。

## 语法

```
new CADisplayLink()
```

### 参数

无。

### 返回值

新建的 `CADisplayLink`。要监听 [`tick`](tick-event.md) 并调 [`addToRunLoop()`](addtorunloop.md)，两步都做了才开始派发。开始工作之前，[`timestamp`](timestamp.md) 和 [`duration`](duration.md) 是 0。

## 示例

```js
const link = new CADisplayLink();
console.log(link.isPaused, link.timestamp);
```

**结果**：控制台输出 `false 0`。

## 对应的 iOS API

`+[CADisplayLink displayLinkWithTarget:selector:]`。没有 target 和 selector，回调用 `addEventListener('tick', …)` 加。

## 参见

- [`addToRunLoop()`](addtorunloop.md)
