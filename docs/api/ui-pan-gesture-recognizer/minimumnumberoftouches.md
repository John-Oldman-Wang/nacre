---
type: reference
native: UIPanGestureRecognizer.minimumNumberOfTouches
---

# `UIPanGestureRecognizer`：`minimumNumberOfTouches` 属性

**`minimumNumberOfTouches`** 属性是最少要几根手指按着才算拖动。

## 值

数，单位是根。

- 可读，可写。
- 默认值是 `1`。

### 怎么得知它变了

它变了不派发事件。只有 App 的代码会改它，不需要通知。

### 写错时

- 负数：抛 `TypeError: minimumNumberOfTouches must be a non-negative integer`。
- 转不成数的值（`undefined`、`'abc'`、`NaN`）：抛 `TypeError: minimumNumberOfTouches must be a finite number, got "abc"`。
- 小数去掉小数部分：写 `2.9` 读回 `2`。数字字符串按数用。
- 出错时属性保持原来的值。

## 示例

```js
const twoFingerDrag = new UIPanGestureRecognizer();
twoFingerDrag.minimumNumberOfTouches = 2;
twoFingerDrag.maximumNumberOfTouches = 2;
```

**效果**：一根手指拖动时这个识别器不派发事件，两根手指一起拖动时才派发。**未在模拟器验证。**

## 对应的 iOS API

`UIPanGestureRecognizer.minimumNumberOfTouches`。

## 参见

- [`maximumNumberOfTouches`](maximumnumberoftouches.md)
