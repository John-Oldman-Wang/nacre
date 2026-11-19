---
type: reference
native: "-[CADisplayLink invalidate]"
---

# `CADisplayLink`：`invalidate()` 方法

**`invalidate()`** 方法彻底停止 `CADisplayLink`。之后不再派发 `tick`，也不能再启动。

## 语法

```
invalidate()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。

## 说明

- 停止之后要再用，新建一个。
- 只想暂时停一下，用 [`isPaused`](ispaused.md)。
- 回调不是在屏幕刷新的那一刻同步执行的，见[运行时怎么工作](../how-it-works.md)。所以停止之后，已经派发、还没执行的那一次回调仍然会执行。回调里如果依赖「已经停止」这个状态，要自己判断。

## 示例

```js
const link = new CADisplayLink();
let count = 0;
link.addEventListener('tick', () => {
  count += 1;
  if (count === 60) link.invalidate();
});
link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
```

**效果**：回调执行 60 次后停止。停止前已经派发的那一次回调仍可能再执行一次。

## 对应的 iOS API

`-[CADisplayLink invalidate]`。

## 参见

- [`isPaused`](ispaused.md)：暂停
