---
type: reference
native: CATransform3DGetAffineTransform
---

# `CATransform3D`：`affineTransform` 属性

**`affineTransform`** 属性是这个变换里二维的那一部分，写成一个 [`CGAffineTransform`](../cg-affine-transform.md)。

## 值

`CGAffineTransform`，六个数取自这几个字段：

| `CGAffineTransform` 的字段 | 取自 |
| --- | --- |
| `a` | `m11` |
| `b` | `m12` |
| `c` | `m21` |
| `d` | `m22` |
| `tx` | `m41` |
| `ty` | `m42` |

- 只读。每次读得到一个新的对象。
- 其余十个数被丢掉。只有 [`isAffine`](isaffine.md) 是 `true` 时，得到的二维变换和原来的效果相同；有 z 方向的内容或透视时，它只是去掉这些之后剩下的部分。

## 示例

```js
const t = CATransform3D.translation(5, 6);
if (t.isAffine) {
  console.log(String(t.affineTransform));
}
```

**结果**：输出 `CGAffineTransform(1, 0, 0, 1, 5, 6)`。

## 对应的 iOS API

`CATransform3DGetAffineTransform(t)`。

## 参见

- [`isAffine`](isaffine.md)
- [`CATransform3D.fromAffineTransform()`](fromaffinetransform.md)：反过来，二维变成三维
- [结构体](../structs.md)：所有结构体共同的规则
