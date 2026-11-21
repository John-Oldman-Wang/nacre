---
type: reference
native: UIView.accessibilityValue
---

# `UIView`: `accessibilityValue` property

The **`accessibilityValue`** property is the current value VoiceOver reads out: the state the element is in now, or the amount it shows, such as "50%" or "3 items".

VoiceOver is the screen reader built into iOS; see [`isAccessibilityElement`](isaccessibilityelement.md).

## Value

A string, or `null`.

- Readable and writable.
- On `UIView` the default is `null`.
- Writing `null` or `undefined` clears it, and it reads `null`. Other values are converted with `String()`: writing `3` reads back `'3'`.
- VoiceOver reads the value after the [label](accessibilitylabel.md). This order comes from Apple's documentation and is **not verified on a device**.
- The value doesn't follow the interface by itself. When the number shown on screen changes, the app has to write the new value at the same time.
- There is no change event: only the app's own code changes it.

## Examples

A progress ring you draw yourself: the label says what it is, and the value says how far along it is:

```js
const ring = new UIView();
ring.isAccessibilityElement = true;
ring.accessibilityLabel = 'Upload progress';

/** @param {number} fraction 0 to 1 */
function setProgress(fraction) {
  ring.accessibilityValue = Math.round(fraction * 100) + '%';
}
setProgress(0.5);
console.log(ring.accessibilityValue);
```

**Effect**: The console prints `50%`. When VoiceOver stops on the ring it reads "Upload progress, 50%". **How VoiceOver reads it is not verified on a device.**

## Corresponding iOS API

`accessibilityValue`. In iOS it belongs to the `UIAccessibility` protocol and every object has it; in JS it exists only on `UIView` and its subclasses.

## See also

- [Making VoiceOver read your interface correctly](../../guides/accessibility.md#what-goes-in-the-label-hint-and-value): content that changes goes in the value, not the name
- [`accessibilityLabel`](accessibilitylabel.md), [`accessibilityHint`](accessibilityhint.md)
