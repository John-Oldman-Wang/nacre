---
type: reference
native: UIActivityViewControllerCompletionEvent.activityType
---

# `UIActivityViewControllerCompletionEvent`: `activityType` property

The **`activityType`** property is where the user chose to share.

## Value

A string or `null`:

- Read-only. Assigning to it throws `TypeError`.
- A built-in action is one of the [names of system actions](../ui-activity-view-controller.md#names-of-system-actions), such as `'copyToPasteboard'` or `'message'`.
- A third-party extension gives its own identifier, a string with dots.
- When the sheet was closed without choosing any action, it is `null`.
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
const sheet = new UIActivityViewController([new URL('https://example.com')]);
sheet.addEventListener('complete', (e) => {
  if (e.activityType === 'copyToPasteboard') {
    console.log('复制了链接');
  }
});
```

**Effect**: after the user taps Copy in the sheet, prints `复制了链接`. **Not verified in the simulator.**

## Corresponding iOS API

The `activityType` parameter of `completionWithItemsHandler`.

## See also

- [`UIActivityViewControllerCompletionEvent`](../ui-activity-view-controller-completion-event.md)
