---
type: reference
native: "-[NSItemProvider hasItemConformingToTypeIdentifier:]"
---

# `NSItemProvider`：`hasItemConformingToTypeIdentifier()` 方法

**`hasItemConformingToTypeIdentifier()`** 方法判断这一项是不是某一类内容。

## 语法

```
hasItemConformingToTypeIdentifier(typeIdentifier)
```

### 参数

**`typeIdentifier`**

一个[统一类型标识符](../ns-item-provider.md#统一类型标识符)，字符串。`'public.image'` 是所有图片，`'public.movie'` 是所有视频。不是字符串的值按字符串转。

### 返回值

布尔。`true`：这一项有符合这一类的格式。

### 异常

无。

## 示例

```js
const photo = UIImage.imageNamed('JS/assets/photo');
if (photo !== null) {
  const provider = new NSItemProvider(photo);
  console.log(provider.hasItemConformingToTypeIdentifier('public.image'));
  console.log(provider.hasItemConformingToTypeIdentifier('public.movie'));
}
```

**结果**：先输出 `true`，再输出 `false`。

## 对应的 iOS API

`-[NSItemProvider hasItemConformingToTypeIdentifier:]`。

## 参见

- [`canLoadObjectOfClass()`](canloadobjectofclass.md)：取不取得出图片
- 这个类属于 `@nacrejs/photos` 包，装法见[要先安装](../photos.md#要先安装)
