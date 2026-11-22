---
type: reference
native: "-[UIWindowScene requestGeometryUpdateWithPreferences:errorHandler:]"
---

# `UIWindowScene`: `requestGeometryUpdateWithPreferences()` method

The **`requestGeometryUpdateWithPreferences()`** method asks to rotate the interface to a given orientation, for example rotating to landscape when the user taps "Full screen".

## Syntax

```
requestGeometryUpdateWithPreferences(preferences)
```

## Parameters

**`preferences`**

A [`UIWindowSceneGeometryPreferencesIOS`](../ui-window-scene-geometry-preferences-ios.md): the orientations you want. The system picks one from the intersection of what you want and what is allowed.

## Return value

A `Promise<void>`.

| Case | Outcome |
| --- | --- |
| The current orientation is already one of the ones you want | Fulfilled immediately |
| The system allows it and starts rotating | Fulfilled once the orientation has actually changed, that is, after [`geometrychange`](geometrychange-event.md). About 0.5 seconds on the iPhone Air simulator (iOS 27.2) |
| The system doesn't allow it (the requested orientations aren't among those the app or the view controller allows) | Rejected with an [`NSError`](../ns-error.md): its `name` is `'NSError'`, its `message` is the reason the system gives, such as `None of the requested orientations are supported by the view controller. …`, and its `domain` and `code` are the system's error domain and error code |

All of the above are tested.

## Exceptions

**`TypeError`**

- The argument isn't a `UIWindowSceneGeometryPreferencesIOS`: `requestGeometryUpdateWithPreferences needs a UIWindowSceneGeometryPreferencesIOS`.
- The preferences contain no orientations: `requestGeometryUpdateWithPreferences: the preferences have no interfaceOrientations`.

## Description

Rotation requires two things: [`ios.orientations`](../../guides/project-config.md#declaring-the-orientations-the-app-allows) in `nacre.config.json` declares the orientation, and the [`supportedInterfaceOrientations`](../ui-view-controller/supportedinterfaceorientations.md) of the topmost full-screen view controller also allows it. To rotate to landscape, first open up the orientations the view controller allows, then make the request.

## Examples

```js
application.addEventListener('sceneconnect', async (e) => {
  const scene = e.scene;
  const page = new UIViewController();
  const win = new UIWindow(scene);
  win.rootViewController = page;
  win.makeKeyAndVisible();

  page.supportedInterfaceOrientations = ['portrait', 'landscapeRight'];
  await scene.requestGeometryUpdateWithPreferences(new UIWindowSceneGeometryPreferencesIOS(['landscapeRight']));
  console.log(scene.effectiveGeometry.interfaceOrientation);
});
```

**Effect**: when `nacre.config.json` declares landscape, the interface rotates to landscape and logs `landscapeRight`. When it doesn't, the Promise is rejected.

## Corresponding iOS API

`-[UIWindowScene requestGeometryUpdateWithPreferences:errorHandler:]`. The native method has no success callback; the Promise fulfills at the same point as the web's `screen.orientation.lock()`. The `NSError` passed to `errorHandler` is the value the Promise rejects with.

## See also

- [`UIWindowSceneGeometryPreferencesIOS`](../ui-window-scene-geometry-preferences-ios.md)
- [`geometrychange`](geometrychange-event.md)
