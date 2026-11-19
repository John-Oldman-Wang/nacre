---
type: reference
---

# `NativeModule`: `name` property

The **`name`** property is the name this module was registered under, which is also the name passed to [`application.nativeModules.get()`](../native-modules/get.md).

## Value

A string.

- Read-only; assigning to it throws `TypeError`.
- It never changes after you get the module object, so there's no change notification.

## Examples

```js
const example = application.nativeModules.get('example');
console.log(example.name);
```

**Result**: Prints `example`.

## Corresponding iOS API

There's no corresponding system API. The name is set by the native side when it registers the module.

## See also

- [`application.nativeModules.names`](../native-modules/names.md): all module names
