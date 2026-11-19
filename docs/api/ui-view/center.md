---
type: reference
native: UIView.center
---

# `UIView`：`center` 属性

**`center`** 属性是视图中心点在父视图坐标系里的位置。

## 值

[`CGPoint`](../cg-point.md)，单位 [pt](../units.md)。

- 可读，可写。
- 默认值是 `(0, 0)`。
- 只移动、不改大小时写它，不用重复写宽高。
- [`transform`](transform.md) 不改变 `center`。设了变换的视图要改位置，写 `center`。
- 写入只在执行的那一刻生效。父视图的大小之后变了，视图不会自动重新居中；要一直保持居中，用约束对齐 [`centerXAnchor`](centerxanchor.md) 和 [`centerYAnchor`](centeryanchor.md)。
- 写入时可以给 `CGPoint`，也可以给 `{ x, y }`。读出来的结构体字段只读，每次读得到一个新对象，见[结构体](../structs.md)。
- 没有变化通知。

### 写错时

- 给的不是对象：抛 `TypeError: center needs an object with all of: x, y`。
- 缺字段，或字段转不出有限的数：抛 `TypeError: center is missing …, or it is not a finite number`，中间是缺的字段名。
- 出错时属性保持原值。字段的值按 `Number()` 转换，所以 `'10'` 可以。

## 示例

```js
const parent = new UIView();
parent.frame = new CGRect(0, 0, 390, 844);
const card = new UIView();
card.frame = new CGRect(0, 0, 200, 120);
parent.addSubview(card);

const size = parent.bounds;
card.center = new CGPoint(size.width / 2, size.height / 2);
console.log(String(card.frame));
```

**结果**：`card` 移到 `parent` 的正中，大小不变。控制台输出 `CGRect(95, 362, 200, 120)`。**未在模拟器验证。**

## 对应的 iOS API

`UIView.center`。`CGPointMake(100, 100)` 写成 `new CGPoint(100, 100)`。

## 参见

- [`frame`](frame.md)、[`bounds`](bounds.md)
- [让视图在父视图里居中](../../guides/views.md#让视图在父视图里居中)
