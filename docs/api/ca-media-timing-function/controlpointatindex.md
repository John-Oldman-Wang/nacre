---
type: reference
native: "-[CAMediaTimingFunction getControlPointAtIndex:values:]"
---

# `CAMediaTimingFunction`：`controlPointAtIndex()` 方法

**`controlPointAtIndex()`** 方法读时间曲线的一个端点或控制点。

## 语法

```
controlPointAtIndex(index)
```

### 参数

**`index`**

0 到 3 的整数。0 和 3 是曲线的两端，固定是 (0, 0) 和 (1, 1)；1 和 2 是两个控制点。按 `Number()` 转换后向零取整。

### 返回值

`CGPoint`，没有单位，是单位正方形里的坐标。数值是单精度浮点数，带有末位误差。

### 异常

**`TypeError`**

- `index` 超出范围：`controlPointAtIndex: index must be 0…3`。
- `index` 转换不出有限数：`index must be a finite number, got …`。

## 示例

```js
const ease = CAMediaTimingFunction.functionWithName('easeInEaseOut');
console.log(String(ease.controlPointAtIndex(0)), String(ease.controlPointAtIndex(1)));
```

**结果**：控制台输出 `CGPoint(0, 0)` 和约为 `CGPoint(0.42, 0)` 的值。

## 对应的 iOS API

`-[CAMediaTimingFunction getControlPointAtIndex:values:]`。ObjC 把结果写进一个 `float[2]` 出参，这里改成返回 `CGPoint`。

## 参见

- [曲线的形状](../ca-media-timing-function.md#曲线的形状)
