---
type: reference
native: UIApplication.supportsMultipleScenes
---

# `Application`: `supportsMultipleScenes` property

The **`supportsMultipleScenes`** property indicates whether the app can have multiple scenes at the same time.

## Value

A boolean.

| Value | Meaning |
| --- | --- |
| `true` | Multiple scenes can exist at the same time |
| `false` | Only one |

- Read-only. Assigning to it throws `TypeError`.
- The value is the result of "support is declared in Info.plist" AND "the current device allows it". To read only the declared value, get `UIApplicationSupportsMultipleScenes` from `application.info.UIApplicationSceneManifest`.
- No change event: iOS doesn't provide a corresponding notification.

## Examples

```js
if (application.supportsMultipleScenes) {
  console.log('Multiple windows possible');
} else {
  console.log('Only one window');
}
```

**Result**: the acceptance app prints `Only one window`.

## Corresponding iOS API

`UIApplication.supportsMultipleScenes`.

## See also

- [Number of scenes](../ui-window-scene.md#number-of-scenes)
