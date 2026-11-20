# `@nacrejs/keychain`

A capability package for [Nacre](https://john-oldman-wang.github.io/nacre/), a JavaScript runtime for iOS apps: secure storage for tokens and passwords in the keychain. It provides `application.keychain`. The app has it only if the project installs this package.

[Documentation](https://john-oldman-wang.github.io/nacre/api/keychain) · [中文文档](https://john-oldman-wang.github.io/nacre/zh/api/keychain)

## Install

In a Nacre project, two steps.

**1. Install the package.**

```bash
npm install @nacrejs/keychain
```

**2. Bring in its types at the top of the entry file.**

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/keychain" />
```

**Effect**: after you regenerate `ios/` and rebuild, the app includes this capability, and `'keychain' in application` is `true`.

Without the package, `'keychain' in application` is `false` and `application.keychain` is `undefined`, and type checking reports it first.

For how to use it, see [Keychain](https://john-oldman-wang.github.io/nacre/api/keychain). For all capability packages, see [Core and capability packages](https://john-oldman-wang.github.io/nacre/api/capabilities).

## License

FSL-1.1-MIT, see `LICENSE.md`.
