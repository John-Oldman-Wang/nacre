---
type: reference
native: UIView.shouldGroupAccessibilityChildren
---

# `UIView`: `shouldGroupAccessibilityChildren` property

The **`shouldGroupAccessibilityChildren`** property determines whether VoiceOver treats the elements inside this view as one group: it finishes the group before moving on to elements elsewhere.

VoiceOver is the screen reader built into iOS; see [`isAccessibilityElement`](isaccessibilityelement.md). By default VoiceOver orders elements by their position on screen, top to bottom and left to right within each row, regardless of which superview they belong to.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | VoiceOver reads all the elements inside this view in a row, then moves on to the elements outside it |
| `false` | The elements inside this view are ordered together with the elements outside it by screen position |

The effects of both values come from Apple's documentation and are **not verified on a device**.

- Readable and writable.
- The default is `false`.
- Converted with `Boolean()` on write: `1`, non-empty strings, and objects are `true`; `0`, `''`, `null`, `undefined`, and `NaN` are `false`. So writing `'false'` gives `true` (measured).
- VoiceOver still stops on the elements in the group one at a time. To merge several views into one element that is read in one go, use [`isAccessibilityElement`](isaccessibilityelement.md).
- There is no change event: only the app's own code changes it.

## Examples

Two columns side by side, each a vertical stack of text. Without grouping, VoiceOver alternates left and right row by row; with each column made a group, it finishes the left column before reading the right one:

```js
const left = new UIView();
const right = new UIView();
left.shouldGroupAccessibilityChildren = true;
right.shouldGroupAccessibilityChildren = true;
console.log(left.shouldGroupAccessibilityChildren);
```

**Effect**: The console prints `true`. VoiceOver reads all the text in `left`, then the text in `right`. **The VoiceOver effect is not verified on a device.**

## Corresponding iOS API

`shouldGroupAccessibilityChildren`. In iOS it belongs to the `UIAccessibility` protocol and every object has it; in JS it exists only on `UIView` and its subclasses.

## See also

- [Making VoiceOver read your interface correctly](../../guides/accessibility.md)
- [`isAccessibilityElement`](isaccessibilityelement.md): merging several views into one element
