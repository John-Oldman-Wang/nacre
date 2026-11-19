---
type: reference
native: "-[UIScrollView setZoomScale:animated:]"
---

# `UIScrollView`：`setZoomScale()` 方法

**`setZoomScale()`** 方法改缩放比例，可以带动画。

## 语法

```
setZoomScale(scale)
setZoomScale(scale, { animated })
```

### 参数

**`scale`**

缩放比例，数。按 Apple 的文档，超出 [`minimumZoomScale`](minimumzoomscale.md) 到 [`maximumZoomScale`](maximumzoomscale.md) 的范围时被限制在范围内。**未在模拟器验证。**

**`options.animated`**

布尔，可以不传（实测不传不抛）。

### 返回值

无（`undefined`）。

### 异常

无。

## 说明

这个方法是按 iOS 的头文件补上的。在模拟器上调过：不带 `animated` 时不抛。缩放的效果**未在模拟器验证**。

## 示例

```js
const scroller = new UIScrollView();
scroller.minimumZoomScale = 0.5;
scroller.maximumZoomScale = 4;
scroller.setZoomScale(2, { animated: true });
```

**效果**：内容放大到两倍。按 Apple 的文档，要缩放的子视图由系统当场问，这一问还没接，所以屏幕上可能看不到变化。**未在模拟器验证。**

## 对应的 iOS API

`-[UIScrollView setZoomScale:animated:]`。

## 参见

- [`zoomScale`](zoomscale.md)
