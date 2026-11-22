---
type: reference
native: PHPickerViewControllerFinishEvent.results
---

# `PHPickerViewControllerFinishEvent`：`results` 属性

**`results`** 属性是用户选中的那几项。

## 值

[`PHPickerResult`](../ph-picker-result.md) 的数组，冻结的。

- 只读。给它赋值抛 `TypeError`。
- 用户点了取消时是空数组。
- [`selection`](../ph-picker-configuration/selection.md) 是 `'ordered'` 或 `'continuousAndOrdered'` 时，按用户选的先后排。
- 用 [`new`](constructor.md) 创建时没给，是 冻结的空数组。

## 示例

```js
const page = new UIViewController();
const picker = new PHPickerViewController(new PHPickerConfiguration());
picker.addEventListener('pick', (e) => {
  picker.dismissViewController({ animated: true });
  console.log(e.results.length === 0 ? '取消了' : '选了 ' + e.results.length + ' 项');
});
page.presentViewController(picker, { animated: true });
```

**效果**：用户选好或取消后，关掉选图界面，输出选了几项或 `取消了`。

## 对应的 iOS API

`picker:didFinishPicking:` 的参数 `results`。

## 参见

- [`PHPickerViewControllerFinishEvent`](../ph-picker-view-controller-finish-event.md)
