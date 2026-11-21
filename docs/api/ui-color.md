---
type: reference
native: UIColor
status: partial
---

# `UIColor`

**`UIColor`** 表示一个颜色。在 Nacre 里，颜色主要写成字符串：视图的底色、文字的颜色、图层的边框色，所有接受颜色的属性都按同一套规则，写入一个字符串，读出来也是一个字符串。`UIColor` 对象在全局存在，日常不需要用到，见[什么时候需要 `UIColor` 对象](#什么时候需要-uicolor-对象)。

```js
const view = new UIView();
view.backgroundColor = '#5856D6';
```

**结果**：视图的底色变成靛蓝色。

字符串有五类写法：

| 写法 | 例子 | 说明 |
| --- | --- | --- |
| 十六进制 | `'#5856D6'`、`'#ff000080'` | 3、4、6、8 位。字母不区分大小写 |
| `rgb()` | `'rgb(255, 59, 48)'`、`'rgba(0, 0, 0, 0.4)'` | 红、绿、蓝是 0–255，不透明度是 0–1 |
| 颜色名 | `'systemBackground'`、`'label'`、`'white'` | 只有[表里的 51 个](#能用的颜色名)。名字区分大小写 |
| 跟随深浅色 | `'light-dark(#ffffff, #1c1c1e)'` | 浅色模式用第一个，深色模式用第二个 |
| Asset Catalog | `'asset(BrandBlue)'` | 取 Xcode 工程里配置好的颜色 |

完整的格式见[支持的写法](#支持的写法)。

- **颜色写错不会让 App 崩溃。** 写入一个不合法的颜色时，不抛异常，属性保持原来的颜色，控制台输出一条警告，见[写错不抛，打警告](#写错不抛打警告)。
- **合法写入的字符串原样读出**，大小写和空格都不变。两种例外见[读出来的字符串](#读出来的字符串)。
- **颜色名里的系统色、语义色和 `light-dark()` 跟随浅色和深色模式**，系统在用户切换时自动换色。十六进制和 `rgb()` 写的颜色在两种模式下相同。图层上的颜色是例外，见[浅色模式和深色模式](#浅色模式和深色模式)。

`UIColor` 对象不可变，没有自己的实例属性和方法，不派发事件。

**继承关系**：`EventTarget` → `NSObject` → `UIColor`

怎么写固定色、半透明、跟随深浅色的颜色，见指南[设置颜色](../guides/colors.md)。

## 构造函数

不能用 `new` 创建，也不能被继承。`new UIColor()` 抛：

```
TypeError: Illegal constructor: UIColor is created by the runtime, not by new
```

**未在模拟器验证。** `UIColor` 对象只能从下面的静态属性取得。

## 静态属性

51 个，全部只读，类型都是 `UIColor`。属性名是[颜色名](#能用的颜色名)加上 `Color` 后缀，和 Objective-C 里的名字相同。同一个属性每次取到的是同一个对象。

| 分组 | 属性 |
| --- | --- |
| 固定色 | [`UIColor.blackColor`](ui-color/blackcolor.md) [`UIColor.darkGrayColor`](ui-color/darkgraycolor.md) [`UIColor.lightGrayColor`](ui-color/lightgraycolor.md) [`UIColor.whiteColor`](ui-color/whitecolor.md) [`UIColor.grayColor`](ui-color/graycolor.md) [`UIColor.redColor`](ui-color/redcolor.md) [`UIColor.greenColor`](ui-color/greencolor.md) [`UIColor.blueColor`](ui-color/bluecolor.md) [`UIColor.cyanColor`](ui-color/cyancolor.md) [`UIColor.yellowColor`](ui-color/yellowcolor.md) [`UIColor.magentaColor`](ui-color/magentacolor.md) [`UIColor.orangeColor`](ui-color/orangecolor.md) [`UIColor.purpleColor`](ui-color/purplecolor.md) [`UIColor.brownColor`](ui-color/browncolor.md) [`UIColor.clearColor`](ui-color/clearcolor.md) |
| 系统色 | [`UIColor.systemRedColor`](ui-color/systemredcolor.md) [`UIColor.systemGreenColor`](ui-color/systemgreencolor.md) [`UIColor.systemBlueColor`](ui-color/systembluecolor.md) [`UIColor.systemOrangeColor`](ui-color/systemorangecolor.md) [`UIColor.systemYellowColor`](ui-color/systemyellowcolor.md) [`UIColor.systemPinkColor`](ui-color/systempinkcolor.md) [`UIColor.systemPurpleColor`](ui-color/systempurplecolor.md) [`UIColor.systemTealColor`](ui-color/systemtealcolor.md) [`UIColor.systemIndigoColor`](ui-color/systemindigocolor.md) [`UIColor.systemBrownColor`](ui-color/systembrowncolor.md) [`UIColor.systemMintColor`](ui-color/systemmintcolor.md) [`UIColor.systemCyanColor`](ui-color/systemcyancolor.md) [`UIColor.systemGrayColor`](ui-color/systemgraycolor.md) [`UIColor.systemGray2Color`](ui-color/systemgray2color.md) [`UIColor.systemGray3Color`](ui-color/systemgray3color.md) [`UIColor.systemGray4Color`](ui-color/systemgray4color.md) [`UIColor.systemGray5Color`](ui-color/systemgray5color.md) [`UIColor.systemGray6Color`](ui-color/systemgray6color.md) |
| 语义色 | [`UIColor.labelColor`](ui-color/labelcolor.md) [`UIColor.secondaryLabelColor`](ui-color/secondarylabelcolor.md) [`UIColor.tertiaryLabelColor`](ui-color/tertiarylabelcolor.md) [`UIColor.quaternaryLabelColor`](ui-color/quaternarylabelcolor.md) [`UIColor.placeholderTextColor`](ui-color/placeholdertextcolor.md) [`UIColor.separatorColor`](ui-color/separatorcolor.md) [`UIColor.opaqueSeparatorColor`](ui-color/opaqueseparatorcolor.md) [`UIColor.linkColor`](ui-color/linkcolor.md) [`UIColor.systemBackgroundColor`](ui-color/systembackgroundcolor.md) [`UIColor.secondarySystemBackgroundColor`](ui-color/secondarysystembackgroundcolor.md) [`UIColor.tertiarySystemBackgroundColor`](ui-color/tertiarysystembackgroundcolor.md) [`UIColor.systemGroupedBackgroundColor`](ui-color/systemgroupedbackgroundcolor.md) [`UIColor.secondarySystemGroupedBackgroundColor`](ui-color/secondarysystemgroupedbackgroundcolor.md) [`UIColor.tertiarySystemGroupedBackgroundColor`](ui-color/tertiarysystemgroupedbackgroundcolor.md) [`UIColor.systemFillColor`](ui-color/systemfillcolor.md) [`UIColor.secondarySystemFillColor`](ui-color/secondarysystemfillcolor.md) [`UIColor.tertiarySystemFillColor`](ui-color/tertiarysystemfillcolor.md) [`UIColor.quaternarySystemFillColor`](ui-color/quaternarysystemfillcolor.md) |

## 实例属性

`UIColor` 没有自己的实例属性。

## 实例方法

`UIColor` 没有自己的实例方法。

## 支持的写法

| 写法 | 格式 | 例子 | 效果 |
| --- | --- | --- | --- |
| 十六进制，3 位 | `#rgb` | `'#f00'` | 每一位重复一次，等于 `#ff0000`。不透明 |
| 十六进制，4 位 | `#rgba` | `'#f00a'` | 等于 `#ff0000aa`。最后一位是不透明度 |
| 十六进制，6 位 | `#rrggbb` | `'#ff0000'` | 红、绿、蓝各两位，`00`–`ff`。不透明 |
| 十六进制，8 位 | `#rrggbbaa` | `'#ff000080'` | 最后两位是不透明度，`00` 全透明，`ff` 不透明 |
| `rgb()` 逗号写法 | `rgb(r, g, b)`、`rgb(r, g, b, a)` | `'rgb(255, 0, 0)'`、`'rgba(255,0,0,.5)'` | 见下面的分量说明 |
| `rgb()` 空格写法 | `rgb(r g b)`、`rgb(r g b / a)` | `'rgb(255 0 0)'`、`'rgb(255 0 0 / 50%)'` | 同上 |
| 跟随深浅色 | `light-dark(浅色, 深色)` | `'light-dark(#fff, #000)'` | 浅色模式显示第一个，深色模式显示第二个。两个参数可以是本表的任何写法 |
| 颜色名 | 表里的名字 | `'systemBackground'` | 见[能用的颜色名](#能用的颜色名) |
| 全透明 | `transparent` | `'transparent'` | 和 CSS 一样，不区分大小写。效果和颜色名 `clear` 相同 |
| Asset Catalog | `asset(名字)` | `'asset(BrandBlue)'` | Asset Catalog 里这个名字的 Color Set |
| 代号 | `native(n)` | `'native(7)'` | 只会从读取得到，见[读出来的字符串](#读出来的字符串) |

以上写法里，例子列出的十六进制四种、`rgb()` 四种、`light-dark()` 两种（参数是十六进制、参数是颜色名）和颜色名的「写入后原样读出」都在验收用例里验证过。`asset()` 和 `native()` **未在模拟器验证**。

大小写和空格的规则：

| 部分 | 区分大小写 |
| --- | --- |
| 十六进制的字母 | 否。`'#FF0000'` 和 `'#ff0000'` 相同 |
| 函数名 `rgb`、`rgba`、`light-dark`、`asset`、`native` | 否 |
| 颜色名 | 是。`'darkGray'` 合法，`'darkgray'` 不合法 |
| `asset()` 里的名字 | 按原样交给系统查找 |

字符串首尾的空格被忽略。十六进制的位数只能是 3、4、6、8。

**`rgb()` 的分量**：

| 分量 | 取值 | 含义 |
| --- | --- | --- |
| 红、绿、蓝 | 0–255 的数，可以带小数；或者 0%–100% 的百分比 | 0 是没有这个颜色，255 或 100% 是最强 |
| 不透明度 | 0–1 的数；或者 0%–100% 的百分比 | 0 是全透明，1 或 100% 是不透明。省略时是 1 |

`rgb` 和 `rgba` 两个函数名可以互换，都接受三个或四个分量。运行时不检查分量是否在范围内，不要写超出范围的值。

写入时除了字符串，还接受 `UIColor` 对象、`null` 和 `undefined`。`null` 和 `undefined` 表示没有颜色。

## 能用的颜色名

一共 51 个。名字区分大小写。不在表里的名字按写错处理，警告里会列出这张表。

**固定色**，15 个。色值固定，不随外观变。下表的色值来自 Apple 的定义，换算成 0–255 并四舍五入。

| 名字 | 色值 |
| --- | --- |
| `black` | `rgb(0, 0, 0)` |
| `darkGray` | `rgb(85, 85, 85)` |
| `lightGray` | `rgb(170, 170, 170)` |
| `white` | `rgb(255, 255, 255)` |
| `gray` | `rgb(128, 128, 128)` |
| `red` | `rgb(255, 0, 0)` |
| `green` | `rgb(0, 255, 0)` |
| `blue` | `rgb(0, 0, 255)` |
| `cyan` | `rgb(0, 255, 255)` |
| `yellow` | `rgb(255, 255, 0)` |
| `magenta` | `rgb(255, 0, 255)` |
| `orange` | `rgb(255, 128, 0)` |
| `purple` | `rgb(128, 0, 128)` |
| `brown` | `rgb(153, 102, 51)` |
| `clear` | 全透明 |

其中 `green`、`orange`、`brown`、`darkGray`、`lightGray` 的色值和 CSS 的同名颜色不同，见[同名但色值不同的颜色名](#同名但色值不同的颜色名)。

**系统色**，18 个。这是 iOS 界面里常用的一组颜色，色值由系统决定。浅色模式和深色模式下的色值略有不同，用来在两种底色上都保持清晰。

`systemRed` `systemGreen` `systemBlue` `systemOrange` `systemYellow` `systemPink` `systemPurple` `systemTeal` `systemIndigo` `systemBrown` `systemMint` `systemCyan` `systemGray` `systemGray2` `systemGray3` `systemGray4` `systemGray5` `systemGray6`

**语义色**，18 个。按用途命名，色值由系统决定，跟随浅色模式、深色模式和「增强对比度」设置变化。

| 名字 | 用途 |
| --- | --- |
| `label` | 正文文字。浅色模式下是黑色，深色模式下是白色 |
| `secondaryLabel` | 次要文字，比 `label` 淡 |
| `tertiaryLabel` | 更次要的文字，比 `secondaryLabel` 淡 |
| `quaternaryLabel` | 最淡的一级文字 |
| `placeholderText` | 输入框里的占位文字 |
| `separator` | 分隔线。半透明，会透出后面的内容 |
| `opaqueSeparator` | 分隔线，不透明 |
| `link` | 链接文字 |
| `systemBackground` | 页面底色。浅色模式下是白色，深色模式下是黑色 |
| `secondarySystemBackground` | 放在页面底色上面的一层内容的底色 |
| `tertiarySystemBackground` | 放在第二层上面的内容的底色 |
| `systemGroupedBackground` | 分组样式的页面底色（像系统「设置」那样，页面上放一块块分组） |
| `secondarySystemGroupedBackground` | 分组样式页面上，分组的底色 |
| `tertiarySystemGroupedBackground` | 分组里面再放一层内容时的底色 |
| `systemFill` | 细小形状的填充：开关的轨道、进度条的底。半透明 |
| `secondarySystemFill` | 中等大小形状的填充。半透明 |
| `tertiarySystemFill` | 大一些的形状的填充：输入框、搜索框、按钮。半透明 |
| `quaternarySystemFill` | 里面有复杂内容的大块区域的填充。半透明 |

`label` 在两种模式下的色值是实测的（浅色 `#000000`，深色 `#ffffff`）。`systemBackground` 的色值来自 Apple 的定义。其余语义色只写了用途，具体色值没有量过。

「写入后原样读出」验证过的名字有 `black`、`systemBlue`、`systemPink`、`systemYellow`、`systemTeal`、`label`、`systemBackground`。其余名字走同一段代码，**未在模拟器逐个验证**。

## 写错不抛，打警告

写入不合法的颜色时：

- 不抛异常，后面的代码继续执行。
- 属性保持原来的颜色。原来没有颜色的，仍然没有。
- 控制台输出一条警告。

```js
const view = new UIView();
view.backgroundColor = '#0a7b55';
view.backgroundColor = '#GGG';
console.log(view.backgroundColor);
```

**结果**：不抛异常。控制台先输出下面这条警告，再输出 `#0a7b55`。视图的底色仍是 `#0a7b55`。

```text
[Nacre] backgroundColor: "#GGG" is not a valid color, ignored
```

警告的格式是 `[Nacre] <属性名或方法名>: <写入的值> is not a valid color, ignored`。它和 `console.warn()` 的输出出现在同一个地方。

| 写入 | 警告 |
| --- | --- |
| `'#GGG'` | `[Nacre] backgroundColor: "#GGG" is not a valid color, ignored` |
| `'light-dark(#fff)'`（少一个参数） | `[Nacre] backgroundColor: "light-dark(#fff)" is not a valid color, ignored` |
| `42`（不是字符串） | `[Nacre] backgroundColor: 42 is not a valid color, ignored` |
| `'nosuchColor'` | 见下 |

写入的字符串以字母开头、只由字母和数字组成时，运行时把它当作写错的颜色名，在警告后面列出全部能用的名字：

```text
[Nacre] backgroundColor: "nosuchColor" is not a valid color, ignored; expected a color name, one of: black / darkGray / lightGray / white / gray / red / green / blue / cyan / yellow / magenta / orange / purple / brown / clear / systemRed / systemGreen / systemBlue / systemOrange / systemYellow / systemPink / systemPurple / systemTeal / systemIndigo / systemBrown / systemMint / systemCyan / systemGray / systemGray2 / systemGray3 / systemGray4 / systemGray5 / systemGray6 / label / secondaryLabel / tertiaryLabel / quaternaryLabel / placeholderText / separator / opaqueSeparator / link / systemBackground / secondarySystemBackground / tertiarySystemBackground / systemGroupedBackground / secondarySystemGroupedBackground / tertiarySystemGroupedBackground / systemFill / secondarySystemFill / tertiarySystemFill / quaternarySystemFill
```

「不抛异常」和「保持原来的颜色」在验收用例里验证过，上表四种写入都验证了。警告的文字来自运行时的代码。

### 哪些不算写错

- **`null` 和 `undefined` 不算写错。** 它们表示「没有颜色」，不输出警告，见指南[设置颜色](../guides/colors.md)。所以 `view.backgroundColor = Colors.brnad` 这种拼错了常量名的写法，得到的是 `undefined`，结果是颜色被去掉，没有任何提示。
- **`UIColor` 对象不算写错。** 它直接被接受。

### 哪些也按写错处理

- 颜色名的大小写不对：`'Red'`、`'darkgray'`。
- 颜色名带 `Color` 后缀：`'systemPinkColor'`。字符串里只能用表里的短名字。
- 这里不支持的 CSS 写法：`'hsl(0 100% 50%)'`。
- [`CAGradientLayer`](ca-gradient-layer.md) 的 [`colors`](ca-gradient-layer/colors.md) 是颜色数组。其中任何一项不合法，整个数组都不写入。

### `asset()` 的名字不存在时会抛

`asset(名字)` 的名字在 Asset Catalog 里不存在时，不是输出警告，而是**抛 `TypeError: cannot build a color from this specification`**。用 `asset()` 时要自己确认名字存在。**未在模拟器验证**。

### 编辑器能不能提前发现

不能。颜色的类型是 `string`，类型检查只能确认写入的是字符串，字符串的内容是否合法只有运行时知道。`'#GGG'`、`'sytemRed'` 都能通过类型检查。

这一点和[枚举](enums.md)不同。枚举的取值写错时类型检查会报错。

### 怎么避免写错

把 App 用到的颜色集中定义成常量，其他地方只引用常量名。颜色字符串只出现一次，常量名写错能被类型检查发现。写法见指南[设置颜色](../guides/colors.md)。

## 浅色模式和深色模式

固定颜色（十六进制、`rgb()`、固定色名）在两种模式下相同。语义色、系统色、`light-dark()` 和 `asset()` 得到的是**动态色**：颜色本身包含多个值，系统在绘制时按当时的外观选一个。

所以动态色只需要设置一次。用户切换外观时系统自动重新绘制，不需要重新赋值。

每个视图有自己的外观。默认跟随系统设置，也可以用 `overrideUserInterfaceStyle` 让某个视图和它的子视图固定用浅色或深色。动态色按它所在视图的外观取值，所以同一个 `'label'` 在一个被固定成深色的卡片里是白色，在卡片外面是黑色。

代码需要知道当前是哪种外观时，读 `view.traitCollection.userInterfaceStyle`。外观变化时视图和场景派发 `traitchange` 事件。两者的说明见 [`UITraitCollection`](ui-trait-collection.md)。只是让颜色跟着变，不需要用到它们。

**图层上的颜色是例外。** `layer.backgroundColor`、`layer.borderColor`、`layer.shadowColor`、形状图层的 `fillColor` 和 `strokeColor`、渐变图层的 `colors`，这些属性不保存动态色：

- 写入动态色时，颜色按图层所属视图**当时**的外观取一个固定的值。自己创建的子图层按它所挂的视图的外观取值。这一条在验收用例里验证过：视图被固定成深色之后写 `layer.borderColor = 'label'`，读出 `#ffffff`。
- 之后切换外观，图层上的颜色不变。
- 要跟随外观，在 `traitchange` 事件里重新写一次，写法见指南[适配深色模式](../guides/dark-mode.md)。

> **注意**：视图刚写了 `overrideUserInterfaceStyle` 时，它的外观不是立刻更新的。这时写图层颜色，取到的还是旧外观下的值。所以图层颜色统一放在 `traitchange` 的回调里写。

## 读出来的字符串

合法写入的字符串原样返回。下面两种情况例外。

**同一个色值用了不同的写法。** 对十六进制和 `rgb()` 写出的颜色，运行时按色值记录写法。同一个色值在任何地方用另一种写法写入之后，读出来的是最后写入的那种写法。

```js
const box1 = new UIView();
const box2 = new UIView();
box1.backgroundColor = '#112233';
box2.backgroundColor = 'rgb(17, 34, 51)';   // 同一个色值，另一种写法
console.log(box1.backgroundColor);
```

**效果**：控制台输出 `rgb(17, 34, 51)`，不是 `#112233`。

大小写不同也算不同的写法，比如 `'#5856D6'` 和 `'#5856d6'`。在整个 App 里对同一个色值使用同一种写法，就不会遇到这种情况，把颜色集中定义成常量（见指南[设置颜色](../guides/colors.md)）可以保证这一点。颜色名、`light-dark()` 不受影响。

**颜色不是 App 的代码写的。** 比如控件的默认颜色。这时运行时按颜色的实际内容生成一个字符串：

| 颜色 | 读出来 |
| --- | --- |
| 表里的 51 个颜色之一 | 它的名字，比如 `'label'` |
| 不透明的固定颜色 | `'#rrggbb'`，小写 |
| 半透明的固定颜色 | `'rgba(r, g, b, a)'`。`r`、`g`、`b` 是 0–255 的整数，`a` 最多三位小数 |
| 其他（没有名字的动态色等） | `'native(n)'`，`n` 是一个整数 |

`native(n)` 表示这个颜色无法用上面的写法表示。它可以原样赋给别的颜色属性，效果是同一个颜色。它只在当前这次运行里有效，不要保存到文件或发给服务器。

图层上的颜色属性（`layer.borderColor` 等）不保证读出写入的那个字符串。写入动态色时，读出来的是写入那一刻取到的固定色值，按这张表生成。验收用例验证了写入 `'#abcdef'` 后读出的是一个 `#rrggbb` 形式的字符串。

## 接受颜色的属性

这些属性和方法的写入、读出、写错时的行为都按这一页的规则。

| 类 | 成员 |
| --- | --- |
| [`UIView`](ui-view.md) | `backgroundColor` |
| [`UILabel`](ui-label.md) | `textColor`、`highlightedTextColor`、`shadowColor` |
| [`UITextField`](ui-text-field.md) | `textColor` |
| [`UIImageView`](ui-image-view.md) | `tintColor` |
| [`UIButton`](ui-button.md) | `setTitleColor()`、`titleColorForState()`、`currentTitleColor` |
| [`UITabBar` 和 `UITabBarItem`](ui-tab-bar-controller.md) | `tintColor`、`unselectedItemTintColor`、`badgeColor` |
| [`CALayer`](ca-layer.md) | `backgroundColor`、`borderColor`、`shadowColor` |
| [`CAGradientLayer`](ca-gradient-layer.md) | `colors`（颜色数组） |
| [`CAShapeLayer`](ca-shape-layer.md) | `fillColor`、`strokeColor` |
| [动画](ca-animation.md) | 对颜色属性做动画时的起止值 |

各属性的默认值、写 `null` 的含义见各自的页面。

## 什么时候需要 `UIColor` 对象

日常不需要。字符串能做到 `UIColor` 对象在这里能做到的全部事情。

`UIColor` 对象只能从 51 个[静态属性](#静态属性)取得。它可以直接赋给颜色属性，效果和写对应的名字相同：

```js
const box1 = new UIView();
box1.backgroundColor = UIColor.systemGreenColor;
console.log(box1.backgroundColor);
```

**效果**：色块变成系统的绿色。控制台输出 `systemGreen`。读出来的仍然是字符串，不是 `UIColor` 对象。屏幕上的颜色**未在模拟器验证**。

照着 iOS 的资料写代码时，资料里的 `UIColor.systemGreenColor` 可以原样使用。

## 示例

### 四种写法的色块

从空白 App 开始，在页面上从上到下放四个色块，分别用四种写法设置底色。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const colors = ['#5856D6', 'rgb(255 59 48 / 50%)', 'label', 'light-dark(#34c759, #0a84ff)'];
  colors.forEach((color, i) => {
    const box = new UIView();
    box.frame = new CGRect(40, 100 + i * 100, 120, 80);
    box.backgroundColor = color;
    page.view.addSubview(box);
    console.log(box.backgroundColor);
  });
});
```

**效果**

- 页面上从上到下有四个 120 × 80 pt 的色块。
- 第一个色块是靛蓝色。浅色模式和深色模式下相同。
- 第二个色块是半透明的红色，能透出页面的底色。
- 第三个色块在浅色模式下是黑色，在深色模式下是白色。
- 第四个色块在浅色模式下是绿色，在深色模式下是蓝色。
- 控制台依次输出写进去的四个字符串。

「读出来是写进去的那个字符串」在验收用例里验证过。屏幕上各色块的实际颜色和切换模式时的变化**未在模拟器验证**。在模拟器里切换浅色和深色模式：菜单 Features → Toggle Appearance。

更多写法见指南[设置颜色](../guides/colors.md)。

## 对应的 iOS API

| Objective-C | JS |
| --- | --- |
| `[UIColor colorWithRed:1 green:0 blue:0 alpha:1]` | `'#ff0000'` 或 `'rgb(255, 0, 0)'` |
| `[UIColor colorWithRed:1 green:0 blue:0 alpha:0.5]` | `'rgba(255, 0, 0, 0.5)'` |
| `UIColor.systemBackgroundColor` | `'systemBackground'`，或 `UIColor.systemBackgroundColor` |
| `UIColor.labelColor` | `'label'`，或 `UIColor.labelColor` |
| `UIColor.clearColor` | `'clear'`，或 `UIColor.clearColor` |
| `[UIColor colorWithDynamicProvider:^(UITraitCollection *t) { … }]`，按浅色和深色返回两个颜色 | `'light-dark(浅色, 深色)'` |
| `[UIColor colorNamed:@"BrandBlue"]` | `'asset(BrandBlue)'` |
| `view.backgroundColor = nil` | `view.backgroundColor = null` |
| `layer.borderColor = UIColor.redColor.CGColor` | `layer.borderColor = 'red'` |

Objective-C 的色彩分量是 0–1 的小数。`rgb()` 里的红、绿、蓝是 0–255，换算时乘以 255。

Swift 里的名字没有 `Color` 后缀（`UIColor.systemBackground`），和这里的颜色名字符串相同。

### 与浏览器写法的对照

这一节给熟悉 CSS 颜色的人查对应关系。

| | CSS | 这里 |
| --- | --- | --- |
| 写入不合法的颜色 | 不抛异常，保持原值，没有提示 | 不抛异常，保持原值，输出一条警告 |
| `light-dark()` | 要先声明 `color-scheme` 才生效 | 写了就生效 |
| 颜色名 | 一百多个，不区分大小写 | 51 个，区分大小写 |
| 系统颜色 | `Canvas`、`CanvasText` 等 | `systemBackground`、`label` 等语义色 |
| 全透明 | `transparent` | `'transparent'`、`'clear'` 或 `null` |

#### 不支持的 CSS 写法

下面这些在 CSS 里合法，在这里都按写错处理（输出警告，保持原来的颜色）：

| CSS 写法 | 替代 |
| --- | --- |
| `hsl()`、`hsla()`、`hwb()` | 换算成 `rgb()` |
| `lab()`、`lch()`、`oklab()`、`oklch()`、`color(display-p3 …)` | 没有替代，不能写广色域颜色 |
| `color-mix()`、相对颜色语法（`rgb(from …)`） | 自己算出结果再写 |
| `currentColor` | 没有替代 |
| 表以外的 CSS 颜色名：`pink`、`navy`、`rebeccapurple` 等 | 写十六进制 |
| 大小写不同的名字：`Red`、`darkgray` | 按表里的大小写写：`red`、`darkGray` |
| CSS 系统颜色：`Canvas`、`CanvasText` 等 | `systemBackground`、`label` 等语义色 |

#### 同名但色值不同的颜色名

这几个名字在 CSS 里也有，但色值不同。照 CSS 的印象使用会得到另一个颜色。

| 名字 | 这里的色值 | CSS 同名颜色的色值 |
| --- | --- | --- |
| `green` | `rgb(0, 255, 0)` | `#008000`。这里的 `green` 等于 CSS 的 `lime` |
| `orange` | `rgb(255, 128, 0)` | `#ffa500` |
| `brown` | `rgb(153, 102, 51)` | `#a52a2a` |
| `darkGray` | `rgb(85, 85, 85)` | `darkgray` 是 `#a9a9a9` |
| `lightGray` | `rgb(170, 170, 170)` | `lightgray` 是 `#d3d3d3` |

其余同名的固定色（`black`、`white`、`gray`、`red`、`blue`、`cyan`、`yellow`、`magenta`、`purple`）色值相同。

## 参见

- [设置颜色](../guides/colors.md)：固定色、半透明、语义色、`light-dark()`、Asset Catalog、读出和比较
- [适配深色模式](../guides/dark-mode.md)：让图层的颜色跟随深浅色模式
- [`UITraitCollection`](ui-trait-collection.md)：读当前是浅色还是深色，`traitchange` 事件
- [`UIView`](ui-view.md)：`backgroundColor` 在这里
- [`CALayer`](ca-layer.md)：边框、阴影的颜色
- [枚举](enums.md)：枚举写错时类型检查会报错；枚举属性写错时运行时的处理和颜色相同，输出警告、保持原值
- [单位](units.md)
