---
type: reference
native: "-[UIWindowSceneGeometryPreferencesIOS initWithInterfaceOrientations:]"
---

# `UIWindowSceneGeometryPreferencesIOS()` constructor

The **`UIWindowSceneGeometryPreferencesIOS()`** constructor creates rotation preferences from a list of orientation names.

## Syntax

```
new UIWindowSceneGeometryPreferencesIOS()
new UIWindowSceneGeometryPreferencesIOS(interfaceOrientations)
```

## Parameters

**`interfaceOrientations`**

An array of orientation names; optional. Omitting it means "no preference", and passing such preferences to `requestGeometryUpdateWithPreferences()` throws.

| Name | Orientation |
| --- | --- |
| `'portrait'` | Upright, with the home indicator at the bottom |
| `'portraitUpsideDown'` | Upside down |
| `'landscapeLeft'` | Sideways, with the top of the phone facing right |
| `'landscapeRight'` | Sideways, with the top of the phone facing left |
| `'landscape'` | Shorthand for both landscape orientations |
| `'all'` | Shorthand for all four orientations |
| `'allButUpsideDown'` | The three orientations other than upside down |

## Return value

New preferences.

## Exceptions

**`TypeError`**

- The array contains an unrecognized name: `interfaceOrientations has no value "sideways"; expected one of: …`.
- The argument isn't an array: `interfaceOrientations needs an array of orientation names`.

## Examples

```js
const prefs = new UIWindowSceneGeometryPreferencesIOS(['landscape']);
console.log(prefs.interfaceOrientations.join(','));
```

**Result**: logs `landscapeLeft,landscapeRight`.

## Corresponding iOS API

`-[UIWindowSceneGeometryPreferencesIOS initWithInterfaceOrientations:]`.

## See also

- [`UIWindowSceneGeometryPreferencesIOS`](../ui-window-scene-geometry-preferences-ios.md)
