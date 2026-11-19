---
type: reference
native: NSRunLoop.mainRunLoop
---

# `NSRunLoop.mainRunLoop` 静态属性

**`NSRunLoop.mainRunLoop`** 静态属性是 App 主线程的事件循环。

## 值

`NSRunLoop`。

- 只读。给它赋值抛 `TypeError`。
- 每次读到的是同一个对象。

## 示例

```js
console.log(NSRunLoop.mainRunLoop === NSRunLoop.mainRunLoop);

const link = new CADisplayLink();
link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
```

**结果**：控制台输出 `true`。`link` 开始工作。

## 对应的 iOS API

`NSRunLoop.mainRunLoop`。

## 参见

- [`CADisplayLink.addToRunLoop()`](../ca-display-link/addtorunloop.md)
