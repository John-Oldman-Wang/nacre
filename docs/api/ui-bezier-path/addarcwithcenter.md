---
type: reference
native: "-[UIBezierPath addArcWithCenter:radius:startAngle:endAngle:clockwise:]"
---

# `UIBezierPath`：`addArcWithCenter()` 方法

**`addArcWithCenter()`** 方法在路径上接一段圆弧。路径已有[当前点](currentpoint.md)时，先从当前点画一条直线到圆弧的起点，再画圆弧。圆弧的终点成为新的当前点。

## 语法

```
addArcWithCenter(center, { radius, startAngle, endAngle, clockwise })
```

### 参数

**`center`**

圆心，`CGPoint`，单位是 [pt](../units.md)。也可以写成普通对象 `{ x, y }`。

**`options.radius`**

半径，数，单位是 pt。必填。

**`options.startAngle`**

起始角度，数，单位是弧度。0 是正右方，见[坐标和角度](../ui-bezier-path.md#坐标和角度)。必填。

**`options.endAngle`**

结束角度，数，单位是弧度。必填。

**`options.clockwise`**

布尔，必填。`true` 沿屏幕上的顺时针方向从起始角度画到结束角度；`false` 沿逆时针方向。

四个选项都没有默认值。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 四个选项缺了任何一个：`addArcWithCenter needs { radius, startAngle, endAngle, clockwise }; missing radius`（`radius` 换成实际缺的那个）。
- `radius`、`startAngle`、`endAngle` 转不成有限数。
- `center` 写错：`addArcWithCenter needs an object with all of: x, y`。

## 示例

扇形：先移到圆心，接一段弧，再闭合回圆心。

```js
const center = new CGPoint(60, 60);
const pie = new UIBezierPath();
pie.moveToPoint(center);
pie.addArcWithCenter(center, {
  radius: 50, startAngle: 0, endAngle: Math.PI / 2, clockwise: true,
});
pie.closePath();
```

**结果**：一个四分之一圆的扇形，圆心在 (60, 60)，占右下方的那一块。

## 对应的 iOS API

`-[UIBezierPath addArcWithCenter:radius:startAngle:endAngle:clockwise:]`。除圆心外的四个参数放进 options 对象。

## 参见

- [`UIBezierPath.bezierPathWithArcCenter()`](bezierpathwitharccenter.md)：只有一段圆弧的新路径
- [`closePath()`](closepath.md)
