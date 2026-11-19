---
type: reference
native: "+[UIBezierPath bezierPathWithArcCenter:radius:startAngle:endAngle:clockwise:]"
---

# `UIBezierPath.bezierPathWithArcCenter()` 静态方法

**`UIBezierPath.bezierPathWithArcCenter()`** 静态方法创建一段圆弧。角度的方向见[坐标和角度](../ui-bezier-path.md#坐标和角度)。

## 语法

```
UIBezierPath.bezierPathWithArcCenter(center, { radius, startAngle, endAngle, clockwise })
```

### 参数

**`center`**

圆心，`CGPoint`，单位是 [pt](../units.md)。也可以写成普通对象 `{ x, y }`。

**`options.radius`**

半径，数，单位是 pt。必填。

**`options.startAngle`**

起始角度，数，单位是弧度。0 是正右方。必填。

**`options.endAngle`**

结束角度，数，单位是弧度。必填。画整圆时让它比 `startAngle` 大 `2 * Math.PI`。

**`options.clockwise`**

布尔，必填。`true` 沿屏幕上的顺时针方向从起始角度画到结束角度；`false` 沿逆时针方向。同样的两个角度，两种走法得到一个圆上互补的两段弧。**两种走向在屏幕上的样子未在模拟器验证。**

四个选项都没有默认值。

### 返回值

新建的 `UIBezierPath`。

### 异常

**`TypeError`**

- 四个选项缺了任何一个，报错信息指出缺的是哪个：`bezierPathWithArcCenter needs { radius, startAngle, endAngle, clockwise }; missing startAngle`。
- `center` 不是对象：`bezierPathWithArcCenter needs an object with all of: x, y`。

## 示例

### 半圆

```js
const arc = UIBezierPath.bezierPathWithArcCenter(new CGPoint(50, 50), {
  radius: 50, startAngle: 0, endAngle: Math.PI, clockwise: true,
});
console.log(arc.bounds.width);
```

**结果**：一段半圆弧，从正右方沿顺时针方向经过正下方到正左方。控制台输出 `100`。

### 从正上方开始的整圆

```js
const ring = UIBezierPath.bezierPathWithArcCenter(new CGPoint(50, 50), {
  radius: 40, startAngle: -Math.PI / 2, endAngle: Math.PI * 1.5, clockwise: true,
});
```

**结果**：一个半径 40 pt 的整圆，起点和终点都在正上方，方向是顺时针。做进度环时，配合形状图层的 `strokeEnd` 只画出其中一部分。

## 对应的 iOS API

`+[UIBezierPath bezierPathWithArcCenter:radius:startAngle:endAngle:clockwise:]`。除圆心外的四个参数放进 options 对象。

## 参见

- [`addArcWithCenter()`](addarcwithcenter.md)：在已有的路径上接一段圆弧
- [坐标和角度](../ui-bezier-path.md#坐标和角度)
