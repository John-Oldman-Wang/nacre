---
type: reference
native: CATransform3DIsIdentity
---

# `CATransform3D`：`isIdentity` 属性

**`isIdentity`** 属性表示这个变换是不是单位矩阵，也就是不做任何变换。

## 值

布尔。

- `true`：`m11`、`m22`、`m33`、`m44` 正好是 1，其余 12 个数正好是 0。
- `false`：其他情况。比较是逐个数的精确相等，没有容差。
- 只读。

## 示例

```js
const layer = new CALayer();
console.log(layer.transform.isIdentity);
console.log(CATransform3D.scale(2).isIdentity);
console.log(CATransform3D.rotation(0, 0, 0, 1).isIdentity);
```

**结果**：依次输出 `true`、`false`、`true`。新图层的 `transform` 是单位矩阵；转 0 弧度也是单位矩阵。

## 对应的 iOS API

`CATransform3DIsIdentity(t)`。

## 参见

- [`CATransform3D.identity`](identity.md)
- [`isAffine`](isaffine.md)
- [结构体](../structs.md)：所有结构体共同的规则
