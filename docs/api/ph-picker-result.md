---
type: reference
native: PHPickerResult
status: partial
---

# `PHPickerResult`

**`PHPickerResult`** 表示用户在选图界面里选中的一项。它只出现在 [`pick`](photos/pick-event.md) 事件的 `results` 里。

它自己不是图片。它的 [`itemProvider`](ph-picker-result/itemprovider.md) 是这一项内容的提供者，图片要从提供者身上取。

要先装 `@nacrejs/photos`，装法见 [`PHPickerViewController`](photos.md#要先安装)，也可以看[核心和能力包](capabilities.md)。

**继承关系**：`NSObject` → `PHPickerResult`

## 构造函数

不能用 `new` 创建。`new PHPickerResult()` 抛 `TypeError`：

```
Illegal constructor: PHPickerResult is created by the runtime, not by new
```

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`itemProvider`](ph-picker-result/itemprovider.md) <small>只读</small> | 这一项内容的提供者 |

## 示例

```js
const picker = new PHPickerViewController(new PHPickerConfiguration());
picker.addEventListener('pick', async (event) => {
  const { results } = /** @type {PHPickerViewControllerFinishEvent} */ (event);
  picker.dismissViewController({ animated: true });
  for (const result of results) {
    const image = await result.itemProvider.loadObjectOfClass(UIImage);
    console.log(image.size.width, image.size.height);
  }
});
```

**效果**：用户选好之后，选中的每一张图输出一行宽和高（单位是[点](units.md)）。**未在模拟器验证。**

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `result.itemProvider` | `result.itemProvider` |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 知道选中的是相册里的哪一张 | `assetIdentifier` |

## 参见

- [`NSItemProvider`](ns-item-provider.md)：从提供者身上取图片
- [`pick`](photos/pick-event.md)：结果从这个事件来
