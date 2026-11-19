---
type: reference
---

# `NativeModules`: `has()` method

The **`has()`** method returns whether a native module with a given name is registered.

## Syntax

```
has(name)
```

### Parameters

**`name`**

The module name, a string. Non-strings are converted to strings first.

### Return value

A boolean. `true` if registered, `false` if not.

### Exceptions

None.

## Examples

```js
if (application.nativeModules.has('example')) {
  const example = application.nativeModules.get('example');
  console.log(example.name);
} else {
  console.log('this app does not have the example module installed');
}
```

**Effect**: A project with `@nacrejs/example-module` installed prints `example`; one without it prints `this app does not have the example module installed`.

## Corresponding iOS API

There is no corresponding system API.

## See also

- [`get()`](get.md): throws `TypeError` for a name that isn't registered, so when unsure, ask `has()` first
