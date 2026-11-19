---
type: reference
native: UIControl.contentHorizontalAlignment
---

# `UIControl`: `contentHorizontalAlignment` property

The **`contentHorizontalAlignment`** property determines the horizontal position of the control's content within the control's bounds. Content means what the subclass itself displays, such as a button's text and icon or a text field's text.

## Value

A string, one of the following:

| Value | Effect |
| --- | --- |
| `'center'` | Content is centered horizontally |
| `'left'` | Content is aligned to the left edge |
| `'right'` | Content is aligned to the right edge |
| `'fill'` | Content is stretched horizontally to the control's width |
| `'leading'` | Content is aligned to the leading edge: the left edge in left-to-right languages, the right edge in right-to-left languages (such as Arabic) |
| `'trailing'` | Content is aligned to the trailing edge. The opposite of `'leading'` |

- Readable and writable.
- Defaults to `'center'`.
- The visual effect of each value is **not verified in the simulator**.
- A `UIControl` created directly displays no content of its own, so this property has no visible effect on it. Subviews added with `addSubview()` are not affected by it; their position is determined by constraints.

### Observing changes

No event fires when it changes. Only the app's code changes it, so no notification is needed.

### Invalid values

Writing a value not in the table does not throw; the property keeps its previous value, and the console prints a warning:

```
[Nacre] contentHorizontalAlignment has no value "middle"; expected one of: center / left / right / fill / leading / trailing, ignored
```

## Examples

```js
const wide = UIButton.buttonWithType('system');
wide.setTitle('Left-aligned text', { forState: ['normal'] });
wide.contentHorizontalAlignment = 'leading';
wide.frame = { x: 20, y: 100, width: 300, height: 44 };
```

**Effect**: The button is 300 pt wide, and the text sits against the button's left edge. Without this property, the text is in the center of the button. **The text position is not verified in the simulator.**

## Corresponding iOS API

`UIControl.contentHorizontalAlignment`. `UIControlContentHorizontalAlignmentLeading` is written `'leading'`, and likewise for the rest.

## See also

- [`contentVerticalAlignment`](contentverticalalignment.md): the vertical direction
- [Enums](../enums.md): why an invalid property value gives a warning instead of throwing
