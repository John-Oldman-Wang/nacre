---
type: reference
native: CGAffineTransformIsIdentity
---

# `CGAffineTransform`：`isIdentity` 属性

**`isIdentity`** 属性表示这个变换是不是单位矩阵，也就是不做任何变换。

## 值

布尔。

- `true`：六个数正好是 `(1, 0, 0, 1, 0, 0)`。
- `false`：其他情况。比较是逐个数的精确相等，没有容差。
- 只读。

## 示例

```js
const view = new UIView();
console.log(view.transform.isIdentity);
view.transform = CGAffineTransform.scale(2);
console.log(view.transform.isIdentity);
```

**结果**：依次输出 `true`、`false`。新视图的 `transform` 是单位矩阵。

## 对应的 iOS API

`CGAffineTransformIsIdentity(t)`。

## 参见

- [`CGAffineTransform.identity`](identity.md)
- [结构体](../structs.md)：所有结构体共同的规则
