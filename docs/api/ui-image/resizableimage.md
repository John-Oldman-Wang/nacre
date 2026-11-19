---
type: reference
native: "-[UIImage resizableImageWithCapInsets:resizingMode:]"
---

# `UIImage`：`resizableImage()` 方法

**`resizableImage()`** 方法生成一张九宫格图：四条边保留原样，只有中间部分伸缩。九宫格图放进比它大的视图时，四个角不变形。气泡、带圆角的边框这类背景图用它。

## 语法

```
resizableImage({ withCapInsets, [resizingMode] })
```

### 参数

**`options.withCapInsets`**

必填。[`UIEdgeInsets`](../structs.md) 对象，或者带 `top`、`left`、`bottom`、`right` 四个数的普通对象。四条边各保留多宽，单位是 [pt](../units.md)。

**`options.resizingMode`**

可选。中间部分怎么填充：

| 取值 | 效果 |
| --- | --- |
| `'tile'` | 重复平铺。不写时是这个值 |
| `'stretch'` | 拉伸 |

不写时是 `'tile'`，不是拉伸，这一点是实测结果。

### 返回值

新的 `UIImage`，它的 [`capInsets`](capinsets.md) 和 [`resizingMode`](resizingmode.md) 是这次给的值。原图不变。对动图调用，得到的是静态图，内容是第一帧。

### 异常

**`TypeError`**

- 没传 `withCapInsets`：`resizableImage needs { withCapInsets }`。
- `withCapInsets` 不是对象：`withCapInsets needs an object with all of: top, left, bottom, right`。
- `withCapInsets` 缺字段或字段不是有限的数：`withCapInsets is missing top, or it is not a finite number`，其中 `top` 换成出问题的那个字段名。
- `resizingMode` 写错：`resizingMode has no value "fill"; expected one of: …`。

## 示例

```js
const frameImage = UIImage.imageNamed('JS/assets/frame');
if (frameImage) {
  const a = frameImage.resizableImage({ withCapInsets: new UIEdgeInsets(6, 6, 6, 6) });
  const b = frameImage.resizableImage({
    withCapInsets: { top: 6, left: 6, bottom: 6, right: 6 },
    resizingMode: 'stretch',
  });
  console.log(a.capInsets.left, a.resizingMode);
  console.log(b.resizingMode);
}
```

**结果**：控制台输出 `6 tile` 和 `stretch`。

## 对应的 iOS API

`-[UIImage resizableImageWithCapInsets:]`、`-[UIImage resizableImageWithCapInsets:resizingMode:]`。

## 参见

- [`capInsets`](capinsets.md)、[`resizingMode`](resizingmode.md)
- [显示图片](../../guides/images.md)：做可拉伸的背景图
