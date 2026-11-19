---
type: reference
native: UISwitch.isOn
---

# `UISwitch`: `isOn` property

The **`isOn`** property indicates whether the switch is on or off.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | On: the thumb is on the right, and the track shows [`onTintColor`](ontintcolor.md), or the system green if never set |
| `false` | Off: the thumb is on the left, and the track is gray |

How the two values look on screen is **not verified in the simulator**.

- Readable and writable.
- The default is `false`.
- Written values are converted by JS truthiness: the string `'false'` is a non-empty string and gives `true`; `0` gives `false`.
- Writing `isOn` isn't animated. For an animation, use [`setOn()`](seton.md).

### Observing changes

When the user toggles the switch, [`change`](../ui-control/change-event.md) fires; read `isOn` in the callback to get the value after the toggle.

Writing `isOn` in code doesn't fire `change`, so you can write it directly when restoring the interface from saved settings without triggering your own listener. Asserted in the acceptance tests: no `change` arrived after a write.

## Examples

```js
const sw = new UISwitch();
sw.isOn = true;
console.log(sw.isOn);
// @ts-expect-error the type accepts only booleans; this shows the runtime converting by truthiness
sw.isOn = 0;
console.log(sw.isOn);
```

**Result**: Prints `true` and then `false`.

## Corresponding iOS API

`UISwitch.on`; the getter is `isOn`.

## See also

- [`setOn()`](seton.md): toggle with an animation
- [`change`](../ui-control/change-event.md) event
