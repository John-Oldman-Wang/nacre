---
type: reference
native: UIView.accessibilityElementsHidden
---

# `UIView`: `accessibilityElementsHidden` property

The **`accessibilityElementsHidden`** property determines whether VoiceOver skips all the elements inside this view. The views still show on screen as usual; VoiceOver just doesn't stop on them.

VoiceOver is the screen reader built into iOS; see [`isAccessibilityElement`](isaccessibilityelement.md).

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | VoiceOver skips the elements inside this view: its subviews, and the views inside those subviews |
| `false` | VoiceOver stops on the elements inside as usual |

The effects of both values come from Apple's documentation and are **not verified on a device**.

- Readable and writable.
- The default is `false`.
- Converted with `Boolean()` on write: `1`, non-empty strings, and objects are `true`; `0`, `''`, `null`, `undefined`, and `NaN` are `false`. So writing `'false'` gives `true`.
- It affects only VoiceOver, not display or touch: buttons inside are still visible and can still be tapped with a finger.
- There is no change event: only the app's own code changes it.

## Examples

A purely decorative background pattern that VoiceOver shouldn't stop on:

```js
const decoration = new UIView();
decoration.addSubview(new UIImageView());
decoration.addSubview(new UIImageView());
decoration.accessibilityElementsHidden = true;
console.log(decoration.accessibilityElementsHidden);
```

**Effect**: The console prints `true`. VoiceOver skips the two images inside `decoration`, and they still show on screen as usual. **The VoiceOver effect is not verified on a device.**

## Corresponding iOS API

`accessibilityElementsHidden`. In iOS it belongs to the `UIAccessibility` protocol and every object has it; in JS it exists only on `UIView` and its subclasses.

## See also

- [Making VoiceOver read your interface correctly](../../guides/accessibility.md)
- [`accessibilityViewIsModal`](accessibilityviewismodal.md): keeping VoiceOver inside an overlay that covers the page
- [`isAccessibilityElement`](isaccessibilityelement.md)
