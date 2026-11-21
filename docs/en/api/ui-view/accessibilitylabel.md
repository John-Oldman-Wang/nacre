---
type: reference
native: UIView.accessibilityLabel
---

# `UIView`: `accessibilityLabel` property

The **`accessibilityLabel`** property is the name VoiceOver reads out: it says what the element is, such as "Close", "Search", or "Balance".

VoiceOver is the screen reader built into iOS; see [`isAccessibilityElement`](isaccessibilityelement.md).

## Value

A string, or `null`.

- Readable and writable.
- On `UIView` the default is `null`.
- Writing `null` or `undefined` clears it, and it reads `null`. Other values are converted with `String()`: writing `5` reads back `'5'`.
- On a `UILabel` where it has never been set, it reads the label's displayed text while VoiceOver is on, and `null` while VoiceOver is off (measured). Once set, it reads the value you set and no longer follows the text (measured).
- When VoiceOver stops on an element, it reads the label first, then the [value](accessibilityvalue.md), [traits](accessibilitytraits.md), and [hint](accessibilityhint.md). This order comes from Apple's documentation and is **not verified on a device**.
- There is no change event: only the app's own code changes it. On a `UILabel` where it has never been set, the text it reads is computed at the moment it is read, so it follows `text`.

## Examples

A button with only an icon and no text gives VoiceOver nothing to read, so it needs a label:

```js
const close = UIButton.buttonWithType('system');
close.setImage(UIImage.systemImageNamed('xmark'), { forState: ['normal'] });
close.accessibilityLabel = 'Close';
console.log(close.accessibilityLabel);
```

**Effect**: The console prints `Close`. When VoiceOver stops on this button it reads "Close", then says it is a button. **How VoiceOver reads it is not verified on a device.**

## Corresponding iOS API

`accessibilityLabel`. In iOS it belongs to the `UIAccessibility` protocol and every object has it; in JS it exists only on `UIView` and its subclasses.

## See also

- [Making VoiceOver read your interface correctly](../../guides/accessibility.md#what-goes-in-the-label-hint-and-value): what to put in a label and what to leave out
- [`accessibilityHint`](accessibilityhint.md), [`accessibilityValue`](accessibilityvalue.md)
- [`isAccessibilityElement`](isaccessibilityelement.md)
