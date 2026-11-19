---
type: reference
native: "-[UIScrollView zoomToRect:animated:]"
---

# `UIScrollView`：`zoomToRect()` 方法

**`zoomToRect()`** 方法缩放到让指定的矩形占满可视区。

## 语法

```
zoomToRect(rect)
zoomToRect(rect, { animated })
```

### 参数

**`rect`**

要占满可视区的矩形，[`CGRect`](../structs.md) 或普通对象 `{ x, y, width, height }`，单位是 [pt](../units.md)，坐标系是要缩放的那个子视图的。

**`options.animated`**

布尔，可以不传。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

`rect` 不是矩形（实测）。

## 说明

这个方法是按 iOS 的头文件补上的。在模拟器上调过：传的不是矩形时抛 `TypeError`。缩放的效果**未在模拟器验证**。

## 示例

```js
const scroller = new UIScrollView();
scroller.maximumZoomScale = 4;
scroller.zoomToRect(new CGRect(0, 0, 100, 100), { animated: true });
```

**效果**：放大到左上角 100 × 100 pt 的范围占满可视区。**未在模拟器验证。**

## 对应的 iOS API

`-[UIScrollView zoomToRect:animated:]`。

## 参见

- [`setZoomScale()`](setzoomscale.md)
