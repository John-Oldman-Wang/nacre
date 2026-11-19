---
type: reference
native: UIPanGestureRecognizer.maximumNumberOfTouches
---

# `UIPanGestureRecognizer`：`maximumNumberOfTouches` 属性

**`maximumNumberOfTouches`** 属性是最多能有几根手指按着。

## 值

数，单位是根。

- 可读，可写。
- 默认值是 `4294967295`，等于不限制。[`UIScreenEdgePanGestureRecognizer`](../ui-screen-edge-pan-gesture-recognizer.md) 的默认值是 `1`。

### 怎么得知它变了

它变了不派发事件。只有 App 的代码会改它，不需要通知。

### 写错时

- 负数：抛 `TypeError: maximumNumberOfTouches must be a non-negative integer`。
- 转不成数的值（`undefined`、`'abc'`、`NaN`）：抛 `TypeError: maximumNumberOfTouches must be a finite number, got "abc"`。
- 小数去掉小数部分：写 `2.9` 读回 `2`。数字字符串按数用。
- 出错时属性保持原来的值。

## 示例

```js
const drag = new UIPanGestureRecognizer();
drag.maximumNumberOfTouches = 1;
console.log(drag.maximumNumberOfTouches);
```

**效果**：输出 `1`。加到视图上之后，两根手指拖动不派发事件。**未在模拟器验证。**

## 对应的 iOS API

`UIPanGestureRecognizer.maximumNumberOfTouches`。

## 参见

- [`minimumNumberOfTouches`](minimumnumberoftouches.md)
