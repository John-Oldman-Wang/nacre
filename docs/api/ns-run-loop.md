---
type: reference
native: NSRunLoop
status: partial
---

# `NSRunLoop`

**`NSRunLoop`** 表示一个线程的事件循环。JS 运行在主线程上，能拿到的只有主线程的那一个，[`NSRunLoop.mainRunLoop`](ns-run-loop/mainrunloop.md)。

它唯一的用处是作为 [`CADisplayLink.addToRunLoop()`](ca-display-link/addtorunloop.md) 的参数：`CADisplayLink` 加入它之后才开始工作。

**继承关系**：`EventTarget` → `NSObject` → `NSRunLoop`

## 构造函数

不能用 `new` 创建。用 `NSRunLoop.mainRunLoop`。

## 静态属性

[`NSRunLoop.mainRunLoop`](ns-run-loop/mainrunloop.md) <small>只读</small>

主线程的事件循环。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `NSRunLoop.mainRunLoop` | `NSRunLoop.mainRunLoop` |
| `NSRunLoop.currentRunLoop` | `NSRunLoop.mainRunLoop`。JS 在主线程上，两者是同一个 |

## 参见

- [`CADisplayLink`](ca-display-link.md)
