# `@nacrejs/contacts`

A capability package for [Nacre](https://john-oldman-wang.github.io/nacre/), a JavaScript runtime for iOS apps: letting the user pick contacts with the system contact picker. It provides `CNContactPickerViewController` and `CNContact`. The app has it only if the project installs this package.

[Documentation](https://john-oldman-wang.github.io/nacre/api/contacts) · [中文文档](https://john-oldman-wang.github.io/nacre/zh/api/contacts)

The system picker gives the app only the contacts the user picks, so no contacts permission is needed.

## Install

In a Nacre project, two steps.

**1. Install the package.**

```bash
npm install @nacrejs/contacts
```

**2. Bring in its types at the top of the entry file.**

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/contacts" />
```

**Effect**: after you regenerate `ios/` and rebuild, the app includes this capability, and `typeof CNContactPickerViewController !== 'undefined'` is `true`.

Without the package, its classes don't exist: reading one throws `ReferenceError`, and type checking reports it first.

For how to use it, see [Contact picker](https://john-oldman-wang.github.io/nacre/api/contacts). For all capability packages, see [Core and capability packages](https://john-oldman-wang.github.io/nacre/api/capabilities).

## License

FSL-1.1-MIT, see `LICENSE.md`.
