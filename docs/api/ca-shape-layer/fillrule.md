---
type: reference
native: CAShapeLayer.fillRule
---

# `CAShapeLayer`：`fillRule` 属性

**`fillRule`** 属性决定路径自己相交或者一圈套一圈时，哪些区域算在内部、被填充。

## 值

字符串。两种规则都是从某个点向外引一条射线，看它穿过路径的情况：

| 取值 | 效果 |
| --- | --- |
| `'nonZero'` | 路径从左向右穿过射线记 +1，从右向左记 −1。总和不是 0 的点在内部。两个同方向的圆套在一起时，里面的圆也被填充 |
| `'evenOdd'` | 只数穿过的次数。奇数次的点在内部。两个圆套在一起时，里面的圆是空的，得到一个环 |

- 可读，可写。
- 默认值是 `'nonZero'`。
- 两种取值画出来的差别**未在模拟器验证**。

### 写错时

写了表里没有的值时不抛异常：属性保持原来的值，控制台输出一条警告：

```
[Nacre] fillRule has no value "oddEven"; expected one of: nonZero / evenOdd, ignored
```

## 示例

```js
const ring = UIBezierPath.bezierPathWithOvalInRect(new CGRect(0, 0, 100, 100));
ring.appendPath(UIBezierPath.bezierPathWithOvalInRect(new CGRect(25, 25, 50, 50)));
const shape = new CAShapeLayer();
shape.path = ring;
shape.fillRule = 'evenOdd';
```

**效果**：一个环：外圆填充，里面的圆是空的。**未在模拟器验证。**

## 对应的 iOS API

`CAShapeLayer.fillRule`。`kCAFillRuleEvenOdd` 写成 `'evenOdd'`。

## 参见

- [`fillColor`](fillcolor.md)
- [`UIBezierPath.usesEvenOddFillRule`](../ui-bezier-path/usesevenoddfillrule.md)
