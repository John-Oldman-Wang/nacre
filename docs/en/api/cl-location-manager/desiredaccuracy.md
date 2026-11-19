---
type: reference
native: CLLocationManager.desiredAccuracy
---

# `CLLocationManager`: `desiredAccuracy` property

The **`desiredAccuracy`** property is how many meters you'd like the location to be accurate to. It's a desired accuracy, not a guarantee: how accurate a location from the system actually is shows in each location's [`horizontalAccuracy`](../cl-location/horizontalaccuracy.md).

## Value

A number not less than 0 (meters), or one of the following three names:

| Value | Effect |
| --- | --- |
| A number not less than 0 | Aim for an error within this many meters. Common values are `10`, `100`, `1000`, `3000`. Larger numbers save more power and locate faster |
| `'best'` | The highest accuracy the device can give |
| `'bestForNavigation'` | Higher than `'best'`, intended for navigation; uses the most power |
| `'reduced'` | Approximate location only, the same as when the user gave only approximate location |

- Readable and writable. Values read back as written: numbers read back as numbers, names as names.
- Defaults to `'best'`.
- Strings that look like numbers are treated as numbers: writing `'50'` reads back as the number `50`.
- Only the app can change it, so there's no change notification.
- The power use and locating speed of the different values are **not verified in the simulator**.

### Invalid values

Writing an unrecognized name doesn't throw: the console prints a warning, and the property keeps its previous value.

```
[Nacre] desiredAccuracy has no value "fast"; expected one of: best / bestForNavigation / reduced, ignored
```

Writing a negative number or a value that can't be converted to a finite number throws `TypeError`, and the previous value stays.

| Written | Error message |
| --- | --- |
| A negative number, `-1` | `desiredAccuracy must be a non-negative number of meters or one of: best / bestForNavigation / reduced` |
| Can't be converted to a finite number, `NaN`, `undefined` | `desiredAccuracy must be a finite number, got NaN`. What follows `got` is the written value; writing `undefined` gives `got undefined` |

## Examples

```js
const manager = new CLLocationManager();
manager.desiredAccuracy = 100;
console.log(manager.desiredAccuracy);
manager.desiredAccuracy = 'bestForNavigation';
console.log(manager.desiredAccuracy);
```

**Result**: prints `100`, then `bestForNavigation`.

## Corresponding iOS API

`CLLocationManager.desiredAccuracy`.

| ObjC | JS |
| --- | --- |
| `kCLLocationAccuracyBest` | `'best'` |
| `kCLLocationAccuracyBestForNavigation` | `'bestForNavigation'` |
| `kCLLocationAccuracyReduced` | `'reduced'` |
| `kCLLocationAccuracyNearestTenMeters`, `HundredMeters`, `Kilometer`, `ThreeKilometers` | `10`, `100`, `1000`, `3000` |

## See also

- [`distanceFilter`](distancefilter.md): how far to move before reporting
- [Enums](../enums.md): why a wrong name produces a warning
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
