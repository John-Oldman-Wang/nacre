---
type: reference
native: UIScrollView.zoomScale
---

# `UIScrollView`：`zoomScale` 属性

**`zoomScale`** 属性是当前的缩放比例。`1` 是原始大小，`2` 是放大一倍。

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
scroller.minimumZoomScale = 0.5;
scroller.maximumZoomScale = 4;
console.log(scroller.zoomScale);
```

**结果**：输出 `1`。

## 对应的 iOS API

`UIScrollView.zoomScale`。

## 参见

- [`setZoomScale()`](setzoomscale.md)
- [`zoomToRect()`](zoomtorect.md)
