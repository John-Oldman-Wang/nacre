---
type: reference
native: CALayer.position
---

# `CALayer`：`position` 属性

**`position`** 属性是图层中心点在父图层坐标系里的坐标。

## 值

[`CGPoint`](../structs.md)，单位 [pt](../units.md)。

- 可读，可写。
- 默认值是 `(0, 0)`。
- 改 `position` 移动图层，大小不变。
- 做位移动画时用它：`frame` 不能做动画，见 [`CAAnimation`](../ca-animation.md)。
- 写入时可以给 `CGPoint`，也可以给 `{ x, y }`。

### 写错时

**`TypeError`**

给的不是对象，或者缺字段、字段不是有限的数。

## 示例

```js
const layer = new CALayer();
layer.frame = new CGRect(1, 2, 3, 4);
layer.position = new CGPoint(10, 10);
console.log(layer.frame.x);
```

**结果**：控制台输出 `8.5`。宽 3 pt 的图层中心移到 x = 10，左上角是 10 − 1.5 = 8.5。

## 对应的 iOS API

`CALayer.position`。改变旋转中心的 `anchorPoint` 没有提供，中心点固定在图层正中。

## 参见

- [`frame`](frame.md)
