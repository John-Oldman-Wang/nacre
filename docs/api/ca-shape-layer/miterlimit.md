---
type: reference
native: CAShapeLayer.miterLimit
---

# `CAShapeLayer`：`miterLimit` 属性

**`miterLimit`** 属性是 `lineJoin` 为 `'miter'` 时尖角的长度上限。

## 值

数，尖角长度与线宽之比，没有单位。

- 可读，可写。
- 默认值是 `10`。
- 超过上限的拐角改用 `'bevel'` 的画法，尖被平着切掉。

### 写错时

写入的值按 `Number()` 转成数。转不成有限数的抛 `TypeError`。

## 示例

```js
const shape = new CAShapeLayer();
shape.lineJoin = 'miter';
shape.miterLimit = 4;
console.log(shape.miterLimit);
```

**结果**：控制台输出 `4`。

## 对应的 iOS API

`CAShapeLayer.miterLimit`。

## 参见

- [`lineJoin`](linejoin.md)
