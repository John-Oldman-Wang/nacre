---
type: reference
native: UITraitChangeEvent.previousTraitCollection
---

# `UITraitChangeEvent`: `previousTraitCollection` property

The **`previousTraitCollection`** property is the set of values from before the change.

## Value

A [`UITraitCollection`](../ui-trait-collection.md).

- Read-only. Assigning to it throws `TypeError`.
- The current values aren't on the event object; read them from `event.target.traitCollection`, which already holds the new values when the callback runs.
- Compare the two sets to find out which value changed.
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
const page = new UIViewController();
page.view.addEventListener('traitchange', (e) => {
  const before = e.previousTraitCollection.userInterfaceStyle;
  const now = page.view.traitCollection.userInterfaceStyle;
  if (before !== now) {
    console.log('切到了', now);
  }
});
```

**Effect**: switching dark mode in system settings prints `切到了` and the new style, for example `dark`.

## Corresponding iOS API

The `previousCollection` parameter of the handler block of `registerForTraitChanges:withHandler:`.

## See also

- [`UITraitChangeEvent`](../ui-trait-change-event.md)
