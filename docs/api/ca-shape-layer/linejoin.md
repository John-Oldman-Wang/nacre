---
type: reference
native: CAShapeLayer.lineJoin
---

# `CAShapeLayer`：`lineJoin` 属性

**`lineJoin`** 属性是两段线相接的拐角的形状。

## 值

字符串：

| 取值 | 效果 |
| --- | --- |
| `'miter'` | 两段线的外边延长到相交，形成尖角 |
| `'round'` | 拐角处是圆弧 |
| `'bevel'` | 拐角的尖被平着切掉 |

- 可读，可写。
- 默认值是 `'miter'`。尖角太长时改用 `'bevel'` 的画法，上限由 [`miterLimit`](miterlimit.md) 决定。
- 画出来的样子**未在模拟器验证**。

### 写错时

写了表里没有的值时不抛异常：属性保持原来的值，控制台输出一条警告：

```
[Nacre] lineJoin has no value "sharp"; expected one of: miter / round / bevel, ignored
```

## 示例

```js
const shape = new CAShapeLayer();
shape.lineWidth = 8;
shape.lineJoin = 'round';
```

**效果**：折线的拐角是圆的。**未在模拟器验证。**

## 对应的 iOS API

`CAShapeLayer.lineJoin`。`kCALineJoinBevel` 写成 `'bevel'`。

## 参见

- [`miterLimit`](miterlimit.md)
- [`lineCap`](linecap.md)
