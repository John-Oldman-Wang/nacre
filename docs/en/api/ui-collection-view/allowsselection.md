---
type: reference
native: UICollectionView.allowsSelection
---

# `UICollectionView`: `allowsSelection` property

The **`allowsSelection`** property indicates whether the user can select items in the list.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | The user can select items |
| `false` | Tapping does nothing, and [`itemselect`](itemselect-event.md) doesn't fire |

- Readable and writable.
- Defaults to `true`.
- No change event: only the app's own code changes it.

## Examples

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
list.allowsSelection = false;
```

**Effect**: tapping a row does nothing. **Not verified in the simulator.**

## Corresponding iOS API

`UICollectionView.allowsSelection`.

## See also

- [`allowsMultipleSelection`](allowsmultipleselection.md)
