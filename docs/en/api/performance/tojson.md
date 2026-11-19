---
type: reference
---

# `Performance`: `toJSON()` method

The **`toJSON()`** method returns a plain-object representation of `performance`: `{ timeOrigin }`. It's what lets `JSON.stringify(performance)` produce a result.

## Syntax

```
performance.toJSON()
```

### Parameters

None.

### Return value

A plain object with a single property, `timeOrigin`, whose value is the same as [`performance.timeOrigin`](timeorigin.md).

### Exceptions

None.

## Examples

```js
const json = JSON.stringify(performance);
console.log(json.startsWith('{"timeOrigin":'));
```

**Result**: Prints `true`.

## Differences from the web

The object browsers return also has fields such as `timing`, `navigation`, and `eventCounts`. Here there's only `timeOrigin`.

## See also

- [`timeOrigin`](timeorigin.md)
