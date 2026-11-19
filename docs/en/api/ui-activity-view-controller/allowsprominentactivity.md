---
type: reference
native: UIActivityViewController.allowsProminentActivity
---

# `UIActivityViewController`: `allowsProminentActivity` property

The **`allowsProminentActivity`** property decides whether the system can show one action enlarged at the top of the share sheet.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | The system can show one action enlarged at the top of the share sheet. Which one is up to the system |
| `false` | No action is enlarged |

- Readable and writable.
- The default is `true`.
- The on-screen effect of the two values is **not verified in the simulator**.
- No event fires when it changes: only the app itself can change it.

## Examples

```js
const sheet = new UIActivityViewController(['some text']);
sheet.allowsProminentActivity = false;
console.log(sheet.allowsProminentActivity);
```

**Result**: The console prints `false`.

## Corresponding iOS API

`UIActivityViewController.allowsProminentActivity`.

## See also

- [`UIActivityViewController`](../ui-activity-view-controller.md)
