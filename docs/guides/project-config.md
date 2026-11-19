# 配置 App：名字、语言、权限文案

App 的名字、包名、支持哪些语言、向用户申请权限时显示的那句话、哪些链接能打开它，都写在项目根目录的 `nacre.config.json` 里。生成 `ios/` 时，这些配置被写进原生工程。`ios/` 目录里没有需要手改的文件。

App 图标和启动屏上的图不写在这份文件里。它们是项目根目录下名字固定的文件，见 [App 图标](#app-图标)和[启动屏](#启动屏)。

改了 `nacre.config.json`、换了图标或者启动屏的图之后，要重新生成一次 `ios/` 才生效。用 `run-sim.sh` 运行时它每次都会重新生成。

## 全部配置项

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

**效果**：生成的 App 在英文手机上叫 Shop，在简体中文手机上叫「小店」；启动时的画面在浅色模式下是白色、深色模式下是深蓝色；申请面容 ID 权限时，系统的提示框里显示对应语言的那句话；`myapp://` 开头的链接会打开它。

| 配置项 | 必填 | 类型 | 含义 |
| --- | --- | --- | --- |
| `name` | 是 | 字符串 | 工程和产物的名字。不显示给用户，只能是一个字符串 |
| `bundleId` | 是 | 字符串 | 包名，App 在系统里的唯一标识 |
| `displayName` | 否 | 字符串，或按语言写的对象 | 图标下面显示的名字。不写就用 `name` |
| `version` | 否 | 字符串 | 给用户看的版本号。默认 `"0.1.0"` |
| `buildNumber` | 否 | 字符串 | 构建号。默认 `"1"` |
| `deploymentTarget` | 否 | 字符串 | 最低支持的 iOS 版本。默认是运行时支持的最低版本 |
| `launchScreen` | 否 | 色值字符串，或 `{ light, dark }` | [启动屏](#启动屏)的底色。写在最外层，不在 `ios` 下面 |
| `ios.languages` | 否 | 语言代码的数组 | App 支持哪些语言。第一个是默认语言 |
| `ios.urlSchemes` | 否 | 协议名的数组 | 哪些自定义协议（`myapp://…`）的链接能打开这个 App |
| `ios.infoPlist` | 否 | 对象 | 写进 Info.plist 的键值。权限文案写在这里 |
| `ios.entitlements` | 否 | 对象 | App 的 entitlement |

Info.plist 是 iOS App 包里的一份配置文件，系统从里面读 App 的名字、版本和各种声明。entitlement 是 App 向系统申请的特殊能力（推送、关联域名），签名时写进 App。

## 声明 App 支持的语言

```json
{
  "name": "Shop",
  "bundleId": "com.example.shop",
  "ios": { "languages": ["en", "zh-Hans"] }
}
```

**效果**：手机语言是简体中文时，App 里由系统提供的文字显示成中文；是英文或者别的语言时，显示成英文。

「由系统提供的文字」指系统报错的说明、系统弹窗里的固定按钮这一类不是你写的文字。实测读一个不存在的文件时系统给的报错：

| `ios.languages` | 手机语言 | 报错的文字 |
| --- | --- | --- |
| 不写 | 简体中文 | `The file “missing.txt” couldn’t be opened because there is no such file.` |
| `["en", "zh-Hans"]` | 简体中文 | `未能打开文件“missing.txt”，因为它不存在。` |
| `["en", "zh-Hans"]` | 日文 | `The file “missing.txt” couldn’t be opened because there is no such file.` |

规则：

- **不写 `ios.languages`，系统的文字一律是英文**，不跟手机的语言变。
- 手机的语言在列表里，就用那种语言；不在，用列表里的第一个。
- 语言代码用系统的写法：`en`、`zh-Hans`（简体中文）、`zh-Hant`（繁体中文）、`ja`、`pt-BR`。
- 它不影响 [`Intl`](../api/intl.md) 的结果。数字和日期按手机的语言和地区写，和这里列了哪些语言无关（实测）。

你自己界面上的文字不归这一项管。用哪种翻译方案由你定，这一项只决定系统那部分文字。

> **注意**：简体中文写 `zh-Hans`，不写 `zh-CN`。生成时只检查代码的格式，`zh-CN` 格式上没有问题，不会报错，但系统不把它当作简体中文。

## 按语言写 App 的名字

```json
{
  "displayName": { "en": "Shop", "zh-Hans": "小店" },
  "ios": { "languages": ["en", "zh-Hans"] }
}
```

**效果**：桌面上图标下面的名字，英文手机上是 Shop，简体中文手机上是「小店」。**桌面上的样子未在模拟器验证**；实测生成的 App 包里两种语言各有一份名字。

`displayName` 写成字符串时，各种语言都用同一个名字。

## App 图标

App 图标是桌面上代表这个 App 的那张图。把图标文件放在项目根目录，和 `nacre.config.json` 并排，文件名是固定的。`nacre.config.json` 里不用写任何东西。

```
my-app/
├─ package.json
├─ nacre.config.json
├─ icon.png               App 图标：一张 1024×1024 像素的 PNG
├─ src/main.js
└─ assets/
```

**效果**：重新生成并安装之后，桌面上这个 App 的图标是这张图（实测）。

认两种文件，放一个就行：

| 文件 | 是什么 | 适合什么情况 |
| --- | --- | --- |
| `icon.png` | 一张 1024×1024 像素的 PNG | 手里只有一张图。大多数情况用它 |
| `icon.icon` | Icon Composer 存出来的图标文件 | 要自己决定图标在深色、着色等样式下的样子 |

两个都放了，用 `icon.icon`，不报错。

> **注意**：文件名必须一字不差，全部小写。`Icon.png`、`icon.PNG`、`AppIcon.png` 都不认，效果和没放一样，生成时也不会提示。

### 用一张 PNG

- 尺寸必须正好是 1024×1024 像素。不是的话生成时报错，见[写错时的报错](#写错时的报错)。
- 只要这一张。桌面、设置、搜索结果里用到的各种小尺寸由系统从它缩出来。
- 图要铺满整个正方形，不要自己画圆角。系统显示时把它裁成圆角的形状（实测：一张直角的方图，桌面上四个角是圆的）。
- 带透明通道的 PNG 能通过编译（实测）。透明的部分在桌面上显示成什么、提交 App Store 时会不会被拒，**未验证**。

系统切到深色模式时，图标不变（实测：切换之后桌面上所有 App 的图标都和原来一样）。iOS 的桌面另有一项图标样式的设置，在桌面的「自定义」里，用户可以给全部图标选深色、着色等样式。`icon.png` 只有一张图，里面没有为这些样式准备的版本（实测生成的 App 包里只有这一张）。用户选了这些样式时，系统把它处理成什么样，**未在模拟器验证**。要自己决定这些样式下的样子，用 `icon.icon`。

### 用 Icon Composer 的图标文件

Icon Composer 是 Apple 做图标的工具，随 Xcode 安装（Xcode 27.2 上的位置是 `/Applications/Xcode.app/Contents/Applications/Icon Composer.app`）。在里面把图标拆成背景和几层图案，分别调浅色、深色、着色几种样式下的样子，存出来是一个扩展名为 `.icon` 的文件。把它改名成 `icon.icon`，放到项目根目录：

```
my-app/
├─ nacre.config.json
├─ icon.icon/             在访达里显示成一个文件，实际是一个目录
│  ├─ icon.json
│  └─ Assets/
└─ src/main.js
```

**效果**：桌面上是这个文件里设计的图标（实测）。生成的 App 包里带着浅色、深色、着色三套（实测）；桌面切到深色、着色样式时屏幕上的样子**未在模拟器验证**。

实测用的是一个手写的最小图标文件；Icon Composer 实际存出来的文件**未验证**。

- `icon.icon` 是一个目录，提交到版本库时要把整个目录提交进去。
- 文件里的内容不对（`icon.json` 写坏了、引用的图层图片不在）时，生成不报错，编译时报错并指出这个文件。

### 没放图标

没放图标不算错。生成时不报错，也不提示。App 照常编译和运行，桌面上显示系统的占位图标：白底上一张灰色的网格图（实测）。

运行时不带默认图标。要图标就放一个。

### 这些文件不是图标

| 文件 | 为什么不认 |
| --- | --- |
| `icon-dark.png`、`icon-tinted.png` | 不支持每种样式单独放一张 PNG。要分样式，用 `icon.icon` |
| `assets/icon.png` | `assets/` 是给 JS 用的资源，整个目录会被放进 App 包。这个文件照常能被 JS 加载，但不是 App 图标 |
| `Icon.png`、`icon.jpg`、`AppIcon.png` | 文件名不对 |

## 启动屏

启动屏是用户点开 App 之后、App 自己的界面出现之前，系统显示的那个画面。它由一个底色和一张居中的图组成。底色写在 `nacre.config.json` 里，图是项目根目录的 `launch.png`。

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
├─ launch.png             启动屏上的图：透明底的 PNG
├─ src/main.js
└─ assets/
```

**效果**：App 启动时整个屏幕是蓝色（`#0A84FF`），正中是 `launch.png` 这张图（实测）。

底色和图各自可以不给，不给不算错，生成时也不提示：

| `launchScreen` | `launch.png` | 启动屏的样子 |
| --- | --- | --- |
| 写了 | 放了 | 底色上放这张图 |
| 写了 | 没放 | 整个屏幕是这个颜色 |
| 没写 | 放了 | 系统的底色上放这张图。系统的底色在浅色模式下是白，深色模式下是黑 |
| 没写 | 没放 | 空白的画面：浅色模式下白，深色模式下黑 |

四种都在模拟器上验过，浅色模式和深色模式各一遍。

### 写底色

两种写法。一个色值，两种模式下都用它：

```json
{ "launchScreen": "#0A84FF" }
```

**效果**：浅色模式和深色模式下启动屏都是这个蓝色（实测）。

或者两种模式各写一个：

```json
{ "launchScreen": { "light": "#FFFFFF", "dark": "#101826" } }
```

**效果**：手机是浅色模式时启动屏是白色，是深色模式时是深蓝色（实测）。用哪一个看的是启动那一刻系统的外观设置（设置 → 显示与亮度）。

- 色值是 `#` 加 6 位十六进制数，也可以写 3 位（`#08F` 等于 `#0088FF`）。字母大写小写都可以。
- 不认带透明度的写法（4 位、8 位）、颜色名和 `rgb()`。
- 按模式分时 `light` 和 `dark` 都要写。别的键不看。
- `launchScreen` 写在 `nacre.config.json` 的最外层，不在 `ios` 下面。

> **注意**：`launchScreen` 写得认不出来时（上面三条有一条不符合），生成不报错，也不提示，按没写处理：启动屏的底色是系统默认的，浅色模式白、深色模式黑。启动屏的底色不是写的那个颜色时，先检查这一项的写法。

### 放一张图

图的文件名固定是 `launch.png`，放在项目根目录。

- **按 3 倍图算**：图的像素数除以 3，是它在屏幕上的大小。360×360 像素的图显示成 120×120 [pt](../api/units.md)（实测）。
- **图多大就显示多大，不放大**，放在屏幕正中。
- **比屏幕大时等比缩小到正好放得下**，不裁切、不变形。实测：1800×1800 像素（600×600 pt）的图，在 420 pt 宽的屏幕上显示成 420×420 pt。
- 用透明底的 PNG，透明的地方露出底色。
- 浅色模式和深色模式用同一张图。没写底色时底色是白或者黑，所以一张白色的图在浅色模式下看不见（实测）。图不是在黑白两种底上都看得清时，写一个底色。
- 宽乘高不能超过 400 万像素（比如 2000×2000），超过时生成报错。实测图太大时系统不显示启动屏，整个屏幕是黑的：2400×2400 像素正常，2600×2600 就黑了。

实测用的是 3 倍屏的模拟器。2 倍屏的机型上的样子**未验证**。

> **注意**：和图标一样，文件名必须一字不差、全部小写。`Launch.png`、`launch@3x.png`、`assets/launch.png` 都不认，效果和没放一样，生成时也不会提示。

### 启动屏显示多久

启动屏由系统显示，也由系统收走，没有接口能让它多留一会儿。

实测：JS 启动后 7 秒才建窗口的一个 App，启动屏在启动后大约 2 秒就消失了，之后是黑屏，直到窗口出现。

所以 `main.js` 一开始就把窗口和第一个页面建出来，网络请求、读大文件这类耗时的事放到页面出现之后做。这样启动屏之后接着的就是 App 的界面，中间没有黑屏。

系统会把启动屏的画面缓存起来。改了启动屏之后在手机上看到的还是旧的，把 App 删掉重装（这一条**未验证**：验证时每次都是删掉重装的）。

### 用自己的 storyboard

上面的形状不够用时（要两张图、要图不在正中），可以自己写启动屏。storyboard 是 Xcode 的界面文件，内容是 XML。把它命名为 `launch.storyboard` 放在项目根目录：

```
my-app/
├─ nacre.config.json
├─ launch.storyboard      自己写的启动屏
├─ src/main.js
└─ assets/
   └─ mark.png            storyboard 里用到的图
```

**效果**：启动屏是这个文件画出来的样子（实测）。`launchScreen` 和 `launch.png` 这时不再使用，留着也不报错。

- **图放在 `assets/` 里，storyboard 里的图名写 `JS/assets/` 加文件名**，比如 `JS/assets/mark`。实测带不带 `.png` 都找得到，`mark@3x.png` 这样带倍率的文件也认。项目根目录的 `launch.png` 引用不到。
- 引用了一张不存在的图，不报错，那个位置是空的（实测）。
- 颜色只能用固定的色值或者系统的颜色。自己定一个随深浅色模式变的颜色，做不到。
- 系统不允许启动屏的 storyboard 用自定义的类。用了的话编译时报 `Launch screens may not set custom classnames`（实测）。
- 文件的内容生成时不检查。内容不对时编译报错，并指出这个文件。

实测用的是手写的 storyboard；Xcode 里新建并存出来的启动屏文件**未验证**。

## 写权限文案

App 第一次用相机、面容 ID、定位这类能力时，系统弹出提示框问用户同不同意，提示框里有一句你写的话，说明为什么要用。这句话写在 `ios.infoPlist` 里，键名由系统规定。

```json
{
  "ios": {
    "infoPlist": {
      "NSCameraUsageDescription": "Scan the QR code on a payment page"
    }
  }
}
```

**效果**：App 第一次打开相机时，系统的提示框里显示这句话。

要按语言写，把值写成对象：

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

**效果**：提示框里的那句话跟着手机的语言变。实测生成的 App 包里，默认语言的那一句在 Info.plist 里，每种语言各有一份自己的。提示框在屏幕上的样子**未在模拟器验证**。

- 某种语言没写，这种语言显示默认语言的那一句。生成时会提示一行，不算错。
- 默认语言（`ios.languages` 的第一个）的那一句必须写。
- 对象里的语言必须都在 `ios.languages` 里。

### 装了能力包却没写文案

需要权限的能力是单独的包。包会声明它要哪一句文案，你装了包而没写，生成时报错并停下：

```
nacre: @nacrejs/local-authentication needs NSFaceIDUsageDescription in Info.plist: a sentence shown to the user explaining why the app needs this permission. Put it in ios.infoPlist in nacre.config.json
```

不在这里拦的话，App 编译和运行都正常，要到用户第一次用这个功能时才崩溃，或者上传 App Store 时被拒。

## 声明自定义协议

自定义协议是 App 自己起的一个地址前缀。声明了 `myapp` 之后，别的 App 或网页打开 `myapp://` 开头的地址时，系统启动这个 App（或者把它切到前台），并把地址交给它。

```json
{
  "name": "Shop",
  "bundleId": "com.example.shop",
  "ios": { "urlSchemes": ["myapp"] }
}
```

**效果**：生成的 App 的 Info.plist 里多一项 `CFBundleURLTypes`，里面是 `myapp` 这个协议（实测生成的工程里有）。别的 App 或网页打开 `myapp://orders/42` 时，JS 收到 `application` 的 [`openurl` 事件](open-links.md)，`e.url` 是 `'myapp://orders/42'`。**收到事件这一步未在模拟器验证。**

在模拟器上试，不需要另一个 App：

```bash
xcrun simctl openurl booted 'myapp://orders/42'
```

规则：

- 只写协议名，不带 `://`。
- 名字以字母开头，后面只能是字母、数字、`+`、`-`、`.`。不分大小写。
- 可以写几个，比如正式版和测试版各一个：`["myapp", "myapp-dev"]`。
- 不写这一项，或者写空数组，App 不认任何自定义协议。
- `http`、`https`、`mailto`、`tel`、`sms`、`facetime`、`facetime-audio` 是系统自己的协议，不能写。要让 `https://` 的链接打开 App，配的是下一节的通用链接。

协议名没有登记的地方，谁都可以用。别的 App 声明了同一个名字时，系统把链接交给哪一个没有保证，所以名字要起得不容易重复（比如带上公司或产品的名字）。链接的内容也可以是任何人拼的，处理时的注意事项见 [`openurl`](open-links.md)。

## 配置通用链接

通用链接是普通的 `https://` 地址。配好之后，用户点 `https://shop.example.com/orders/42`，装了 App 的手机直接打开 App，没装的照常用浏览器打开网页。它要两处一起配：App 声明自己关联哪个域名，那个域名的网站声明自己认哪个 App。系统两边都核对过才生效。

**这一节整个未验证**：它需要一个真实的域名，和带「关联域名」这项能力的签名。下面的写法来自 Apple 的文档；运行时这一侧的代码写了，没有跑过。

第一处，App 这边，在 `ios.entitlements` 里写关联的域名，每一项以 `applinks:` 开头：

```json
{
  "ios": {
    "entitlements": {
      "com.apple.developer.associated-domains": ["applinks:shop.example.com"]
    }
  }
}
```

**效果**：生成的工程里多一份 entitlement 文件，里面是这个域名。

第二处，网站这边，在 `https://shop.example.com/.well-known/apple-app-site-association` 放一份 JSON（文件名没有扩展名）：

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

- `appIDs` 里是「团队 ID.包名」。团队 ID 是 Apple 开发者账号里那串 10 位的字符。
- `components` 列出哪些路径交给 App，没列的路径照常由浏览器打开。
- 这个地址必须能用 HTTPS 直接取到，不能有跳转。

两处都配好之后，JS 这边和自定义协议一样监听 [`openurl`](open-links.md)，`e.url` 是完整的 `https://` 地址，`e.sourceApplication` 是 `null`。

- 带这条 entitlement 的 App 要用包含「关联域名」能力的描述文件签名，包名不能是通配的。
- 用户在浏览器的地址栏里直接输入这个地址，不会打开 App；从别的 App 或网页里点才会。
- 系统在 App 安装时去取那份文件，并缓存一段时间；改了文件之后不会马上生效。

## 写别的 Info.plist 键

`ios.infoPlist` 里的值不限于文案，数组、布尔、数、嵌套的对象都可以：

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

**效果**：这两个键原样出现在 App 的 Info.plist 里。

有八个键不能写在这里，写了生成时报错：

| 键 | 改用 |
| --- | --- |
| `CFBundleIdentifier` | `bundleId` |
| `CFBundleDisplayName` | `displayName` |
| `CFBundleShortVersionString` | `version` |
| `CFBundleVersion` | `buildNumber` |
| `CFBundleURLTypes` | `ios.urlSchemes` |
| `UILaunchScreen`、`UILaunchStoryboardName` | `launchScreen` 和 `launch.png`，见[启动屏](#启动屏) |
| `UIApplicationSceneManifest` | 不能改，它由启动代码决定 |

## 写 entitlement

```json
{
  "ios": {
    "entitlements": {
      "aps-environment": "development"
    }
  }
}
```

**效果**：生成的工程里多一份 entitlement 文件，签名时写进 App。

实测模拟器的构建里带上了写的值。**真机未验证**：带 entitlement 的 App 要用包含对应能力的描述文件签名，通配的描述文件签不了推送和关联域名。

## 写错时的报错

配置有错时，生成在改动任何文件之前停下，报错以 `nacre:` 开头，是英文的：

| 情况 | 报错 |
| --- | --- |
| `name` 写成了对象 | `"name" in nacre.config.json must be a string: it names the project and the product. For the name shown under the icon use displayName, which can be written per language` |
| `ios.languages` 不是数组，或者是空的 | `ios.languages must be a list of language codes, the first one being the default, e.g. ["en", "zh-Hans"]` |
| 语言代码不像语言代码 | `ios.languages: "english!" does not look like a language code (e.g. en, zh-Hans, pt-BR)` |
| 按语言写了，但没写 `ios.languages` | `ios.infoPlist.NSCameraUsageDescription is written per language, but the app does not declare its languages. Add ios.languages, e.g. ["en","zh-Hans"]` |
| 出现了 `ios.languages` 里没有的语言 | `ios.infoPlist.NSCameraUsageDescription: zh-CN is not in ios.languages (en, zh-Hans). Is the language code misspelled, or missing from ios.languages?` |
| 默认语言的那一句没写 | `ios.infoPlist.NSCameraUsageDescription has no text for the default language en` |
| `ios.urlSchemes` 不是数组 | `ios.urlSchemes must be a list of scheme names (without ://), e.g. ["myapp"]` |
| 协议名写错了 | `ios.urlSchemes: "myapp://" is not a scheme name. It must start with a letter, followed only by letters, digits, +, - and . (no ://)` |
| 协议名写了两次 | `ios.urlSchemes: MyApp is listed twice (scheme names are case-insensitive)` |
| 写了系统自己的协议 | `ios.urlSchemes: https is a system scheme; an app that declares it never receives it. To open the app from https links, set up universal links (associated domains), not this` |
| 在 `ios.infoPlist` 里写了 `CFBundleURLTypes` | `ios.infoPlist.CFBundleURLTypes: this key is controlled by ios.urlSchemes in nacre.config.json; change that instead` |
| 写了由别的配置项管的键 | `ios.infoPlist.CFBundleIdentifier: this key is controlled by bundleId in nacre.config.json; change that instead` |
| `icon.png` 不是 1024×1024 像素 | `icon.png is 512×512. The app icon must be a 1024×1024 PNG` |
| `icon.png` 不是 PNG（比如把 JPEG 改了个扩展名） | `icon.png is not a PNG file (bad file signature). The app icon must be a 1024×1024 PNG` |
| `icon.png` 是一个目录 | `icon.png is a directory. The app icon must be a 1024×1024 PNG` |
| `icon.icon` 是一个普通文件 | `icon.icon is not a directory. It must be an icon saved by Icon Composer: a directory containing icon.json` |
| `icon.icon` 里没有 `icon.json` | `icon.icon has no icon.json. It must be an icon saved by Icon Composer: a directory containing icon.json` |
| `launch.png` 不是 PNG | `launch.png is not a PNG file (bad file signature). The launch screen image must be a PNG` |
| `launch.png` 超过 400 万像素 | `launch.png is 2600×2600, more than 4000000 pixels. When the image is too large the system draws no launch screen and the whole screen is black. It is shown at 3x (360×360 pixels is 120×120 points), so it does not need to be this large` |
| `launch.png` 或 `launch.storyboard` 是一个目录 | `launch.png is a directory. The launch screen image must be a PNG` |

图标的报错只针对用上的那个文件。`icon.icon` 和 `icon.png` 都在时用的是 `icon.icon`，这时 `icon.png` 有问题也不报。

## 还不能做的

| 想做的事 | 状态 |
| --- | --- |
| 能力包自己带固定的 Info.plist 值（不用项目写） | 未实现。现在包只能声明「要哪些键」，值都由项目写 |
| 深色模式下启动屏用另一张图（`launch-dark.png`） | 未实现。两种模式用同一张图 |
| 让启动屏多留一会儿，等界面准备好再收走 | 未实现，系统也没有提供这样的接口。见[启动屏显示多久](#启动屏显示多久) |
| 自己的 `launch.storyboard` 里用自己定的、随深浅色模式变的颜色 | 未实现。只能用固定的色值或系统的颜色 |
| 每种图标样式单独放一张 PNG | 未实现。要分样式，用 `icon.icon` |
| 调试包和发布包用不同的图标 | 未实现 |
| App 运行时换图标（原生的备用图标，`setAlternateIconName`） | 未实现 |
| 屏幕方向 | 未实现。现在固定竖屏 |
| 按构建配置（调试、发布）用不同的值 | 未实现 |

---

← 返回[指南](README.md)
