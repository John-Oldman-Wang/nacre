---
type: reference
native: "-[UIScreen snapshotViewAfterScreenUpdates:]"
---

# `UIScreen`: `snapshotViewAfterScreenUpdates()` method

The **`snapshotViewAfterScreenUpdates()`** method captures the screen's current contents as a view.

## Syntax

```
snapshotViewAfterScreenUpdates(afterUpdates)
```

## Parameters

**`afterUpdates`**

A boolean, converted with `Boolean()`.

- `false`: captures what is already displayed on screen.
- `true`: waits for changes not yet drawn to finish drawing, then captures.

## Return value

A [`UIView`](../ui-view.md): a new view showing the captured contents. It is a static image; later changes on screen are not reflected in it.

## Exceptions

None.

## Description

The returned view is not yet in any view hierarchy; to show it, add it to some view. It is suited to covering the original content before a transition and removing it afterward. The size and contents of the captured view are **not verified in the simulator**; only that a `UIView` is returned is verified.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const snapshot = e.scene.screen.snapshotViewAfterScreenUpdates(false);
  console.log(snapshot instanceof UIView);
});
```

**Result**: logs `true`.

## Corresponding iOS API

`-[UIScreen snapshotViewAfterScreenUpdates:]`.

## See also

- [`UIView`](../ui-view.md)
