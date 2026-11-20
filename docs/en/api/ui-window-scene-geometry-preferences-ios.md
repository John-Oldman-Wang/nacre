---
type: reference
native: UIWindowSceneGeometryPreferencesIOS
---

# `UIWindowSceneGeometryPreferencesIOS`

**`UIWindowSceneGeometryPreferencesIOS`** represents the preferences for a rotation request: which orientations you want. Pass it to the scene's [`requestGeometryUpdateWithPreferences()`](ui-window-scene/requestgeometryupdatewithpreferences.md).

**Inheritance**: `EventTarget` → `NSObject` → `UIWindowSceneGeometryPreferencesIOS`

## Constructor

[`UIWindowSceneGeometryPreferencesIOS()`](ui-window-scene-geometry-preferences-ios/constructor.md)

Creates preferences from a list of orientation names.

## Instance properties

| Property | Description |
| --- | --- |
| [`interfaceOrientations`](ui-window-scene-geometry-preferences-ios/interfaceorientations.md) | The orientations you want |

## Examples

```js
const prefs = new UIWindowSceneGeometryPreferencesIOS(['landscapeRight']);
console.log(prefs.interfaceOrientations.join(','));
```

**Result**: logs `landscapeRight`.

## Corresponding iOS API

`UIWindowSceneGeometryPreferencesIOS`.

## See also

- [`requestGeometryUpdateWithPreferences()`](ui-window-scene/requestgeometryupdatewithpreferences.md)
