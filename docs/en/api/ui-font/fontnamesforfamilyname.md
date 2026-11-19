---
type: reference
native: "+[UIFont fontNamesForFamilyName:]"
---

# `UIFont.fontNamesForFamilyName()` static method

The **`fontNamesForFamilyName()`** static method lists the names of the fonts in a font family.

## Syntax

```
UIFont.fontNamesForFamilyName(familyName)
```

## Parameters

**`familyName`**

The family name, a string, taken from [`familyNames`](familynames.md). Converted as a string: `null` and `undefined` become the empty string.

## Return value

An array of strings: the names of the fonts in this family, which can be passed to [`fontWithName()`](fontwithname.md). An empty array for an unrecognized family.

## Exceptions

None.

## Examples

```js
const faces = UIFont.fontNamesForFamilyName('Helvetica Neue');
console.log(faces.includes('HelveticaNeue'));
const font = UIFont.fontWithName(faces[0], { size: 17 });
console.log(font !== null);
```

**Result**: logs `true` and then `true`.

## Corresponding iOS API

`+[UIFont fontNamesForFamilyName:]`.

## See also

- [`familyNames`](familynames.md)
- [`fontWithName()`](fontwithname.md)
