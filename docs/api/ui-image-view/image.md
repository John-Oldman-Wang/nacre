---
type: reference
native: UIImageView.image
---

# `UIImageView`：`image` 属性

**`image`** 属性是图片视图显示的图片。

## 值

[`UIImage`](../ui-image.md)，或者 `null`。

- 可读，可写。
- 默认值是 `null`，表示不显示图片。把 `null` 赋给它不会出错，结果是不显示图片，只剩底色（如果设了 `backgroundColor`）。
- 读出来的和写进去的是同一个对象。
- 给的是动图时自动播放；换成静态图或 `null` 时播放停止。见[动图的播放](../ui-image-view.md#动图的播放)。
- 用约束定位、不约束宽高时，视图的大小跟着图片的 `size` 变。

## 示例

```js
const iv = new UIImageView();
const star = UIImage.systemImageNamed('star.fill');
iv.image = star;
console.log(iv.image === star);
iv.image = null;
```

**结果**：控制台输出 `true`。最后一行之后图片视图不显示图片。清除后的显示**未在模拟器验证**。

## 对应的 iOS API

`UIImageView.image`。原生的图片视图不播放 `+imageNamed:` 取到的动图文件，这里会播放。

## 参见

- [`UIImage`](../ui-image.md)
- [`highlightedImage`](highlightedimage.md)
