---
type: reference
native: UIView.bounds
---

# `UIView`：`bounds` 属性

**`bounds`** 属性是视图在自己坐标系里的矩形。

## 值

[`CGRect`](../cg-rect.md)，单位 [pt](../units.md)。

- 可读，可写。
- 默认值是 `(0, 0, 0, 0)`。
- 左上角通常是 `(0, 0)`，宽高和 [`frame`](frame.md) 相同。
- 知道一个视图有多大，或者让子视图铺满它，读它的 `bounds`：子视图的坐标相对它的左上角，`bounds` 正是这个坐标系里的矩形。读父视图的 `frame` 会把父视图自己的位置带进来。
- [`transform`](transform.md) 不改变 `bounds`。设了变换的视图要改大小，写 `bounds`。
- 写入时可以给 `CGRect`，也可以给字段齐全的普通对象。读出来的结构体字段只读，每次读得到一个新对象，见[结构体](../structs.md)。
- 没有变化通知。视图的位置、大小、层级变化的通知还没有实现，见[还不能做的](../ui-view.md#还不能做的)。

### 写错时

- 给的不是对象：抛 `TypeError: bounds needs an object with all of: x, y, width, height`。
- 缺字段，或字段转不出有限的数：抛 `TypeError: bounds is missing …, or it is not a finite number`，中间是缺的字段名。
- 出错时属性保持原值。字段的值按 `Number()` 转换，所以 `'10'` 可以。

## 示例

```js
const box = new UIView();
box.frame = new CGRect(24, 304, 40, 40);
box.transform = CGAffineTransform.scale(1.2)
  .concat(CGAffineTransform.rotation(Math.PI / 6));

console.log(box.bounds.width);
console.log(box.frame.width);
```

**结果**：依次输出 `40` 和约 `65.57`。变换不改变 `bounds`，`frame` 读出的是变换后的外接矩形。

## 对应的 iOS API

`UIView.bounds`。

## 参见

- [`frame`](frame.md)、[`center`](center.md)
- [`frame`、`bounds` 和 `center`](../ui-view.md#framebounds-和-center)
