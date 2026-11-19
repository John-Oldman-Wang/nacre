---
type: reference
native: +[ASIdentifierManager sharedManager]
---

# `ASIdentifierManager.sharedManager()` static method

The **`ASIdentifierManager.sharedManager()`** static method returns the single `ASIdentifierManager` the system provides.

## Syntax

```
ASIdentifierManager.sharedManager()
```

### Parameters

None.

### Return value

An `ASIdentifierManager`. Every call gives the same object, which you can compare with `===`.

### Exceptions

None.

## Examples

```js
const manager = ASIdentifierManager.sharedManager();
console.log(manager === ASIdentifierManager.sharedManager());
```

**Result**: It prints `true`.

## Corresponding iOS API

`+[ASIdentifierManager sharedManager]`. It is a class method in ObjC, so it takes parentheses in JS.

## See also

- [`advertisingIdentifier`](advertisingidentifier.md): reading the advertising identifier from it
- [Installing `@nacrejs/app-tracking-transparency`](../app-tracking-transparency.md#installation)
