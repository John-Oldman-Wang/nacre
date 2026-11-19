---
type: reference
native: PHPickerResult.itemProvider
---

# `PHPickerResult`：`itemProvider` 属性

**`itemProvider`** 属性是这一项内容的提供者。图片从它身上取。

## 值

[`NSItemProvider`](../ns-item-provider.md)。

- 只读。给它赋值抛 `TypeError`。

## 示例

```js
const picker = new PHPickerViewController(new PHPickerConfiguration());
picker.addEventListener('pick', async (event) => {
  const { results } = /** @type {PHPickerViewControllerFinishEvent} */ (event);
  if (results.length === 0) return;
  const provider = results[0].itemProvider;
  if (provider.canLoadObjectOfClass(UIImage)) {
    const image = await provider.loadObjectOfClass(UIImage);
    console.log(image.size.width);
  }
});
```

**效果**：用户选了一张图之后，控制台输出它的宽度（单位是[点](../units.md)）。**未在模拟器验证。**

## 对应的 iOS API

`PHPickerResult.itemProvider`。

## 参见

- [`loadObjectOfClass()`](../ns-item-provider/loadobjectofclass.md)：取出图片
- 这个类属于 `@nacrejs/photos` 包，装法见[要先安装](../photos.md#要先安装)
