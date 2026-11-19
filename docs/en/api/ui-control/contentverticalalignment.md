---
type: reference
native: UIControl.contentVerticalAlignment
---

# `UIControl`: `contentVerticalAlignment` property

The **`contentVerticalAlignment`** property determines the vertical position of the control's content within the control's bounds. Content means what the subclass itself displays, such as a button's text and icon or a text field's text.

## Value

A string, one of the following:

| Value | Effect |
| --- | --- |
| `'center'` | Content is centered vertically |
| `'top'` | Content is aligned to the top edge |
| `'bottom'` | Content is aligned to the bottom edge |
| `'fill'` | Content is stretched vertically to the control's height |

- Readable and writable.
- Defaults to `'center'`. **The default value is not verified in the simulator.**
- The visual effect of each value is **not verified in the simulator**.
- A `UIControl` created directly displays no content of its own, so this property has no visible effect on it.

### Observing changes

No event fires when it changes. Only the app's code changes it, so no notification is needed.

### Invalid values

Writing a value not in the table does not throw; the property keeps its previous value, and the console prints a warning:

```
[Nacre] contentVerticalAlignment has no value "middle"; expected one of: center / top / bottom / fill, ignored
```

## Examples

```js
const tall = UIButton.buttonWithType('system');
tall.setTitle('Top-aligned text', { forState: ['normal'] });
tall.contentVerticalAlignment = 'top';
tall.frame = { x: 20, y: 100, width: 200, height: 120 };
```

**Effect**: The button is 120 pt tall, and the text sits against the button's top edge. **Not verified in the simulator.**

## Corresponding iOS API

`UIControl.contentVerticalAlignment`. `UIControlContentVerticalAlignmentTop` is written `'top'`, and likewise for the rest.

## See also

- [`contentHorizontalAlignment`](contenthorizontalalignment.md): the horizontal direction
