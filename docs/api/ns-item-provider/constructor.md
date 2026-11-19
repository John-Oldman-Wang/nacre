---
type: reference
native: "-[NSItemProvider initWithObject:]"
---

# `NSItemProvider()` 构造函数

**`NSItemProvider()`** 构造函数用一个对象建一个内容提供者。现在只收 `UIImage`。

选图用不到它：选图界面选中的每一项自带提供者。

## 语法

```
new NSItemProvider(object)
```

### 参数

**`object`**

一个 [`UIImage`](../ui-image.md)，必填。

### 返回值

新建的 `NSItemProvider`。[`canLoadObjectOfClass(UIImage)`](canloadobjectofclass.md) 是 `true`，[`hasItemConformingToTypeIdentifier('public.image')`](hasitemconformingtotypeidentifier.md) 是 `true`。

### 异常

**`TypeError`**

`object` 不是 `UIImage`：

```
new NSItemProvider supports only a UIImage for now, got "hello"
```

## 示例

```js
const photo = UIImage.imageNamed('JS/assets/photo');
if (photo !== null) {
  const provider = new NSItemProvider(photo);
  const copy = await provider.loadObjectOfClass(UIImage);
  console.log(copy.size.width > 0);
}
```

**结果**：输出 `true`。从提供者取回来的图有尺寸。

## 对应的 iOS API

`-[NSItemProvider initWithObject:]`。

## 参见

- [`loadObjectOfClass()`](loadobjectofclass.md)
- 这个类属于 `@nacrejs/photos` 包，装法见[要先安装](../photos.md#要先安装)
