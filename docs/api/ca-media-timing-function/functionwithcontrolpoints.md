---
type: reference
native: "+[CAMediaTimingFunction functionWithControlPoints::::]"
---

# `CAMediaTimingFunction.functionWithControlPoints()` 静态方法

**`CAMediaTimingFunction.functionWithControlPoints()`** 静态方法用两个控制点的坐标创建一条自定义的时间曲线。

## 语法

```
CAMediaTimingFunction.functionWithControlPoints(c1x, c1y, c2x, c2y)
```

### 参数

**`c1x`**、**`c1y`**

第一个控制点的 x、y。

**`c2x`**、**`c2y`**

第二个控制点的 x、y。

四个都是数，没有单位，是[曲线所在的单位正方形](../ca-media-timing-function.md#曲线的形状)里的坐标。按 `Number()` 转换。

### 返回值

`CAMediaTimingFunction`。

### 异常

**`TypeError`**

某个参数转换不出有限数：`c1x must be a finite number, got …`，参数名按出错的那个。

## 示例

```js
const custom = CAMediaTimingFunction.functionWithControlPoints(0.25, 0.1, 0.25, 1);
console.log(String(custom.controlPointAtIndex(1)));
```

**结果**：得到一条和 `'default'` 相同的曲线。控制台输出约为 `CGPoint(0.25, 0.1)`，带有单精度浮点数的末位误差。

## 对应的 iOS API

`+[CAMediaTimingFunction functionWithControlPoints::::]`。

## 参见

- [`functionWithName()`](functionwithname.md)：内置曲线
- [`controlPointAtIndex()`](controlpointatindex.md)
