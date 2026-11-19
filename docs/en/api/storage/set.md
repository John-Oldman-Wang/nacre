---
type: reference
native: "-[NSUserDefaults setObject:forKey:]"
---

# `NSUserDefaults`: `set()` method

The **`set()`** method writes a value to storage. When it returns, the new value is already in effect and can be read immediately.

## Syntax

```
set(key, value)
```

### Parameters

**`key`**

The key name, a string.

**`value`**

The value to save: a string, a finite number, a boolean, an array, or a plain object; array elements and object property values must also be one of these. See [Which values can be stored](../storage.md#which-values-can-be-stored).

Passing `null` deletes the key, the same as [`remove()`](remove.md).

### Return value

None (`undefined`).

The system writes to disk automatically afterward; the app does not need to, and cannot, trigger that itself. After the write, `application.storage` fires the [`change`](change-event.md) event.

### Exceptions

**`TypeError`**

On error nothing is written, and the key keeps its previous value.

| Value passed | Error message |
| --- | --- |
| `key` is not a string | `set: key must be a string` |
| `undefined` | `set: value is undefined; pass null to remove the key` |
| `NaN`, `Infinity` | `set("x"): NaN and Infinity cannot be stored` |
| A function (Symbol and the like are similar, with a different type name at the start) | `set("x"): function cannot be stored; only strings, finite numbers, booleans, arrays and plain objects of those` |
| `Date`, native objects, and other objects that are not plain objects | `set("x"): only plain objects can be stored, got Date` |
| `null` inside an array or object | `set("x")[1]: null cannot be stored; only strings, finite numbers, booleans, arrays and plain objects of those` |
| A self-referencing structure | `set("x").self: circular structures cannot be stored` |

The `set("x")` at the start of the message is the key name; the `[1]` or `.self` after it is the location of the offending value within the structure.

## Examples

### Writing an object

```js
const storage = application.storage;
storage.set('profile', { name: 'Wang', level: 3, tags: ['vip'] });
console.log(JSON.stringify(storage.get('profile')));
```

**Result**: Prints `{"name":"Wang","level":3,"tags":["vip"]}`.

### Writing a value that cannot be stored

```js
try {
  application.storage.set('x', /** @type {any} */ ({ a: [1, { b: () => {} }] }));
} catch (err) {
  console.log(String(err));
}
```

**Result**: The console prints `TypeError: set("x").a[1].b: function cannot be stored; only strings, finite numbers, booleans, arrays and plain objects of those`. The key `x` is not written.

## Corresponding iOS API

`-[NSUserDefaults setObject:forKey:]`. Typed writes such as `setInteger:forKey:` and `setBool:forKey:` are all written as `set()`.

## See also

- [`get()`](get.md): reading it back
- [`remove()`](remove.md): deleting
- [`change`](change-event.md): the event fired after a write
