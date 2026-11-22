---
type: reference
native: "-[PHPickerViewControllerDelegate picker:didFinishPicking:]"
---

# `PHPickerViewController`: `pick` event

The **`pick`** event fires when the user finishes picking or taps Cancel. The event object's `results` holds the picked items.

## Syntax

```
picker.addEventListener('pick', (event) => { })
```

## Event object

[`PHPickerViewControllerFinishEvent`](../ph-picker-view-controller-finish-event.md), with one extra read-only field:

**[`results`](../ph-picker-view-controller-finish-event/results.md)**

An array of [`PHPickerResult`](../ph-picker-result.md), read-only (frozen). An empty array when the user tapped Cancel. When `selection` is `'ordered'` or `'continuousAndOrdered'`, the items are in the order the user picked them.

Not cancelable. The callback runs in the next turn after the event occurs.

## When it fires

The photo picker can finish in three ways:

| What the user did | What fires |
| --- | --- |
| Finished picking and tapped "Add" at the top right. When only one item may be picked, tapping that item counts as finishing | `pick`, with `results` holding the picked items |
| Tapped "Cancel" at the top left | `pick`, with `results` an empty array |
| Dragged the picker down | The view controller's [`dismiss`](../ui-view-controller/dismiss-event.md) event. Whether a `pick` with empty `results` also fires is **not verified in the simulator** |

- **The photo picker doesn't close itself.** After `pick` fires it is still on screen; call [`dismissViewController()`](../ui-view-controller/dismissviewcontroller.md) in the listener. What happens if you call `dismissViewController()` again on a picker that has already been dragged away is **not verified in the simulator**.
- **When [`selection`](../ph-picker-configuration/selection.md) is `'continuous'` or `'continuousAndOrdered'`, it fires each time an item is selected or deselected**, with `results` holding everything selected at that moment. In these modes, don't close the picker in the listener.
- To fire `pick` yourself to try a listener, build the event with [`new PHPickerViewControllerFinishEvent()`](../ph-picker-view-controller-finish-event/constructor.md); without `results`, it is an empty array. When you fire a plain `Event`, the listener reads `undefined` for `results`.

## Examples

```js
const page = new UIViewController();
const picker = new PHPickerViewController(new PHPickerConfiguration());
picker.addEventListener('pick', (event) => {
  const { results } = event;
  picker.dismissViewController({ animated: true });
  console.log(results.length === 0 ? 'Canceled' : 'Picked ' + results.length + ' item(s)');
});
page.presentViewController(picker, { animated: true });
```

**Effect** (**not verified in the simulator**): When the user picks one item, the photo picker disappears and the console prints `Picked 1 item(s)`. When the user taps "Cancel", it prints `Canceled`.

## Corresponding iOS API

The delegate method `picker:didFinishPicking:`. In JS, instead of setting a delegate, listen for this event; the `results` parameter is on the event object.

## See also

- [`PHPickerResult`](../ph-picker-result.md): the type of each item in `results`
- [`NSItemProvider`](../ns-item-provider.md): loading images from picked items
- [Picking photos and saving them to the photo library](../../guides/pick-photos.md)
- This class belongs to the `@nacrejs/photos` package; for how to install it, see [Install first](../photos.md#installation)
