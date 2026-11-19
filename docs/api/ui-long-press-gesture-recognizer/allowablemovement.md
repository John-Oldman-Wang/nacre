---
type: reference
native: UILongPressGestureRecognizer.allowableMovement
---

# `UILongPressGestureRecognizer`：`allowableMovement` 属性

**`allowableMovement`** 属性是长按被认出之前手指最多能移动多远。

## 值

数，单位 [pt](../units.md)。

- 可读，可写。
- 默认值是 `10`。
- 认出之前手指移动超过这个距离，就不算长按，不派发任何事件。被认出之后移动多远都可以，每次移动派发 [`changed`](../ui-gesture-recognizer/changed-event.md)。

### 怎么得知它变了

它变了不派发事件。只有 App 的代码会改它，不需要通知。

### 写错时

- 负数：抛 `TypeError: allowableMovement must be a non-negative number`。
- 转不成数的值（`undefined`、`'soon'`、`NaN`）：抛 `TypeError: allowableMovement must be a finite number, got "soon"`。
- 数字字符串按数用：写 `'0.4'` 读回 `0.4`。
- 出错时属性保持原来的值。

## 示例

```js
const press = new UILongPressGestureRecognizer();
press.allowableMovement = 30;
```

**效果**：按住时手指晃动 30 pt 以内仍然算长按。**未在模拟器验证。**

## 对应的 iOS API

`UILongPressGestureRecognizer.allowableMovement`。

## 参见

- [`minimumPressDuration`](minimumpressduration.md)
