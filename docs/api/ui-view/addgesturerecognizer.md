---
type: reference
native: "-[UIView addGestureRecognizer:]"
---

# `UIView`：`addGestureRecognizer()` 方法

**`addGestureRecognizer()`** 方法把一个手势识别器加到视图上，让普通视图也能响应点按、长按、拖动这类手势。

## 语法

```
addGestureRecognizer(recognizer)
```

### 参数

**`recognizer`**

一个 [`UIGestureRecognizer`](../ui-gesture-recognizer.md)。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

参数不是识别器：`addGestureRecognizer needs a UIGestureRecognizer`。

## 说明

- 识别器加到视图上之后由视图保管，不需要另外保存。
- 一个识别器同一时刻只能挂在一个视图上。它原来在别的视图上时，先从那个视图上移除。
- `UIView` 自己不派发点按事件。要的是一个按钮时，直接用 [`UIButton`](../ui-button.md)。

## 示例

```js
const card = new UIView();
const tap = new UITapGestureRecognizer();
tap.addEventListener('ended', () => {
  console.log('点了');
});
card.addGestureRecognizer(tap);
```

**效果**：`card` 显示在屏幕上之后，点它时控制台输出 `点了`。

## 对应的 iOS API

`-[UIView addGestureRecognizer:]`。

## 参见

- [`removeGestureRecognizer()`](removegesturerecognizer.md)
- [手势识别器](../ui-gesture-recognizer.md)
