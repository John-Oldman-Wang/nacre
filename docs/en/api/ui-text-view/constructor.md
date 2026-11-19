---
type: reference
native: "-[UITextView init]"
---

# `UITextView()` constructor

The **`UITextView()`** constructor creates a text view.

## Syntax

```
new UITextView()
```

### Parameters

None.

### Return value

A new `UITextView`. It has no content, no font set ([`font`](font.md) is `null`), a background color of `'systemBackground'`, and a size of 0; it is editable, selectable, and scrollable (measured).

A new text view has the same background color as the page and no border, so once placed on the page there's no visible sign of where to tap; with no font set, its text is smaller than the system's standard 17 pt body text. So set `font`, then give it a background color and corner radius. See [Building a multiline text view](../../guides/multiline-text.md).

### Exceptions

**`TypeError`**

`UITextView` can't be subclassed; `class X extends UITextView {}` throws on `new X()`. See [Native classes](../native-classes.md#no-subclassing).

## Examples

```js
const input = new UITextView();
console.log(JSON.stringify(input.text), input.font, input.isEditable, input.isScrollEnabled);
```

**Result**: logs `"" null true true`.

## Corresponding iOS API

`[[UITextView alloc] init]`.

## See also

- [`font`](font.md)
