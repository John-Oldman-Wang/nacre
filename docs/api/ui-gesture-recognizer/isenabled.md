---
type: reference
native: UIGestureRecognizer.enabled
---

# `UIGestureRecognizer`：`isEnabled` 属性

**`isEnabled`** 属性表示识别器是否接收触摸。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | 正常识别手势 |
| `false` | 不接收触摸，不派发事件。正在进行的连续手势被取消，派发 [`cancelled`](cancelled-event.md) |

- 可读，可写。
- 默认值是 `true`。
- 写入按 JS 的真假值转换。
- 设成 `false` 之后不再响应**未在模拟器验证**；长按进行中设成 `false` 时派发 `cancelled` **未在模拟器验证**。

### 怎么得知它变了

它变了不派发事件。只有 App 的代码会改它，不需要通知。

## 示例

```js
const tap = new UITapGestureRecognizer();
tap.isEnabled = false;
console.log(tap.isEnabled);
```

**效果**：输出 `false`。加到视图上之后，点视图不再有反应；设回 `true` 后恢复。**未在模拟器验证。**

## 对应的 iOS API

`UIGestureRecognizer.enabled`，读取方法是 `isEnabled`。

## 参见

- [`cancelled`](cancelled-event.md)
