---
type: reference
native: NSAttributedString.string
---

# `NSAttributedString`: `string` property

The **`string`** property is the attributed string's text without attributes.

## Value

A string.

- Read-only; assigning to it throws `TypeError`.
- At an attachment's position is the character `'￼'` (U+FFFC).
- An `NSAttributedString`'s content never changes. After an `NSMutableAttributedString`'s content is changed, you read the changed text; there is no change notification, since changes come only from the app's own code.

## Examples

```js
const text = new NSMutableAttributedString('abc', { kern: 3 });
text.replaceCharactersInRange(new NSRange(1, 1), { withString: 'XYZ' });
console.log(text.string);
```

**Result**: The console prints `aXYZc`.

## Corresponding iOS API

`NSAttributedString.string`.

## See also

- [`length`](length.md)
