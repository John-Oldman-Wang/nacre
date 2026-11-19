---
type: reference
native: UIView.contentMode
---

# `UIView`：`contentMode` 属性

**`contentMode`** 属性决定视图的内容和视图大小不一致时怎么摆放。主要用在 [`UIImageView`](../ui-image.md) 上。「内容」指视图画出来的东西，比如 `UIImageView` 里的图片。

## 值

字符串，下面的值之一：

| 取值 | 效果 |
| --- | --- |
| `'scaleToFill'` | 把内容拉伸到和视图一样大。宽高比不同时内容变形 |
| `'scaleAspectFit'` | 保持宽高比缩放，直到内容完整地放进视图。两边可能留空 |
| `'scaleAspectFill'` | 保持宽高比缩放，直到内容盖满视图。超出的部分画在视图外面，要裁剪需设 `clipsToBounds = true` |
| `'center'` | 不缩放，内容按原始大小居中 |
| `'top'`、`'bottom'`、`'left'`、`'right'` | 不缩放，内容贴着对应的那条边，在另一个方向上居中。**未在模拟器验证** |
| `'topLeft'`、`'topRight'`、`'bottomLeft'`、`'bottomRight'` | 不缩放，内容贴着对应的那个角。**未在模拟器验证** |
| `'redraw'` | 视图大小变化时重新绘制内容，不做缩放。**未在模拟器验证** |

- 可读，可写。
- 默认值是 `'scaleToFill'`。

### 写错时

写入表里没有的值：不抛异常，控制台输出一条警告 `[Nacre] contentMode has no value "cover"; expected one of: …, ignored`，省略号处是上表的全部取值，属性保持原值。

## 示例

```js
const photo = new UIImageView();
photo.contentMode = 'scaleAspectFill';
photo.clipsToBounds = true;
```

**效果**：图片保持宽高比盖满视图，超出视图的部分被裁掉。

## 对应的 iOS API

`UIView.contentMode`。`UIViewContentModeScaleAspectFit` 写成 `'scaleAspectFit'`，其余同理。

## 参见

- [`UIImageView`](../ui-image.md)
- [枚举](../enums.md)：属性写错时为什么是警告
