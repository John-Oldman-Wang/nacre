---
type: reference
native: "-[CADisplayLink addToRunLoop:forMode:]"
---

# `CADisplayLink`：`addToRunLoop()` 方法

**`addToRunLoop()`** 方法把 `CADisplayLink` 加入事件循环，让它开始工作。

## 语法

```
addToRunLoop(runLoop[, { forMode }])
```

### 参数

**`runLoop`**

只能是 [`NSRunLoop.mainRunLoop`](../ns-run-loop/mainrunloop.md)。

**`options.forMode`**

字符串，决定用户拖动滚动视图期间回调是否继续。不给时是 `'default'`。

| `forMode` | 效果 |
| --- | --- |
| `'common'` | 一直回调。**一般用这个** |
| `'default'` | 平时回调，用户拖动滚动视图期间暂停 |
| `'tracking'` | 只在用户拖动滚动视图期间回调 |

三种取值在滚动期间的差别来自 iOS 的定义，**未在模拟器验证**。验收用例只用了 `'common'`。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- `runLoop` 不是 `NSRunLoop.mainRunLoop`：`addToRunLoop expects an NSRunLoop`。类型检查发现不了这个错误，只有运行时会抛。
- `forMode` 不认识：`forMode has no value "idle"; expected one of: …`，后面列出全部取值。

## 说明

- 只调 `addToRunLoop()`、不监听 `tick`，回调一次都不会执行。
- 可以用不同的 `forMode` 调多次。
- 加入之后，代码里不保存它，它也不会被回收，一直工作到 [`invalidate()`](invalidate.md)，或者加过的 `forMode` 全部被 [`removeFromRunLoop()`](removefromrunloop.md) 取消。

## 示例

```js
const link = new CADisplayLink();
link.addEventListener('tick', () => {
  console.log('tick');
});
link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
```

**结果**：屏幕每刷新一帧，控制台输出一行 `tick`。

## 对应的 iOS API

`-[CADisplayLink addToRunLoop:forMode:]`。`NSRunLoopCommonModes` 写成 `'common'`，`NSDefaultRunLoopMode` 写成 `'default'`，`UITrackingRunLoopMode` 写成 `'tracking'`。

## 参见

- [`removeFromRunLoop()`](removefromrunloop.md)
- [`invalidate()`](invalidate.md)
