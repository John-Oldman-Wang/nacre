---
type: reference
---

# `NativeModules`: `get()` method

The **`get()`** method returns a native module by name, as a [`NativeModule`](../native-module.md).

## Syntax

```
get(name)
```

### Parameters

**`name`**

The module name, a string. Non-strings are converted to strings first.

### Return value

A [`NativeModule`](../native-module.md). The same name returns the same object every time, so you can just get it whenever you use it; there's no need to keep it yourself.

### Exceptions

**`TypeError`**

A name that isn't registered: `nativeModules.get: no native module named "nope"; registered modules: example`, ending with a list of the registered names. When no module is registered at all, it ends with `registered modules: none`.

## Examples

```js
const example = application.nativeModules.get('example');
console.log(example.name);
console.log(example === application.nativeModules.get('example'));
```

**Result**: In a project with `@nacrejs/example-module` installed, prints `example` and then `true`. Without it, the first line throws `TypeError`.

## Corresponding iOS API

There is no corresponding system API.

## See also

- [`has()`](has.md): check whether it exists first
- [`NativeModule`](../native-module.md): what you can do with the module you get
