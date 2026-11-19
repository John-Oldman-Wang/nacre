---
type: reference
native: CGAffineTransformIdentity
---

# `CGAffineTransform.identity` 静态属性

**`CGAffineTransform.identity`** 静态属性是单位矩阵，表示不做任何变换。

## 值

`CGAffineTransform`，六个数是 `(1, 0, 0, 1, 0, 0)`。

- 只读。
- 每次读得到一个新的实例，所以 `CGAffineTransform.identity === CGAffineTransform.identity` 是 `false`。判断一个变换是不是单位矩阵用 [`isIdentity`](isidentity.md)。
- 视图的 `transform` 默认就是单位矩阵。

## 示例

```js
const box = new UIView();
box.transform = CGAffineTransform.rotation(Math.PI / 6);
box.transform = CGAffineTransform.identity;
console.log(box.transform.isIdentity);
```

**结果**：视图恢复原样，控制台输出 `true`。

## 对应的 iOS API

`CGAffineTransformIdentity`。

## 参见

- [`isIdentity`](isidentity.md)
- [`UIView.transform`](../ui-view/transform.md)
- [结构体](../structs.md)：所有结构体共同的规则
