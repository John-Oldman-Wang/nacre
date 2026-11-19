---
type: reference
native: NSItemProvider
status: partial
---

# `NSItemProvider`

**`NSItemProvider`** 表示一项内容的提供者。同一项内容可能有几种格式（同一张照片的 HEIC 和 JPEG），提供者按要的类型把它取出来。

选图界面选中的每一项带一个提供者，在 [`PHPickerResult`](ph-picker-result.md) 的 [`itemProvider`](ph-picker-result/itemprovider.md) 上。现在只接了取图片要用的那几样，而且只认 `UIImage`。

要先装 `@nacrejs/photos`，装法见 [`PHPickerViewController`](photos.md#要先安装)，也可以看[核心和能力包](capabilities.md)。

**继承关系**：`NSObject` → `NSItemProvider`

## 构造函数

[`NSItemProvider()`](ns-item-provider/constructor.md)

用一张 `UIImage` 建一个提供者。选图用不到它：选中的每一项自带提供者。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`registeredTypeIdentifiers`](ns-item-provider/registeredtypeidentifiers.md) <small>只读</small> | 这一项有哪些格式 |
| [`suggestedName`](ns-item-provider/suggestedname.md) <small>只读</small> | 系统建议的文件名 |

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`hasItemConformingToTypeIdentifier()`](ns-item-provider/hasitemconformingtotypeidentifier.md) | 这一项是不是某一类内容 |
| [`canLoadObjectOfClass()`](ns-item-provider/canloadobjectofclass.md) | 取不取得出某个类的对象 |
| [`loadObjectOfClass()`](ns-item-provider/loadobjectofclass.md) | 取出这个类的对象，返回 Promise |

## 统一类型标识符

**统一类型标识符**是系统用来表示数据类型的字符串，比如 `'public.jpeg'`、`'public.heic'`、`'public.png'`、`'com.apple.quicktime-movie'`。它们有上下级：`'public.image'` 包括所有图片格式，`'public.movie'` 包括所有视频格式。`registeredTypeIdentifiers` 给的是具体格式，`hasItemConformingToTypeIdentifier()` 可以用上级的名字判断。

## 示例

```js
const picker = new PHPickerViewController(new PHPickerConfiguration());
picker.addEventListener('pick', async (event) => {
  const { results } = /** @type {PHPickerViewControllerFinishEvent} */ (event);
  for (const result of results) {
    const provider = result.itemProvider;
    if (provider.canLoadObjectOfClass(UIImage)) {
      const image = await provider.loadObjectOfClass(UIImage);
      console.log('图片 ' + provider.suggestedName, image.size.width);
    } else if (provider.hasItemConformingToTypeIdentifier('public.movie')) {
      console.log('视频 ' + provider.suggestedName + '，现在取不出来');
    }
  }
});
```

**效果**（**未在模拟器验证**）：选中的每一项输出一行，图片带宽度，视频只有名字。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[NSItemProvider alloc] initWithObject:image]` | `new NSItemProvider(image)` |
| `[provider canLoadObjectOfClass:UIImage.class]` | `provider.canLoadObjectOfClass(UIImage)` |
| `[provider loadObjectOfClass:UIImage.class completionHandler:^(id image, NSError *error) { … }]` | `await provider.loadObjectOfClass(UIImage)` |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 取出选中的视频 | `loadFileRepresentationForTypeIdentifier:completionHandler:` |
| 取图片的原始文件数据（不解码成 `UIImage`） | `loadDataRepresentationForTypeIdentifier:completionHandler:` |
| 用提供者传图片以外的东西 | `NSItemProvider` 的其余成员 |

## 参见

- [`PHPickerResult`](ph-picker-result.md)：选中的每一项带一个提供者
- [`UIImage`](ui-image.md)：取出来的对象的类型
- [从相册选图、把图存进相册](../guides/pick-photos.md#判断选中的是不是图片)
