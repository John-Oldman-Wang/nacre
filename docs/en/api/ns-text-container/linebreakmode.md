---
type: reference
native: NSTextContainer.lineBreakMode
---

# `NSTextContainer`: `lineBreakMode` property

The **`lineBreakMode`** property determines what happens when a line doesn't fit.

## Value

A string, one of the following:

| Value | Effect |
| --- | --- |
| `'byWordWrapping'` | Wraps at word boundaries |
| `'byCharWrapping'` | Wraps between any characters |
| `'byClipping'` | Doesn't wrap; the overflowing part isn't shown |
| `'byTruncatingHead'` | Ellipsis at the start |
| `'byTruncatingTail'` | Ellipsis at the end |
| `'byTruncatingMiddle'` | Ellipsis in the middle |

- Readable and writable.
- Defaults to `'byWordWrapping'`.
- How each value displays is **not verified in the simulator**.
- No change event: only the app's own code changes it.

### Invalid values

Writing a value not in the table doesn't throw: the console prints a warning listing all available values, and the property keeps its previous value.

```
[Nacre] lineBreakMode has no value "x"; expected one of: …, ignored
```

## Examples

```js
const container = new UITextView().textContainer;
container.lineBreakMode = 'byCharWrapping';
console.log(container.lineBreakMode);
```

**Effect**: the console prints `byCharWrapping`.

## Corresponding iOS API

`NSTextContainer.lineBreakMode`. `NSLineBreakByTruncatingTail` is written as `'byTruncatingTail'`, and likewise for the rest.

## See also

- [`maximumNumberOfLines`](maximumnumberoflines.md)
