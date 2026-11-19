---
type: reference
native: UIFont.familyNames
---

# `UIFont.familyNames` static property

The **`familyNames`** static property is the names of all available font families.

## Value

An array of strings, such as `['Helvetica Neue', 'Menlo', …]`.

- Read-only. Assigning to it throws `TypeError`.
- Each read returns a new array.
- It includes the system's built-in families and the families of fonts registered in the app bundle. On the iPhone Air simulator (iOS 27.2) there are 86.
- No change notification: it does not change while the app is running.

To list the names of the fonts in a family (regular, bold, italic…), use [`fontNamesForFamilyName()`](fontnamesforfamilyname.md), then pass them to [`fontWithName()`](fontwithname.md).

## Examples

```js
console.log(UIFont.familyNames.includes('Helvetica Neue'));
```

**Result**: logs `true`.

## Corresponding iOS API

`UIFont.familyNames` (a class property).

## See also

- [`fontNamesForFamilyName()`](fontnamesforfamilyname.md)
- [`fontWithName()`](fontwithname.md)
