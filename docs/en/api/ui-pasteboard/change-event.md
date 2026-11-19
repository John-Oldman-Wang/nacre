---
type: reference
native: UIPasteboardChangedNotification
---

# `UIPasteboard`: `change` event

The **`change`** event fires when this app itself changes the clipboard's content. It does not fire when another app changes the clipboard.

## Syntax

```
pasteboard.addEventListener('change', (event) => { })
```

## Event object

`Event`, with no fields other than `type` and `target`. Read the new content from [`string`](string.md) and the count from [`changeCount`](changecount.md).

Not cancelable.

## When it fires

- When this app writes [`string`](string.md), including writing `null` to clear it.
- **One write fires it twice.** On a device, one write produced 2 `change` events; in the simulator, two consecutive writes produced 4. So do not count changes by the number of events received; read `changeCount` to know how many times it changed. Operations in the callback must be safe to repeat.
- **The callback does not run synchronously on the writing line; it runs a little later.** With two consecutive writes, the `changeCount` read in all four callbacks is the same value: by the time the callbacks run, both writes have finished.
- **It does not fire when another app changes the clipboard** (verified on a device). To know whether the content changed while the app was in the background, compare `changeCount` after returning to the foreground.
- It only fires once a listener has been added. Remove it with `removeEventListener()`.
- Listening for any other name does not throw: it is treated as a custom event and fires only when you dispatch it yourself with `dispatchEvent()`.

## Examples

```js
const pasteboard = UIPasteboard.generalPasteboard;
pasteboard.addEventListener('change', () => {
  console.log('Changed; the count is now ' + pasteboard.changeCount);
});

pasteboard.string = 'New content';
```

**Effect**: Prints two lines `Changed; the count is now …`, with the same number on both lines.

## Corresponding iOS API

`UIPasteboardChangedNotification`.

## See also

- [`changeCount`](changecount.md): how to learn that another app changed the content
