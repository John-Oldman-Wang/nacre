---
type: reference
native: "+[UIFont fontWithName:size:]"
---

# `UIFont.fontWithName()` static method

The **`UIFont.fontWithName()`** static method gets a font installed on the system by name. Returns `null` when the system has no font with that name.

## Syntax

```
UIFont.fontWithName(name, { size })
```

### Parameters

**`name`**

A string. It can be a font family name (such as `'Helvetica'`) or a specific font name (such as `'Helvetica-Bold'`). Only fonts that come with the system can be used; font files bundled with the app cannot be used yet. Which font names the system has cannot currently be listed in JS; consult Apple's resources.

**`options.size`**

Required. The font size, a number in [pt](../units.md).

### Return value

A `UIFont`. Returns `null`, without throwing, when the system has no font with that name.

There is no fallback list: you can specify only one name at a time, and what to use instead when it is not found is up to the app's code.

Whether getting the same name twice returns the same object is not guaranteed. To compare two named fonts, compare [`fontName`](fontname.md) and [`pointSize`](pointsize.md), not `===`.

### Exceptions

**`TypeError`**

`options` was not passed, or `options` has no `size`:

```
TypeError: fontWithName needs { size }
```

"Font not found" returns `null`; only "wrong call" throws.

## Examples

### Getting a font, with no substitute when not found

```js
const label = new UILabel();
const helvetica = UIFont.fontWithName('Helvetica', { size: 17 });
if (helvetica) {
  label.font = helvetica;
}
```

**Effect**: when the system has this font, the text changes to 17 pt Helvetica. **Not verified in the simulator.**

### A name that does not exist

```js
const missing = UIFont.fontWithName('NoSuchFont', { size: 17 });
console.log(missing);
```

**Result**: the console logs `null`.

## Corresponding iOS API

`+[UIFont fontWithName:size:]`. The second part, `size:`, goes into the options object.

## See also

- [Where fonts come from](../ui-font.md#where-fonts-come-from)
- [`fontName`](fontname.md)
