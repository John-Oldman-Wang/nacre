---
type: reference
native: UITextView.dataDetectorTypes
---

# `UITextView`: `dataDetectorTypes` property

The **`dataDetectorTypes`** property determines which kinds of content in the text become tappable links, such as phone numbers and URLs.

## Value

An array of strings, each one of the following:

| Value | What it detects |
| --- | --- |
| `'phoneNumber'` | Phone numbers |
| `'link'` | URLs |
| `'address'` | Addresses |
| `'calendarEvent'` | Dates and times |
| `'shipmentTrackingNumber'` | Shipment tracking numbers |
| `'flightNumber'` | Flight numbers |
| `'lookupSuggestion'` | Words that can be looked up |
| `'money'` | Amounts of money |
| `'physicalValue'` | Quantities with units |

- Readable and writable. Reading returns an array of names.
- According to Apple's documentation, detected content is tappable only when [`isEditable`](iseditable.md) is `false`. **Not verified in the simulator.**
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after its original value is written back; the default value and the effect of each value are **not verified in the simulator**, and usage follows Apple's documentation.
- There is no change event: only the app's own code changes it.

### Invalid values

If the array contains a name that isn't recognized, the whole assignment has no effect, and the console logs a warning listing all valid values. See [Enums](../enums.md).

## Examples

```js
const input = new UITextView();
input.isEditable = false;
input.dataDetectorTypes = ['phoneNumber', 'link'];
input.text = 'Phone 010-12345678, website https://example.com';
```

**Effect**: the phone number and URL appear as tappable links. **Not verified in the simulator.**

## Corresponding iOS API

`UITextView.dataDetectorTypes`. The bitmask is written as an array of names: `UIDataDetectorTypePhoneNumber | UIDataDetectorTypeLink` is written `['phoneNumber', 'link']`.

## See also

- [`isEditable`](iseditable.md)
