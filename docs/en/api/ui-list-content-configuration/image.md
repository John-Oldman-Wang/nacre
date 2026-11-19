---
type: reference
native: UIListContentConfiguration.image
---

# `UIListContentConfiguration`: `image` property

The **`image`** property is the image to the left of the text.

## Value

A [`UIImage`](../ui-image.md), or `null`.

- Readable and writable.
- Defaults to `null`.
- Writing `null` clears it (verified by testing).

### Invalid values

Writing an object that is not a `UIImage` (a view, for example) throws `TypeError` (verified by testing).

## Examples

```js
const content = UIListContentConfiguration.subtitleCellConfiguration();
content.image = UIImage.systemImageNamed('star');
content.text = 'Favorites';
```

**Effect**: a star icon appears to the left of "Favorites".

## Corresponding iOS API

`UIListContentConfiguration.image`.

## See also

- [`UIImage`](../ui-image.md)
