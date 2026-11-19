# Building your own app

Build an iOS App that uses Nacre from scratch: four files, a few packages, two commands, and it shows up in the simulator.

## What you need

| | |
| --- | --- |
| macOS | Apple Silicon |
| Xcode | 26 or later, with an iOS 26 or later simulator installed (Xcode → Settings → Components). The commands in this guide were verified by testing on Xcode 27.2; they haven't been verified on Xcode 26 yet |
| [XcodeGen](https://github.com/yonaskolb/XcodeGen) | `brew install xcodegen`. Nacre generates a project description, and XcodeGen turns it into an Xcode project |
| Node | 20 or later |

## 1. Create the project directory

A Nacre project needs only three files, plus one for type checking.

```bash
mkdir my-app && cd my-app && mkdir src
```

`package.json`:

```json
{
  "name": "my-app",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "esbuild src/main.js --bundle --format=iife --platform=neutral --charset=utf8 --outfile=ios/JS/main.js",
    "check": "tsc --noEmit",
    "ios": "nacre generate . && npm run build && cd ios && xcodegen generate"
  }
}
```

The four flags on the `build` line can't be changed; see [Bundling constraints](#bundling-constraints). The `ios` line chains the three steps of generating the project; step 3 below uses it.

`nacre.config.json`:

```json
{
  "name": "MyApp",
  "bundleId": "com.example.myapp"
}
```

These are the two required entries. The App's display name, supported languages, and usage descriptions also go in this file; see [Configuring the app: name, languages, usage descriptions](project-config.md).

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["ESNext"],
    "module": "Preserve",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "allowJs": true,
    "checkJs": true,
    "types": []
  },
  "include": ["src/**/*.js"]
}
```

Two entries are worth explaining: `"lib": ["ESNext"]` has **no `DOM`**. This runtime has no `window`, `document`, or `location`, and including DOM would make them look like they exist in the editor. `"checkJs": true` makes `.js` files actually type-checked, not just autocompleted.

`src/main.js`:

```js
/// <reference types="@nacrejs/types" />

application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const label = new UILabel();
  label.text = 'Hello';
  label.font = UIFont.systemFontOfSize(28, { weight: 'semibold' });
  label.textColor = 'label';
  label.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(label);

  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    label.centerXAnchor.constraintEqualToAnchor(safe.centerXAnchor),
    label.centerYAnchor.constraintEqualToAnchor(safe.centerYAnchor),
  ]);

  console.log('Up and running');
});
```

**Effect**: the directory contains `package.json`, `nacre.config.json`, `tsconfig.json`, and `src/main.js`.

`sceneconnect` is the App's entry point: it fires when the system connects a scene, and the windows and view controllers are all built by JS. See [`application`](../api/application.md) for details.

## 2. Install dependencies

```bash
npm install -D @nacrejs/ios @nacrejs/cli @nacrejs/types esbuild typescript
```

**Effect**: these five appear in `node_modules/`, and `package.json` gains `devDependencies`.

| Package | What it provides |
| --- | --- |
| `@nacrejs/ios` | The compiled runtime (`Nacre.xcframework`) and the launch shell |
| `@nacrejs/cli` | The `nacre` command: generates the iOS project from your project |
| `@nacrejs/types` | Types. Once installed, `UIWindow`, `UILabel`, and the rest get autocompletion in the editor |
| `esbuild` | Bundles your JS into one file |
| `typescript` | Type checking |

```bash
npm run check
```

**Effect**: no output means no problems. Change `weight: 'semibold'` to `'semibld'` and run it again, and it tells you:

```
src/main.js(12,46): error TS2820: Type '"semibld"' is not assignable to
type 'UIFontWeight | undefined'. Did you mean '"semibold"'?
```

Type checking is the first line of defense, and many mistakes **can only be caught by it**: a misspelled property name isn't reported at runtime (see [Native classes](../api/native-classes.md)), so don't skip this step.

## 3. Generate the project

```bash
npm run ios
```

**Effect**: an `ios/` directory appears in the project, containing `MyApp.xcodeproj`. The last few lines in the terminal are:

```
Generated ios (runtime: framework)
Capability packages: none (core only)
…
Created project at …/my-app/ios/MyApp.xcodeproj
```

This command chains three steps. To fit them into your own workflow, call them separately:

```bash
# 1. Generate ios/: the launch shell, project description, resources, and the precompiled runtime
npx nacre generate .

# 2. Bundle the JS → ios/JS/main.js
npm run build

# 3. Turn the project description into an Xcode project
(cd ios && xcodegen generate)
```

## 4. Run it

With Xcode:

```bash
open ios/MyApp.xcodeproj
```

**Effect**: Xcode opens the project. Choose a simulator at the top and click Run. The simulator shows "Hello" in the middle of the screen, and Xcode's console prints `[JS][log] Up and running`. (The command-line route was verified by testing; the step of clicking Run in Xcode is not verified in the simulator.)

You can also skip Xcode and use only the command line. First have a simulator running, then:

```bash
xcodebuild -project ios/MyApp.xcodeproj -scheme App -sdk iphonesimulator \
  -destination 'generic/platform=iOS Simulator' -derivedDataPath ios/build -quiet build
```

```bash
xcrun simctl install booted ios/build/Build/Products/Debug-iphonesimulator/MyApp.app
```

```bash
xcrun simctl launch --console-pty booted com.example.myapp
```

**Effect**: the first command compiles; no `error` means success (it prints two lines starting with `[MT]`, which you can ignore). The second installs the App on the running simulator. The third launches the App and connects its output to the terminal:

```
[nacre] Nacre 0.0.1, V8 14.9.207.39 initialized in 9.1 ms, context ready in 14.3 ms
[nacre] builtin script ready in 32.0 ms (40 parts)
[nacre] main.js finished in 0.4 ms
[JS][log] Up and running
```

Press Ctrl+C to exit. `com.example.myapp` in the last command is the `bundleId` written in `nacre.config.json`.

## 5. Change a line and run again

Change `'Hello'` in `src/main.js` to something else, then:

```bash
npm run build
```

Click Run in Xcode again (or rerun the three commands from step 4).

**Effect**: the text in the simulator changes accordingly.

When you change only JS, you don't need to regenerate the project; `npm run build` is enough, but **you have to recompile, reinstall, and relaunch the App every time**. If you change `nacre.config.json`, replace the icon, or install or uninstall a capability package, rerun `npm run ios`.

## What each thing in the project is

```
my-app/
├─ package.json           dependencies and the bundling command
├─ nacre.config.json      the App's name and bundle ID
├─ icon.png               App icon (optional)
├─ launch.png             image on the launch screen (optional)
├─ src/main.js            JS entry point
├─ assets/                images and other resources (optional)
└─ ios/                   ← generated; don't edit it by hand or commit it
```

`icon.png` is the App icon on the Home Screen: a 1024×1024 pixel PNG with a fixed file name, in the project root. Without it the App still runs, and the Home Screen shows the system's placeholder icon. For the other icon file format and the details, see [App icon in Configuring the app](project-config.md#app-icon).

`launch.png` is the image in the center of the launch screen. The launch screen is what the system shows before the App's UI appears; its background color is set in `launchScreen` in `nacre.config.json`. Both are optional; see [Launch screen in Configuring the app](project-config.md#launch-screen).

Files under `assets/` are placed in `JS/assets/` in the App bundle. Use them in JS like this:

```js
const icon = UIImage.imageNamed('JS/assets/icon');
```

**Effect**: `assets/icon.png` (and `icon@2x.png`, `icon@3x.png`) is loaded, and the system picks one by screen scale. See [`UIImage`](../api/ui-image.md) for details.

## Using a capability not in the core

Some capabilities aren't in the core; each is a separate package that you install to use. For all packages, see [Core and capability packages](../api/capabilities.md). The example below uses Keychain (`@nacrejs/keychain`). It doesn't need a usage description; packages that do also need a line in `nacre.config.json`; see [Configuring the app: name, languages, usage descriptions](project-config.md).

Install it:

```bash
npm install -D @nacrejs/keychain
```

Add a line at the top of `src/main.js` to bring in its types:

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/keychain" />
```

Run `npm run ios` again, then run the App as in step 4.

**Effect**: generation prints an extra line, `Capability packages: @nacrejs/keychain`; the launch log becomes `… (40 parts + 1 from NacreKeychain)`; and [`application.keychain`](../api/keychain.md) can be used in JS.

For a package that needs a usage description (such as `@nacrejs/local-authentication` for Face ID), if it's installed but that line isn't in `nacre.config.json`, generation stops and tells you what's missing, without touching any files:

```
nacre: @nacrejs/local-authentication needs NSFaceIDUsageDescription in Info.plist: a sentence shown to the user explaining why the app needs this permission. Put it in ios.infoPlist in nacre.config.json
```

**Whichever packages are installed, the generated project embeds their frameworks; packages that aren't installed aren't in the output.** When it isn't installed, the `application.keychain` property doesn't exist, and type checking reports it too, so you never end up with "fine while writing, unusable at runtime".

Only packages you write into your own `package.json` count. A library that depends on a capability package doesn't quietly make your App embed another framework; if you want it, install it yourself.

## `ios/` is generated and can be deleted at any time

The whole `ios/` directory is generated by `nacre generate` from the launch shell in `@nacrejs/ios`. **Editing it by hand is pointless**: the next generation overwrites it.

```bash
rm -rf ios && npm run ios
```

**Effect**: `ios/` reappears with the same contents as before deletion, and compiles and runs as usual.

So it shouldn't go into version control. Add a line to `.gitignore`:

```
ios/
```

## Bundling constraints

Four flags of the `build` command in `package.json` can't be changed:

| Flag | What happens if you change it |
| --- | --- |
| `--format=iife` | An `import` in ESM output throws immediately |
| `--platform=neutral` | The bundler must not inject Node shims such as `process` and `Buffer`; the runtime doesn't have them |
| No `--minify` | Error line numbers refer to the bundle output, so you have to look them up there; minified output makes that impossible |
| `--charset=utf8` | Same as above: text squashed into escape sequences is unreadable |

Another bundler works too, as long as it meets these four conditions. They are also written, machine-readable, in `node_modules/@nacrejs/ios/nacre-ios.json`.

## Installing on a device

The only difference from the simulator is signing, so there's no one-step script. Roughly:

1. Generate the project with `npm run ios`
2. Open `ios/MyApp.xcodeproj` in Xcode and choose your developer account under Signing & Capabilities
3. Choose the device and run

> **Note:** `ENABLE_DEBUG_DYLIB` is turned off in the generated project. Don't turn it on; linking fails if you do.

To publish on the App Store, there are two more things.

**Include the third-party notices.** `Nacre.framework` has third-party libraries compiled in, and by embedding it your App distributes that code too. Their licenses require including notices when distributing; the full text is in `node_modules/@nacrejs/ios/THIRD-PARTY-NOTICES.md`. The usual approach is to put an "Acknowledgements" or "Open source licenses" screen in the App that displays it.

**Privacy manifest.** The App Store requires you to declare what data your App collects (`NSPrivacyTracking` and `NSPrivacyCollectedDataTypes` in `PrivacyInfo.xcprivacy`). You have to write this yourself; it would be wrong for us to fill it in for you. **The runtime's part is taken care of**: `Nacre.framework` ships with its own, declaring the system APIs it uses.

## Building your own Xcode project without the CLI

You can also drag `Nacre.xcframework` (under `node_modules/@nacrejs/ios/`) into an existing project. Each capability not in the core is a separate xcframework in its own package (such as `node_modules/@nacrejs/keychain/NacreKeychain.xcframework`); drag in and embed the ones you want. **For a capability that isn't embedded, the corresponding property doesn't exist**; for example, `'keychain' in application` is `false`.

There are also three things you **must configure yourself**; missing any of them causes problems:

| What to configure | What happens if you miss it |
| --- | --- |
| Add `-Wl,-stack_size,0x800000` to `Other Linker Flags` | On a device, the main thread runs out of stack |
| Set `ENABLE_DEBUG_DYLIB` to `NO` | The linker flag above fails outright |
| Add the JS directory (containing `main.js`) to the App bundle as a **folder reference** | The runtime can't find `main.js`, and the App is blank after launch |

In addition, the launch shell must start the runtime in `AppDelegate`:

```swift
import Nacre

let runtime = NacreRuntime()
if let scripts = Bundle.main.url(forResource: "JS", withExtension: nil) {
    runtime.start(withScriptsDirectory: scripts)
}
```

The complete list is in `node_modules/@nacrejs/ios/`: `nacre-ios.json` is the machine-readable version, and the original launch shell is next to it in `template/`.

## Next steps

- [Configuring the app: name, languages, usage descriptions](project-config.md): display name, languages, usage descriptions, icon, launch screen
- [Writing your own native module](native-modules.md): bringing in your own or third-party native SDKs for JS to call
- [API documentation](../api/README.md): every capability the runtime provides
- [How the runtime works](../api/how-it-works.md): JS and the UI share one thread, and this holds for every API
- [`application`](../api/application.md): the App instance, scenes, and the global error outlet
