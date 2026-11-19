---
type: reference
native: UIGestureRecognizer.state
---

# `UIGestureRecognizer`：`state` 属性

**`state`** 属性是识别器当前的状态。

## 值

字符串，下面几个之一：

| 取值 | 含义 |
| --- | --- |
| `'possible'` | 还没有认出手势。没有触摸时也是这个值 |
| `'began'` | 连续手势刚被认出 |
| `'changed'` | 连续手势进行中 |
| `'ended'` | 手势结束。离散手势被认出时也是这个值 |
| `'cancelled'` | 连续手势被打断 |
| `'failed'` | 这次触摸不是这个手势 |

- 只读。给它赋值抛 `TypeError`。
- 默认值是 `'possible'`。

> **注意**：回调里读到的是回调执行那一刻的状态，不是事件发生那一刻的状态。实测点按的 `ended` 回调里读到 `'possible'`，因为手势结束之后识别器立刻回到初始状态；长按的 `began` 回调里手指还按着时读到 `'began'`，手指已经移动过时可能读到 `'changed'`。要知道是哪个阶段，看事件名。

### 怎么得知它变了

`'began'`、`'changed'`、`'ended'`、`'cancelled'` 各有一个同名事件：[`began`](began-event.md)、[`changed`](changed-event.md)、[`ended`](ended-event.md)、[`cancelled`](cancelled-event.md)。`'possible'` 和 `'failed'` 没有对应的事件。

## 示例

```js
const tap = new UITapGestureRecognizer();
console.log(tap.state);
```

**结果**：输出 `possible`。

## 对应的 iOS API

`UIGestureRecognizer.state`。`UIGestureRecognizerStateBegan` 写成 `'began'`，其余同理。`UIGestureRecognizerStateRecognized` 和 `UIGestureRecognizerStateEnded` 是同一个值，这里只有 `'ended'`。

## 参见

- [回调里读不到当时的状态](../ui-gesture-recognizer.md#回调里读不到当时的状态)
- [离散手势和连续手势](../ui-gesture-recognizer.md#离散手势和连续手势)
