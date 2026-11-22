---
type: reference
web: DOMException()
---

# `DOMException()` constructor

The **`DOMException()`** constructor creates a `DOMException` with a description and a name.

## Syntax

```
new DOMException()
new DOMException(message)
new DOMException(message, name)
```

### Parameters

**`message`**

Optional. A one-sentence description, converted to a string. Omitted, `undefined`, or `null` gives an empty string.

**`name`**

Optional. The error's name, converted to a string. Omitted or `undefined` gives `'Error'`; `null` gives an empty string.

The name isn't limited to those in the web standards: an unrecognized name is accepted as is, and its [`code`](code.md) is 0.

### Return value

The new `DOMException`.

### Exceptions

**`TypeError`**

Called without `new`: `DOMException('x')`.

## Description

`DOMException` can be subclassed; instances of the subclass are `instanceof DOMException`.

## Examples

### Create an error

```js
const plain = new DOMException();
console.log(JSON.stringify(plain.message), plain.name, plain.code);
const aborted = new DOMException('stopped', 'AbortError');
console.log(String(aborted), aborted.code, aborted instanceof Error);
```

**Result**:

- The first line prints `"" Error 0`.
- The second line prints `AbortError: stopped 20 true`.

### Write a subclass

```js
class LoginRequiredError extends DOMException {
  constructor() {
    super('please sign in first', 'NotAllowedError');
  }
}
const err = new LoginRequiredError();
console.log(err instanceof DOMException, err.name, err.code);
```

**Result**: Prints `true NotAllowedError 0`. `'NotAllowedError'` has no legacy numeric code, so `code` is 0.

## Differences from the web

Passing `null` as `message` or `name` gives an empty string. On the web it gives the string `'null'`.

## See also

- [`name`](name.md), [`message`](message.md), [`code`](code.md)
