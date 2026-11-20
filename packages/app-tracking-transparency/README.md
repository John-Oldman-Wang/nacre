# `@nacrejs/app-tracking-transparency`

A capability package for [Nacre](https://john-oldman-wang.github.io/nacre/), a JavaScript runtime for iOS apps: tracking authorization and the advertising identifier. It provides `ATTrackingManager` and `ASIdentifierManager`. The app has it only if the project installs this package.

[Documentation](https://john-oldman-wang.github.io/nacre/api/app-tracking-transparency) · [中文文档](https://john-oldman-wang.github.io/nacre/zh/api/app-tracking-transparency)

## Install

In a Nacre project, three steps.

**1. Install the package.**

```bash
npm install @nacrejs/app-tracking-transparency
```

**2. Bring in its types at the top of the entry file.**

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/app-tracking-transparency" />
```

**3. Write its usage description in `nacre.config.json`.**

```json
{
  "ios": {
    "infoPlist": {
      "NSUserTrackingUsageDescription": "Used to show you more relevant ads"
    }
  }
}
```

`NSUserTrackingUsageDescription` is the sentence iOS shows the user when the app asks for permission to track. Only you can write it, so the package doesn't ship one. If it's missing, `nacre generate` stops with an error that names the key. See [Writing usage descriptions](https://john-oldman-wang.github.io/nacre/guides/project-config#writing-usage-descriptions).

**Effect**: after you regenerate `ios/` and rebuild, the app includes this capability, and `typeof ATTrackingManager !== 'undefined'` is `true`.

Without the package, its classes don't exist: reading one throws `ReferenceError`, and type checking reports it first.

For how to use it, see [Tracking authorization and advertising identifier](https://john-oldman-wang.github.io/nacre/api/app-tracking-transparency). For all capability packages, see [Core and capability packages](https://john-oldman-wang.github.io/nacre/api/capabilities).

## License

FSL-1.1-MIT, see `LICENSE.md`.
