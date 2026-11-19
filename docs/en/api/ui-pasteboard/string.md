---
type: reference
native: UIPasteboard.string
---

# `UIPasteboard`: `string` property

The **`string`** property is the text on the clipboard. Reading it fetches the content; writing it replaces the content.

## Value

A string or `null`.

- Readable and writable.
- Reads `null` when there is no text on the clipboard. Reads `null` when the clipboard holds only an image; **not verified in the simulator**.
- Writing a piece of text replaces the existing content of the clipboard. Writing needs no user consent and shows no system prompt. Once the assignment line has run, the text is on the clipboard.
- Writing `null` clears the clipboard: afterward `string` reads `null` and [`hasStrings`](hasstrings.md) is `false`. It clears the whole system clipboard, including content the user copied in another app.
- Every write (including writing `null`) increases [`changeCount`](changecount.md) and fires the [`change`](change-event.md) event. There is no event when another app changes the content; see [`changeCount`](changecount.md).

> **Note:** When the content comes from another app, reading `string` shows a system prompt, and the line does not return until the user responds; the whole interface freezes. See [The system prompt when reading](../ui-pasteboard.md#the-system-prompt-when-reading). To know only whether there is text, read [`hasStrings`](hasstrings.md).

### Invalid values

Values that are not strings are converted with `String()` on write; for example, writing `42` gives `'42'`. Writing `undefined` clears it, the same as writing `null`. Writing never throws.

## Examples

```js
const pasteboard = UIPasteboard.generalPasteboard;
pasteboard.string = '20261112-0042';
console.log(pasteboard.string);

pasteboard.string = null;
console.log(pasteboard.string, pasteboard.hasStrings);
```

**Result**: First prints `20261112-0042`; after clearing, prints `null false`.

## Corresponding iOS API

`UIPasteboard.string`.

## See also

- [Copying and pasting text](../../guides/clipboard.md): when to read without disturbing the user
- [`hasStrings`](hasstrings.md): checking only whether there is text
