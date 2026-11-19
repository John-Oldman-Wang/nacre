---
type: reference
native: UITextField.keyboardType
---

# `UITextField`: `keyboardType` property

The **`keyboardType`** property decides which keyboard appears when the user taps the text field.

## Value

A string, one of these 13:

| Value | Keyboard shown |
| --- | --- |
| `'default'` | The standard keyboard for the current input method |
| `'asciiCapable'` | A keyboard that can type only English letters, digits, and symbols |
| `'numbersAndPunctuation'` | The standard keyboard, opened on the digits and punctuation page |
| `'url'` | For entering URLs: has `.`, `/`, and `.com` keys, and no space bar |
| `'numberPad'` | Only 0 through 9 |
| `'phonePad'` | A phone dial pad: 0 through 9, `*`, `#` |
| `'namePhonePad'` | For entering a person's name or phone number: a letter keyboard that can switch to the dial pad |
| `'emailAddress'` | For entering email addresses: has `@` and `.` keys |
| `'decimalPad'` | 0 through 9 plus a decimal point |
| `'twitter'` | The standard keyboard plus `@` and `#` keys |
| `'webSearch'` | For entering search terms or URLs: has a space bar and a `.` key |
| `'asciiCapableNumberPad'` | Only 0 through 9, and outputs only ASCII digits |
| `'alphabet'` | The old name for `'asciiCapable'`, with the same effect |

- Readable and writable.
- The default is `'default'`.
- The keyboard each value brings up is **not verified in the simulator**. What the acceptance tests verify: every value can be written and read back, and on an invalid value the property keeps its previous value and a warning is printed.
- It only decides which keyboard appears and does not validate the content. The user can still paste other characters in, and with a hardware keyboard connected can type any character. When you need validation, listen for [`beforeinput`](beforeinput-event.md), or check `text` in `input`.
- The `'numberPad'`, `'decimalPad'`, and `'phonePad'` keyboards have no Return key, so the user cannot press Return to dismiss the keyboard. **Not verified in the simulator.** Provide another way to dismiss the keyboard; see [Dismissing the keyboard](../../guides/text-fields.md#dismissing-the-keyboard).
- There is no change event: only the app's own code changes it.

### Invalid values

Writing a value not in the table does not throw: the console prints a warning listing all available values, and the property keeps its previous value.

```
[Nacre] keyboardType has no value "x"; expected one of: …, ignored
```

## Examples

```js
const field = new UITextField();
field.keyboardType = 'numberPad';
// @ts-expect-error deliberately wrong
field.keyboardType = 'numeric';
console.log(field.keyboardType);
```

**Effect**

- Tapping the text field brings up a number keyboard with only 0 through 9. **Not verified in the simulator.**
- The console first prints the warning `[Nacre] keyboardType has no value "numeric"; expected one of: …, ignored`, where the ellipsis stands for the 13 available values.
- It then prints `numberPad`: the invalid assignment had no effect.

## Corresponding iOS API

`UITextField.keyboardType`. `UIKeyboardTypeNumberPad` is written `'numberPad'`, and likewise for the rest.

## See also

- [`returnKeyType`](returnkeytype.md)
- [Enums](../enums.md)
