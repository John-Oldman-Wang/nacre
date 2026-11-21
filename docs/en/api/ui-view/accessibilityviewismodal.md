---
type: reference
native: UIView.accessibilityViewIsModal
---

# `UIView`: `accessibilityViewIsModal` property

The **`accessibilityViewIsModal`** property determines whether VoiceOver stays inside this view: once it is `true`, VoiceOver skips the elements in the other views that share this view's superview. Use it for overlays that cover the page.

VoiceOver is the screen reader built into iOS; see [`isAccessibilityElement`](isaccessibilityelement.md).

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | VoiceOver skips the elements in this view's siblings (the other subviews of the same superview) and stops only on the elements inside this view |
| `false` | VoiceOver stops on all visible elements as usual |

The effects of both values come from Apple's documentation and are **not verified on a device**.

- Readable and writable.
- The default is `false`.
- Only the elements in sibling views are skipped. According to Apple's documentation, siblings of the superview are not affected: add the overlay directly to the superview of the views it should cover, such as the page's root view.
- It affects only VoiceOver, not display or touch. Where the overlay doesn't cover the screen, a finger can still tap the views underneath.
- Converted with `Boolean()` on write: `1`, non-empty strings, and objects are `true`; `0`, `''`, `null`, `undefined`, and `NaN` are `false`. So writing `'false'` gives `true`.
- There is no change event: only the app's own code changes it.

## Examples

```js
const page = new UIViewController();
const sheet = new UIView();
sheet.backgroundColor = 'systemBackground';
sheet.accessibilityViewIsModal = true;
page.view.addSubview(sheet);
console.log(sheet.accessibilityViewIsModal);
```

**Effect**: The console prints `true`. Once the overlay `sheet` is added to the page's root view, VoiceOver stops only on the elements inside `sheet` and skips the buttons and text on the page that it covers. **The VoiceOver effect is not verified on a device.**

## Corresponding iOS API

`accessibilityViewIsModal`. In iOS it belongs to the `UIAccessibility` protocol and every object has it; in JS it exists only on `UIView` and its subclasses.

## See also

- [Making VoiceOver read your interface correctly](../../guides/accessibility.md#overlays-keeping-voiceover-inside): how to set it on an overlay you build yourself
- [`accessibilityElementsHidden`](accessibilityelementshidden.md): skipping all the elements inside a view
