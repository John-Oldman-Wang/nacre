---
type: reference
---

# `NativeModules`: `names` property

The **`names`** property holds the names of all native modules registered in this app.

## Value

An array of strings, sorted by name.

- Read-only.
- The array is frozen; you can't add, remove, or change elements.
- Every read reflects the situation at that moment and isn't the same array object.
- An empty array when no module is registered.

There is no change notification: modules are registered when the app launches and generally don't change afterward.

## Examples

```js
const names = application.nativeModules.names;
console.log(names.join(', '));
console.log(Object.isFrozen(names));
```

**Result**: First prints the registered module names, which include `example` in a project with `@nacrejs/example-module` installed; then prints `true`.

## Corresponding iOS API

There is no corresponding system API. The names are set by the native side when registering the modules; see [Writing your own native module](../../guides/native-modules.md).

## See also

- [`has()`](has.md): ask about a single name
