---
type: reference
native: "-[UIViewController traitCollectionDidChange:]"
---

# `UIViewController`: `traitchange` event

The **`traitchange`** event fires when the view controller's appearance traits change, such as switching to dark mode or changing the text size.

## Syntax

```
page.addEventListener('traitchange', (event) => { })
```

## Event object

[`UITraitChangeEvent`](../ui-trait-change-event.md). Besides `type` and `target` (this view controller), it has one more read-only field:

| Field | Type | Meaning |
| --- | --- | --- |
| [`previousTraitCollection`](../ui-trait-change-event/previoustraitcollection.md) | [`UITraitCollection`](../ui-trait-collection.md) | The set of values before the change. Read the current values from `event.target.traitCollection` |

Not cancelable.

## When it fires

When any value in the view controller's [`traitCollection`](traitcollection.md) changes, including when [`overrideUserInterfaceStyle`](overrideuserinterfacestyle.md) is changed. For which changes fire it and what to watch for, see [Appearance traits](../ui-trait-collection.md).

## Examples

```js
const page = new UIViewController();
page.addEventListener('traitchange', (event) => {
  const { previousTraitCollection } = event;
  console.log(previousTraitCollection.userInterfaceStyle, '→',
    page.traitCollection.userInterfaceStyle);
});
page.overrideUserInterfaceStyle = 'dark';
```

**Effect**: When the view controller is on screen and was light, prints `light → dark`. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIViewController traitCollectionDidChange:]`, and from iOS 17, `registerForTraitChanges:`.

## See also

- [Appearance traits](../ui-trait-collection.md)
