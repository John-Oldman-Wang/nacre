---
type: reference
native: CATransform3DIdentity
---

# `CATransform3D.identity` 静态属性

**`CATransform3D.identity`** 静态属性是单位矩阵，表示不做任何变换。

## 值

`CATransform3D`。对角线上的 `m11`、`m22`、`m33`、`m44` 是 1，其余 12 个数是 0。

- 只读。
- 每次读得到一个新的实例，所以 `CATransform3D.identity === CATransform3D.identity` 是 `false`。判断一个变换是不是单位矩阵用 [`isIdentity`](isidentity.md)。
- 图层的 `transform` 默认就是单位矩阵。
- 要在单位矩阵的基础上改一个数，用展开写法造一个普通对象：`{ ...CATransform3D.identity, m34: -1 / 500 }`。这个对象可以直接写进图层的 `transform`，也可以传给 [`concat()`](concat.md)。

## 示例

```js
const layer = new CALayer();
console.log(layer.transform.isIdentity);
layer.transform = CATransform3D.rotation(0.5, 0, 1, 0);
layer.transform = CATransform3D.identity;
console.log(layer.transform.isIdentity);
```

**结果**：依次输出 `true`、`true`。新图层的 `transform` 是单位矩阵；写回单位矩阵之后图层恢复原样。

## 对应的 iOS API

`CATransform3DIdentity`。

## 参见

- [`isIdentity`](isidentity.md)
- [`CALayer.transform`](../ca-layer/transform.md)
- [结构体](../structs.md)：所有结构体共同的规则
