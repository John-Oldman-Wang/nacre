---
type: reference
native: UIPasteboard.hasStrings
---

# `UIPasteboard`: `hasStrings` property

The **`hasStrings`** property tells whether there is text on the clipboard. It only queries; it does not fetch the content and does not show a system prompt.

## Value

A boolean.

- Read-only; assigning to it throws `TypeError`.
- `true`: there is text on the clipboard.
- `false`: there is none.
- When this app itself changes it by writing [`string`](string.md), the [`change`](change-event.md) event fires. There is no event when another app changes it; read it again after returning to the foreground.

After reading `true`, still check whether `string` is `null` when you read it: the content may have changed between the two reads.

## Examples

```js
const pasteboard = UIPasteboard.generalPasteboard;
if (pasteboard.hasStrings) {
  console.log('Can paste');
}
```

**Result**: Prints `Can paste` when there is text on the clipboard. There is no system prompt.

## Corresponding iOS API

`UIPasteboard.hasStrings`.

## See also

- [`string`](string.md)
- [The system prompt when reading](../ui-pasteboard.md#the-system-prompt-when-reading)
