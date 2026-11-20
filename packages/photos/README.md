# `@nacrejs/photos`

A capability package for [Nacre](https://john-oldman-wang.github.io/nacre/), a JavaScript runtime for iOS apps: picking images from the photo library and saving images to it. It provides `PHPickerViewController`, `PHPhotoLibrary` and the classes around them. The app has it only if the project installs this package.

[Documentation](https://john-oldman-wang.github.io/nacre/api/photos) · [中文文档](https://john-oldman-wang.github.io/nacre/zh/api/photos)

Picking images needs no permission, but the usage description is required as soon as the package is installed.

## Install

In a Nacre project, three steps.

**1. Install the package.**

```bash
npm install @nacrejs/photos
```

**2. Bring in its types at the top of the entry file.**

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/photos" />
```

**3. Write its usage description in `nacre.config.json`.**

```json
{
  "ios": {
    "infoPlist": {
      "NSPhotoLibraryAddUsageDescription": "Used to save images to your photo library"
    }
  }
}
```

`NSPhotoLibraryAddUsageDescription` is the sentence iOS shows the user when the app first asks to add images to the photo library. Only you can write it, so the package doesn't ship one. If it's missing, `nacre generate` stops with an error that names the key. See [Writing usage descriptions](https://john-oldman-wang.github.io/nacre/guides/project-config#writing-usage-descriptions).

**Effect**: after you regenerate `ios/` and rebuild, the app includes this capability, and `typeof PHPickerViewController !== 'undefined'` is `true`.

Without the package, its classes don't exist: reading one throws `ReferenceError`, and type checking reports it first.

For how to use it, see [Photo library](https://john-oldman-wang.github.io/nacre/api/photos). For all capability packages, see [Core and capability packages](https://john-oldman-wang.github.io/nacre/api/capabilities).

## License

FSL-1.1-MIT, see `LICENSE.md`.
