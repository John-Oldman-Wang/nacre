---
type: reference
native: UIColor
status: partial
---

# 颜色

在 Nacre 里，颜色写成字符串。所有接受颜色的属性都是这样：写入一个字符串，读出来也是一个字符串。下面的 `view` 是任意一个视图。

```js
view.backgroundColor = '#5856D6';
```

大部分写法和 CSS 相同。和 CSS 相比有五点不同：

- **只支持 CSS 颜色语法的一部分。** 支持十六进制、`rgb()` / `rgba()`、`light-dark()`。不支持 `hsl()`、`color()`、`color-mix()`、`transparent`、`currentColor` 等，完整列表见[不支持的 CSS 写法](#不支持的-css-写法)。
- **颜色名是 iOS 的，不是 CSS 的。** 能用的名字只有[一张表](#能用的颜色名)里的 39 个。名字区分大小写。`red`、`green` 这些名字和 CSS 相同，但其中几个的色值和 CSS 不同。
- **有「语义色」。** 语义色按用途命名，比如 `label`（正文文字）、`systemBackground`（页面底色）。它在浅色模式和深色模式下自动显示成不同的颜色。CSS 里最接近的是系统颜色关键字 `Canvas`、`CanvasText`。
- **多一种 `asset(名字)` 写法。** 它取 Xcode 工程里配置好的颜色。Web 里没有对应物。
- **写错不抛错。** 不合法的颜色只在控制台输出一条警告，属性保持原值。CSS 里写错是静默忽略，这里多一条警告。

`UIColor` 是 iOS 里表示颜色的类。它在全局存在，但日常不需要用到它，见[什么时候需要 `UIColor` 对象](#什么时候需要-uicolor-对象)。

这一页分三部分：先给一个[能直接运行的完整例子](#完整例子)，再按[你想做的事](#常见用法)给出写法和效果，最后是[全部写法和颜色名的说明](#成员说明)。

## 完整例子

下面的代码从空白 App 开始，在页面上从上到下放四个色块，分别用四种写法设置底色。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 固定颜色：十六进制
  const box1 = new UIView();
  box1.frame = new CGRect(40, 100, 120, 80);
  box1.backgroundColor = '#5856D6';
  page.view.addSubview(box1);

  // 2. 带透明度：红 255、绿 59、蓝 48，不透明度 50%
  const box2 = new UIView();
  box2.frame = new CGRect(40, 200, 120, 80);
  box2.backgroundColor = 'rgb(255 59 48 / 50%)';
  page.view.addSubview(box2);

  // 3. 语义色：正文文字的颜色，跟随浅色和深色模式
  const box3 = new UIView();
  box3.frame = new CGRect(40, 300, 120, 80);
  box3.backgroundColor = 'label';
  page.view.addSubview(box3);

  // 4. 自己指定两个颜色：浅色模式用绿色，深色模式用蓝色
  const box4 = new UIView();
  box4.frame = new CGRect(40, 400, 120, 80);
  box4.backgroundColor = 'light-dark(#34c759, #0a84ff)';
  page.view.addSubview(box4);

  // 5. 读出来是写进去的那个字符串
  console.log(box1.backgroundColor);
  console.log(box4.backgroundColor);
});
```

**效果**

- 页面上从上到下有四个 120 × 80 pt 的色块。pt 是 iOS 的长度单位，见[单位](units.md)。
- 第一个色块是靛蓝色。浅色模式和深色模式下相同。
- 第二个色块是半透明的红色，能透出页面的底色。浅色模式下页面底色是白色，色块看起来是浅红色。深色模式下页面底色是黑色，色块看起来是暗红色。
- 第三个色块在浅色模式下是黑色，在深色模式下是白色。
- 第四个色块在浅色模式下是绿色，在深色模式下是蓝色。
- 在系统设置里切换浅色和深色模式时，页面底色、第三个和第四个色块自动换色。不需要写任何代码。
- 控制台输出 `#5856D6` 和 `light-dark(#34c759, #0a84ff)`。

这段代码没有作为一个整体在模拟器运行过。「读出来是写进去的那个字符串」在验收用例里验证过。屏幕上各色块的实际颜色和切换模式时的变化**未在模拟器验证**。

在模拟器里切换浅色和深色模式：菜单 Features → Toggle Appearance。

## 常见用法

以下例子都假设已经有上面的 `page`、`box1` 和 `box2`。例子用的都是 `backgroundColor`，其他接受颜色的属性写法相同，列表见[接受颜色的属性](#接受颜色的属性)。

### 写一个固定颜色

用十六进制或 `rgb()`。两种写法得到的颜色相同。

```js
box1.backgroundColor = '#ff9500';
box2.backgroundColor = 'rgb(255, 149, 0)';
```

**效果**：两个色块都变成橙色。浅色模式和深色模式下相同。

`rgb()` 里的三个数依次是红、绿、蓝，范围 0–255。也可以用表里的固定色名：

```js
box1.backgroundColor = 'white';
```

**效果**：色块变成白色。**未在模拟器验证。**

### 带透明度

十六进制在末尾加一组不透明度，`00` 是全透明，`ff` 是不透明。`rgb()` 加第四个数，范围 0–1，或者写成百分比。

```js
box1.backgroundColor = '#ff000080';          // 末尾的 80 约等于 50%
box2.backgroundColor = 'rgba(255, 0, 0, 0.5)';
```

**效果**：两个色块都变成半透明的红色，能看到后面的内容。**未在模拟器验证。**

`rgb()` 的空格写法把不透明度放在 `/` 后面：

```js
box2.backgroundColor = 'rgb(255 0 0 / 50%)';
```

**效果**：和上面相同。**未在模拟器验证。**

全透明用颜色名 `clear`，或者赋 `null`，见[去掉颜色](#去掉颜色)。CSS 的 `transparent` 不支持。

> **注意**：只有十六进制和 `rgb()` 能带透明度。给颜色名加透明度（比如半透明的 `systemBlue`）目前做不到。

### 跟随深浅色模式：用语义色

iOS 有浅色和深色两种外观，由用户在系统设置里选择，相当于 CSS 的 `prefers-color-scheme`。语义色是系统预先配好的一组颜色，在两种外观下各有一个值。

```js
page.view.backgroundColor = 'systemBackground';   // 页面底色
box1.backgroundColor = 'secondarySystemBackground';   // 放在页面底色上面的一层
box2.backgroundColor = 'separator';   // 分隔线
```

**效果**：页面底色在浅色模式下是白色，在深色模式下是黑色。两个色块在两种模式下各显示系统为该用途配好的颜色。用户切换模式时自动换色。**未在模拟器验证。**

按用途选名字，不要按色值选。全部语义色和各自的用途见[能用的颜色名](#能用的颜色名)。

### 跟随深浅色模式：自己指定两个颜色

用 `light-dark(浅色模式的颜色, 深色模式的颜色)`。

```js
box1.backgroundColor = 'light-dark(#ffffff, #1c1c1e)';
box2.backgroundColor = 'light-dark(systemBackground, #000)';
```

**效果**：`box1` 在浅色模式下是白色，在深色模式下是深灰色。`box2` 在浅色模式下是系统的页面底色，在深色模式下是黑色。用户切换模式时自动换色。**未在模拟器验证。**

两个参数可以是这一页里的任何一种字符串写法。它和 CSS 的 `light-dark()` 用法相同，有一点不同：CSS 要先声明 `color-scheme` 才生效，这里不需要。

### 用 Asset Catalog 里的颜色

Asset Catalog 是 Xcode 工程里放图片和颜色的资源目录，在这个仓库里是 `ios/App/Assets.xcassets`。在里面添加一个 Color Set（一个有名字的颜色），就可以按名字引用它。一个 Color Set 可以为浅色、深色、高对比度分别配置色值。

下面的例子假设已经在 Asset Catalog 里添加了名为 `BrandBlue` 的 Color Set。

```js
box1.backgroundColor = 'asset(BrandBlue)';
```

**效果**：色块显示 `BrandBlue` 在当前外观下配置的颜色。**未在模拟器验证。**

想让颜色在「增强对比度」设置下也换一个值，只能用这种写法。`light-dark()` 只区分浅色和深色。

> **注意**：Asset Catalog 里没有这个名字时，赋值会抛 `TypeError: cannot build a color from this specification`，而不是输出警告。这一条来自代码，**未在模拟器验证。**

### 读出一个颜色

读出来的也是字符串。合法写入的字符串原样返回，不会被改写成另一种写法。

```js
box1.backgroundColor = '#f00';
console.log(box1.backgroundColor);

box1.backgroundColor = 'rgba(255,0,0,.5)';
console.log(box1.backgroundColor);
```

**效果**：控制台依次输出 `#f00` 和 `rgba(255,0,0,.5)`。大小写和空格都和写入时相同。

读出来的任何字符串都可以再赋回去。

有两种情况读出来的不是你写的字符串，见[读出来的字符串](#读出来的字符串)。

### 比较两个颜色是否相同

直接比较读出来的字符串。

```js
box1.backgroundColor = '#5856D6';
box2.backgroundColor = '#5856D6';
console.log(box1.backgroundColor === box2.backgroundColor);
```

**效果**：控制台输出 `true`。

这种比较比的是**写法**，不是色值。同一个颜色用颜色名和十六进制各写一次，读出来是两个不同的字符串。目前没有按色值比较两个颜色的方法。

### 去掉颜色

```js
box1.backgroundColor = null;
console.log(box1.backgroundColor);
```

**效果**：色块变成透明，能看到后面的内容。控制台输出 `null`。屏幕上的变化**未在模拟器验证**。

### 写错时会发生什么

```js
box1.backgroundColor = '#0a7b55';
box1.backgroundColor = '#GGG';
console.log(box1.backgroundColor);
```

**效果**：不抛错。控制台先输出一条警告，再输出 `#0a7b55`。色块的颜色不变。

```text
[Nacre] backgroundColor: "#GGG" is not a valid color, ignored
```

详细规则见[写错不抛，打警告](#写错不抛打警告)。

## 浅色模式和深色模式

固定颜色（十六进制、`rgb()`、固定色名）在两种模式下相同。语义色、系统色、`light-dark()` 和 `asset()` 得到的是**动态色**：颜色本身包含多个值，系统在绘制时按当时的外观选一个。

所以动态色只需要设置一次。用户切换外观时系统自动重新绘制，不派发事件，也不需要重新赋值。

目前 JS 读不到当前是哪种外观，也收不到外观变化的通知，见[还不能做的](#还不能做的)。

> **注意**：图层（`view.layer`）上的颜色属性不跟随外观。给 `layer.borderColor` 写入动态色时，颜色在写入那一刻按当时的外观固定下来，之后切换外观不会变。见 [`CALayer`](ca-layer.md)。

## 写错不抛，打警告

写入不合法的颜色时：

- 不抛错，后面的代码继续执行。
- 属性保持原来的值。
- 控制台输出一条警告。

警告的格式是 `[Nacre] <属性名或方法名>: <写入的值> is not a valid color, ignored`。

| 写入 | 警告 |
| --- | --- |
| `'#GGG'` | `[Nacre] backgroundColor: "#GGG" is not a valid color, ignored` |
| `'light-dark(#fff)'`（少一个参数） | `[Nacre] backgroundColor: "light-dark(#fff)" is not a valid color, ignored` |
| `42`（不是字符串） | `[Nacre] backgroundColor: 42 is not a valid color, ignored` |
| `'nosuchColor'` | 见下 |

写入的字符串以字母开头、只由字母和数字组成时，运行时把它当作写错的颜色名，在警告后面列出全部能用的名字：

```text
[Nacre] backgroundColor: "nosuchColor" is not a valid color, ignored; expected a color name, one of: black / darkGray / lightGray / white / gray / red / green / blue / cyan / yellow / magenta / orange / purple / brown / clear / systemRed / systemGreen / systemBlue / systemOrange / systemYellow / systemPink / systemPurple / systemTeal / systemIndigo / systemBrown / systemMint / systemCyan / systemGray / label / secondaryLabel / tertiaryLabel / quaternaryLabel / placeholderText / separator / opaqueSeparator / link / systemBackground / secondarySystemBackground / tertiarySystemBackground
```

「不抛错」和「保持原值」在验收用例里验证过。警告的文字来自代码。

三点补充：

- 这条规则只对颜色成立。[枚举](enums.md)写错会当场抛错。
- 颜色名带 `Color` 后缀（`'systemPinkColor'`）是不合法的。字符串里只能用表里的短名字。
- [`CAGradientLayer`](ca-layer.md) 的 `colors` 是颜色数组。其中任何一项不合法，整个数组都不写入。
- `asset(名字)` 的名字在 Asset Catalog 里不存在时会抛 `TypeError`，不属于这条规则，见[用 Asset Catalog 里的颜色](#用-asset-catalog-里的颜色)。

TypeScript 查不出写错的颜色字符串。颜色的类型是 `string`，内容是否合法只有运行时知道。

## 读出来的字符串

合法写入的字符串原样返回。下面两种情况例外。

**同一个色值用了不同的写法。** 对十六进制和 `rgb()` 写出的颜色，运行时按色值记录写法。同一个色值在任何地方用另一种写法写入之后，读出来的是最后写入的那种写法。

```js
box1.backgroundColor = '#112233';
box2.backgroundColor = 'rgb(17, 34, 51)';   // 同一个色值，另一种写法
console.log(box1.backgroundColor);
```

**效果**：控制台输出 `rgb(17, 34, 51)`，不是 `#112233`。

大小写不同也算不同的写法，比如 `'#5856D6'` 和 `'#5856d6'`。在整个 App 里对同一个色值使用同一种写法，就不会遇到这种情况。颜色名、`light-dark()` 不受影响。

**颜色不是你写的。** 比如控件的默认颜色。这时运行时按颜色的实际内容生成一个字符串：

| 颜色 | 读出来 |
| --- | --- |
| 表里的 39 个颜色之一 | 它的名字，比如 `'label'` |
| 不透明的固定颜色 | `'#rrggbb'`，小写 |
| 半透明的固定颜色 | `'rgba(r, g, b, a)'`。`r`、`g`、`b` 是 0–255 的整数，`a` 最多三位小数 |
| 其他（没有名字的动态色等） | `'native(n)'`，`n` 是一个整数 |

`native(n)` 表示这个颜色无法用上面的写法表示。它可以原样赋给别的颜色属性，效果是同一个颜色。它只在当前这次运行里有效，不要保存到文件或发给服务器。

图层上的颜色属性（`layer.borderColor` 等）不保证读出写入的那个字符串。写入动态色时，读出来的是写入那一刻固定下来的色值，按这张表生成。验收用例只验证了写入 `'#abcdef'` 后读出的是一个 `#rrggbb` 形式的字符串。

## 什么时候需要 `UIColor` 对象

日常不需要。字符串能做到 `UIColor` 对象在 Nacre 里能做到的全部事情。

`UIColor` 对象只能从 39 个类级属性取得，属性名是颜色名加 `Color` 后缀。它可以直接赋给颜色属性，效果和写对应的名字相同：

```js
box1.backgroundColor = UIColor.systemGreenColor;
console.log(box1.backgroundColor);
```

**效果**：色块变成系统的绿色。控制台输出 `systemGreen`。读出来的仍然是字符串，不是 `UIColor` 对象。屏幕上的颜色**未在模拟器验证**。

照着 iOS 的资料写代码时，资料里的 `UIColor.systemGreenColor` 可以原样使用。

## 成员说明

### 支持的写法

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
| Asset Catalog | `asset(名字)` | `'asset(BrandBlue)'` | Asset Catalog 里这个名字的 Color Set |
| 代号 | `native(n)` | `'native(7)'` | 只会从读取得到，见[读出来的字符串](#读出来的字符串) |

以上写法里，例子列出的十六进制四种、`rgb()` 四种、`light-dark()` 两种（参数是十六进制、参数是颜色名）和颜色名的「写入后原样读出」都在验收用例里验证过。`asset()` 和 `native()` **未在模拟器验证**。

**十六进制**的字母不区分大小写。位数只能是 3、4、6、8。

**`rgb()` 的分量**：

| 分量 | 取值 | 含义 |
| --- | --- | --- |
| 红、绿、蓝 | 0–255 的数，可以带小数；或者 0%–100% 的百分比 | 0 是没有这个颜色，255 或 100% 是最强 |
| 不透明度 | 0–1 的数；或者 0%–100% 的百分比 | 0 是全透明，1 或 100% 是不透明。省略时是 1 |

`rgb` 和 `rgba` 两个函数名可以互换，都接受三个或四个分量。函数名不区分大小写。运行时不检查分量是否在范围内，不要写超出范围的值。

写入时除了字符串，还接受 `UIColor` 对象和 `null`。`null` 表示没有颜色。

### 不支持的 CSS 写法

下面这些在 CSS 里合法，在这里都按写错处理（警告，保持原值）：

| CSS 写法 | 替代 |
| --- | --- |
| `hsl()`、`hsla()`、`hwb()` | 换算成 `rgb()` |
| `lab()`、`lch()`、`oklab()`、`oklch()`、`color(display-p3 …)` | 没有替代，不能写广色域颜色 |
| `color-mix()`、相对颜色语法（`rgb(from …)`） | 自己算出结果再写 |
| `transparent` | `'clear'` 或 `null` |
| `currentColor` | 没有替代 |
| 表以外的 CSS 颜色名：`pink`、`navy`、`rebeccapurple` 等 | 写十六进制 |
| 大小写不同的名字：`Red`、`darkgray` | 按表里的大小写写：`red`、`darkGray` |
| CSS 系统颜色：`Canvas`、`CanvasText` 等 | `systemBackground`、`label` 等语义色 |

### 能用的颜色名

一共 39 个。名字区分大小写。不在表里的名字按写错处理，警告里会列出这张表。

**固定色**，15 个。色值固定，不随外观变。下表的色值来自 iOS SDK 的头文件，换算成 0–255 并四舍五入。

| 名字 | 色值 | 和 CSS 同名颜色相比 |
| --- | --- | --- |
| `black` | `rgb(0, 0, 0)` | 相同 |
| `darkGray` | `rgb(85, 85, 85)` | CSS 的 `darkgray` 是 `#a9a9a9`，比它浅 |
| `lightGray` | `rgb(170, 170, 170)` | CSS 的 `lightgray` 是 `#d3d3d3`，比它浅 |
| `white` | `rgb(255, 255, 255)` | 相同 |
| `gray` | `rgb(128, 128, 128)` | 相同 |
| `red` | `rgb(255, 0, 0)` | 相同 |
| `green` | `rgb(0, 255, 0)` | 不同。CSS 的 `green` 是 `#008000`，这里相当于 CSS 的 `lime` |
| `blue` | `rgb(0, 0, 255)` | 相同 |
| `cyan` | `rgb(0, 255, 255)` | 相同 |
| `yellow` | `rgb(255, 255, 0)` | 相同 |
| `magenta` | `rgb(255, 0, 255)` | 相同 |
| `orange` | `rgb(255, 128, 0)` | 不同。CSS 的 `orange` 是 `#ffa500` |
| `purple` | `rgb(128, 0, 128)` | 相同 |
| `brown` | `rgb(153, 102, 51)` | 不同。CSS 的 `brown` 是 `#a52a2a` |
| `clear` | 全透明 | 相当于 CSS 的 `transparent` |

**系统色**，13 个。这是 iOS 界面里常用的一组颜色，色值由系统决定。浅色模式和深色模式下的色值略有不同，用来在两种底色上都保持清晰。

`systemRed` `systemGreen` `systemBlue` `systemOrange` `systemYellow` `systemPink` `systemPurple` `systemTeal` `systemIndigo` `systemBrown` `systemMint` `systemCyan` `systemGray`

**语义色**，11 个。按用途命名，色值由系统决定，跟随浅色模式、深色模式和「增强对比度」设置变化。

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

`systemBackground` 在两种模式下的色值是实测的。其余语义色只写了用途，具体色值没有量过。

「写入后原样读出」验证过的名字有 `black`、`systemBlue`、`systemPink`、`systemYellow`、`systemTeal`、`label`、`systemBackground`。其余名字走同一段代码，**未在模拟器逐个验证**。

### 接受颜色的属性

这些属性和方法的写入、读出、写错时的行为都按这一页的规则。

| 类 | 成员 |
| --- | --- |
| [`UIView`](ui-view.md) | `backgroundColor` |
| [`UILabel`](ui-label.md) | `textColor`、`highlightedTextColor`、`shadowColor` |
| [`UITextField`](ui-text-field.md) | `textColor` |
| [`UIImageView`](ui-image.md) | `tintColor` |
| [`UIButton`](ui-button.md) | `setTitleColor()`、`titleColorForState()`、`currentTitleColor` |
| [`CALayer`](ca-layer.md) | `backgroundColor`、`borderColor`、`shadowColor` |
| [`CAGradientLayer`](ca-layer.md) | `colors`（颜色数组） |
| [`CAShapeLayer`](ca-layer.md) | `fillColor`、`strokeColor` |
| [动画](ca-animation.md) | 对颜色属性做动画时的起止值 |

各属性的默认值和是否可以为 `null` 见各自的页面。

### `UIColor` 类

继承关系：`EventTarget` → `NSObject` → `UIColor`。

**不能构造，也不能继承。** 写 `new UIColor()` 会抛错：

```js
// @ts-expect-error 构造函数是私有的，类型检查也会报错
new UIColor();
```

**效果**：抛 `TypeError: Illegal constructor: UIColor is created by the runtime, not by new`。**未在模拟器验证。**

**类级属性**，39 个，全部只读，类型都是 `UIColor`。属性名是[颜色名](#能用的颜色名)加上 `Color` 后缀，和 Objective-C 里的名字相同。

| 分组 | 属性 |
| --- | --- |
| 固定色 | `blackColor` `darkGrayColor` `lightGrayColor` `whiteColor` `grayColor` `redColor` `greenColor` `blueColor` `cyanColor` `yellowColor` `magentaColor` `orangeColor` `purpleColor` `brownColor` `clearColor` |
| 系统色 | `systemRedColor` `systemGreenColor` `systemBlueColor` `systemOrangeColor` `systemYellowColor` `systemPinkColor` `systemPurpleColor` `systemTealColor` `systemIndigoColor` `systemBrownColor` `systemMintColor` `systemCyanColor` `systemGrayColor` |
| 语义色 | `labelColor` `secondaryLabelColor` `tertiaryLabelColor` `quaternaryLabelColor` `placeholderTextColor` `separatorColor` `opaqueSeparatorColor` `linkColor` `systemBackgroundColor` `secondarySystemBackgroundColor` `tertiarySystemBackgroundColor` |

每个属性的可读、可写：可读是，可写否。各颜色的含义见[能用的颜色名](#能用的颜色名)。

同一个属性每次取到的是同一个对象：

```js
console.log(UIColor.systemBlueColor === UIColor.systemBlueColor);
```

**效果**：控制台输出 `true`。

`UIColor` 对象没有自己的实例属性和方法。它不可变，没有变化通知。

## 与 iOS 原生写法的对照

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

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 用色相、饱和度、亮度写颜色 | `colorWithHue:saturation:brightness:alpha:` | 未实现 |
| 写广色域（Display P3）颜色 | `colorWithDisplayP3Red:green:blue:alpha:` | 未实现 |
| 给颜色名加透明度，比如半透明的 `systemBlue` | `colorWithAlphaComponent:` | 未实现 |
| 读出一个颜色的红、绿、蓝、不透明度 | `getRed:green:blue:alpha:` | 未实现 |
| 按色值比较两个颜色 | `isEqual:` | 未实现 |
| 知道当前是浅色还是深色模式，并在变化时收到通知 | `UITraitCollection` | 未实现 |
| 让某个视图固定用浅色或深色 | `overrideUserInterfaceStyle` | 未实现 |
| 用更多系统颜色：`systemGray2`–`systemGray6`、`systemFill` 一组、`systemGroupedBackground` 一组 | 对应的 `UIColor` 类级属性 | 未实现 |
| 用图片平铺作为颜色 | `colorWithPatternImage:` | 未实现 |
| 让图层上的颜色跟随深浅色模式 | `UITraitCollection` | 未实现 |

## 参见

- [`UIView`](ui-view.md)：`backgroundColor` 在这里
- [`UILabel`](ui-label.md)：文字颜色
- [`UIButton`](ui-button.md)：按状态设置标题颜色
- [`CALayer`](ca-layer.md)：边框、阴影、渐变的颜色，以及图层颜色不跟随外观的原因
- [枚举](enums.md)：枚举写错会抛错，和颜色不同
- [原生类](native-classes.md)：为什么 `UIColor` 不能构造和继承
- [单位](units.md)
- [实现原理：颜色](../internals/ui-color.md)
