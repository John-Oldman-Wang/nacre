---
type: reference
native: PHPickerViewControllerFinishEvent.results
---

# `PHPickerViewControllerFinishEvent`: `results` property

The **`results`** property is the items the user chose.

## Value

A frozen array of [`PHPickerResult`](../ph-picker-result.md).

- Read-only. Assigning to it throws `TypeError`.
- It is an empty array when the user tapped Cancel.
- When [`selection`](../ph-picker-configuration/selection.md) is `'ordered'` or `'continuousAndOrdered'`, the items are in the order the user chose them.
- When the event is created with [`new`](constructor.md) without it, it is a frozen empty array.

## Examples

```js
const page = new UIViewController();
const picker = new PHPickerViewController(new PHPickerConfiguration());
picker.addEventListener('pick', (e) => {
  picker.dismissViewController({ animated: true });
  console.log(e.results.length === 0 ? '取消了' : '选了 ' + e.results.length + ' 项');
});
page.presentViewController(picker, { animated: true });
```

**Effect**: after the user chooses or cancels, closes the picker and prints how many items were chosen, or `取消了`.

## Corresponding iOS API

The `results` parameter of `picker:didFinishPicking:`.

## See also

- [`PHPickerViewControllerFinishEvent`](../ph-picker-view-controller-finish-event.md)
