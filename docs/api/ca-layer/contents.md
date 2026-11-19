---
type: reference
native: CALayer.contents
---

# `CALayer`：`contents` 属性

**`contents`** 属性是图层显示的图片。

## 值

[`UIImage`](../ui-image.md)，或者 `null`。

- 可读，可写。
- 默认值是 `null`，表示没有内容。
- 读出来的是写进去的那个对象。
- 图片被拉伸到铺满图层。要按别的方式摆放图片，用 [`UIImageView`](../ui-image-view.md)。
- 动图写进去显示的是第一帧。要播放，见指南[显示图片](../../guides/images.md#自己控制动图的播放)。
- 只写自己创建的图层的 `contents`。视图自己的图层（`view.layer`）的内容由视图管理。
- `imageNamed()` 找不到图片时返回 `null`，`contents = null` 不会出错。

### 写错时

**`TypeError`**

写入的值不是 `UIImage` 也不是 `null`：

```
TypeError: contents needs a native object or null, got "x"
```

## 示例

```js
const dot = UIImage.imageNamed('JS/assets/dot');
const badge = new CALayer();
badge.frame = new CGRect(20, 20, 40, 40);
badge.contents = dot;
console.log(badge.contents === dot);
```

**结果**：控制台输出 `true`。图片拉伸到 40 × 40 pt，屏幕上的样子**未在模拟器验证**。

## 对应的 iOS API

`CALayer.contents`。ObjC 里写 `(id)image.CGImage`，这里直接写 `UIImage`。

## 参见

- [`UIImage`](../ui-image.md)
