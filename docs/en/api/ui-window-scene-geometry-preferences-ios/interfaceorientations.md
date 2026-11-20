---
type: reference
native: UIWindowSceneGeometryPreferencesIOS.interfaceOrientations
---

# `UIWindowSceneGeometryPreferencesIOS`: `interfaceOrientations` property

The **`interfaceOrientations`** property is the orientations these preferences ask for.

## Value

An array of orientation names.

- Readable and writable. Reading gives the names of individual orientations; combined names are expanded.
- Writing an unrecognized name: the whole assignment has no effect and a warning is logged. Writing something that isn't an array throws `TypeError`.

## Examples

```js
const prefs = new UIWindowSceneGeometryPreferencesIOS();
prefs.interfaceOrientations = ['portrait', 'landscapeLeft'];
console.log(prefs.interfaceOrientations.join(','));
```

**Result**: logs `portrait,landscapeLeft`.

## Corresponding iOS API

`UIWindowSceneGeometryPreferencesIOS.interfaceOrientations`.
