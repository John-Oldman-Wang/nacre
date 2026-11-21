---
type: reference
native: UIView.isAccessibilityElement
---

# `UIView`: `isAccessibilityElement` property

The **`isAccessibilityElement`** property determines whether the screen reader treats this view as an element: it stops on the view and reads out its [label](accessibilitylabel.md), [value](accessibilityvalue.md), [traits](accessibilitytraits.md), and [hint](accessibilityhint.md).

The screen reader (VoiceOver) is the screen reader built into iOS, used by people who can't see the screen well. While it is on, the user swipes left or right on the screen and VoiceOver stops on one element after another in order, reading each one out; double-tapping the screen taps the element it is currently on.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | VoiceOver stops on this view and reads it as a whole, instead of stopping on each of its subviews |
| `false` | VoiceOver doesn't stop on this view; it looks at its subviews instead |

The effects of both values come from Apple's documentation and are **not verified on a device**.

- Readable and writable.
- On `UIView` the default is `false`.
- On system controls such as `UILabel` and `UIButton`, the system decides the value. A `UILabel` or `UIButton` that isn't in a window reads `false`, whether VoiceOver is on or off (measured). What it reads once placed in a window is **not verified on a device**.
- Converted with `Boolean()` on write: `1`, non-empty strings, and objects are `true`; `0`, `''`, `null`, `undefined`, and `NaN` are `false`. So writing `'false'` gives `true`.
- There is no change event. On a `UIView`, only the app's own code changes it; on system controls the system computes the value when it is read, so you always read the current value.

## Examples

```js
const card = new UIView();
card.isAccessibilityElement = true;
card.accessibilityLabel = 'Balance $1,280.00';
console.log(card.isAccessibilityElement);
```

**Effect**: The console prints `true`. VoiceOver stops on the card and reads "Balance $1,280.00", instead of stopping on each line of text inside the card. **How VoiceOver reads it is not verified on a device.**

## Corresponding iOS API

`isAccessibilityElement`. In iOS it belongs to the `UIAccessibility` protocol and every object has it; in JS it exists only on `UIView` and its subclasses.

## See also

- [Making VoiceOver read your interface correctly](../../guides/accessibility.md): when to set it to `true`
- [`accessibilityLabel`](accessibilitylabel.md): the name the element is read out as
- [`accessibilityElementsHidden`](accessibilityelementshidden.md): hiding a whole block of subviews
