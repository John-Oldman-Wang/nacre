---
type: reference
native: UIImageView.tintColor
---

# `UIImageView`：`tintColor` 属性

**`tintColor`** 属性是图片视图给模板图上色用的颜色。模板图是只使用形状、不使用自身颜色的图片：图片里不透明的部分全部显示成这个颜色。

## 值

[颜色](../ui-color.md)字符串。

- 可读，可写。
- 默认值是系统默认的强调色。默认值读出来的字符串**未在模拟器验证**。
- 写入时接受颜色字符串，也接受 `UIColor` 对象。写 `null` 恢复成默认值。
- 读出来的字符串和写入的相同：写入 `'systemPink'` 读回 `'systemPink'`。
- 只对模板图起作用。SF Symbols 图标在图片视图里按模板图处理；自己的图片默认显示原来的颜色，要先用 [`imageWithRenderingMode('alwaysTemplate')`](../ui-image/imagewithrenderingmode.md) 转成模板图。图片的 `renderingMode` 是 `'alwaysOriginal'` 时这个颜色不起作用。见[渲染模式和 `tintColor`](../ui-image.md#渲染模式和-tintcolor)。

### 写错时

写入不合法的颜色时不抛异常。控制台输出一条警告，颜色保持原值：

```
[Nacre] tintColor: "#GGG" is not a valid color, ignored
```

## 示例

```js
const iv = new UIImageView();
iv.image = UIImage.systemImageNamed('star.fill');
iv.tintColor = '#FF3B30';
console.log(iv.tintColor);
```

**效果**

- 星形显示为红色。**未在模拟器验证。**
- 控制台输出 `#FF3B30`。

## 对应的 iOS API

`UIView.tintColor`。原生里它是所有视图的属性，这里只在图片视图上提供。

## 参见

- [`UIColor`](../ui-color.md)：颜色字符串的全部写法
- [`renderingMode`](../ui-image/renderingmode.md)
