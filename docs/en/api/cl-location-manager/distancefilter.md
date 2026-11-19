---
type: reference
native: CLLocationManager.distanceFilter
---

# `CLLocationManager`: `distanceFilter` property

The **`distanceFilter`** property is how many meters the device must move during continuous updates before a new location is reported. It only affects continuous updates after [`startUpdatingLocation()`](startupdatinglocation.md).

## Value

A number not less than 0 (meters), or `'none'`.

| Value | Effect |
| --- | --- |
| A number | The next `locationupdate` fires only after the device moves more than this many meters |
| `'none'` | Every movement is reported |

- Readable and writable. Values read back as written.
- Defaults to `'none'`.
- Strings that look like numbers are treated as numbers: writing `'50'` reads back as the number `50`.
- Only the app can change it, so there's no change notification.
- How many locations are reported and how much power is saved after setting it are **not verified in the simulator**.

### Invalid values

Writing an unrecognized name doesn't throw: the console prints a warning, and the property keeps its previous value.

```
[Nacre] distanceFilter has no value "all"; expected one of: none, ignored
```

Writing a negative number or a value that can't be converted to a finite number throws `TypeError`, and the previous value stays.

| Written | Error message |
| --- | --- |
| A negative number, `-1` | `distanceFilter must be a non-negative number of meters or one of: none` |
| Can't be converted to a finite number, `NaN`, `undefined` | `distanceFilter must be a finite number, got NaN`. What follows `got` is the written value |

These two errors come from the code and are **not verified in the simulator**.

## Examples

```js
const manager = new CLLocationManager();
manager.distanceFilter = 50;
console.log(manager.distanceFilter);
```

**Result**: prints `50`. During continuous updates, a location is reported each time the device moves more than 50 meters.

## Corresponding iOS API

`CLLocationManager.distanceFilter`. `kCLDistanceFilterNone` is written as `'none'`.

## See also

- [`desiredAccuracy`](desiredaccuracy.md): the desired accuracy
- [`locationupdate`](locationupdate-event.md): where locations come from
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
