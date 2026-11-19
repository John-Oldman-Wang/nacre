---
type: reference
native: UIOpenURLContext.options.sourceApplication
---

# `OpenURLEvent`: `sourceApplication` property

The **`sourceApplication`** property is the bundle ID of the source app.

## Value

A string, or `null`.

- Read-only; assigning to it throws `TypeError`.
- `null` when the system does not provide it: always `null` for universal links; for custom schemes, it has a value only when the source app and this app belong to the same developer team. This comes from Apple's documentation and is **not verified in the simulator**.
- `null` when you construct the event yourself without passing it.

## Examples

```js
application.addEventListener('openurl', (e) => {
  console.log('From', e.sourceApplication ?? 'an unknown app');
});
```

**Effect** (**not verified in the simulator**): When opened by a universal link, prints `From an unknown app`.

## Corresponding iOS API

`UIOpenURLContext.options.sourceApplication`.

## See also

- [`url`](url.md)
