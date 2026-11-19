---
type: reference
native: UIViewController.modalPresentationStyle
---

# `UIViewController`: `modalPresentationStyle` property

The **`modalPresentationStyle`** property is the style used when this view controller is presented modally. Set it on **the presented view controller**, before presenting.

## Value

A string:

| Value | Effect |
| --- | --- |
| `'automatic'` | The system picks a style. This is the iOS default |
| `'pageSheet'` | A sheet. Slides in from the bottom; the user can drag it down to dismiss |
| `'formSheet'` | A sheet. How it differs from `'pageSheet'` on iPhone is **not verified in the simulator** |
| `'fullScreen'` | Fills the whole screen and completely covers the view controller underneath. The user cannot drag it down. **Not verified in the simulator** |
| `'overFullScreen'` | Fills the whole screen, but the view controller underneath stays on screen. If the modal view controller's background is translucent, the one underneath shows through. **Not verified in the simulator** |
| `'currentContext'` | Covers only the view controller that "defines the presentation context". The property that defines the presentation context (`definesPresentationContext`) is not provided yet. **Not verified in the simulator** |
| `'overCurrentContext'` | Same as `'currentContext'`, and the view controller underneath stays. **Not verified in the simulator** |
| `'popover'` | A popover. The configuration object it needs is not provided yet. **Not verified in the simulator** |
| `'custom'` | A custom transition. The capability it needs is not provided yet. **Not verified in the simulator** |
| `'none'` | Means "not presented". Not used for presenting. **The result of setting it and then presenting is not verified in the simulator** |

- Readable and writable.
- A new view controller reads `'formSheet'`, not `'automatic'`: the system returns the concrete style it chose. Do not compare the value read with `'automatic'`.
- No event fires when it changes: only the app's own code can change it.

The user cannot drag a `'fullScreen'` view controller down, so it must have a close button; otherwise the user has no way to leave it.

### Invalid values

Writing a value not in the table does not throw. The property keeps its previous value, and the console prints a warning listing all available values:

```
[Nacre] modalPresentationStyle has no value "modal"; expected one of: …, ignored
```

## Examples

```js
const page = new UIViewController();
const sheet = new UIViewController();
console.log(sheet.modalPresentationStyle);
sheet.modalPresentationStyle = 'fullScreen';
page.presentViewController(sheet, { animated: true });
```

**Effect**: First prints `formSheet`. While `page` is on screen, `sheet` slides in from the bottom and fills the whole screen. **The full-screen effect is not verified in the simulator.**

## Corresponding iOS API

`UIViewController.modalPresentationStyle`. `UIModalPresentationPageSheet` is written `'pageSheet'`, and likewise for the rest.

## See also

- [`modalTransitionStyle`](modaltransitionstyle.md)
- [`isModalInPresentation`](ismodalinpresentation.md)
