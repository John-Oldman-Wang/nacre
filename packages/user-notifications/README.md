# `@nacrejs/user-notifications`

A capability package for [Nacre](https://john-oldman-wang.github.io/nacre/), a JavaScript runtime for iOS apps: local notifications, and events when a notification arrives or is tapped. It provides `UNUserNotificationCenter` and the classes around it. The app has it only if the project installs this package.

[Documentation](https://john-oldman-wang.github.io/nacre/api/un-user-notification-center) · [中文文档](https://john-oldman-wang.github.io/nacre/zh/api/un-user-notification-center)

The permission prompt for notifications uses the system's own wording, so there is no usage description to write.

## Install

In a Nacre project, two steps.

**1. Install the package.**

```bash
npm install @nacrejs/user-notifications
```

**2. Bring in its types at the top of the entry file.**

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/user-notifications" />
```

**Effect**: after you regenerate `ios/` and rebuild, the app includes this capability, and `typeof UNUserNotificationCenter !== 'undefined'` is `true`.

Without the package, its classes don't exist: reading one throws `ReferenceError`, and type checking reports it first.

For how to use it, see [Notifications](https://john-oldman-wang.github.io/nacre/api/un-user-notification-center). For all capability packages, see [Core and capability packages](https://john-oldman-wang.github.io/nacre/api/capabilities).

## License

FSL-1.1-MIT, see `LICENSE.md`.
