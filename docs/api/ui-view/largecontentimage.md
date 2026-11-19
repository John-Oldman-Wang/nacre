---
type: reference
native: UIView.largeContentImage
---

# `UIView`：`largeContentImage` 属性

**`largeContentImage`** 属性是放大显示时的图片。见 [`showsLargeContentViewer`](showslargecontentviewer.md)。

## 值

[`UIImage`](../ui-image.md)，或者 `null`。

- 可读，可写。
- 默认值**未在模拟器验证**。
- 写回原值不抛（验收用例核对过）。效果**未在模拟器验证**。

## 示例

```js
const item = new UIView();
const star = UIImage.systemImageNamed('star');
item.largeContentImage = star;
```

**效果**：放大显示时用星形图标。**未在模拟器验证。**

## 对应的 iOS API

`UIView.largeContentImage`。

## 参见

- [`scalesLargeContentImage`](scaleslargecontentimage.md)、[`largeContentImageInsets`](largecontentimageinsets.md)
