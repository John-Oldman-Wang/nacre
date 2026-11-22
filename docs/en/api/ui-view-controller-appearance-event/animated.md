---
type: reference
native: UIViewControllerAppearanceEvent.animated
---

# `UIViewControllerAppearanceEvent`: `animated` property

The **`animated`** property tells whether this appearance or disappearance comes with a transition animation.

## Value

A boolean.

- Read-only. Assigning to it throws `TypeError`.
- `true`: there is a transition animation, such as the slide when pushing or popping.
- `false`: no animation; the page appears or disappears directly.
- The value comes from the `animated` option given when pushing, popping, presenting, or dismissing.
- When the event is created with [`new`](constructor.md) without it, it is `false`.

## Examples

```js
const page = new UIViewController();
page.addEventListener('beforeappear', (e) => {
  console.log('即将出现，带动画：' + e.animated);
});
```

**Effect**: each time the page is about to appear, prints whether this time is animated.

## Corresponding iOS API

The `animated` parameter of the `viewWillAppear:` family of methods.

## See also

- [`UIViewControllerAppearanceEvent`](../ui-view-controller-appearance-event.md)
