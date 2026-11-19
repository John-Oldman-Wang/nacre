---
type: reference
native: UIActivityViewController.excludedActivityTypes
---

# `UIActivityViewController`: `excludedActivityTypes` property

The **`excludedActivityTypes`** property lists system actions that don't appear in the share sheet.

## Value

An array of [names of system actions](../ui-activity-view-controller.md#names-of-system-actions), or `null`.

- Readable and writable.
- The default is `null`.
- Both `null` and an empty array exclude nothing. Writing an empty array reads back an empty array; writing `null` reads back `null`.
- Only system actions can be excluded. Share extensions from third-party apps can't be excluded.
- Set it before presenting. Whether changing it after the share sheet is on screen has any effect is **not verified in the simulator**.
- No event fires when it changes: only the app itself can change it.

### Invalid values

- The array contains a name not in the [names of system actions](../ui-activity-view-controller.md#names-of-system-actions): doesn't throw. The whole assignment has no effect, the property keeps its old value, and the console prints a warning `[Nacre] excludedActivityTypes has no value "<the name written>"; expected one of: …, ignored`, where the ellipsis is all the valid names.
- Neither an array nor `null` is given: throws `TypeError: excludedActivityTypes must be an array of names, got "airDrop"` (what follows `got` is the value actually given), and the old value is unchanged.

## Examples

```js
const sheet = new UIActivityViewController([new URL('https://example.com')]);
sheet.excludedActivityTypes = ['print', 'assignToContact', 'addToReadingList'];
console.log(sheet.excludedActivityTypes);
```

**Result**: The console prints these three names. The presented share sheet has no "Print", "Assign to Contact", or "Add to Reading List"; **the effect on the share sheet is not verified in the simulator**.

## Corresponding iOS API

`UIActivityViewController.excludedActivityTypes`. `UIActivityTypePrint` is written `'print'`, and likewise for the rest.

## See also

- [Names of system actions](../ui-activity-view-controller.md#names-of-system-actions)
- [`excludedActivitySectionTypes`](excludedactivitysectiontypes.md): hide a whole section
