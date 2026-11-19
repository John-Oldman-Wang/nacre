---
type: reference
native: UIPasteboard.changeCount
---

# `UIPasteboard`: `changeCount` property

The **`changeCount`** property is a count of changes to the clipboard's content. It only queries; it does not fetch the content and does not show a system prompt.

## Value

A number, counting changes.

- Read-only; assigning to it throws `TypeError`.
- It increases every time the content changes, including changes made by other apps and changes made while the app is in the background. Writing `null` to clear also counts as a change.
- Its exact value has no meaning; it is only for comparing with a value read earlier.
- When this app itself writes [`string`](string.md), the [`change`](change-event.md) event fires. There is no event when another app changes it (verified on a device); compare it when returning to the foreground.

Checked on a device: after copying in another app and coming back, `changeCount` went from 24 to 25, and no `change` event was received in between.

## Examples

```js
const pasteboard = UIPasteboard.generalPasteboard;
const before = pasteboard.changeCount;
pasteboard.string = 'New content';
console.log(pasteboard.changeCount > before);
```

**Result**: Prints `true`.

## Corresponding iOS API

`UIPasteboard.changeCount`.

## See also

- [Whether the content changed while the user was away from the app](../../guides/clipboard.md#did-the-content-change-while-the-user-was-away)
- [`change`](change-event.md)
