---
type: reference
native: UIImage.capInsets
---

# `UIImage`：`capInsets` 属性

**`capInsets`** 属性是九宫格里四条边保留的宽度。这四条边在图片拉伸时不参与拉伸。

## 值

[`UIEdgeInsets`](../structs.md)，四个值的单位都是 [pt](../units.md)。

没做过九宫格的图片四个值都是 0。由 [`resizableImage()`](resizableimage.md) 生成的图是生成时给的值。

- 只读。给它赋值抛 `TypeError`。
- 图片不可变，这个值不会变，所以没有变化通知。

## 示例

```js
const frameImage = UIImage.imageNamed('JS/assets/frame');
if (frameImage) {
  const a = frameImage.resizableImage({ withCapInsets: new UIEdgeInsets(6, 6, 6, 6) });
  console.log(frameImage.capInsets.left, a.capInsets.left);
}
```

**结果**：控制台输出 `0 6`。

## 对应的 iOS API

`UIImage.capInsets`。

## 参见

- [`resizableImage()`](resizableimage.md)
- [`resizingMode`](resizingmode.md)
