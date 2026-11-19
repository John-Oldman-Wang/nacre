---
type: reference
native: CALayer.zPosition
---

# `CALayer`：`zPosition` 属性

**`zPosition`** 属性决定图层在兄弟图层之间的上下顺序，不用改 `sublayers` 的顺序。

## 值

数，没有单位。

- 可读，可写。
- 默认值是 `0`。
- 数值大的画在上面，数值相同的按 `sublayers` 里的顺序。
- **显示效果未在模拟器验证。**

### 写错时

写入的值按 `Number()` 转成数。转不成有限数的抛 `TypeError`。

## 示例

```js
const layer = new CALayer();
layer.zPosition = 10;
console.log(layer.zPosition);
```

**结果**：控制台输出 `10`。

## 对应的 iOS API

`CALayer.zPosition`。

## 参见

- [`insertSublayer()`](insertsublayer.md)：改数组里的顺序
