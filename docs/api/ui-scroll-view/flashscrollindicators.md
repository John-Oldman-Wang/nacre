---
type: reference
native: "-[UIScrollView flashScrollIndicators]"
---

# `UIScrollView`：`flashScrollIndicators()` 方法

**`flashScrollIndicators()`** 方法让滚动指示条显示片刻再消失，提示用户这里可以滚动。

## 语法

```
flashScrollIndicators()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。

## 示例

```js
const scroller = new UIScrollView();
scroller.flashScrollIndicators();
```

**效果**：指示条出现一下再消失。

## 对应的 iOS API

`-[UIScrollView flashScrollIndicators]`。

## 参见

- [`showsVerticalScrollIndicator`](showsverticalscrollindicator.md)
