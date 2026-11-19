---
type: reference
native: UIView.anchorPoint
---

# `UIView`：`anchorPoint` 属性

**`anchorPoint`** 属性是视图变换（旋转、缩放）时绕的那个点，用视图自己大小的比例表示。

## 值

[`CGPoint`](../cg-point.md)，两个字段都是比例：`(0, 0)` 是左上角，`(1, 1)` 是右下角，`(0.5, 0.5)` 是中心。

- 可读，可写。
- 默认值**未在模拟器验证**，按 Apple 的文档是 `(0.5, 0.5)`，所以 [`transform`](transform.md) 默认以中心为原点。
- 写入时可以给 `CGPoint`，也可以给 `{ x, y }`。读出来的结构体字段只读，每次读得到一个新对象，见[结构体](../structs.md)。
- 读出来的类型、写回原值读到的不变，在验收用例里核对过。改了之后视图的位置怎么变**未在模拟器验证**。

### 写错时

- 给的不是对象：抛 `TypeError: anchorPoint needs an object with all of: x, y`。
- 缺字段，或字段转不出有限的数：抛 `TypeError: anchorPoint is missing …, or it is not a finite number`，中间是缺的字段名。
- 出错时属性保持原值。字段的值按 `Number()` 转换，所以 `'10'` 可以。

## 示例

```js
const hand = new UIView();
hand.anchorPoint = new CGPoint(0.5, 1);
hand.transform = CGAffineTransform.rotation(Math.PI / 4);
```

**效果**：`hand` 绕自己底边的中点旋转 45°。**未在模拟器验证。**

## 对应的 iOS API

`UIView.anchorPoint`。

## 参见

- [`transform`](transform.md)
- [`CALayer`](../ca-layer.md)：图层的 `anchorPoint`
