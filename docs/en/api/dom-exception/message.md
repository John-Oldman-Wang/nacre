---
type: reference
web: DOMException.message
---

# `DOMException`: `message` property

The **`message`** property is a one-sentence description of what went wrong.

## Value

A string.

- Read-only. Assigning to it throws `TypeError`, and the value doesn't change.
- It's the description given at construction; an empty string if none was given, or if `undefined` or `null` was given.
- For errors the runtime determines on its own, it's an English sentence; each API's page has the exact text.
- For errors from iOS, it's the system's description, in the app's language (see [Configuring the app](../../guides/project-config.md)).

`message` is for people: use it in logs and in messages to the user. To tell in code what went wrong, check [`name`](name.md), not the text of `message`.

## Examples

```js
try {
  atob('not base64!');
} catch (err) {
  if (err instanceof DOMException) {
    console.log(err.name, err.message.length > 0);
  }
}
```

**Result**: Prints `InvalidCharacterError true`.

## See also

- [`name`](name.md)
