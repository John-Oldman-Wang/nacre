# `@nacrejs/camera`

A capability package for [Nacre](https://john-oldman-wang.github.io/nacre/), a JavaScript runtime for iOS apps: taking a photo with the system camera interface. It provides `UIImagePickerController`. The app has it only if the project installs this package.

[Documentation](https://john-oldman-wang.github.io/nacre/api/ui-image-picker-controller) · [中文文档](https://john-oldman-wang.github.io/nacre/zh/api/ui-image-picker-controller)

## Install

In a Nacre project, three steps.

**1. Install the package.**

```bash
npm install @nacrejs/camera
```

**2. Bring in its types at the top of the entry file.**

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/camera" />
```

**3. Write its usage description in `nacre.config.json`.**

```json
{
  "ios": {
    "infoPlist": {
      "NSCameraUsageDescription": "Used to take a profile photo"
    }
  }
}
```

`NSCameraUsageDescription` is the sentence iOS shows the user when the app asks for camera access. Only you can write it, so the package doesn't ship one. If it's missing, `nacre generate` stops with an error that names the key. See [Writing usage descriptions](https://john-oldman-wang.github.io/nacre/guides/project-config#writing-usage-descriptions).

**Effect**: after you regenerate `ios/` and rebuild, the app includes this capability, and `typeof UIImagePickerController !== 'undefined'` is `true`.

Without the package, its classes don't exist: reading one throws `ReferenceError`, and type checking reports it first.

For how to use it, see [Taking photos](https://john-oldman-wang.github.io/nacre/api/ui-image-picker-controller). For all capability packages, see [Core and capability packages](https://john-oldman-wang.github.io/nacre/api/capabilities).

## License

FSL-1.1-MIT, see `LICENSE.md`.
