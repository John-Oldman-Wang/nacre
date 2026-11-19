---
type: reference
native: CADisplayLink.paused
---

# `CADisplayLink`：`isPaused` 属性

**`isPaused`** 属性决定 `CADisplayLink` 是否暂停派发 `tick`。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 暂停派发 `tick`。仍然在事件循环里，设回 `false` 就继续 |
| `false` | 正常派发 |

- 可读，可写。
- 默认值是 `false`。
- 写入时按 `Boolean()` 转换，不会出错。
- 暂停之后，已经派发、还没执行的那一次回调仍然会执行。

## 示例

```js
const link = new CADisplayLink();
link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
link.isPaused = true;
```

**效果**：暂停之后不再派发 `tick`。

## 对应的 iOS API

`CADisplayLink.paused`。

## 参见

- [`invalidate()`](invalidate.md)：彻底停止
