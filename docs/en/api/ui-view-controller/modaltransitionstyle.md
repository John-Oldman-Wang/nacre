---
type: reference
native: UIViewController.modalTransitionStyle
---

# `UIViewController`: `modalTransitionStyle` property

The **`modalTransitionStyle`** property is the enter and exit animation used when this view controller is presented modally. Set it on **the presented view controller**, before presenting.

## Value

A string:

| Value | Effect |
| --- | --- |
| `'coverVertical'` | Slides up from the bottom of the screen; slides down when dismissed |
| `'crossDissolve'` | Fades in place; fades out when dismissed. **Not verified in the simulator** |
| `'flipHorizontal'` | Flips horizontally to the new view controller, like turning over a card. **Not verified in the simulator** |
| `'partialCurl'` | A page-curl effect. **Not verified in the simulator** |

- Readable and writable.
- The default is `'coverVertical'`.
- No event fires when it changes: only the app's own code can change it.

### Invalid values

Writing a value not in the table does not throw. The property keeps its previous value, and the console prints a warning `[Nacre] modalTransitionStyle has no value "<value written>"; expected one of: …, ignored`.

## Examples

```js
const page = new UIViewController();
const sheet = new UIViewController();
sheet.modalTransitionStyle = 'crossDissolve';
page.presentViewController(sheet, { animated: true });
```

**Effect**: `sheet` fades in place instead of sliding in from the bottom, and fades out when dismissed. **Not verified in the simulator.**

## Corresponding iOS API

`UIViewController.modalTransitionStyle`. `UIModalTransitionStyleCrossDissolve` is written `'crossDissolve'`, and likewise for the rest.

## See also

- [`modalPresentationStyle`](modalpresentationstyle.md)
