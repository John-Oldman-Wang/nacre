---
type: reference
native: "+[UIImage systemImageNamed:]"
---

# `UIImage.systemImageNamed()` 静态方法

**`UIImage.systemImageNamed()`** 静态方法按名字取 SF Symbols 里的图标。SF Symbols 是 iOS 自带的图标库，有上千个图标，不需要自己准备图片文件，也不增加 App 的体积。

## 语法

```
UIImage.systemImageNamed(name)
```

### 参数

**`name`**

字符串。SF Symbols 的图标名，比如 `'star.fill'`、`'heart.fill'`。全部图标名可以在 Apple 提供的 SF Symbols 应用里查。不是字符串时按 `String()` 转。

### 返回值

`UIImage`，它的 [`isSymbolImage`](issymbolimage.md) 是 `true`。名字不存在时返回 `null`，不抛异常。

在图片视图里，图标按图片视图的 `tintColor` 上色，见[渲染模式和 `tintColor`](../ui-image.md#渲染模式和-tintcolor)。

### 异常

无。

## 示例

```js
const star = UIImage.systemImageNamed('star.fill');
if (star) {
  console.log(star.isSymbolImage, star.renderingMode);
}
```

**结果**：控制台输出 `true automatic`。

## 对应的 iOS API

`+[UIImage systemImageNamed:]`。

## 参见

- [`UIImageView`](../ui-image-view.md) 的 [`tintColor`](../ui-image-view/tintcolor.md)：给图标上色
