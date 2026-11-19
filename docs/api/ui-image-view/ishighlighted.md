---
type: reference
native: UIImageView.highlighted
---

# `UIImageView`：`isHighlighted` 属性

**`isHighlighted`** 属性决定图片视图是否处于高亮状态，即显示 [`image`](image.md) 还是 [`highlightedImage`](highlightedimage.md)。

## 值

布尔。

- 可读，可写。
- 默认值是 `false`。
- `true`：显示 `highlightedImage`。
- `false`：显示 `image`。
- 系统不会自动改它。`UIImageView` 默认不接收触摸，手指按下时它不会变成 `true`。需要「手指按住时自动换图」时，用 [`UIButton`](../ui-button.md) 的 `setImage()` 给 `highlighted` 状态单独设一张图。

## 示例

```js
const iv = new UIImageView();
iv.image = UIImage.systemImageNamed('star');
iv.highlightedImage = UIImage.systemImageNamed('star.fill');
iv.isHighlighted = true;
iv.isHighlighted = false;
```

**效果**：设成 `true` 后显示实心星形，设回 `false` 换回空心星形。**换图的效果未在模拟器验证。**

## 对应的 iOS API

`UIImageView.highlighted`（getter 是 `isHighlighted`）。

## 参见

- [`highlightedImage`](highlightedimage.md)
