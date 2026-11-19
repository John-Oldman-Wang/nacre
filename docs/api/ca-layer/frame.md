---
type: reference
native: CALayer.frame
---

# `CALayer`：`frame` 属性

**`frame`** 属性是图层在父图层坐标系里的位置和大小。

## 值

[`CGRect`](../structs.md)，单位 [pt](../units.md)。`x`、`y` 是图层左上角的坐标，y 轴朝下。

- 可读，可写。
- 默认值是 `(0, 0, 0, 0)`。用 `new` 创建的图层不设 `frame` 就看不见。
- 写入时可以给 `CGRect`，也可以给 `{ x, y, width, height }`。读出来的 `CGRect` 是只读的，要改就赋一个新的值。
- 改 `frame` 会同时改 [`bounds`](bounds.md) 的大小和 [`position`](position.md)。
- 子图层的 `frame` 不随父视图的大小变化，见[子图层的大小不随视图变化](../ca-layer.md#子图层的大小不随视图变化)。
- 对视图自己的图层（`view.layer`），用 `view.frame` 或约束，不写 `layer.frame`：下一次布局时会被约束算出的结果覆盖。**这一条未在模拟器验证。**
- `frame` 不能做动画，做位移动画用 `position`。

### 写错时

**`TypeError`**

给的不是对象，或者缺字段、字段不是有限的数。

## 示例

```js
const layer = new CALayer();
layer.frame = new CGRect(1, 2, 3, 4);
console.log(String(layer.position));
```

**结果**：控制台输出 `CGPoint(2.5, 4)`：中心点在 (2.5, 4)。

## 对应的 iOS API

`CALayer.frame`。`CGRectMake(1, 2, 3, 4)` 写成 `new CGRect(1, 2, 3, 4)`。

## 参见

- [位置：`frame`、`bounds`、`position`](../ca-layer.md#位置frameboundsposition)
- [`bounds`](bounds.md)、[`position`](position.md)
