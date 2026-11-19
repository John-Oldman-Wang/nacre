---
type: reference
native: "-[UIView removeGestureRecognizer:]"
---

# `UIView`：`removeGestureRecognizer()` 方法

**`removeGestureRecognizer()`** 方法把一个手势识别器从视图上拿掉。

## 语法

```
removeGestureRecognizer(recognizer)
```

### 参数

**`recognizer`**

一个 [`UIGestureRecognizer`](../ui-gesture-recognizer.md)。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

参数不是识别器：`removeGestureRecognizer needs a UIGestureRecognizer`。**报错原文未在模拟器验证。**

## 示例

```js
const card = new UIView();
const tap = new UITapGestureRecognizer();
card.addGestureRecognizer(tap);
card.removeGestureRecognizer(tap);
console.log(card.gestureRecognizers.includes(tap));
```

**结果**：输出 `false`。

## 对应的 iOS API

`-[UIView removeGestureRecognizer:]`。

## 参见

- [`addGestureRecognizer()`](addgesturerecognizer.md)
