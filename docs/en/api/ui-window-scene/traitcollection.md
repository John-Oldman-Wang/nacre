---
type: reference
native: UIWindowScene.traitCollection
---

# `UIWindowScene`: `traitCollection` property

The **`traitCollection`** property is the appearance traits of the whole scene. To find out whether Settings is currently set to dark or light, read its `userInterfaceStyle`.

## Value

A [`UITraitCollection`](../ui-trait-collection.md).

- Read-only. Assigning to it throws `TypeError`.
- Fires the [`traitchange`](traitchange-event.md) event when it changes.
- For the possible values, see [Appearance traits](../ui-trait-collection.md).

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  console.log(e.scene.traitCollection.userInterfaceStyle);
});
```

**Result**: logs whether the system is currently light or dark, such as `light`.

## Corresponding iOS API

`UIWindowScene.traitCollection`.

## See also

- [Appearance traits](../ui-trait-collection.md)
