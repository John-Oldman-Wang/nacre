---
type: reference
native: application.nativeModules
---

# `Application`: `nativeModules` property

The **`nativeModules`** property gives the native modules registered in this app. A native module is a piece of code written in ObjC or Swift, registered in the app by name, that provides a set of methods and events and comes in with an npm package.

## Value

`NativeModules`. See [Native modules](../native-modules.md) for usage.

- Read-only. Assigning to it throws `TypeError`.
- Each read returns the same object. Every project has it; when there are no modules, its `names` is an empty array.

## Examples

The following uses the example module `@nacrejs/example-module` (registered under the name `example`).

```js
const modules = application.nativeModules;
if (modules.has('example')) {
  const example = modules.get('example');
  console.log(example.call('add', 1, 2));
} else {
  console.log('Example module not installed');
}
```

**Result** (**not verified in the simulator**): projects with `@nacrejs/example-module` installed print `3`; projects without it print `Example module not installed`.

## Corresponding iOS API

There's no corresponding system API. For how to write the native side, see [Native modules](../native-modules.md).

## See also

- [Native modules](../native-modules.md)
