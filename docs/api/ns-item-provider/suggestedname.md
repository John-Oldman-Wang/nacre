---
type: reference
native: NSItemProvider.suggestedName
---

# `NSItemProvider`：`suggestedName` 属性

**`suggestedName`** 属性是系统建议的文件名，不带扩展名。

## 值

字符串，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 没有建议的名字时是 `null`。
- 提供者建好之后内容不变，没有变化通知。

## 示例

```js
const picker = new PHPickerViewController(new PHPickerConfiguration());
picker.addEventListener('pick', (event) => {
  const { results } = /** @type {PHPickerViewControllerFinishEvent} */ (event);
  for (const result of results) {
    console.log(result.itemProvider.suggestedName ?? '（没有名字）');
  }
});
```

**效果**：用户选好之后，每一项输出一行文件名。选中的照片给出什么名字**未在模拟器验证**。

## 对应的 iOS API

`NSItemProvider.suggestedName`。

## 参见

- [`registeredTypeIdentifiers`](registeredtypeidentifiers.md)：这一项有哪些格式
- 这个类属于 `@nacrejs/photos` 包，装法见[要先安装](../photos.md#要先安装)
