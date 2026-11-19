---
type: reference
native: CAShapeLayer.lineCap
---

# `CAShapeLayer`：`lineCap` 属性

**`lineCap`** 属性是线两端的形状。

## 值

字符串：

| 取值 | 效果 |
| --- | --- |
| `'butt'` | 线在路径的端点处平着截断 |
| `'round'` | 端点外加一个半圆，线比路径长出半个线宽 |
| `'square'` | 端点外加半个方块，线比路径长出半个线宽 |

- 可读，可写。
- 默认值是 `'butt'`。
- 画出来的样子**未在模拟器验证**。

### 写错时

写了表里没有的值时不抛异常：属性保持原来的值，控制台输出一条警告：

```
[Nacre] lineCap has no value "flat"; expected one of: butt / round / square, ignored
```

## 示例

```js
const shape = new CAShapeLayer();
shape.lineWidth = 8;
shape.lineCap = 'round';
```

**效果**：线的两端是圆头。**未在模拟器验证。**

## 对应的 iOS API

`CAShapeLayer.lineCap`。`kCALineCapRound` 写成 `'round'`。

## 参见

- [`lineJoin`](linejoin.md)
