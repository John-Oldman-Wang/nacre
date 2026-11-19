---
type: reference
native: "-[UIScrollView stopScrollingAndZooming]"
---

# `UIScrollView`：`stopScrollingAndZooming()` 方法

**`stopScrollingAndZooming()`** 方法立刻停下正在进行的滚动和缩放。

## 语法

```
stopScrollingAndZooming()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。

## 说明

这个方法是按 iOS 的头文件补上的。**没有在模拟器上调过**，用法照 Apple 的文档。

## 示例

```js
const scroller = new UIScrollView();
scroller.addEventListener('dragend', () => scroller.stopScrollingAndZooming());
```

**效果**：松手后内容立刻停住，不再惯性滑动。**未在模拟器验证。**

## 对应的 iOS API

`-[UIScrollView stopScrollingAndZooming]`（iOS 17.4 起）。

## 参见

- [`isDecelerating`](isdecelerating.md)
