---
type: reference
native: "-[UIView registerForTraitChanges:withHandler:]"
---

# `UIView`: `traitchange` event

The **`traitchange`** event fires when the view's traits (light or dark appearance, display scale, text size, and so on) change.

`UIViewController` and `UIWindowScene` have an event of the same name. Subclasses of `UIView` ([`UIButton`](../ui-button.md), [`UIScrollView`](../ui-scroll-view.md), and so on) can all listen for it.

## Syntax

```
view.addEventListener('traitchange', (event) => { })
```

## Event object

[`UITraitChangeEvent`](../ui-trait-change-event.md). Besides `type` and `target`, it has one more field:

**[`previousTraitCollection`](../ui-trait-change-event/previoustraitcollection.md)**

[`UITraitCollection`](../ui-trait-collection.md): the set of values before the change. The current values aren't on the event object; read them from `event.target.traitCollection`, which already holds the new values when the callback runs.

The event can't be canceled.

## When it fires

- Fires when any of the seven items of `UITraitCollection` changes in this view's traits.
- Fires when the system switches between light and dark; when writing [`overrideUserInterfaceStyle`](overrideuserinterfacestyle.md) changes this view's appearance; and when the user changes the system text size. All three are checked in the simulator.
- Whether it fires when the other four items (the two size classes, contrast, and layout direction) change is **not verified in the simulator**.
- It fires once per change, and only when the traits actually change. Whether it fires when `overrideUserInterfaceStyle` is written with the same value as the current actual appearance is **not verified in the simulator**.
- The callback doesn't run synchronously at the moment of the change; it runs a little later. See [How the runtime works](../how-it-works.md).
- The event fires on the view being listened to and doesn't propagate through the view hierarchy. When a view's traits change, the values its subviews read change too (verified); whether a listener on a subview receives its own event is **not verified in the simulator**.

This is the only event `UIView` itself fires. Touches don't produce `UIView` events; to respond to touches, use a [gesture recognizer](../ui-gesture-recognizer.md) or a subclass of [`UIControl`](../ui-control.md).

## Examples

```js
const page = new UIViewController();
page.view.addEventListener('traitchange', (event) => {
  console.log(event.previousTraitCollection.userInterfaceStyle);
  console.log(page.view.traitCollection.userInterfaceStyle);
});
```

**Effect**: When switching from light to dark, logs `light`, then `dark`.

## Corresponding iOS API

`-[UIView registerForTraitChanges:withHandler:]`, and the older `traitCollectionDidChange:`. Here it is written `addEventListener('traitchange', …)`.

## See also

- [Traits](../ui-trait-collection.md)
- [`traitCollection`](traitcollection.md)
