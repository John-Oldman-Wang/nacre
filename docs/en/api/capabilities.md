---
type: concept
---

# Core and capability packages

Nacre's API is split into two parts: the **core** and **capability packages**.

- The **core** is the part every Nacre project has. It's provided by `@nacrejs/ios` and needs no separate installation. UI, layout, text and images, animation, input, networking, local storage, file reading and writing, and web pages are all in the core.
- A **capability package** is a separate npm package that provides a system capability not in the core, such as location, taking photos, or Face ID. An app has a capability only if the project installs the package for it.

The reason for the split lies with the app's users: for capabilities such as location and the camera, iOS requires the app to state, in a sentence shown to the user, why it needs them. An app that doesn't use location shouldn't be required to write that sentence, so these capabilities aren't in the core.

## Available capability packages

| Package | What it provides | What to write in `nacre.config.json` after installing | Docs |
| --- | --- | --- | --- |
| `@nacrejs/keychain` | `application.keychain`: encrypted storage for tokens and passwords | Nothing | [Keychain](keychain.md) |
| `@nacrejs/local-authentication` | `LAContext`: Face ID and Touch ID authentication | `NSFaceIDUsageDescription` | [`LAContext`](la-context.md) |
| `@nacrejs/core-location` | `CLLocationManager`, `CLLocation`: location while the app is in use | `NSLocationWhenInUseUsageDescription` | [Location](cl-location-manager.md) |
| `@nacrejs/user-notifications` | `UNUserNotificationCenter`: sending local notifications, learning when a notification arrives or is tapped | Nothing | [Notifications](un-user-notification-center.md) |
| `@nacrejs/camera` | `UIImagePickerController`: taking photos with the system interface | `NSCameraUsageDescription` | [Taking photos](ui-image-picker-controller.md) |
| `@nacrejs/photos` | `PHPickerViewController` for picking images, `PHPhotoLibrary` for saving images to the photo library | `NSPhotoLibraryAddUsageDescription` | [Photo library](photos.md) |
| `@nacrejs/contacts` | `CNContactPickerViewController`, `CNContact`: letting the user pick a contact | Nothing | [Contact picker](contacts.md) |
| `@nacrejs/app-tracking-transparency` | `ATTrackingManager`, `ASIdentifierManager`: tracking authorization and the advertising identifier | `NSUserTrackingUsageDescription` | [Tracking authorization and advertising identifier](app-tracking-transparency.md) |

The names in the third column are key names defined by iOS; the value is a sentence shown to the app's users. You write this sentence; for how, see [Configuring the app: name, languages, usage descriptions](../guides/project-config.md).

Every API not listed in this table is in the core.

## What it takes to use a capability package

Three things, using location as the example.

**1. Install the package.**

```bash
npm install @nacrejs/core-location
```

**Effect**: the next time `ios/` is generated, the app includes the location capability. Only packages listed in the project's own `package.json` count; if a library the project depends on uses a capability package, that doesn't count, and you must install it yourself to use it.

**2. Bring in its types at the top of the entry file.**

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/core-location" />
```

**Effect**: the editor and type checker recognize `CLLocationManager`. Without the second line, type checking reports `Cannot find name 'CLLocationManager'`.

**3. If the package requires a usage description, write it in `nacre.config.json`.**

```json
{
  "ios": {
    "infoPlist": {
      "NSLocationWhenInUseUsageDescription": "Used to show stores near you"
    }
  }
}
```

**Effect**: when the system asks the user for location permission, the prompt shows this sentence. Packages marked "Nothing" in the third column of the table above skip this step.

Each package's documentation starts with its own version of these three steps. For the complete process from scratch, see [Building your own app](../guides/your-own-app.md).

## What happens if you use it without installing

For a capability package that isn't installed, its classes and properties don't exist in JS:

- Reading its class name throws `ReferenceError`, for example `new CLLocationManager()`.
- Properties it adds to existing objects don't exist. Without `@nacrejs/keychain` installed, `'keychain' in application` is `false` and `application.keychain` is `undefined`.
- Type checking reports it first: the class name can't be found, or the object has no such property.

To check at run time whether a capability is present, use `typeof`:

```js
if (typeof CLLocationManager === 'undefined') {
  console.log('This app does not have location installed');
}
```

**Result**

- Apps without `@nacrejs/core-location` installed print this line; apps with it installed don't.

## What happens if you install it but don't write the usage description

Generating `ios/` reports an error and stops; the error says which package needs which key:

```
nacre: @nacrejs/local-authentication needs NSFaceIDUsageDescription in Info.plist: a sentence shown to the user explaining why the app needs this permission. Put it in ios.infoPlist in nacre.config.json
```

Write the sentence as the error says and generate again.

## See also

- [Configuring the app: name, languages, usage descriptions](../guides/project-config.md): where usage descriptions go and how to write one sentence per language.
- [Building your own app](../guides/your-own-app.md): the complete steps from creating a project to installing capability packages.
- [`application`](application.md): the app-level entry point in the core.
- [Native modules](native-modules.md): the app's own native code and third-party native SDKs. They're also installed into the project as packages, the same way as capability packages, and called from `application.nativeModules`.
