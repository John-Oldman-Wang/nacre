---
type: reference
native: UIScrollView.zoomAnimating
---

# `UIScrollView`：`isZoomAnimating` 属性

**`isZoomAnimating`** 属性表示是否正在执行缩放的动画。

## 值

布尔。

- 只读。给它赋值抛 `TypeError`。
- 新建的滚动视图是 `false`。
- 这个属性是按 iOS 的头文件补上的。验收用例验证过它读得出来、类型对、效果**未在模拟器验证**，用法照 Apple 的文档。
- 没有变化事件。

## 示例

```js
const scroller = new UIScrollView();
console.log(scroller.isZoomAnimating);
```

**结果**：输出 `false`。

## 对应的 iOS API

`UIScrollView.zoomAnimating`（getter 是 `isZoomAnimating`）。

## 参见

- [`zoomScale`](zoomscale.md)
