---
type: reference
native: PHPickerViewControllerFinishEvent
---

# `PHPickerViewControllerFinishEvent`

**`PHPickerViewControllerFinishEvent`** represents the user finishing a choice in the system photo picker, or tapping Cancel.

The [`pick`](photos/pick-event.md) event of [`PHPickerViewController`](photos.md) is this class, and [`results`](ph-picker-view-controller-finish-event/results.md) is the items chosen; it is an empty array when the user tapped Cancel.

It belongs to the `@nacrejs/photos` package; for installation, see [`PHPickerViewController`](photos.md#installation).

**Inheritance**: [`Event`](event.md) → `PHPickerViewControllerFinishEvent`

## Constructor

[`PHPickerViewControllerFinishEvent()`](ph-picker-view-controller-finish-event/constructor.md)

Creates a `PHPickerViewControllerFinishEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`results`](ph-picker-view-controller-finish-event/results.md) <small>read-only</small> | The items chosen |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`PHPickerViewController`](photos.md) | [`pick`](photos/pick-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect. The photo picker doesn't close itself; call `dismissViewController()` in the listener.

## Examples

```js
const page = new UIViewController();
const picker = new PHPickerViewController(new PHPickerConfiguration());
picker.addEventListener('pick', (e) => {
  console.log(e instanceof PHPickerViewControllerFinishEvent, e.results.length);
  picker.dismissViewController({ animated: true });
});
page.presentViewController(picker, { animated: true });
```

**Effect**: after the user chooses or cancels, prints `true` and the number chosen, then closes the picker.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `picker:didFinishPicking:` | The `pick` event |
| The `results` parameter | `event.results` |

## See also

- [`PHPickerViewController`](photos.md): the object that fires this event
- [`PHPickerResult`](ph-picker-result.md)
- [Picking photos and saving them to the photo library](../guides/pick-photos.md)
