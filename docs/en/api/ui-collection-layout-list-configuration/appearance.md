---
type: reference
native: UICollectionLayoutListConfiguration.appearance
---

# `UICollectionLayoutListConfiguration`: `appearance` property

The **`appearance`** property is the appearance given when the configuration was created.

## Value

A string:

| Value | Effect |
| --- | --- |
| `'plain'` | Each row spans the full width, with no gap between sections |
| `'grouped'` | Gaps between sections, rows span the full width |
| `'insetGrouped'` | Each section is a rounded card inset from both sides. The kind of list in the system Settings |
| `'sidebar'` | Sidebar style |
| `'sidebarPlain'` | Sidebar style, with no section background |

All five appearances can be created (measured); how they look on screen is **not verified in the simulator**.

- Read-only; assigning to it throws `TypeError` (measured). For a different appearance, create a new configuration.

## Examples

```js
const config = new UICollectionLayoutListConfiguration('insetGrouped');
console.log(config.appearance);
```

**Result**: Prints `insetGrouped`.

## Corresponding iOS API

`UICollectionLayoutListConfiguration.appearance`.

## See also

- [`UICollectionLayoutListConfiguration()`](constructor.md)
