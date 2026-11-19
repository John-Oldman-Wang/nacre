---
type: reference
native: UIActivityViewController.excludedActivitySectionTypes
---

# `UIActivityViewController`: `excludedActivitySectionTypes` property

The **`excludedActivitySectionTypes`** property lists sections of the share sheet to hide entirely.

## Value

An array of section names. There is currently only one section name:

| Value | Meaning |
| --- | --- |
| `'peopleSuggestions'` | The row of contacts suggested by the system at the top of the share sheet |

- Readable and writable.
- The default is an empty array: no section is hidden.
- Set it before presenting. Whether changing it after the share sheet is on screen has any effect is **not verified in the simulator**.
- No event fires when it changes: only the app itself can change it.

### Invalid values

- The array contains an unknown name: doesn't throw. The whole assignment has no effect, the property keeps its old value, and the console prints a warning `[Nacre] excludedActivitySectionTypes has no value "apps"; expected one of: peopleSuggestions, ignored`.
- Something other than an array is given: throws `TypeError`.

## Examples

```js
const sheet = new UIActivityViewController(['some text']);
sheet.excludedActivitySectionTypes = ['peopleSuggestions'];
```

**Effect** (**not verified in the simulator**): The presented share sheet no longer shows contacts suggested by the system at the top.

## Corresponding iOS API

`UIActivityViewController.excludedActivitySectionTypes`. In ObjC it is the bitmask `UIActivitySectionTypesPeopleSuggestions`; here it is written as the array `['peopleSuggestions']`.

## See also

- [`excludedActivityTypes`](excludedactivitytypes.md): exclude individual system actions
