---
type: reference
native: UIView.semanticContentAttribute
---

# `UIView`: `semanticContentAttribute` property

The **`semanticContentAttribute`** property describes how the view's content relates to writing direction, which determines whether the view is flipped horizontally in right-to-left languages.

## Value

A string, one of the following:

| Value | Meaning |
| --- | --- |
| `'unspecified'` | Follows the writing direction: flipped horizontally in right-to-left languages |
| `'playback'` | Playback controls (play, fast-forward, rewind buttons and the like); not flipped |
| `'spatial'` | Direction-related controls (such as arrow keys); not flipped |
| `'forceLeftToRight'` | Always laid out left to right |
| `'forceRightToLeft'` | Always laid out right to left |

- Readable and writable.
- The default is **not verified in the simulator**; according to Apple's documentation it is `'unspecified'`.
- Read the actual result after setting it from [`effectiveUserInterfaceLayoutDirection`](effectiveuserinterfacelayoutdirection.md).
- The type that reads back, and that writing back the original value leaves it unchanged, are checked in the acceptance tests. The effect of each value is **not verified in the simulator**; the meanings come from Apple's documentation.

### Invalid values

Writing a value not in the table doesn't throw. A warning is logged, `[Nacre] semanticContentAttribute has no value "x"; expected one of: unspecified / playback / spatial / forceLeftToRight / forceRightToLeft, ignored`, and the property keeps its previous value.

## Examples

```js
const controls = new UIStackView();
controls.semanticContentAttribute = 'playback';
```

**Effect**: In right-to-left languages, this row of playback buttons isn't flipped. **Not verified in the simulator.**

## Corresponding iOS API

`UIView.semanticContentAttribute`. `UISemanticContentAttributePlayback` is written `'playback'`, and likewise for the rest.

## See also

- [`effectiveUserInterfaceLayoutDirection`](effectiveuserinterfacelayoutdirection.md)
- [`leadingAnchor`](leadinganchor.md)
