---
type: reference
native: UIView.alignmentRectInsets
---

# `UIView`：`alignmentRectInsets` 属性

**`alignmentRectInsets`** 属性给出视图的对齐矩形比 `frame` 往里缩了多少。对齐矩形是约束对齐时用的矩形，可以不包括阴影这类装饰。

## 值

[`UIEdgeInsets`](../ui-edge-insets.md)，单位 [pt](../units.md)。

- 只读。给它赋值抛 `TypeError`。
- 普通 `UIView` 是 `(0, 0, 0, 0)`，对齐矩形就是 `frame`。**未在模拟器验证。**
- 读出来的类型在验收用例里核对过。
- ObjC 里子类覆写它来改变对齐矩形，这里只能读，不能改。

## 示例

```js
const view = new UIView();
console.log(String(view.alignmentRectInsets));
```

**结果**：输出 `UIEdgeInsets(0, 0, 0, 0)`。**未在模拟器验证。**

## 对应的 iOS API

`UIView.alignmentRectInsets`。

## 参见

- [`alignmentRectForFrame()`](alignmentrectforframe.md)、[`frameForAlignmentRect()`](frameforalignmentrect.md)
