---
type: reference
native: UIImageView.highlightedImage
---

# `UIImageView`：`highlightedImage` 属性

**`highlightedImage`** 属性是图片视图处于高亮状态时显示的图片。

## 值

[`UIImage`](../ui-image.md)，或者 `null`。

- 可读，可写。
- 默认值是 `null`，表示高亮时仍然显示 [`image`](image.md)。**`null` 时的显示效果未在模拟器验证。**
- 只在 [`isHighlighted`](ishighlighted.md) 是 `true` 时显示。
- 是动图时，`isHighlighted` 为 `true` 期间播放它。

## 示例

```js
const iv = new UIImageView();
iv.image = UIImage.systemImageNamed('star');
iv.highlightedImage = UIImage.systemImageNamed('star.fill');
iv.isHighlighted = true;
```

**效果**：图片视图从空心星形换成实心星形。**未在模拟器验证。**

## 对应的 iOS API

`UIImageView.highlightedImage`。

## 参见

- [`isHighlighted`](ishighlighted.md)
