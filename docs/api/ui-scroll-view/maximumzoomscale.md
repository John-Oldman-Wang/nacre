---
type: reference
native: UIScrollView.maximumZoomScale
---

# `UIScrollView`：`maximumZoomScale` 属性

**`maximumZoomScale`** 属性是允许放到的最大比例。

## 值

数，是比例，没有单位。

- 可读，可写。
- 默认值是 `1`（实测）。最小和最大都是 `1` 时不能缩放。
- 写进去读得回来（实测）。
- 双指捏合缩放还不能用：系统要当场问「缩放的是哪个子视图」，这一问还没接。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const scroller = new UIScrollView();
scroller.maximumZoomScale = 4;
console.log(scroller.maximumZoomScale);
```

**结果**：输出 `4`。

## 对应的 iOS API

`UIScrollView.maximumZoomScale`。

## 参见

- [`setZoomScale()`](setzoomscale.md)
- [`zoomToRect()`](zoomtorect.md)
