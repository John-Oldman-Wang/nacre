---
type: reference
native: UIScreen.traitCollection
---

# `UIScreen`: `traitCollection` property

The **`traitCollection`** property is this screen's traits: dark or light, screen scale, and so on.

## Value

A [`UITraitCollection`](../ui-trait-collection.md).

- Read-only. Assigning to it throws `TypeError`.
- Each read gives the traits as of that moment.
- Its `displayScale` is the same as [`scale`](scale.md).
- Screens have no trait change event. To be notified when switching between dark and light, listen for the scene's [`traitchange`](../ui-window-scene/traitchange-event.md).

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.traitCollection.displayScale);
});
```

**Result**: on the iPhone Air simulator (iOS 27.2), logs `3`.

## Corresponding iOS API

`UIScreen.traitCollection` (the `UITraitEnvironment` protocol).

## See also

- [Traits](../ui-trait-collection.md)
- [`traitCollection` of `UIWindowScene`](../ui-window-scene/traitcollection.md)
