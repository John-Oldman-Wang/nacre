---
type: reference
native: "-[UIBezierPath bezierPathByReversingPath]"
---

# `UIBezierPath`：`bezierPathByReversingPath()` 方法

**`bezierPathByReversingPath()`** 方法返回一条形状相同、方向相反的新路径。原路径不变。

## 语法

```
bezierPathByReversingPath()
```

### 参数

无。

### 返回值

新建的 `UIBezierPath`，不是原来那一条。它的 [`bounds`](bounds.md) 和原路径相同。

### 异常

无。

## 说明

路径的方向在两个地方有影响：

- 形状图层的 `fillRule` 是 `'nonZero'` 时，哪些区域被填充。见 [`CAShapeLayer`](../ca-layer.md#cashapelayer)。
- 沿路径做动画时的行进方向。见[动画](../ca-animation.md)。

## 示例

```js
const path = UIBezierPath.bezierPathWithRect(new CGRect(0, 0, 10, 10));
const back = path.bezierPathByReversingPath();
console.log(back === path, String(back.bounds));
```

**结果**：控制台输出 `false CGRect(0, 0, 10, 10)`。

## 对应的 iOS API

`-[UIBezierPath bezierPathByReversingPath]`。

## 参见

- [`usesEvenOddFillRule`](usesevenoddfillrule.md)
