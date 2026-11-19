---
type: reference
native: UIActivityViewController.completionWithItemsHandler
---

# `UIActivityViewController`: `complete` event

The **`complete`** event fires when the share sheet finishes: the action the user chose is done (or failed), or the user closed the share sheet without choosing.

## Syntax

```
sheet.addEventListener('complete', (event) => { })
```

## Event object

Its type is `UIActivityViewControllerCompletionEvent`. The listener callback's parameter type is `Event`; to read the three fields below, cast the type first, as shown in [Examples](#examples).

| Field | Type | Meaning |
| --- | --- | --- |
| `completed` | `boolean` | `true`: the action the user chose is done. `false`: it wasn't done, including when the user simply closed the share sheet |
| `activityType` | `string \| null` | The destination the user chose: one of the [names of system actions](../ui-activity-view-controller.md#names-of-system-actions), or a third-party extension's own identifier (a dotted string). `null` if closed without choosing |
| `activityError` | `Error \| null` | The error when the action failed; `message` is the system's description, plus `code` (a number) and `domain` (a string). `null` if there was no error |

- `type` is `'complete'` and `target` is the share sheet.
- Not cancelable; `preventDefault()` has no effect.

## When it fires

- Fires when the share sheet finishes, only once per share sheet. When it fires, the share sheet has already closed itself; the app doesn't need to close it again.
- `completed` being `true` only means the action finished, for example the user tapped send in Messages' compose screen. The app doesn't know whether what was shared reached the other party.
- Whether `complete` fires when the share sheet is closed from code with [`dismissViewController()`](../ui-view-controller/dismissviewcontroller.md) is **not verified in the simulator**. Put whatever needs to happen after closing it from code right after that call, without relying on this event.
- If you don't need to know the result, don't listen. The share sheet doesn't depend on a listener to work.

When this event fires and what the event object contains are both **not verified in the simulator**.

## Examples

```js
const sheet = new UIActivityViewController([new URL('https://example.com')]);
sheet.addEventListener('complete', (event) => {
  const result = /** @type {UIActivityViewControllerCompletionEvent} */ (event);
  if (result.activityError !== null) {
    console.log('sharing failed: ' + result.activityError.message);
  } else if (result.completed) {
    console.log('shared; destination is ' + result.activityType);
  }
});
```

**Effect** (**not verified in the simulator**)

- When the user completes the share, it prints the destination's name, for example `shared; destination is copyToPasteboard`.
- When the action fails, it prints the error message.
- When the user simply closes the share sheet, nothing is printed.

## Corresponding iOS API

`UIActivityViewController.completionWithItemsHandler`. Of the callback's four parameters, `activityType`, `completed`, and `activityError` are the fields of the same names on the event object; `returnedItems` isn't provided yet.

## See also

- [When the share sheet finishes](../ui-activity-view-controller.md#when-the-share-sheet-finishes)
- [`dismiss`](../ui-view-controller/dismiss-event.md): the dismissal event inherited from view controllers
