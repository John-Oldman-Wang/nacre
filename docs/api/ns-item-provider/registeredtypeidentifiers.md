---
type: reference
native: NSItemProvider.registeredTypeIdentifiers
---

# `NSItemProvider`：`registeredTypeIdentifiers` 属性

**`registeredTypeIdentifiers`** 属性列出这一项有哪些格式。

## 值

字符串数组。每个值是一个[统一类型标识符](../ns-item-provider.md#统一类型标识符)：`'public.jpeg'`、`'public.heic'`、`'public.png'`、`'com.apple.quicktime-movie'`。

- 只读。给它赋值抛 `TypeError`。
- 提供者建好之后内容不变，没有变化通知。
- 选中的照片具体给出哪几个，**未在模拟器验证**。

## 示例

```js
const picker = new PHPickerViewController(new PHPickerConfiguration());
picker.addEventListener('pick', (event) => {
  const { results } = /** @type {PHPickerViewControllerFinishEvent} */ (event);
  for (const result of results) {
    console.log(result.itemProvider.registeredTypeIdentifiers.join(', '));
  }
});
```

**效果**：用户选好之后，每一项输出一行它的格式，比如 `public.heic, public.jpeg`。**未在模拟器验证。**

## 对应的 iOS API

`NSItemProvider.registeredTypeIdentifiers`。

## 参见

- [`hasItemConformingToTypeIdentifier()`](hasitemconformingtotypeidentifier.md)：按上级类型判断
- 这个类属于 `@nacrejs/photos` 包，装法见[要先安装](../photos.md#要先安装)
