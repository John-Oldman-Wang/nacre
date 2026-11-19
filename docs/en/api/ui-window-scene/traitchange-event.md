---
type: reference
native: "-[UIWindowScene registerForTraitChanges:withHandler:]"
---

# `UIWindowScene`: `traitchange` event

The **`traitchange`** event fires when the appearance traits of the whole scene change, for example when the system switches to dark mode.

## Syntax

```
scene.addEventListener('traitchange', (event) => { })
```

## Event object

A `UITraitChangeEvent`. Besides `type` and `target` (this scene), it has one more read-only field:

| Field | Type | Meaning |
| --- | --- | --- |
| `previousTraitCollection` | [`UITraitCollection`](../ui-trait-collection.md) | The set of values before the change. Read the current values from `event.target.traitCollection` |

Not cancelable.

## When it fires

Fires when a value in the scene's [`traitCollection`](traitcollection.md) changes. For which changes fire it and what to watch out for, see [Appearance traits](../ui-trait-collection.md).

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const scene = e.scene;
  scene.addEventListener('traitchange', (ev) => {
    const { previousTraitCollection } = /** @type {UITraitChangeEvent} */ (ev);
    console.log(previousTraitCollection.userInterfaceStyle, '→',
      scene.traitCollection.userInterfaceStyle);
  });
});
```

**Effect**: when the user switches from light to dark in Settings, logs `light → dark`. **Not verified in the simulator.**

## Corresponding iOS API

`traitCollectionDidChange:` of `UITraitEnvironment`, and `registerForTraitChanges:` from iOS 17 on.

## See also

- [Appearance traits](../ui-trait-collection.md)
