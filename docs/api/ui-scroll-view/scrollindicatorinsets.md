---
type: reference
native: UIScrollView.scrollIndicatorInsets
---

# `UIScrollView`：`scrollIndicatorInsets` 属性

**`scrollIndicatorInsets`** 属性是两个指示条离滚动视图边缘的距离。iOS 13 起废弃，用 [`verticalScrollIndicatorInsets`](verticalscrollindicatorinsets.md) 和 [`horizontalScrollIndicatorInsets`](horizontalscrollindicatorinsets.md)。

## 值

[`UIEdgeInsets`](../structs.md)，单位是 [pt](../units.md)。

- 可读，可写。写入时可以给普通对象 `{ top, left, bottom, right }`。
- 这个属性是按 iOS 的头文件补上的。验收用例验证过它读得出来、类型对、写回原值读到的不变；效果**未在模拟器验证**，用法照 Apple 的文档。
- 每次读出来是一个新对象，字段只读。要改就整个重新赋值，见[结构体](../structs.md)。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const scroller = new UIScrollView();
scroller.verticalScrollIndicatorInsets = new UIEdgeInsets(0, 0, 80, 0);
```

**效果**：新代码用不废弃的属性：纵向指示条不进入底部 80 pt 的范围。**未在模拟器验证。**

## 对应的 iOS API

`UIScrollView.scrollIndicatorInsets`，iOS 13 起废弃。

## 参见

- [`verticalScrollIndicatorInsets`](verticalscrollindicatorinsets.md)
