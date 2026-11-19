---
type: reference
native: UIDevice.systemName
---

# `UIDevice`: `systemName` property

The **`systemName`** property is the operating system's name.

## Value

A string. `'iOS'` on iPhone.

- Read-only. Assigning to it throws `TypeError`, and the value is unchanged.
- It doesn't change while the app is running, so there is no change notification.

## Examples

```js
console.log(UIDevice.currentDevice.systemName);
```

**Result**: Prints `iOS` on iPhone.

## Corresponding iOS API

`UIDevice.systemName`.

## See also

- [`systemVersion`](systemversion.md): the system's version
