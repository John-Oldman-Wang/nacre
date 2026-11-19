---
type: reference
web: TextEncoder()
---

# `TextEncoder()` constructor

The **`TextEncoder()`** constructor creates an encoder that encodes strings into UTF-8 bytes.

## Syntax

```
new TextEncoder()
```

### Parameters

None.

### Return value

A new `TextEncoder`. It has no state, so one can be reused.

### Exceptions

**`TypeError`**

Called without `new`.

## Examples

```js
const encoder = new TextEncoder();
console.log(encoder.encoding);
```

**Result**: It prints `utf-8`. **Not verified in the simulator.**

## Differences from the web

Same as on the web.

## See also

- [`encode()`](encode.md)
