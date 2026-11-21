---
type: reference
native: UIView.accessibilityHint
---

# `UIView`: `accessibilityHint` property

The **`accessibilityHint`** property is the hint VoiceOver reads after the name: it says what happens when the user activates this element, such as "Opens the order details".

VoiceOver is the screen reader built into iOS; see [`isAccessibilityElement`](isaccessibilityelement.md).

## Value

A string, or `null`.

- Readable and writable.
- On `UIView` the default is `null`.
- Writing `null` or `undefined` clears it, and it reads `null`. Other values are converted with `String()`.
- When VoiceOver stops on an element, it reads the [label](accessibilitylabel.md), [value](accessibilityvalue.md), and [traits](accessibilitytraits.md), pauses briefly, then reads the hint. Users can turn hints off in the system settings; then the hint is not read. Both points come from Apple's documentation and are **not verified on a device**.
- There is no change event: only the app's own code changes it.

## Examples

```js
const row = new UIView();
row.isAccessibilityElement = true;
row.accessibilityLabel = 'Order 1024, awaiting shipment';
row.accessibilityHint = 'Opens the order details';
console.log(row.accessibilityHint);
```

**Effect**: The console prints `Opens the order details`. VoiceOver stops on this row, reads "Order 1024, awaiting shipment", and a moment later reads "Opens the order details". **How VoiceOver reads it is not verified on a device.**

## Corresponding iOS API

`accessibilityHint`. In iOS it belongs to the `UIAccessibility` protocol and every object has it; in JS it exists only on `UIView` and its subclasses.

## See also

- [Making VoiceOver read your interface correctly](../../guides/accessibility.md#what-goes-in-the-label-hint-and-value): what to put in a hint
- [`accessibilityLabel`](accessibilitylabel.md), [`accessibilityValue`](accessibilityvalue.md)
