---
type: reference
native: UISwipeGestureRecognizer.numberOfTouchesRequired
---

# `UISwipeGestureRecognizer`：`numberOfTouchesRequired` 属性

**`numberOfTouchesRequired`** 属性是要几根手指一起扫。

## 值

数，单位是根。

- 可读，可写。
- 默认值是 `1`。

### 怎么得知它变了

它变了不派发事件。只有 App 的代码会改它，不需要通知。

### 写错时

- 负数：抛 `TypeError: numberOfTouchesRequired must be a non-negative integer`。
- 转不成数的值（`undefined`、`'abc'`、`NaN`）：抛 `TypeError: numberOfTouchesRequired must be a finite number, got "abc"`。
- 小数去掉小数部分：写 `2.9` 读回 `2`。数字字符串按数用。
- 出错时属性保持原来的值。

## 示例

```js
const swipe = new UISwipeGestureRecognizer();
swipe.numberOfTouchesRequired = 2;
console.log(swipe.numberOfTouchesRequired);
```

**效果**：输出 `2`。加到视图上之后，两根手指一起扫才认出。**未在模拟器验证。**

## 对应的 iOS API

`UISwipeGestureRecognizer.numberOfTouchesRequired`。

## 参见

- [`direction`](direction.md)
