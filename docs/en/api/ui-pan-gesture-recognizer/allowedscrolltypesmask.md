---
type: reference
native: UIPanGestureRecognizer.allowedScrollTypesMask
---

# `UIPanGestureRecognizer`: `allowedScrollTypesMask` property

The **`allowedScrollTypesMask`** property determines which kinds of scroll input also count as a pan. Scroll input comes from an external mouse wheel or trackpad.

## Value

An array of strings. The values that can appear in it:

| Value | Meaning |
| --- | --- |
| `'discrete'` | Scroll input in discrete steps, such as a mouse wheel |
| `'continuous'` | Continuous scroll input, such as a trackpad |

- Readable and writable.
- The default is `[]`: scroll input doesn't trigger this recognizer.
- Its effect on iPhone is **not verified in the simulator**.

### Observing changes

No event fires when it changes. Only the app's own code changes it, so no notification is needed.

### Invalid values

- Not an array: throws `TypeError: allowedScrollTypesMask needs an array of names; expected any of: discrete / continuous`.
- An unrecognized name in the array: nothing is thrown, the whole assignment has no effect, the property keeps its previous value, and the console prints a warning such as `[Nacre] allowedScrollTypesMask has no value "wheel"; expected one of: discrete / continuous, ignored`. The valid names in the array aren't applied on their own either.

## Examples

```js
const drag = new UIPanGestureRecognizer();
drag.allowedScrollTypesMask = ['discrete', 'continuous'];
```

**Effect**: With a mouse or trackpad connected, scrolling also triggers this recognizer. **Not verified in the simulator.**

## Corresponding iOS API

`UIPanGestureRecognizer.allowedScrollTypesMask`. `UIScrollTypeMaskAll` is written as `['discrete', 'continuous']`.

## See also

- [Enums](../enums.md): bitmasks are written as arrays of strings
