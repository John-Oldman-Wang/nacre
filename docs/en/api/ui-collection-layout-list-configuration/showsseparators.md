---
type: reference
native: UICollectionLayoutListConfiguration.showsSeparators
---

# `UICollectionLayoutListConfiguration`: `showsSeparators` property

The **`showsSeparators`** property indicates whether separators are drawn between rows.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Separators are drawn between rows |
| `false` | Not drawn |

- Readable and writable.
- The default is `true`.
- The configuration is copied into the layout the moment it is handed to `layoutWithListConfiguration()`. Changing it afterward does not change lists already created.

## Examples

```js
const config = new UICollectionLayoutListConfiguration('insetGrouped');
config.showsSeparators = false;
const list = new UICollectionView(UICollectionViewCompositionalLayout.layoutWithListConfiguration(config));
```

**Effect**: The list has no separators between rows. **Not verified in the simulator.**

## Corresponding iOS API

`UICollectionLayoutListConfiguration.showsSeparators`.

## See also

- [`backgroundColor`](backgroundcolor.md)
