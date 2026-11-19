---
type: reference
native: UILabel.lineBreakMode
---

# `UILabel`: `lineBreakMode` property

The **`lineBreakMode`** property determines what happens when text does not fit: where lines break, and whether and where an ellipsis replaces what does not fit on the last line.

## Value

A string, one of these six:

| Value | Effect |
| --- | --- |
| `'byTruncatingTail'` | The part at the end that does not fit is replaced with "…" |
| `'byTruncatingHead'` | The beginning is replaced with "…", keeping the end. **Not verified in the simulator** |
| `'byTruncatingMiddle'` | The middle is replaced with "…", keeping the beginning and end. Suits content with information at both ends, such as file names and addresses. **Not verified in the simulator** |
| `'byClipping'` | The part that does not fit is not shown, with no ellipsis. **Not verified in the simulator** |
| `'byWordWrapping'` | Breaks lines at word boundaries. The part that does not fit on the last line is not shown, with no ellipsis. **Not verified in the simulator** |
| `'byCharWrapping'` | Breaks lines between any characters, possibly splitting a word. The part that does not fit on the last line is not shown, with no ellipsis. **Not verified in the simulator** |

- Readable and writable.
- The default is `'byTruncatingTail'`.

### Invalid values

Writing a value not in the table does not throw. The property keeps its previous value, and the console prints a warning, with all available values listed at the ellipsis:

```
[Nacre] lineBreakMode has no value "ellipsis"; expected one of: …, ignored
```

## Examples

```js
const label = new UILabel();
label.text = '/Users/me/Documents/projects/nacre/docs/api/ui-label.md';
label.numberOfLines = 1;
label.lineBreakMode = 'byTruncatingMiddle';
```

**Effect**: The text shows on one line only. The beginning and end are kept, and the middle is replaced with "…". **Not verified in the simulator.**

## Corresponding iOS API

`UILabel.lineBreakMode`. `NSLineBreakByTruncatingTail` is written `'byTruncatingTail'`, and likewise for the rest.

## See also

- [`numberOfLines`](numberoflines.md)
- [Line count, wrapping, and truncation](../ui-label.md#line-count-wrapping-and-truncation)
