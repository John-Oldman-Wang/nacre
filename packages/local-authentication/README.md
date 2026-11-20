# `@nacrejs/local-authentication`

A capability package for [Nacre](https://john-oldman-wang.github.io/nacre/), a JavaScript runtime for iOS apps: Face ID and Touch ID authentication. It provides `LAContext`. The app has it only if the project installs this package.

[Documentation](https://john-oldman-wang.github.io/nacre/api/la-context) · [中文文档](https://john-oldman-wang.github.io/nacre/zh/api/la-context)

## Install

In a Nacre project, three steps.

**1. Install the package.**

```bash
npm install @nacrejs/local-authentication
```

**2. Bring in its types at the top of the entry file.**

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/local-authentication" />
```

**3. Write its usage description in `nacre.config.json`.**

```json
{
  "ios": {
    "infoPlist": {
      "NSFaceIDUsageDescription": "Used to unlock your account"
    }
  }
}
```

`NSFaceIDUsageDescription` is the sentence iOS shows the user when the app uses Face ID for the first time. Only you can write it, so the package doesn't ship one. If it's missing, `nacre generate` stops with an error that names the key. See [Writing usage descriptions](https://john-oldman-wang.github.io/nacre/guides/project-config#writing-usage-descriptions).

**Effect**: after you regenerate `ios/` and rebuild, the app includes this capability, and `typeof LAContext !== 'undefined'` is `true`.

Without the package, its classes don't exist: reading one throws `ReferenceError`, and type checking reports it first.

For how to use it, see [`LAContext`](https://john-oldman-wang.github.io/nacre/api/la-context). For all capability packages, see [Core and capability packages](https://john-oldman-wang.github.io/nacre/api/capabilities).

## License

FSL-1.1-MIT, see `LICENSE.md`.
