---
type: reference
native: NSBundle.mainBundle.infoDictionary
---

# `Application`: `info` property

The **`info`** property is the full contents of the app's Info.plist. Info.plist is the configuration file every iOS app carries; it records the bundle ID, the version, the supported orientations, and so on. It's generated when the app is built and doesn't change while the app runs.

## Value

An object. The keys are Info.plist keys. The values are typed as `unknown`, because every app's Info.plist has different contents.

- Read-only. The object and every nested object are frozen; writing throws `TypeError`.
- Can be read as soon as the script starts.
- It doesn't change while the app runs, so there is no change event.
- Reading a key that isn't in Info.plist gives `undefined` and doesn't throw.
- Check the type before reading nested fields.

It's the Info.plist the runtime reads, not the source file in the project:

- Variables in the source file have been replaced with their actual values.
- Keys added by the build tools are included, such as `MinimumOSVersion`.
- The system also computes a `CFBundleNumericVersion`.
- Values that can't be represented in JSON (dates, binary data) are converted to strings.

The app's display name has no dedicated property; read it from `info.CFBundleDisplayName`. The value it returns is **not verified in the simulator**; it comes from the project configuration.

## Examples

```js
console.log(Object.keys(application.info).length);
console.log(application.info.MinimumOSVersion);
console.log(Object.isFrozen(application.info));
```

**Result**

- The first line prints the number of keys. For the acceptance app it's `26`.
- The second line prints the minimum system version the app requires, as a string.
- The third line prints `true`.

```js
const manifest = application.info.UIApplicationSceneManifest;
if (typeof manifest === 'object' && manifest !== null) {
  console.log('Has scene configuration');
}
```

**Result**: the console prints `Has scene configuration`.

## Corresponding iOS API

`NSBundle.mainBundle.infoDictionary`.

## See also

- [`bundleIdentifier`](bundleidentifier.md), [`version`](version.md), [`build`](build.md): the three most commonly used entries
- [Configuring the app: name, languages, usage descriptions](../../guides/project-config.md): where the contents of Info.plist come from
