---
type: reference
native: UIScrollView.zooming
---

# `UIScrollView`：`isZooming` 属性

**`isZooming`** 属性表示用户是否正在用双指缩放。

## 值

布尔。

- 只读。给它赋值抛 `TypeError`。
- 新建的滚动视图是 `false`（实测）。
- 这个属性是按 iOS 的头文件补上的。验收用例验证过它读得出来、类型对、效果**未在模拟器验证**，用法照 Apple 的文档。
- 没有变化事件。

## 示例

```js
const scroller = new UIScrollView();
console.log(scroller.isZooming);
```

**结果**：输出 `false`。

## 对应的 iOS API

`UIScrollView.zooming`（getter 是 `isZooming`）。

## 参见

- [`zoomScale`](zoomscale.md)
