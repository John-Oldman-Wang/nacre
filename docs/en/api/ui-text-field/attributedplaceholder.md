---
type: reference
native: UITextField.attributedPlaceholder
---

# `UITextField`: `attributedPlaceholder` property

The **`attributedPlaceholder`** property is a styled placeholder, used to change the placeholder's color and font.

## Value

An [`NSAttributedString`](../ns-attributed-string.md), or `null`.

- Readable and writable.
- The default is `null`.
- Write `null` to remove the placeholder.
- It shares its content with [`placeholder`](placeholder.md): after writing it, `placeholder` reads as its plain text; after writing `placeholder` again, its text changes to match.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing a value that is not an `NSAttributedString` (such as a string) throws a `TypeError` whose message contains `attributedPlaceholder`.

## Examples

```js
const field = new UITextField();
field.attributedPlaceholder = new NSAttributedString('Enter your phone number', {
  foregroundColor: 'systemOrange',
});
console.log(field.placeholder);
```

**Effect**: When the text field is empty, it shows "Enter your phone number" in orange. The console prints `Enter your phone number`. The orange color is **not verified in the simulator**.

## Corresponding iOS API

`UITextField.attributedPlaceholder`.

## See also

- [`placeholder`](placeholder.md)
- [Attributed strings](../ns-attributed-string.md)
