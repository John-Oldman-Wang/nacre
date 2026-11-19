---
type: reference
native: UILongPressGestureRecognizer.minimumPressDuration
---

# `UILongPressGestureRecognizer`：`minimumPressDuration` 属性

**`minimumPressDuration`** 属性是要按住多久才算长按。

## 值

数，单位是**秒**，不是毫秒。

- 可读，可写。
- 默认值是 `0.5`。
- 按够这么久时派发 [`began`](../ui-gesture-recognizer/began-event.md)。

### 怎么得知它变了

它变了不派发事件。只有 App 的代码会改它，不需要通知。

### 写错时

- 负数：抛 `TypeError: minimumPressDuration must be a non-negative number`。
- 转不成数的值（`undefined`、`'soon'`、`NaN`）：抛 `TypeError: minimumPressDuration must be a finite number, got "soon"`。
- 数字字符串按数用：写 `'0.4'` 读回 `0.4`。
- 出错时属性保持原来的值。

## 示例

```js
const press = new UILongPressGestureRecognizer();
press.minimumPressDuration = 1;
```

**效果**：要按住 1 秒才派发 `began`。**未在模拟器验证。**

## 对应的 iOS API

`UILongPressGestureRecognizer.minimumPressDuration`。

## 参见

- [`allowableMovement`](allowablemovement.md)
