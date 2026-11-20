# `@nacrejs/ios`

> Node.js for servers, browsers for the web, Nacre for apps.

Nacre is a JavaScript runtime for iOS apps. Native APIs are exposed to JS, the UI is made of native views, and JS decides everything the app does.

This package is what goes into your project's `ios/` folder: the compiled runtime (`Nacre.xcframework`), the launch shell, and a manifest. It has no commands. The `nacre` command from [`@nacrejs/cli`](https://www.npmjs.com/package/@nacrejs/cli) reads it from `node_modules/@nacrejs/ios` and generates `ios/`.

[Documentation](https://john-oldman-wang.github.io/nacre/) · [中文文档](https://john-oldman-wang.github.io/nacre/zh/)

## Install

```bash
npm install -D @nacrejs/ios @nacrejs/cli @nacrejs/types esbuild typescript
```

| Package | What it provides |
| --- | --- |
| `@nacrejs/ios` | The compiled runtime and the launch shell |
| `@nacrejs/cli` | The `nacre` command: generates the iOS project from your project |
| `@nacrejs/types` | Types for the editor and the type checker |
| `esbuild` | Bundles your JS into one file |
| `typescript` | Type checking |

For the full walkthrough from an empty folder to the app running in the simulator, see [Building your own app](https://john-oldman-wang.github.io/nacre/guides/your-own-app).

## Requirements

| | |
| --- | --- |
| Device | iPhone, iOS 26 or later. Real devices and Apple Silicon simulators (arm64) |
| Xcode | 26 or later |
| [XcodeGen](https://github.com/yonaskolb/XcodeGen) | `brew install xcodegen`. Nacre generates a project description, and XcodeGen turns it into an Xcode project |
| Node | 20 or later |

## A Nacre project

```
my-app/
├─ package.json
├─ nacre.config.json      the app's name, bundle ID and other settings
├─ icon.png / icon.icon   the app icon (optional)
├─ launch.png             the image in the middle of the launch screen (optional)
├─ src/main.js            the JS entry point
├─ assets/                images and other resources
└─ ios/                   generated; keep it out of version control, delete and regenerate it at any time
```

`nacre.config.json` has two required entries:

```json
{ "name": "MyApp", "bundleId": "com.example.myapp" }
```

The display name, supported languages, orientations, usage descriptions, URL schemes, entitlements, app icon and launch screen are all set in the project, not in Xcode. See [Configuring the app](https://john-oldman-wang.github.io/nacre/guides/project-config).

## Capability packages

Location, the camera, Face ID and a few other system capabilities are separate packages. The app has a capability only if the project installs its package. See [Core and capability packages](https://john-oldman-wang.github.io/nacre/api/capabilities).

Your own native code and third-party native SDKs come in as [native modules](https://john-oldman-wang.github.io/nacre/guides/native-modules).

## Privacy manifest

`Nacre.xcframework` carries its own `PrivacyInfo.xcprivacy`, which declares the required-reason APIs the runtime uses. Your app doesn't need to declare anything for the runtime.

## License

FSL-1.1-MIT, see `LICENSE.md`. The runtime includes V8 and the libraries it depends on; their licenses are in `THIRD-PARTY-NOTICES.md`.
