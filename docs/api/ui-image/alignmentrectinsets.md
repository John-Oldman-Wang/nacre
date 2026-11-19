---
type: reference
native: UIImage.alignmentRectInsets
---

# `UIImage`：`alignmentRectInsets` 属性

**`alignmentRectInsets`** 属性是 Auto Layout 对齐时从图片四边各扣除的宽度。用于图片四周带阴影等装饰的情况：对齐按扣除之后的区域进行。

## 值

[`UIEdgeInsets`](../structs.md)，四个值的单位都是 [pt](../units.md)。

取值**未在模拟器验证**。

- 只读。给它赋值抛 `TypeError`。
- 图片不可变，这个值不会变，所以没有变化通知。

## 示例

```js
const dot = UIImage.imageNamed('JS/assets/dot');
if (dot) {
  const insets = dot.alignmentRectInsets;
  console.log(insets.top, insets.left, insets.bottom, insets.right);
}
```

**结果**：控制台输出四个数，单位 pt。**未在模拟器验证。**

## 对应的 iOS API

`UIImage.alignmentRectInsets`。

## 参见

- [Auto Layout](../auto-layout.md)
