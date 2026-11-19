---
type: reference
native: CLLocation.sourceInformation
---

# `CLLocation`: `sourceInformation` property

The **`sourceInformation`** property says how this location came about: whether it was simulated by software, and whether it came from an external accessory.

## Value

An object, or `null`. It is `null` when the system gave no source.

The object has two fields, both booleans and both read-only:

**`isSimulatedBySoftware`**

`true`: this location was simulated by software (a location set in the simulator, or a location changed by developer tools). `false`: actually measured.

**`isProducedByAccessory`**

`true`: this location came from an external accessory (a car system, an external GPS receiver). `false`: from the device itself.

- Read-only; assigning to it throws `TypeError`. The object itself is frozen, so changing its fields has no effect.
- Each read on the same `CLLocation` gives the same object.
- What it reads in the simulator is **not verified in the simulator**.

## Examples

```js
const manager = new CLLocationManager();
manager.requestLocation().then((here) => {
  const source = here.sourceInformation;
  if (source !== null && source.isSimulatedBySoftware) {
    console.log('This location was simulated by software');
  }
}, () => {});
```

**Effect**: Prints a line when the location is simulated. **Not verified in the simulator.**

## Corresponding iOS API

`CLLocation.sourceInformation`, of type `CLLocationSourceInformation`. Here it is a plain frozen object, not a class.

## See also

- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
