# Writing your own native module

Some capabilities in an app can only be implemented in native code: your company's own native libraries, or third-party services that only ship an iOS SDK (risk control, crash reporting, payments). Wrap such code in a **native module**, and JS can call it.

A native module is a name with three kinds of things under it:

| | Native side | JS side |
| --- | --- | --- |
| Synchronous methods | A handler that returns a value | `module.call('methodName', ...args)`, which gets the return value on the spot |
| Asynchronous methods | A handler that calls `resolve` or `reject` when done | `module.callAsync('methodName', ...args)`, which is a Promise |
| Events | `emitEvent:detail:` | `module.addEventListener('eventName', callback)` |

This page builds a module step by step. It is named `risk` and wraps a hypothetical third-party SDK (`RiskSDK`). When done, it is an npm package that other Nacre projects can install and use. For the full description of the JS side, see the [API documentation](../api/native-modules.md).

The repository has an example you can look at directly: `ios/Capabilities/ExampleModule/` (Swift) and `packages/example-module/` (the package).

## What's in a module's package

```
risk/                            → an npm package
├─ package.json
├─ nacre-ios.json                manifest: tells Nacre this package carries native code
├─ index.js                      the package's own JS: wraps the module's methods as functions
├─ index.d.ts                    types
├─ RiskModule.xcframework/       your native code, precompiled
└─ vendor/RiskSDK.xcframework/   the third-party SDK (if any)
```

When a project that uses this package runs `npm install` and regenerates `ios/`, these two frameworks are embedded in the app. The project doesn't need any native code and doesn't need manual edits to the Xcode project.

## 1. Create a framework project

In Xcode, create a new project using the iOS **Framework** template, with ObjC or Swift as the language. Below, it's assumed to be named `RiskModule`.

Add `Nacre.xcframework` to this target's "Frameworks and Libraries", with the embed option set to **Do Not Embed**. `Nacre.xcframework` is in the `@nacrejs/ios` package. It is "Do Not Embed" because the app embeds the runtime; the module only needs to find its headers at compile time.

Add the third-party SDK in the same place:

- If the SDK is a dynamic framework: also choose **Do Not Embed**, and ship it with the package later (see [step 6](#6-shipping-a-third-party-sdk)).
- If the SDK is a static library (`.a`, or a static framework): link it normally. Its code is compiled into `RiskModule`, so the package doesn't need to carry it.

Set the minimum deployment target to iOS 26.0, the same as the runtime.

## 2. Write the module

The module's code uses only one header, `#import <Nacre/Nacre.h>` (`import Nacre` in Swift). It contains two things: the `NacreModule` class, and the `NacreModuleProvider` protocol used for registration from Swift.

### ObjC

```objc
// RiskModule.m
#import <Nacre/Nacre.h>
#import <RiskSDK/RiskSDK.h>

@interface RiskModuleLoader : NSObject
@end

@implementation RiskModuleLoader

// The system calls this method when the framework is loaded. It runs as soon as
// the app embeds this framework; the app doesn't need to write any code
+ (void)load {
  NacreModule *module = [[NacreModule alloc] initWithName:@"risk"];

  // Synchronous method: returns a value on the spot
  [module addMethod:@"sdkVersion" handler:^id _Nullable(NSArray *arguments) {
    return [RiskSDK version];
  }];

  // Synchronous method: returns an error when the arguments are wrong; call() on the JS side throws it
  [module addMethod:@"setUserId" handler:^id _Nullable(NSArray *arguments) {
    id userId = arguments.firstObject;
    if (![userId isKindOfClass:NSString.class]) {
      return [NacreModule errorWithName:@"TypeError" message:@"setUserId needs a string"];
    }
    [RiskSDK setUserId:userId];
    return nil;
  }];

  // Asynchronous method: calls resolve or reject after the SDK finishes
  [module addAsyncMethod:@"collect"
                 handler:^(NSArray *arguments, NacreModuleResolve resolve,
                           NacreModuleReject reject) {
    id scene = arguments.firstObject;
    if (![scene isKindOfClass:NSString.class]) {
      reject([NacreModule errorWithName:@"TypeError" message:@"collect needs a scene name"]);
      return;
    }
    [RiskSDK collectForScene:scene completion:^(NSString *token, NSError *error) {
      if (error != nil) {
        reject(error);               // An NSError from the SDK can be passed on as is
      } else {
        resolve(@{@"token": token});
      }
    }];
  }];

  // Event: declare the name first. After JS calls watch, every SDK callback emits an event
  [module addEvent:@"levelchange"];
  __weak NacreModule *weakModule = module;   // The module holds the handler, so the handler doesn't hold the module back
  [module addMethod:@"watch" handler:^id _Nullable(NSArray *arguments) {
    [RiskSDK setLevelHandler:^(NSInteger level) {
      [weakModule emitEvent:@"levelchange" detail:@{@"level": @(level)}];
    }];
    return nil;
  }];

  [NacreModule registerModule:module];
}

@end
```

### Swift

Swift has no method that "runs automatically on load", so registration is written differently: write a class that conforms to `NacreModuleProvider`, and build and hand over the module in `nacreModules()`. For how this class is found, see [step 3](#3-registration).

```swift
// RiskModule.swift
import Foundation
import Nacre
import RiskSDK

// The name inside @objc(…) is the name to fill in at step 3
@objc(RiskModuleProvider)
final class RiskModuleProvider: NSObject, NacreModuleProvider {
  static func nacreModules() -> [NacreModule] {
    let module = NacreModule(name: "risk")

    // Synchronous method: returns a value on the spot
    module.addMethod("sdkVersion") { _ in
      RiskSDK.version()
    }

    // Synchronous method: returns an error when the arguments are wrong; call() on the JS side throws it
    module.addMethod("setUserId") { arguments in
      guard let userId = arguments.first as? String else {
        return NacreModule.error(name: "TypeError", message: "setUserId needs a string")
      }
      RiskSDK.setUserId(userId)
      return nil
    }

    // Asynchronous method: calls resolve or reject after the SDK finishes
    module.addAsyncMethod("collect") { arguments, resolve, reject in
      guard let scene = arguments.first as? String else {
        reject(NacreModule.error(name: "TypeError", message: "collect needs a scene name"))
        return
      }
      RiskSDK.collect(forScene: scene) { token, error in
        if let error = error {
          reject(error)                // An error from the SDK can be passed on as is
        } else {
          resolve(["token": token ?? ""])
        }
      }
    }

    // Event: declare the name first. After JS calls watch, every SDK callback emits an event
    module.addEvent("levelchange")
    module.addMethod("watch") { [unowned module] _ in
      RiskSDK.setLevelHandler { level in
        module.emit("levelchange", detail: ["level": level])
      }
      return nil
    }

    return [module]
  }
}
```

The two versions do the same thing. A few rules:

- **Add all methods and events before registering.** Anything added after registration is ignored, and the runtime prints a warning.
- **A synchronous method reports an error by returning an `NSError`**, not by throwing an exception. Returning `nil` means no return value, and JS gets `null`.
- **An asynchronous method calls only one of `resolve` and `reject`, and only once.** A second call is ignored, and the runtime prints a warning. If the handler finishes without calling either, the Promise on the JS side is rejected.
- **Event names must first be declared with `addEvent`.** Emitting an undeclared event drops it, and the runtime prints a warning. On the JS side, listening for an undeclared name doesn't throw: it is just a custom event that native code never fires. So when a name is misspelled, only the native side gets a warning.
- **Module names must be unique across the whole app.** When two modules register the same name, the later registration fails and the runtime prints a warning; the earlier one is unaffected. So include your company or product name in the name.

## 3. Registration

**ObjC**: The `+load` above already registers the module; nothing else is needed.

**Swift**: Make the class from step 2 the framework's principal class. The principal class is the value of the `NSPrincipalClass` entry in the framework's Info.plist.

- When Xcode generates the Info.plist automatically (the default for a new framework project): add an `INFOPLIST_KEY_NSPrincipalClass` entry in the target's Build Settings with the value `RiskModuleProvider`.
- When the project has its own Info.plist file: add an `NSPrincipalClass` entry to it with the value `RiskModuleProvider`.

The name you fill in must be the same as the one inside `@objc(…)`. The first time JS uses `application.nativeModules`, the runtime looks at the principal class of every framework embedded in the app, calls `nacreModules()` once on each one that conforms to `NacreModuleProvider`, and registers the modules it returns.

Modules written in ObjC can also be registered this way; `+load` isn't required.

## 4. Values, errors, and threads

### How values map

Arguments, return values, and an event's `detail` can only be the following kinds, nested in any combination:

| JS | ObjC | What you get in Swift |
| --- | --- | --- |
| `null`, `undefined` | `NSNull` | `NSNull` |
| `true` / `false` | `NSNumber` (boolean) | `NSNumber`; `as? Bool` works |
| Number | `NSNumber` | `NSNumber`; `as? Double` and `as? Int` work |
| String | `NSString` | `String` |
| Array | `NSArray` | `[Any]` |
| Object | `NSDictionary` with `NSString` keys | `[String: Any]` |
| `ArrayBuffer`, `Uint8Array`, etc. | `NSData` | `Data` |

Points to watch:

- **The number of arguments isn't fixed.** `arguments` contains however many JS passed. Check the count before taking one, or use `arguments.firstObject` (`arguments.first` in Swift).
- **`null` is `NSNull`, not `nil`.** Arrays and dictionaries can't contain `nil`. When checking whether an argument has a value, account for both `NSNull` and "not passed".
- **Booleans and numbers are both `NSNumber`.** `boolValue` returns `YES` for both `1` and `true`; in Swift, `as? Bool` also succeeds for `0` and `1`. When you need to tell them apart, use `[NacreModule isBoolean:value]` (`NacreModule.isBoolean(value)` in Swift).
- **Don't trust argument types.** JS can pass any value that can be passed. Check the type first, and report an error if it's wrong.
- **Other types can't be handed over.** Returning an `NSDate`, an `NSURL`, or an object of your own class gives JS a `TypeError`. Convert to a type in the table first (dates to timestamps, URLs to strings). `NaN` and infinity in numbers can't be handed over either.
- **Hand large binary data over directly as an asynchronous method's return value.** Writing `resolve(data)` skips encoding, and the runtime copies the bytes only once. The `ArrayBuffer` JS receives is a separate copy: JS changing it doesn't change your `data`, and the same `data` can be handed over repeatedly. When binary data is inside a dictionary or array, is a synchronous method's return value, or is in an event's data, each chunk is encoded and decoded once.

### Errors

Create errors with these two `NacreModule` methods:

```objc
[NacreModule errorWithName:@"NotLoggedIn" message:@"log in first"];
[NacreModule errorWithName:@"Rejected" message:@"too many requests" code:429];
```

JS gets an `Error` whose `name`, `message`, and `code` are the ones given here. Without a `code`, the error object has no `code` property. When `name` is `TypeError` or `RangeError`, JS gets an error of that class.

An `NSError` from elsewhere (the system, an SDK) can be returned or passed to `reject` as is. The `Error` JS gets has `name` `'Error'`, `message` set to its `localizedDescription`, and `code` and `domain` set to its error code and error domain.

An ObjC exception thrown in a handler is caught by the runtime and becomes an error on the JS side; the app doesn't exit. But don't rely on this to report errors: when an exception is thrown, the SDK's internal state may already be inconsistent. In Swift, `fatalError`, array index out of range, and failed force unwraps can't be caught, and the app exits immediately.

### Threads

- **Handlers are always called on the main thread.** Both synchronous and asynchronous methods.
- **Synchronous methods must be fast.** While one runs, JS and the UI wait for it. Make only things that can be answered immediately into synchronous methods.
- **Make slow work into asynchronous methods, and switch to a background thread yourself in the handler.** The runtime doesn't switch threads for you.

  ```swift
  module.addAsyncMethod("hashFile") { arguments, resolve, reject in
    guard let path = arguments.first as? String else {
      reject(NacreModule.error(name: "TypeError", message: "hashFile needs a path"))
      return
    }
    DispatchQueue.global(qos: .utility).async {
      // This is a background thread
      guard let data = FileManager.default.contents(atPath: path) else {
        reject(NacreModule.error(name: "NotFound", message: "no such file"))
        return
      }
      resolve(data.count)
    }
  }
  ```

- **`resolve`, `reject`, and `emit` can be called from any thread.** The runtime takes care of delivering the result to the thread JS runs on.
- **Events emitted one after another on the same thread are received by JS in the same order.** The order of events emitted from different threads isn't guaranteed.
- **Events with no listener on the JS side aren't delivered and aren't kept.**

## 5. Make it a package

### Build the xcframework

Build once for devices and once for the simulator, then combine them into one `.xcframework`:

```bash
xcodebuild archive -project RiskModule.xcodeproj -scheme RiskModule -configuration Release -destination 'generic/platform=iOS' -archivePath build/device SKIP_INSTALL=NO BUILD_LIBRARY_FOR_DISTRIBUTION=YES
```

```bash
xcodebuild archive -project RiskModule.xcodeproj -scheme RiskModule -configuration Release -destination 'generic/platform=iOS Simulator' -archivePath build/simulator SKIP_INSTALL=NO BUILD_LIBRARY_FOR_DISTRIBUTION=YES
```

```bash
xcodebuild -create-xcframework -framework build/device.xcarchive/Products/Library/Frameworks/RiskModule.framework -framework build/simulator.xcarchive/Products/Library/Frameworks/RiskModule.framework -output RiskModule.xcframework
```

Put the resulting `RiskModule.xcframework` in the package's root directory.

### The manifest `nacre-ios.json`

```json
{
  "capability": "risk",
  "requires": { "runtimeVersion": "0.1.0" },
  "xcframework": "RiskModule.xcframework"
}
```

| Entry | Required | Meaning |
| --- | --- | --- |
| `capability` | Yes | The name of this package. Only with this entry is the package treated as one with native code when the project is generated |
| `xcframework` | Yes | The file name of the precompiled framework in the package's root directory |
| `requires.runtimeVersion` | No | Which runtime version this package was built against. When it differs from the runtime version in the project, generating the project fails with an error |
| `requires.infoPlist` | No | Info.plist keys (usage descriptions) the project must write in `nacre.config.json`; see [Configuring the app: name, languages, usage descriptions](project-config.md) |
| `requires.entitlements` | No | Entitlement keys the project must write |
| `vendoredFrameworks` | No | Third-party frameworks shipped with the package; see [step 6](#6-shipping-a-third-party-sdk) |
| `systemFrameworks` | No | System frameworks the app must link; see [step 6](#6-shipping-a-third-party-sdk) |

### The package's own JS

The recommended approach is to wrap the module's methods as functions and export them. That way, people using the package don't need to know the module and method names, and arguments and return values have types.

```js
// index.js
const native = () => application.nativeModules.get('risk');

/** @returns {string} */
export function sdkVersion() {
  return /** @type {string} */ (native().call('sdkVersion'));
}

/**
 * @param {string} scene
 * @returns {Promise<{ token: string }>}
 */
export function collect(scene) {
  return /** @type {Promise<{ token: string }>} */ (native().callAsync('collect', scene));
}

/**
 * Starts listening for risk level changes. Returns a function; call it to stop listening.
 * @param {(level: number) => void} listener
 */
export function onLevelChange(listener) {
  const module = native();
  /** @param {NativeModuleEvent} event */
  const handler = (event) => {
    const detail = /** @type {{ level: number }} */ (event.detail);
    listener(detail.level);
  };
  module.addEventListener('levelchange', handler);
  module.call('watch');
  return () => module.removeEventListener('levelchange', handler);
}
```

This is ordinary npm package code, bundled into the app by the bundler of the project that uses it. It can only use public APIs such as `application.nativeModules`.

In `package.json`, specify the entry point with `exports`:

```json
{
  "name": "@example/risk",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": { "types": "./index.d.ts", "default": "./index.js" }
  },
  "peerDependencies": { "@nacrejs/types": "*" }
}
```

Write `exports`, not just `main`: Nacre projects bundle with `--platform=neutral`, and with that setting the bundler doesn't read `main`.

### Using it in a project

```bash
npm install @example/risk
```

After installing, regenerate `ios/` (`run-sim.sh` regenerates it on every run). Then in JS:

```js
import { collect, onLevelChange, sdkVersion } from '@example/risk';

console.log('SDK version', sdkVersion());

const stop = onLevelChange((level) => {
  console.log('Risk level changed to', level);
});

collect('login').then(
  (result) => { console.log('Got token', result.token); },
  (/** @type {NativeModuleError} */ err) => { console.log('Collection failed', err.name, err.message); },
);
```

**Effect** (not verified in the simulator; `RiskSDK` is hypothetical): The console prints the SDK's version number; when collection finishes it prints the token, and on failure it prints the error's name and message; each time the risk level changes it prints a line. After `stop()` is called, levels are no longer printed.

Only packages the project **depends on directly** are wired into the Xcode project. If a package is brought in by another package, its native code isn't embedded in the app.

## 6. Shipping a third-party SDK

### Dynamic frameworks: ship them with the package

When the SDK is a dynamic `.xcframework`, the app must contain it: your module loads it at launch, and without it the app exits as soon as it starts. Put it in the package and list it in the manifest:

```json
{
  "capability": "risk",
  "requires": { "runtimeVersion": "0.1.0" },
  "xcframework": "RiskModule.xcframework",
  "vendoredFrameworks": ["vendor/RiskSDK.xcframework"]
}
```

Write paths relative to the package directory. When the project is generated, each one listed is embedded in the app and signed along with your module.

| Mistake | Error when generating the project |
| --- | --- |
| Not an array, or an item isn't a string | Names the package and says to write it as a list of paths |
| Not an `.xcframework` | Names the package and the item. A standalone `.framework` isn't accepted: it covers only one of device or simulator |
| The path doesn't exist, or points outside the package | Names the package and the item |
| It contains a static library | Names the package and the item. Static libraries don't go here; see below |
| Same name as a framework shipped by another package | Names both packages |

### Static libraries: link them into your own framework

When the SDK is a static library (`.a`, or a static `.xcframework`), don't list it in `vendoredFrameworks`. Link it normally in the project from step 1; its code is then inside `RiskModule.xcframework`, and the package doesn't need to carry it.

### System frameworks the SDK asks you to add

System frameworks your framework uses directly don't need to be declared; they're already recorded in it at compile time.

What needs declaring is the kind an SDK's integration guide lists under "add the following system libraries to your project". Such SDKs look up system classes by name at runtime, and the corresponding system framework is loaded only if something links it. List them in the manifest, and the generated app links them:

```json
{
  "capability": "risk",
  "requires": { "runtimeVersion": "0.1.0" },
  "xcframework": "RiskModule.xcframework",
  "systemFrameworks": ["CoreTelephony.framework", "libz.tbd"]
}
```

Write system frameworks as `Name.framework` and system libraries as `libName.tbd`, with only the name and no path. Anything else makes project generation fail with an error naming the package.

### Not supported

SDKs distributed through CocoaPods or Swift Package Manager can't be referenced directly. First build them into an `.xcframework` (most SDKs' release pages also provide one directly), then ship them as described above.

When the SDK needs usage descriptions (`NS…UsageDescription` in Info.plist), list the key names in the manifest's `requires.infoPlist`. When a project using this package hasn't written the corresponding description, generating the project fails with an error; see [Configuring the app: name, languages, usage descriptions](project-config.md).

## When the module doesn't show up

When `application.nativeModules.get('risk')` throws `no native module named "risk"` in JS, the end of the error lists the modules that are registered. Check in this order:

1. **Is the package installed?** The package must be in `dependencies` or `devDependencies` of the project's `package.json`, and have a `nacre-ios.json` in its root directory with `capability` in it. The "Capability packages:" line printed when `ios/` is generated should include this package's name.
2. **Did you regenerate?** After installing a package, regenerate `ios/` and rebuild the app.
3. **Swift: is the principal class name right?** The value of `NSPrincipalClass` must be exactly the same as the name inside `@objc(…)`, and the class must conform to `NacreModuleProvider`.
4. **Is the name already taken?** Check whether the runtime log contains `a module named "risk" is already registered`.
5. **Runtime warnings.** All module-related warnings start with `[nacre] native module warning:`.

---

← Back to [Guides](README.md)
