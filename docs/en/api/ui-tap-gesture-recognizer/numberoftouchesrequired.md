---
type: reference
native: UITapGestureRecognizer.numberOfTouchesRequired
---

# `UITapGestureRecognizer`: `numberOfTouchesRequired` property

The **`numberOfTouchesRequired`** property is how many fingers must tap together for it to count.

## Value

A number, counting fingers.

- Readable and writable.
- The default is `1`.

### Observing changes

No event fires when it changes. Only the app's code changes it, so no notification is needed.

### Invalid values

- A negative number: throws `TypeError: numberOfTouchesRequired must be a non-negative integer`.
- A value that cannot be converted to a number (`undefined`, `'abc'`, `NaN`): throws `TypeError: numberOfTouchesRequired must be a finite number, got "abc"`.
- The fractional part is dropped: writing `2.9` reads back `2`. Numeric strings are used as numbers.
- On error, the property keeps its previous value.

## Examples

```js
const tap = new UITapGestureRecognizer();
tap.numberOfTouchesRequired = 2;
console.log(tap.numberOfTouchesRequired);
```

**Effect**: Prints `2`. Once added to a view, it is recognized only when two fingers tap together. **Not verified in the simulator.**

## Corresponding iOS API

`UITapGestureRecognizer.numberOfTouchesRequired`.

## See also

- [`numberOfTapsRequired`](numberoftapsrequired.md)
