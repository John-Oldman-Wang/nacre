---
type: reference
native: UIImage.size
---

# `UIImage`：`size` 属性

**`size`** 属性是图片的宽和高，单位是点，不是像素。

## 值

[`CGSize`](../structs.md)，单位 [pt](../units.md)。

- 已经按 [`imageOrientation`](imageorientation.md) 转正。
- 像素数等于 `size` 乘以 [`scale`](scale.md)。`dot.png`（10 像素）、`dot@2x.png`（20 像素）、`dot@3x.png`（30 像素）读出来的 `size` 都是 10 × 10。
- 用约束定位的图片视图，不约束宽高时大小等于这个值。

- 只读。给它赋值抛 `TypeError`。
- 图片不可变，这个值不会变，所以没有变化通知。

## 示例

```js
const dot = UIImage.imageNamed('JS/assets/dot');
if (dot) {
  console.log(dot.size.width, dot.size.height);
}
```

**结果**：项目 `assets/` 里有 `dot.png` 一组三个文件时，控制台输出 `10 10`。

## 对应的 iOS API

`UIImage.size`。

## 参见

- [`scale`](scale.md)
- [`size` 的单位是点，不是像素](../ui-image.md#size-的单位是点不是像素)
