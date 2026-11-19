---
type: reference
native: UIOpenURLContext scene
---

# `OpenURLEvent`: `scene` property

The **`scene`** property is the scene the system handed this URL to.

## Value

A [`UIWindowScene`](../ui-window-scene.md).

- Read-only; assigning to it throws `TypeError`.
- It is the same object `sceneconnect` gives, so it can be compared with `===`. Use it to find the UI in that scene.

## Examples

```js
/** @type {Map<UIWindowScene, UINavigationController>} */
const navigators = new Map();

application.addEventListener('openurl', (e) => {
  const nav = navigators.get(e.scene);
  console.log(nav === undefined ? 'This scene has no UI yet' : 'Found the UI');
});
```

**Effect** (**not verified in the simulator**): Finds the navigation controller recorded earlier for the scene. For the complete pattern, see the guide [Handling links that open the app](../../guides/open-links.md).

## Corresponding iOS API

The `scene` parameter of `scene:openURLContexts:`.

## See also

- [`sceneconnect`](../application/sceneconnect-event.md)
