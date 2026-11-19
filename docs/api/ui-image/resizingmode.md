---
type: reference
native: UIImage.resizingMode
---

# `UIImage`：`resizingMode` 属性

**`resizingMode`** 属性是九宫格里中间部分的填充方式。

## 值

字符串，下面两个之一：

| 取值 | 效果 |
| --- | --- |
| `'tile'` | 中间部分重复平铺 |
| `'stretch'` | 中间部分拉伸 |

[`resizableImage()`](resizableimage.md) 不传 `resizingMode` 时是 `'tile'`。中间是纯色时两种方式看起来一样，有渐变或图案时不一样。

- 只读。给它赋值抛 `TypeError`。
- 图片不可变，这个值不会变，所以没有变化通知。

## 示例

```js
const frameImage = UIImage.imageNamed('JS/assets/frame');
if (frameImage) {
  const b = frameImage.resizableImage({
    withCapInsets: { top: 6, left: 6, bottom: 6, right: 6 },
    resizingMode: 'stretch',
  });
  console.log(b.resizingMode);
}
```

**结果**：控制台输出 `stretch`。

## 对应的 iOS API

`UIImage.resizingMode`。

## 参见

- [`resizableImage()`](resizableimage.md)
- [`capInsets`](capinsets.md)
