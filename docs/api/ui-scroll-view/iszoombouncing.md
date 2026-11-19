---
type: reference
native: UIScrollView.zoomBouncing
---

# `UIScrollView`：`isZoomBouncing` 属性

**`isZoomBouncing`** 属性表示缩放是否正在弹回到最小或最大比例。

## 值

布尔。

- 只读。给它赋值抛 `TypeError`。
- 新建的滚动视图是 `false`。
- 这个属性是按 iOS 的头文件补上的。验收用例验证过它读得出来、类型对、效果**未在模拟器验证**，用法照 Apple 的文档。
- 没有变化事件。

## 示例

```js
const scroller = new UIScrollView();
console.log(scroller.isZoomBouncing);
```

**结果**：输出 `false`。

## 对应的 iOS API

`UIScrollView.zoomBouncing`（getter 是 `isZoomBouncing`）。

## 参见

- [`zoomScale`](zoomscale.md)
