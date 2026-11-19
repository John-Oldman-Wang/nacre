---
type: reference
native: OpenURLEvent()
---

# `OpenURLEvent()` constructor

The **`OpenURLEvent()`** constructor creates a URL event object for simulating an open in tests: dispatch it on `application`, and the `openurl` listeners are called while nothing happens on the system side.

## Syntax

```
new OpenURLEvent(type, { url, scene, sourceApplication, cancelable })
```

### Parameters

**`type`**

The event name, a string. Write `'openurl'` to simulate `openurl`.

**`options.url`**

The URL, a string; required.

**`options.scene`**

A [`UIWindowScene`](../ui-window-scene.md); required.

**`options.sourceApplication`**

The bundle ID of the source app, a string or `null`; optional. Defaults to `null`.

**`options.cancelable`**

A boolean; optional; defaults to `false`.

### Return value

A new `OpenURLEvent`.

### Exceptions

**`TypeError`**

- `url` is missing: `Failed to construct 'OpenURLEvent': url is required`.
- `scene` is missing or is not a scene: `Failed to construct 'OpenURLEvent': scene must be a UIWindowScene`.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  application.dispatchEvent(new OpenURLEvent('openurl', {
    url: 'myapp://orders/42',
    scene: e.scene,
  }));
});
```

**Effect**: The `openurl` listeners are called once, with `e.url` being `'myapp://orders/42'` and `e.sourceApplication` being `null`. Nothing happens on the system side.

## Corresponding iOS API

There is no corresponding system API.

## See also

- [`openurl`](../application/openurl-event.md)
