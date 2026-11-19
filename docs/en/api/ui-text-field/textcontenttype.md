---
type: reference
native: UITextField.textContentType
---

# `UITextField`: `textContentType` property

The **`textContentType`** property states what kind of content the field holds. The system uses it to offer suggestions above the keyboard, or to fill the field in for the user. It does not change how the keyboard looks.

## Value

A string, or `null`. There are 48 values. The "What the system does" column below is **not verified in the simulator**; cells left blank are those for which there is no reliable description here:

| Category | Value | Content | What the system does |
| --- | --- | --- | --- |
| Account | `'username'` | User name | Pairs with `'password'` to fill in a saved account |
| | `'password'` | An existing password | Same as above |
| | `'newPassword'` | A newly chosen password | Offers to generate a strong password and save it |
| | `'oneTimeCode'` | A one-time verification code | Fills in the code from a text message |
| Contact info | `'emailAddress'` | Email address | Suggests the user's own email address |
| | `'telephoneNumber'` | Phone number | Suggests the user's own number |
| | `'url'` | URL | |
| Name | `'name'` | Full name | Suggests the user's own name |
| | `'namePrefix'` | Name prefix, such as "Dr." | |
| | `'givenName'` | Given name | |
| | `'middleName'` | Middle name | |
| | `'familyName'` | Family name | |
| | `'nameSuffix'` | Name suffix, such as "Jr." | |
| | `'nickname'` | Nickname | |
| | `'jobTitle'` | Job title | |
| | `'organizationName'` | Company or organization name | |
| Address | `'location'` | Place name | Fills in a saved address |
| | `'fullStreetAddress'` | Full street address | Same as above |
| | `'streetAddressLine1'` | Street address, line 1 | Same as above |
| | `'streetAddressLine2'` | Street address, line 2 | Same as above |
| | `'addressCity'` | City | Same as above |
| | `'addressState'` | Province or state | Same as above |
| | `'addressCityAndState'` | City plus province or state | Same as above |
| | `'sublocality'` | District | Same as above |
| | `'countryName'` | Country | Same as above |
| | `'postalCode'` | Postal code | Same as above |
| Payment card | `'creditCardNumber'` | Card number | Fills in a saved card, or scans the card number with the camera |
| | `'creditCardName'` | Cardholder's full name | Fills in a saved card |
| | `'creditCardGivenName'` | Cardholder's given name | Same as above |
| | `'creditCardMiddleName'` | Cardholder's middle name | Same as above |
| | `'creditCardFamilyName'` | Cardholder's family name | Same as above |
| | `'creditCardExpiration'` | Expiration date | Same as above |
| | `'creditCardExpirationMonth'` | Expiration month | Same as above |
| | `'creditCardExpirationYear'` | Expiration year | Same as above |
| | `'creditCardSecurityCode'` | Security code | Same as above |
| | `'creditCardType'` | Card type | Same as above |
| Date | `'birthdate'` | Birthday | |
| | `'birthdateDay'` | Day of the birthday | |
| | `'birthdateMonth'` | Month of the birthday | |
| | `'birthdateYear'` | Year of the birthday | |
| | `'dateTime'` | Date and time | |
| Shipping and travel | `'shipmentTrackingNumber'` | Package tracking number | |
| | `'flightNumber'` | Flight number | |
| Device | `'cellularEID'` | The eSIM's EID | |
| | `'cellularIMEI'` | The device's IMEI | |
| | `'cellularIMEI1'` | The first IMEI | |
| | `'cellularIMEI2'` | The second IMEI | |
| | `'cellularNAL'` | The cellular network's NAL | |

- Readable and writable.
- The default is `null`, meaning not configured.
- Write `null` to clear it.
- Without it there is no AutoFill, and the user has to type everything by hand.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing a value not in the table does not throw: the console prints a warning listing all available values, and the property keeps its previous value.

```
[Nacre] textContentType has no value "x"; expected one of: …, ignored
```

## Examples

### Account and password

```js
const account = new UITextField();
account.textContentType = 'username';
const secret = new UITextField();
secret.textContentType = 'password';
secret.isSecureTextEntry = true;
```

**Effect**: When either field is tapped, a bar appears above the keyboard listing accounts saved in the system. When the user picks one, both fields are filled in together. **Not verified in the simulator.**

### Verification code from a text message

```js
const code = new UITextField();
code.keyboardType = 'numberPad';
code.textContentType = 'oneTimeCode';
```

**Effect**: After the phone receives a text message containing a verification code, the code appears above the keyboard, and one tap fills it into the field. **Not verified in the simulator.**

## Corresponding iOS API

`UITextField.textContentType`. `UITextContentTypeOneTimeCode` is written `'oneTimeCode'`, and likewise for the rest; `nil` is written `null`.

## See also

- [`isSecureTextEntry`](issecuretextentry.md)
- [`keyboardType`](keyboardtype.md)
