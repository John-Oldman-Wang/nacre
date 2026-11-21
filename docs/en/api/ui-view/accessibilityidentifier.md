---
type: reference
native: UIView.accessibilityIdentifier
---

# `UIView`: `accessibilityIdentifier` property

The **`accessibilityIdentifier`** property is an identifier that automated UI tests use to find elements. Automated UI tests are programs that simulate the user's taps and typing to test the app's interface, such as XCUITest, which comes with Xcode; they use this identifier to find the view to act on.

## Value

A string, or `null`.

- Readable and writable.
- On `UIView` the default is `null`.
- Writing `null` or `undefined` clears it, and it reads `null`. Other values are converted with `String()`.
- VoiceOver doesn't read it, and users don't see it. According to Apple's documentation, it is kept separate from the [label](accessibilitylabel.md) precisely so that the label can be translated and reworded at any time while the identifier used by test code stays the same.
- It doesn't have to be unique; the runtime doesn't check for duplicates.
- There is no change event: only the app's own code changes it.

## Examples

```js
const submit = UIButton.buttonWithType('system');
submit.setTitle('Place order', { forState: ['normal'] });
submit.accessibilityIdentifier = 'checkout-submit';
console.log(submit.accessibilityIdentifier);
```

**Effect**: The console prints `checkout-submit`. If the button's title later changes, or is translated into another language, test code still finds it by `checkout-submit`.

## Corresponding iOS API

`accessibilityIdentifier`. In iOS it belongs to the `UIAccessibilityIdentification` protocol; in JS it exists only on `UIView` and its subclasses.

## See also

- [`tag`](tag.md): the app's own code finding views by an integer number
- [`accessibilityLabel`](accessibilitylabel.md): the name VoiceOver reads out
