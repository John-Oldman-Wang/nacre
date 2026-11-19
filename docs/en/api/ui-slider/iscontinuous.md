---
type: reference
native: UISlider.continuous
---

# `UISlider`: `isContinuous` property

The **`isContinuous`** property determines when [`change`](../ui-control/change-event.md) fires while the user drags the slider.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | `change` fires continuously during the drag, once per movement |
| `false` | Nothing fires during the drag; it fires once on release |

The effects of both values are **not verified in the simulator**.

- Readable and writable.
- Defaults to `true`.
- Writes are converted by JS truthiness.

Use `true` when you only update a number on screen during the drag. Use `false` for things like network requests or saving, so each drag is handled only once.

This property has no change notification; only your code changes it.

## Examples

```js
const slider = new UISlider();
slider.maximumValue = 100;
slider.isContinuous = false;
slider.addEventListener('change', () => {
  console.log('Selected', Math.round(slider.value));
});
```

**Effect**: Nothing is printed during the drag. On release it prints once, for example `Selected 72`. **Not verified in the simulator.**

## Corresponding iOS API

`UISlider.continuous`; its getter is `isContinuous`.

## See also

- The [`change`](../ui-control/change-event.md) event
