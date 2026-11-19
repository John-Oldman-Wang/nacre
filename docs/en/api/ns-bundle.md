---
type: reference
native: NSBundle
---

# `NSBundle`

**`NSBundle`** represents a bundle: a directory on disk that holds a program and its resources. The app's own bundle is a directory ending in `.app`, containing the app's program, `Info.plist`, the bundled JS, and the project's `assets/`.

Get the app's bundle from [`NSBundle.mainBundle`](ns-bundle/mainbundle.md). It gives the bundle's path, finds resources in the bundle by name, reads `Info.plist`, and tells which languages the app supports and which one is actually in use this time.

The app's bundle is read-only: writing into it is rejected on a device. Data you need to change goes in one of the directories of [`application.fileSystem`](filesystem.md).

To read files in the project's own `assets/`, building the path from [`application.fileSystem.assets`](filesystem/assets.md) is simpler.

**Inheritance**: `EventTarget` → `NSObject` → `NSBundle`

## Constructor

Cannot be created with `new`: `new NSBundle()` throws `TypeError: Illegal constructor: NSBundle is created by the runtime, not by new`. Get the app's bundle from `mainBundle`, and other bundles with `bundleWithPath()`.

## Static properties

| Property | Description |
| --- | --- |
| [`mainBundle`](ns-bundle/mainbundle.md) <small>read-only</small> | The app's own bundle |

## Static methods

| Method | Description |
| --- | --- |
| [`bundleWithPath()`](ns-bundle/bundlewithpath.md) | Gets a bundle by its directory path |
| [`bundleWithIdentifier()`](ns-bundle/bundlewithidentifier.md) | Gets an already loaded bundle by its bundle identifier |
| [`preferredLocalizationsFromArray()`](ns-bundle/preferredlocalizationsfromarray.md) | Picks the languages from a list that best match the user's preferences |

## Instance properties

All read-only, and unchanged while the app runs.

| Property | Description |
| --- | --- |
| [`bundlePath`](ns-bundle/bundlepath.md) | The absolute path of the bundle |
| [`resourcePath`](ns-bundle/resourcepath.md) | The absolute path of the directory holding resources |
| [`bundleIdentifier`](ns-bundle/bundleidentifier.md) | The bundle identifier |
| [`infoDictionary`](ns-bundle/infodictionary.md) | The bundle's Info.plist |
| [`localizedInfoDictionary`](ns-bundle/localizedinfodictionary.md) | The translated entries of Info.plist |
| [`localizations`](ns-bundle/localizations.md) | All languages the bundle supports |
| [`preferredLocalizations`](ns-bundle/preferredlocalizations.md) | The languages actually in use this time, best match first |
| [`developmentLocalization`](ns-bundle/developmentlocalization.md) | The development language |

## Instance methods

| Method | Description |
| --- | --- |
| [`pathForResource()`](ns-bundle/pathforresource.md) | Finds the absolute path of a resource by name |
| [`pathsForResourcesOfType()`](ns-bundle/pathsforresourcesoftype.md) | All resources with a given extension |
| [`objectForInfoDictionaryKey()`](ns-bundle/objectforinfodictionarykey.md) | The value of one key in Info.plist |
| [`localizedStringForKey()`](ns-bundle/localizedstringforkey.md) | The translation of one key in a `.strings` table |
| [`localizedAttributedStringForKey()`](ns-bundle/localizedattributedstringforkey.md) | Same as above, with Markdown turned into an attributed string |

## Events

None: the bundle's contents do not change while the app runs.

## Examples

### Which language the app is using

```js
const main = NSBundle.mainBundle;
console.log(JSON.stringify(main.localizations));
console.log(main.preferredLocalizations[0]);
```

**Result**: When running the acceptance app on the iPhone Air simulator (iOS 27.2) (system language Simplified Chinese; the acceptance app does not set `ios.languages`), prints `["en"]`, then `en`: the app only supports English, so the system uses English.

For an app with `"languages": ["en", "zh-Hans"]` in `nacre.config.json`, on a phone whose system language is Simplified Chinese, the first line shows both languages and the second line is `zh-Hans`. **Not verified in the simulator.**

### Find a file in the bundle

```js
const path = NSBundle.mainBundle.pathForResource('data', { ofType: 'json', inDirectory: 'JS/assets/web' });
console.log(path === application.fileSystem.assets + '/web/data.json');
```

**Result**: When the project has `assets/web/data.json`, prints `true`.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `NSBundle.mainBundle` | `NSBundle.mainBundle` |
| `[bundle pathForResource:@"data" ofType:@"json"]` | `bundle.pathForResource('data', { ofType: 'json' })` |
| `[bundle pathForResource:@"data" ofType:@"json" inDirectory:@"web"]` | `bundle.pathForResource('data', { ofType: 'json', inDirectory: 'web' })` |
| `NSLocalizedString(@"key", nil)` | `NSBundle.mainBundle.localizedStringForKey('key')` |
| `[bundle URLForResource:@"data" withExtension:@"json"]` | `bundle.pathForResource('data', { ofType: 'json' })`, which gives a path |

## See also

- [`application.fileSystem`](filesystem.md): reading and writing files; `assets` is where the project's `assets/` is in the bundle
- [`application.info`](application/info.md): the app's Info.plist
- [`NSLocale`](ns-locale.md): the user's language preferences and region
- [`UIFont.familyNames`](ui-font/familynames.md): which fonts are in the bundle and the system
