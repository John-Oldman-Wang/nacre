# Configuring the app: name, languages, usage descriptions

The app's name, bundle ID, supported languages, the sentence shown when asking the user for a permission, and which links can open it are all written in `nacre.config.json` at the project root. When `ios/` is generated, this configuration is written into the native project. Nothing in the `ios/` directory needs to be edited by hand.

The app icon and the launch screen image are not written in this file. They are files with fixed names at the project root; see [App icon](#app-icon) and [Launch screen](#launch-screen).

After changing `nacre.config.json`, or replacing the icon or the launch screen image, regenerate `ios/` for the change to take effect. When running with `run-sim.sh`, it regenerates every time.

## All configuration options

```json
{
  "name": "Shop",
  "bundleId": "com.example.shop",
  "displayName": { "en": "Shop", "zh-Hans": "小店" },
  "version": "1.2.0",
  "buildNumber": "34",
  "launchScreen": { "light": "#FFFFFF", "dark": "#101826" },
  "ios": {
    "languages": ["en", "zh-Hans"],
    "urlSchemes": ["myapp"],
    "infoPlist": {
      "NSFaceIDUsageDescription": {
        "en": "Confirm orders with Face ID",
        "zh-Hans": "用面容 ID 确认下单"
      }
    },
    "entitlements": {
      "com.apple.developer.associated-domains": ["applinks:example.com"]
    }
  }
}
```

**Effect**: the generated app is called Shop on English-language phones and `小店` on Simplified Chinese phones; the launch screen is white in light mode and dark blue in dark mode; when asking for Face ID permission, the system alert shows the sentence for the corresponding language; links starting with `myapp://` open it.

| Option | Required | Type | Meaning |
| --- | --- | --- | --- |
| `name` | Yes | String | The name of the project and build product. Not shown to the user; must be a single string |
| `bundleId` | Yes | String | The bundle ID, the app's unique identifier in the system |
| `displayName` | No | String, or an object keyed by language | The name shown under the icon. Defaults to `name` |
| `version` | No | String | The version number shown to users. Defaults to `"0.1.0"` |
| `buildNumber` | No | String | The build number. Defaults to `"1"` |
| `deploymentTarget` | No | String | The minimum supported iOS version. Defaults to the lowest version the runtime supports |
| `launchScreen` | No | Color string, or `{ light, dark }` | The background color of the [launch screen](#launch-screen). Written at the top level, not under `ios` |
| `ios.languages` | No | Array of language codes | Which languages the app supports. The first is the default language |
| `ios.urlSchemes` | No | Array of scheme names | Which custom schemes (`myapp://…`) can open this app |
| `ios.infoPlist` | No | Object | Keys and values written into Info.plist. Usage descriptions go here |
| `ios.entitlements` | No | Object | The app's entitlements |

Info.plist is a configuration file inside an iOS app bundle, from which the system reads the app's name, version, and various declarations. An entitlement is a special capability the app requests from the system (push notifications, associated domains), written into the app at signing.

## Declaring the languages the app supports

```json
{
  "name": "Shop",
  "bundleId": "com.example.shop",
  "ios": { "languages": ["en", "zh-Hans"] }
}
```

**Effect**: when the phone's language is Simplified Chinese, text provided by the system in the app is shown in Chinese; when it is English or any other language, it is shown in English.

"Text provided by the system" means text you did not write, such as descriptions in system errors and the fixed buttons in system alerts. The system error when reading a nonexistent file, measured:

| `ios.languages` | Phone language | Error text |
| --- | --- | --- |
| Not set | Simplified Chinese | `The file “missing.txt” couldn’t be opened because there is no such file.` |
| `["en", "zh-Hans"]` | Simplified Chinese | `未能打开文件“missing.txt”，因为它不存在。` |
| `["en", "zh-Hans"]` | Japanese | `The file “missing.txt” couldn’t be opened because there is no such file.` |

Rules:

- **Without `ios.languages`, system text is always English** and does not follow the phone's language.
- If the phone's language is in the list, that language is used; if not, the first in the list is used.
- Language codes use the system's spelling: `en`, `zh-Hans` (Simplified Chinese), `zh-Hant` (Traditional Chinese), `ja`, `pt-BR`.
- It does not affect the results of [`Intl`](../api/intl.md). Numbers and dates follow the phone's language and region, regardless of which languages are listed here (verified by testing).

Text in your own UI is not governed by this option. Which translation approach to use is up to you; this option only decides the system's part of the text.

> **Note:** Write Simplified Chinese as `zh-Hans`, not `zh-CN`. Generation checks only the format of the code; `zh-CN` is well-formed and does not produce an error, but the system does not treat it as Simplified Chinese.

## Writing the app name per language

```json
{
  "displayName": { "en": "Shop", "zh-Hans": "小店" },
  "ios": { "languages": ["en", "zh-Hans"] }
}
```

**Effect**: the name under the icon on the home screen is Shop on English-language phones and `小店` on Simplified Chinese phones. **How it looks on the home screen is not verified in the simulator**; testing confirms the generated app bundle contains a name for each of the two languages.

When `displayName` is a string, all languages use the same name.

## App icon

The app icon is the image that represents the app on the home screen. Put the icon file at the project root, next to `nacre.config.json`, with a fixed file name. Nothing needs to be written in `nacre.config.json`.

```
my-app/
├─ package.json
├─ nacre.config.json
├─ icon.png               app icon: a 1024×1024 pixel PNG
├─ src/main.js
└─ assets/
```

**Effect**: after regenerating and installing, the app's icon on the home screen is this image (verified by testing).

Two kinds of file are recognized; provide one:

| File | What it is | When to use it |
| --- | --- | --- |
| `icon.png` | A 1024×1024 pixel PNG | You have just one image. Use this in most cases |
| `icon.icon` | An icon file saved by Icon Composer | You want to decide how the icon looks in dark, tinted, and other styles |

If both are present, `icon.icon` is used, with no error.

> **Note:** The file name must match exactly, all lowercase. `Icon.png`, `icon.PNG`, and `AppIcon.png` are not recognized; the effect is the same as having no icon, and generation gives no hint.

### Using a PNG

- The size must be exactly 1024×1024 pixels. Otherwise generation reports an error; see [Errors for invalid configuration](#errors-for-invalid-configuration).
- Only this one image is needed. The various small sizes used on the home screen, in Settings, and in search results are scaled down from it by the system.
- The image should fill the whole square; do not draw rounded corners yourself. The system clips it to the rounded shape when displaying it (measured: a square image with sharp corners has rounded corners on the home screen).
- A PNG with an alpha channel compiles (verified by testing). What the transparent parts look like on the home screen, and whether App Store submission rejects it, is **not verified**.

When the system switches to dark mode, the icon does not change (measured: after switching, every app icon on the home screen looked the same as before). The iOS home screen has a separate icon style setting, under "Customize" on the home screen, where the user can choose dark, tinted, and other styles for all icons. `icon.png` is a single image with no versions prepared for those styles (testing shows the generated app bundle contains only this one). What the system turns it into when the user chooses those styles is **not verified in the simulator**. To decide how it looks in those styles yourself, use `icon.icon`.

### Using an Icon Composer icon file

Icon Composer is Apple's icon-making tool, installed with Xcode (on Xcode 27.2 it is at `/Applications/Xcode.app/Contents/Applications/Icon Composer.app`). In it, you split the icon into a background and several layers of artwork, adjust how it looks in light, dark, and tinted styles, and save it as a file with the extension `.icon`. Rename it to `icon.icon` and put it at the project root:

```
my-app/
├─ nacre.config.json
├─ icon.icon/             shown as a single file in Finder, but actually a directory
│  ├─ icon.json
│  └─ Assets/
└─ src/main.js
```

**Effect**: the home screen shows the icon designed in this file (verified by testing). The generated app bundle contains light, dark, and tinted sets (verified by testing); how it looks on screen when the home screen switches to dark or tinted style is **not verified in the simulator**.

Testing used a minimal hand-written icon file; a file actually saved by Icon Composer is **not verified**.

- `icon.icon` is a directory; commit the whole directory to version control.
- When the file's content is wrong (`icon.json` is malformed, or a referenced layer image is missing), generation does not report an error; compilation does, pointing to this file.

### No icon

Having no icon is not an error. Generation reports no error and gives no hint. The app compiles and runs as usual, and the home screen shows the system placeholder icon: a gray grid on a white background (verified by testing).

If you want an icon, provide one.

### These files are not icons

| File | Why it is not recognized |
| --- | --- |
| `icon-dark.png`, `icon-tinted.png` | A separate PNG per style is not supported. For per-style icons, use `icon.icon` |
| `assets/icon.png` | `assets/` holds resources for JS, and the whole directory goes into the app bundle. This file can still be loaded by JS, but it is not the app icon |
| `Icon.png`, `icon.jpg`, `AppIcon.png` | Wrong file name |

## Launch screen

The launch screen is what the system shows after the user opens the app and before the app's own UI appears. It consists of a background color and a centered image. The background color is written in `nacre.config.json`; the image is `launch.png` at the project root.

```json
{
  "name": "Shop",
  "bundleId": "com.example.shop",
  "launchScreen": "#0A84FF"
}
```

```
my-app/
├─ nacre.config.json
├─ launch.png             launch screen image: a PNG with a transparent background
├─ src/main.js
└─ assets/
```

**Effect**: when the app launches, the whole screen is blue (`#0A84FF`), with `launch.png` in the center (verified by testing).

Either the background color or the image can be omitted; omitting them is not an error, and generation gives no hint:

| `launchScreen` | `launch.png` | What the launch screen looks like |
| --- | --- | --- |
| Set | Present | The image on the background color |
| Set | Absent | The whole screen is that color |
| Not set | Present | The image on the system background. The system background is white in light mode and black in dark mode |
| Not set | Absent | A blank screen: white in light mode, black in dark mode |

All four were verified in the simulator, once each in light and dark mode.

### Writing the background color

There are two forms. A single color value, used in both modes:

```json
{ "launchScreen": "#0A84FF" }
```

**Effect**: the launch screen is this blue in both light and dark mode (verified by testing).

Or one for each mode:

```json
{ "launchScreen": { "light": "#FFFFFF", "dark": "#101826" } }
```

**Effect**: the launch screen is white when the phone is in light mode and dark blue in dark mode (verified by testing). Which one is used depends on the system appearance setting at the moment of launch (Settings → Display & Brightness).

- A color value is `#` followed by 6 hex digits; 3 digits also work (`#08F` equals `#0088FF`). Letters can be upper or lower case.
- Forms with transparency (4 or 8 digits), color names, and `rgb()` are not recognized.
- When split by mode, both `light` and `dark` are required. Other keys are ignored.
- `launchScreen` goes at the top level of `nacre.config.json`, not under `ios`.

> **Note:** When `launchScreen` cannot be recognized (one of the three rules above is not met), generation reports no error and gives no hint, and treats it as not set: the launch screen background is the system default, white in light mode and black in dark mode. If the launch screen background is not the color you wrote, check how this option is written first.

### Adding an image

The image file name is fixed as `launch.png`, at the project root.

- **It is treated as a 3x image**: the pixel count divided by 3 is its size on screen. A 360×360 pixel image is shown at 120×120 [pt](../api/units.md) (verified by testing).
- **It is shown at its own size, never enlarged**, in the center of the screen.
- **When larger than the screen, it is scaled down proportionally to just fit**, without cropping or distortion. Measured: an 1800×1800 pixel (600×600 pt) image is shown at 420×420 pt on a screen 420 pt wide.
- Use a PNG with a transparent background; the background color shows through the transparent parts.
- Light and dark mode use the same image. Without a background color the background is white or black, so a white image is invisible in light mode (verified by testing). If the image is not clearly visible on both black and white, set a background color.
- Width times height must not exceed 4 million pixels (2000×2000, for example); beyond that, generation reports an error. Measured: when the image is too large, the system does not show the launch screen and the whole screen is black: 2400×2400 pixels was fine, 2600×2600 went black.

Testing used a 3x simulator. How it looks on 2x devices is **not verified**.

> **Note:** As with the icon, the file name must match exactly, all lowercase. `Launch.png`, `launch@3x.png`, and `assets/launch.png` are not recognized; the effect is the same as having no image, and generation gives no hint.

### How long the launch screen is shown

The system shows the launch screen and the system removes it; there is no API to keep it up longer.

Measured: in an app that created its window 7 seconds after JS started, the launch screen disappeared about 2 seconds after launch, followed by a black screen until the window appeared.

So create the window and the first view controller right at the start of `main.js`, and do time-consuming work such as network requests and reading large files after the view controller appears. That way the app's UI follows the launch screen directly, with no black screen in between.

The system caches the launch screen image. If you still see the old one on the phone after changing the launch screen, delete and reinstall the app (this is **not verified**: during verification the app was deleted and reinstalled every time).

### Using your own storyboard

When the form above is not enough (you need two images, or an image off-center), you can write the launch screen yourself. A storyboard is an Xcode interface file whose content is XML. Name it `launch.storyboard` and put it at the project root:

```
my-app/
├─ nacre.config.json
├─ launch.storyboard      your own launch screen
├─ src/main.js
└─ assets/
   └─ mark.png            image used in the storyboard
```

**Effect**: the launch screen looks as this file draws it (verified by testing). `launchScreen` and `launch.png` are no longer used; leaving them in place does not cause an error.

- **Put images in `assets/`, and in the storyboard write the image name as `JS/assets/` plus the file name**, such as `JS/assets/mark`. Testing shows it is found with or without `.png`, and files with a scale suffix such as `mark@3x.png` are recognized too. `launch.png` at the project root cannot be referenced.
- Referencing an image that does not exist causes no error; that spot is empty (verified by testing).
- Colors can only be fixed color values or system colors.
- The system does not allow custom classes in launch screen storyboards. Using one makes compilation report `Launch screens may not set custom classnames` (verified by testing).
- Generation does not check the file's content. When the content is wrong, compilation reports an error pointing to this file.

Testing used a hand-written storyboard; a launch screen file created and saved in Xcode is **not verified**.

## Writing usage descriptions

The first time an app uses a capability such as the camera, Face ID, or location, the system shows an alert asking whether the user agrees, containing a sentence you wrote explaining why it is needed. This sentence goes in `ios.infoPlist`, under a key name defined by the system.

```json
{
  "ios": {
    "infoPlist": {
      "NSCameraUsageDescription": "Scan the QR code on a payment page"
    }
  }
}
```

**Effect**: the first time the app opens the camera, the system alert shows this sentence.

To write it per language, make the value an object:

```json
{
  "ios": {
    "languages": ["en", "zh-Hans"],
    "infoPlist": {
      "NSCameraUsageDescription": {
        "en": "Scan the QR code on a payment page",
        "zh-Hans": "扫描付款页上的二维码"
      }
    }
  }
}
```

**Effect**: the sentence in the alert follows the phone's language. Testing shows that in the generated app bundle, the default language's sentence is in Info.plist and each language has its own copy. How the alert looks on screen is **not verified in the simulator**.

- If a language is missing, that language shows the default language's sentence. Generation prints a one-line hint; it is not an error.
- The sentence for the default language (the first in `ios.languages`) is required.
- Every language in the object must be in `ios.languages`.

### Installing a capability package without writing the usage description

Capabilities that need permissions are separate packages. A package declares which usage description it needs; if you install the package without writing it, generation reports an error and stops:

```
nacre: @nacrejs/local-authentication needs NSFaceIDUsageDescription in Info.plist: a sentence shown to the user explaining why the app needs this permission. Put it in ios.infoPlist in nacre.config.json
```

Without this check, the app would compile and run normally, then crash the first time the user uses the feature, or be rejected when uploaded to the App Store.

## Declaring a custom scheme

A custom scheme is an address prefix the app makes up for itself. Once `myapp` is declared, when another app or a web page opens an address starting with `myapp://`, the system launches this app (or brings it to the foreground) and hands it the address.

```json
{
  "name": "Shop",
  "bundleId": "com.example.shop",
  "ios": { "urlSchemes": ["myapp"] }
}
```

**Effect**: the generated app's Info.plist gains a `CFBundleURLTypes` entry containing the `myapp` scheme (testing confirms it is in the generated project). When another app or a web page opens `myapp://orders/42`, JS receives the [`openurl` event](open-links.md) of `application`, with `e.url` being `'myapp://orders/42'`. **Receiving the event is not verified in the simulator.**

To try it in the simulator, you do not need another app:

```bash
xcrun simctl openurl booted 'myapp://orders/42'
```

Rules:

- Write only the scheme name, without `://`.
- The name starts with a letter, followed only by letters, digits, `+`, `-`, and `.`. Case-insensitive.
- You can list several, for example one each for the release and test builds: `["myapp", "myapp-dev"]`.
- If this option is absent or an empty array, the app recognizes no custom schemes.
- `http`, `https`, `mailto`, `tel`, `sms`, `facetime`, and `facetime-audio` are the system's own schemes and cannot be listed. To have `https://` links open the app, configure universal links, described in the next section.

There is no registry for scheme names; anyone can use any name. When another app declares the same name, there is no guarantee which app the system hands the link to, so choose a name unlikely to collide (including your company or product name, for example). The link's content can also be put together by anyone; for precautions when handling it, see [`openurl`](open-links.md).

## Configuring universal links

A universal link is an ordinary `https://` address. Once configured, when the user taps `https://shop.example.com/orders/42`, phones with the app installed open the app directly, and those without it open the web page in the browser as usual. Two places must be configured together: the app declares which domain it is associated with, and that domain's website declares which app it recognizes. It takes effect only after the system has checked both sides.

**This whole section is not verified**: it needs a real domain and a signature with the Associated Domains capability. The configuration below comes from Apple's documentation.

First, on the app side, write the associated domains in `ios.entitlements`, each starting with `applinks:`:

```json
{
  "ios": {
    "entitlements": {
      "com.apple.developer.associated-domains": ["applinks:shop.example.com"]
    }
  }
}
```

**Effect**: the generated project gains an entitlements file containing this domain.

Second, on the website side, put a JSON file at `https://shop.example.com/.well-known/apple-app-site-association` (the file name has no extension):

```json
{
  "applinks": {
    "details": [
      {
        "appIDs": ["ABCDE12345.com.example.shop"],
        "components": [{ "/": "/orders/*" }]
      }
    ]
  }
}
```

- `appIDs` contains "team ID.bundle ID". The team ID is the 10-character string in your Apple Developer account.
- `components` lists which paths are handed to the app; paths not listed open in the browser as usual.
- This address must be retrievable directly over HTTPS, without redirects.

Once both are configured, on the JS side you listen for [`openurl`](open-links.md) just as with custom schemes; `e.url` is the full `https://` address and `e.sourceApplication` is `null`.

- An app with this entitlement must be signed with a provisioning profile that includes the Associated Domains capability, and the bundle ID cannot be a wildcard.
- Typing the address directly into the browser's address bar does not open the app; only tapping it from another app or a web page does.
- The system fetches that file when the app is installed and caches it for a while; changes to the file do not take effect immediately.

## Writing other Info.plist keys

Values in `ios.infoPlist` are not limited to usage descriptions; arrays, booleans, numbers, and nested objects all work:

```json
{
  "ios": {
    "infoPlist": {
      "LSApplicationQueriesSchemes": ["maps", "tel"],
      "ITSAppUsesNonExemptEncryption": false
    }
  }
}
```

**Effect**: these two keys appear unchanged in the app's Info.plist.

Eight keys cannot be written here; writing them makes generation report an error:

| Key | Use instead |
| --- | --- |
| `CFBundleIdentifier` | `bundleId` |
| `CFBundleDisplayName` | `displayName` |
| `CFBundleShortVersionString` | `version` |
| `CFBundleVersion` | `buildNumber` |
| `CFBundleURLTypes` | `ios.urlSchemes` |
| `UILaunchScreen`, `UILaunchStoryboardName` | `launchScreen` and `launch.png`; see [Launch screen](#launch-screen) |
| `UIApplicationSceneManifest` | Cannot be changed; it is determined by the startup code |

## Writing entitlements

```json
{
  "ios": {
    "entitlements": {
      "aps-environment": "development"
    }
  }
}
```

**Effect**: the generated project gains an entitlements file, which is written into the app at signing.

Testing confirms the simulator build includes the written values. **Not verified on a device**: an app with entitlements must be signed with a provisioning profile that includes the corresponding capabilities, and wildcard profiles cannot sign push notifications or associated domains.

## Errors for invalid configuration

When the configuration has an error, generation stops before changing any file. Errors begin with `nacre:` and are in English:

| Situation | Error |
| --- | --- |
| `name` written as an object | `"name" in nacre.config.json must be a string: it names the project and the product. For the name shown under the icon use displayName, which can be written per language` |
| `ios.languages` is not an array, or is empty | `ios.languages must be a list of language codes, the first one being the default, e.g. ["en", "zh-Hans"]` |
| A language code does not look like one | `ios.languages: "english!" does not look like a language code (e.g. en, zh-Hans, pt-BR)` |
| Written per language without `ios.languages` | `ios.infoPlist.NSCameraUsageDescription is written per language, but the app does not declare its languages. Add ios.languages, e.g. ["en","zh-Hans"]` |
| A language not in `ios.languages` appears | `ios.infoPlist.NSCameraUsageDescription: zh-CN is not in ios.languages (en, zh-Hans). Is the language code misspelled, or missing from ios.languages?` |
| The default language's sentence is missing | `ios.infoPlist.NSCameraUsageDescription has no text for the default language en` |
| `ios.urlSchemes` is not an array | `ios.urlSchemes must be a list of scheme names (without ://), e.g. ["myapp"]` |
| An invalid scheme name | `ios.urlSchemes: "myapp://" is not a scheme name. It must start with a letter, followed only by letters, digits, +, - and . (no ://)` |
| A scheme name listed twice | `ios.urlSchemes: MyApp is listed twice (scheme names are case-insensitive)` |
| A system scheme listed | `ios.urlSchemes: https is a system scheme; an app that declares it never receives it. To open the app from https links, set up universal links (associated domains), not this` |
| `CFBundleURLTypes` written in `ios.infoPlist` | `ios.infoPlist.CFBundleURLTypes: this key is controlled by ios.urlSchemes in nacre.config.json; change that instead` |
| A key governed by another option | `ios.infoPlist.CFBundleIdentifier: this key is controlled by bundleId in nacre.config.json; change that instead` |
| `icon.png` is not 1024×1024 pixels | `icon.png is 512×512. The app icon must be a 1024×1024 PNG` |
| `icon.png` is not a PNG (a JPEG with its extension changed, for example) | `icon.png is not a PNG file (bad file signature). The app icon must be a 1024×1024 PNG` |
| `icon.png` is a directory | `icon.png is a directory. The app icon must be a 1024×1024 PNG` |
| `icon.icon` is a regular file | `icon.icon is not a directory. It must be an icon saved by Icon Composer: a directory containing icon.json` |
| `icon.icon` has no `icon.json` | `icon.icon has no icon.json. It must be an icon saved by Icon Composer: a directory containing icon.json` |
| `launch.png` is not a PNG | `launch.png is not a PNG file (bad file signature). The launch screen image must be a PNG` |
| `launch.png` exceeds 4 million pixels | `launch.png is 2600×2600, more than 4000000 pixels. When the image is too large the system draws no launch screen and the whole screen is black. It is shown at 3x (360×360 pixels is 120×120 points), so it does not need to be this large` |
| `launch.png` or `launch.storyboard` is a directory | `launch.png is a directory. The launch screen image must be a PNG` |

Icon errors apply only to the file actually used. When both `icon.icon` and `icon.png` exist, `icon.icon` is used, and problems with `icon.png` are not reported.

---

← Back to [Guides](README.md)
