---
type: reference
native: UIView.frame
---

# `UIView`：`frame` 属性

**`frame`** 属性是视图在父视图坐标系里的位置和大小。

## 值

[`CGRect`](../cg-rect.md)，单位 [pt](../units.md)。坐标原点在父视图的左上角，`x` 向右增大，`y` 向下增大。

- 可读，可写。
- 默认值是 `(0, 0, 0, 0)`。
- 写入时可以给 `CGRect`，也可以给四个字段（`x`、`y`、`width`、`height`）齐全的普通对象。
- 读出来的结构体字段只读，每次读得到一个新对象，见[结构体](../structs.md)。写 `view.frame.x = 10` 抛 `TypeError: x is read-only: structs are values, assign a whole new one instead`；要改就整体赋一个新的。
- `frame`、[`bounds`](bounds.md)、[`center`](center.md) 是同一份数据：写其中一个，另外两个读出来跟着变。
- [`transform`](transform.md) 不是单位矩阵时，读出来的是变换后图形的外接矩形，不再是视图原本的矩形。这时不要读写 `frame`，改用 `bounds` 和 `center`。
- 用约束定位的视图（[`translatesAutoresizingMaskIntoConstraints`](translatesautoresizingmaskintoconstraints.md) 是 `false`）可以读，不要写：写入不报错，但下一次布局时系统用约束的结果覆盖它。**「写入的 `frame` 被覆盖」未在模拟器验证。** 激活约束之后要立刻读到结果，先调 [`layoutIfNeeded()`](layoutifneeded.md)。
- 没有变化通知。

### 写错时

- 给的不是对象：抛 `TypeError: frame needs an object with all of: x, y, width, height`。
- 缺字段，或字段转不出有限的数：抛 `TypeError: frame is missing …, or it is not a finite number`，中间是缺的字段名。
- 出错时属性保持原值。字段的值按 `Number()` 转换，所以 `'10'` 可以。

## 示例

```js
const card = new UIView();
card.frame = new CGRect(40, 120, 200, 120);

const f = card.frame;
card.frame = new CGRect(f.x, f.y + 100, f.width, f.height);

card.frame = { x: 60, y: 270, width: 160, height: 80 };
console.log(String(card.frame));
```

**效果**

- 第二次赋值让视图向下移动 100 pt，大小不变。
- 第三次赋值把视图移到 `(60, 270)`，宽 160 pt、高 80 pt。控制台输出 `CGRect(60, 270, 160, 80)`。

## 对应的 iOS API

`UIView.frame`。`CGRectMake(40, 120, 200, 120)` 写成 `new CGRect(40, 120, 200, 120)`。`[[UIView alloc] initWithFrame:rect]` 写成 `new UIView()` 之后赋 `frame`。

## 参见

- [`bounds`](bounds.md)、[`center`](center.md)
- [`frame`、`bounds` 和 `center`](../ui-view.md#framebounds-和-center)
- [两种定位方式](../ui-view.md#两种定位方式)
- [`CGRect`](../cg-rect.md)
