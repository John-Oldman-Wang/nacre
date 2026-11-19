---
type: reference
native: UIScrollView.contentAlignmentPoint
---

# `UIScrollView`：`contentAlignmentPoint` 属性

**`contentAlignmentPoint`** 属性决定内容比可视区小时，内容在可视区里怎么摆。

## 值

[`CGPoint`](../structs.md)，`x` 和 `y` 是 0 到 1 的比例：`(0, 0)` 是左上角，`(0.5, 0.5)` 是正中。按 Apple 的文档，**未在模拟器验证**。

- 可读，可写。写入时可以给普通对象 `{ x, y }`。
- 这个属性是按 iOS 的头文件补上的。验收用例验证过它读得出来、类型对、写回原值读到的不变；效果**未在模拟器验证**，用法照 Apple 的文档。
- 每次读出来是一个新对象，字段只读。要改就整个重新赋值，见[结构体](../structs.md)。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const scroller = new UIScrollView();
scroller.contentAlignmentPoint = new CGPoint(0.5, 0.5);
```

**效果**：内容比可视区小时，摆在可视区的正中。**未在模拟器验证。**

## 对应的 iOS API

`UIScrollView.contentAlignmentPoint`（iOS 17.4 起）。

## 参见

- [`contentSize`](contentsize.md)
