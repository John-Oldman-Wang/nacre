---
type: reference
native: UIButton.imageView
---

# `UIButton`：`imageView` 属性

**`imageView`** 属性是按钮里负责显示图标的那个 [`UIImageView`](../ui-image.md)。

## 值

[`UIImageView`](../ui-image.md)，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- `system` 按钮没设图标时它也有值。其他类型的按钮**未在模拟器验证**。
- 类型上它可能是 `null`，用之前先判断。
- 图标本身用 [`setImage()`](setimage.md) 设，不要直接改 `imageView.image`。

## 示例

```js
const button = UIButton.buttonWithType('system');
button.setImage(UIImage.systemImageNamed('heart'), { forState: ['normal'] });
const view = button.imageView;
if (view) {
  view.contentMode = 'scaleAspectFit';
}
```

**效果**：图标按比例缩放显示。**未在模拟器验证。**

## 对应的 iOS API

`UIButton.imageView`。

## 参见

- [`setImage()`](setimage.md)
- [`titleLabel`](titlelabel.md)
