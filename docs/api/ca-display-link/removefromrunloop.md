---
type: reference
native: "-[CADisplayLink removeFromRunLoop:forMode:]"
---

# `CADisplayLink`：`removeFromRunLoop()` 方法

**`removeFromRunLoop()`** 方法取消 `CADisplayLink` 在某个模式上的回调。

## 语法

```
removeFromRunLoop(runLoop[, { forMode }])
```

### 参数

**`runLoop`**

只能是 [`NSRunLoop.mainRunLoop`](../ns-run-loop/mainrunloop.md)。

**`options.forMode`**

`'default'`、`'common'`、`'tracking'` 之一，不给时是 `'default'`。含义见 [`addToRunLoop()`](addtorunloop.md)。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- `runLoop` 不是 `NSRunLoop.mainRunLoop`。
- `forMode` 不认识：`forMode has no value "idle"; expected one of: …`。

## 说明

- 加过的 `forMode` 全部取消之后不再回调，它也可以被回收。
- 和 [`invalidate()`](invalidate.md) 不同，取消之后还能再 `addToRunLoop()`。**未在模拟器验证。**

## 示例

```js
const link = new CADisplayLink();
link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
link.removeFromRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
```

**效果**：不再派发 `tick`。**未在模拟器验证。**

## 对应的 iOS API

`-[CADisplayLink removeFromRunLoop:forMode:]`。

## 参见

- [`addToRunLoop()`](addtorunloop.md)
