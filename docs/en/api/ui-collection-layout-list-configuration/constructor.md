---
type: reference
native: "-[UICollectionLayoutListConfiguration initWithAppearance:]"
---

# `UICollectionLayoutListConfiguration()` constructor

The **`UICollectionLayoutListConfiguration()`** constructor creates a list layout configuration with an appearance.

## Syntax

```
new UICollectionLayoutListConfiguration(appearance)
```

### Parameters

**`appearance`**

The appearance, a string; required:

| Value | Effect |
| --- | --- |
| `'plain'` | Each row spans the full width, with no gap between sections |
| `'grouped'` | Gaps between sections, rows span the full width |
| `'insetGrouped'` | Each section is a rounded card inset from both sides. The kind of list in the system Settings |
| `'sidebar'` | Sidebar style |
| `'sidebarPlain'` | Sidebar style, with no section background |

All five appearances can be created (measured); how they look on screen is **not verified in the simulator**.

### Return value

A new configuration. [`showsSeparators`](showsseparators.md) is `true`, [`backgroundColor`](backgroundcolor.md) is `null`, and [`headerMode`](headermode.md) is `'none'` (measured).

### Exceptions

**`TypeError`**

`appearance` is missing, or is not a value in the table above (measured). The error message lists all available values.

## Examples

```js
const config = new UICollectionLayoutListConfiguration('insetGrouped');
console.log(config.appearance, config.showsSeparators);
```

**Result**: Prints `insetGrouped true`.

## Corresponding iOS API

`[[UICollectionLayoutListConfiguration alloc] initWithAppearance:UICollectionLayoutListAppearanceInsetGrouped]`. `UICollectionLayoutListAppearanceInsetGrouped` is written `'insetGrouped'`.

## See also

- [`appearance`](appearance.md)
