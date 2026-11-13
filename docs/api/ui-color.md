---
type: reference
native: UIColor
status: partial
---

# 颜色

颜色写成字符串。视图的底色、文字的颜色、图层的边框色，所有接受颜色的属性都按同一套规则：写入一个字符串，读出来也是一个字符串。下面的 `view` 是任意一个视图。

```js
view.backgroundColor = '#5856D6';
```

**结果**：视图的底色变成靛蓝色。

**颜色写错不会让 App 崩溃。** 写入一个不合法的颜色时，不抛异常，后面的代码照常执行，属性保持原来的颜色，控制台输出一条警告。这是定下来的规则，行为和给 `element.style.color` 赋一个不合法的值一致。警告的原文、怎么提前发现写错、推荐的写法，都在下面的[写错不抛，打警告](#写错不抛打警告)一节。

字符串有五类写法：

| 写法 | 例子 | 说明 |
| --- | --- | --- |
| 十六进制 | `'#5856D6'`、`'#ff000080'` | 3、4、6、8 位。字母不区分大小写 |
| `rgb()` | `'rgb(255, 59, 48)'`、`'rgba(0, 0, 0, 0.4)'` | 红、绿、蓝是 0–255，不透明度是 0–1 |
| 颜色名 | `'systemBackground'`、`'label'`、`'white'` | 只有[表里的 39 个](#能用的颜色名)。名字区分大小写 |
| 跟随深浅色 | `'light-dark(#ffffff, #1c1c1e)'` | 浅色模式用第一个，深色模式用第二个 |
| Asset Catalog | `'asset(BrandBlue)'` | 取 Xcode 工程里配置好的颜色 |

读者在这里通常会问的几件事：

- **读出来的和写进去的一样吗？** 一样。合法写入的字符串原样读出，大小写和空格都不变。两种例外见[读出来的字符串](#读出来的字符串)。
- **深色模式要不要自己处理？** 用颜色名里的系统色和语义色，或者用 `light-dark()`，系统在用户切换浅色和深色模式时自动换色，不需要写代码。十六进制和 `rgb()` 写的颜色在两种模式下相同。图层上的颜色是例外，见[浅色模式和深色模式](#浅色模式和深色模式)。
- **半透明怎么写？** 十六进制末尾加一组不透明度，或者 `rgb()` 加第四个数，见[带透明度](#带透明度)。颜色名不能带透明度。
- **`hsl()`、`transparent` 这些能用吗？** 不能。不支持的写法和各自的替代见[不支持的 CSS 写法](#不支持的-css-写法)。

`UIColor` 是 iOS 里表示颜色的类。它在全局存在，日常不需要用到，见[什么时候需要 `UIColor` 对象](#什么时候需要-uicolor-对象)。

## 写错不抛，打警告

写入不合法的颜色时：

- 不抛异常，后面的代码继续执行。
- 属性保持原来的颜色。原来没有颜色的，仍然没有。
- 控制台输出一条警告。

```js
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
[Nacre] backgroundColor: "nosuchColor" is not a valid color, ignored; expected a color name, one of: black / darkGray / lightGray / white / gray / red / green / blue / cyan / yellow / magenta / orange / purple / brown / clear / systemRed / systemGreen / systemBlue / systemOrange / systemYellow / systemPink / systemPurple / systemTeal / systemIndigo / systemBrown / systemMint / systemCyan / systemGray / label / secondaryLabel / tertiaryLabel / quaternaryLabel / placeholderText / separator / opaqueSeparator / link / systemBackground / secondarySystemBackground / tertiarySystemBackground
```

「不抛异常」和「保持原来的颜色」在验收用例里验证过，上表四种写入都验证了。警告的文字来自运行时的代码。

### 哪些不算写错

- **`null` 和 `undefined` 不算写错。** 它们表示「没有颜色」，不输出警告，见[去掉颜色](#去掉颜色)。所以 `view.backgroundColor = Colors.brnad` 这种拼错了常量名的写法，得到的是 `undefined`，结果是颜色被去掉，没有任何提示。
- **`UIColor` 对象不算写错。** 它直接被接受。

### 哪些也按写错处理

- 颜色名的大小写不对：`'Red'`、`'darkgray'`。
- 颜色名带 `Color` 后缀：`'systemPinkColor'`。字符串里只能用表里的短名字。
- 这里不支持的 CSS 写法：`'hsl(0 100% 50%)'`、`'transparent'`。
- [`CAGradientLayer`](ca-layer.md) 的 `colors` 是颜色数组。其中任何一项不合法，整个数组都不写入。

### 一处已知问题：`asset()` 的名字不存在时会抛

`asset(名字)` 的名字在 Asset Catalog 里不存在，也属于颜色写错，按规则应当只输出警告、保持原来的颜色。**当前版本在这种情况下会抛 `TypeError: cannot build a color from this specification`，这是已知问题。** 修好之前，用 `asset()` 时要自己确认名字存在。这一条来自运行时的代码，**未在模拟器验证**。

### 编辑器能不能提前发现

不能。颜色的类型是 `string`，类型检查只能确认写入的是字符串，字符串的内容是否合法只有运行时知道。`'#GGG'`、`'sytemRed'` 都能通过类型检查。

这一点和[枚举](enums.md)不同。枚举的取值写错时类型检查会报错，运行时也会抛异常。

### 推荐的做法：把颜色集中定义成常量

把 App 用到的颜色写在一个地方，其他地方只引用常量名：

```js
// 全 App 的颜色只在这里写一次
const Colors = {
  brand: '#5856D6',
  danger: 'systemRed',
  text: 'label',
  cardBackground: 'light-dark(#ffffff, #1c1c1e)',
  overlay: 'rgba(0, 0, 0, 0.4)',
};

view.backgroundColor = Colors.brand;
```

**结果**：视图的底色变成靛蓝色。

这样写有三个好处：

- **颜色字符串只出现一次。** 写错的机会只有这一处。App 启动后看一遍控制台，没有 `is not a valid color` 的警告，这些字符串就都是合法的。
- **常量名写错能被类型检查发现。** 开着类型检查时，`Colors.brnad` 会报「属性不存在」。颜色字符串写错不会报，常量名写错会报。不开类型检查时，`Colors.brnad` 是 `undefined`，颜色被去掉且没有警告，所以建议开着类型检查。
- **同一个色值只有一种写法。** 同一个色值用两种写法写入时，读出来的字符串会变成后写入的那一种，见[读出来的字符串](#读出来的字符串)。集中定义之后不会遇到。

需要跟随浅色和深色模式的颜色，优先用语义色（`'label'`、`'systemBackground'`）。语义色由系统维护，在浅色、深色和「增强对比度」设置下都有合适的值。系统没有提供的品牌色用 `light-dark()` 写两个值。

`asset(名字)` 把色值放在 Xcode 的 Asset Catalog 里，可以为浅色、深色、高对比度分别配置。它适合手工维护 Xcode 工程的 App。用 [`@nacre/ios` 的命令行工具](../guides/your-own-app.md)生成工程的 App 目前没有添加颜色的途径：生成的 `ios/` 目录每次都会重建，里面的 Asset Catalog 只有 App 图标。这种工程用上面的常量写法。

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

以下例子都沿用上面的 `page`、`box1` 和 `box2`。例子用的都是 `backgroundColor`，其他接受颜色的属性写法相同，列表见[接受颜色的属性](#接受颜色的属性)。

### 写一个固定颜色

用十六进制或 `rgb()`。两种写法得到的颜色相同。

```js
box1.backgroundColor = '#ff9500';
box2.backgroundColor = 'rgb(255, 149, 0)';
```

**效果**：两个色块都变成橙色。浅色模式和深色模式下相同。屏幕上的颜色**未在模拟器验证**。

`rgb()` 里的三个数依次是红、绿、蓝，范围 0–255。十六进制的字母大写小写都可以，`'#FF9500'` 和 `'#ff9500'` 是同一个颜色。

也可以用表里的固定色名。颜色名区分大小写，要照表里的写法：

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

全透明用颜色名 `clear`，或者赋 `null`，见[去掉颜色](#去掉颜色)。

颜色的不透明度只影响这一个颜色。要让整个视图连同它的子视图一起变透明，用视图的 `alpha`，见 [`UIView`](ui-view.md)。

> **注意**：只有十六进制和 `rgb()` 能带透明度。给颜色名加透明度（比如半透明的 `systemBlue`）目前做不到。

### 跟随深浅色模式：用语义色

iOS 有浅色和深色两种外观，由用户在系统设置里选择。语义色是系统预先配好的一组颜色，按用途命名，在两种外观下各有一个值。

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

**效果**：`box1` 在浅色模式下是白色，在深色模式下是深灰色。`box2` 在浅色模式下是系统的页面底色，在深色模式下是黑色。用户切换模式时自动换色。**屏幕上的颜色未在模拟器验证。**

两个参数可以是这一页里的任何一种字符串写法。写了就生效，不需要另外声明 App 支持深色模式。

### 用 Asset Catalog 里的颜色

Asset Catalog 是 Xcode 工程里放图片和颜色的资源目录。在里面添加一个 Color Set（一个有名字的颜色），就可以按名字引用它。一个 Color Set 可以为浅色、深色、高对比度分别配置色值。

下面的例子假设已经在 Asset Catalog 里添加了名为 `BrandBlue` 的 Color Set。

```js
box1.backgroundColor = 'asset(BrandBlue)';
```

**效果**：色块显示 `BrandBlue` 在当前外观下配置的颜色。**未在模拟器验证。**

想让颜色在「增强对比度」设置下也换一个值，只能用这种写法。`light-dark()` 只区分浅色和深色。

> **注意**：名字不存在时，当前版本会抛 `TypeError`，没有按「写错只警告」处理，见[一处已知问题](#一处已知问题asset-的名字不存在时会抛)。用命令行工具生成的工程目前没有添加 Color Set 的途径，见[推荐的做法](#推荐的做法把颜色集中定义成常量)。

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

有两种情况读出来的不是写入的字符串，见[读出来的字符串](#读出来的字符串)。

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

写 `undefined` 和写 `null` 相同。有些属性写 `null` 的含义是恢复默认值，比如 [`UILabel`](ui-label.md) 的 `textColor`，各属性的说明见各自的页面。

### 让图层的颜色跟随深浅色模式

图层（`view.layer`）上的颜色在写入时确定，之后不随外观变化。要跟随，在视图的 `traitchange` 事件里重新写一次：

```js
box1.layer.borderWidth = 1;
box1.layer.borderColor = 'separator';

box1.addEventListener('traitchange', () => {
  box1.layer.borderColor = 'separator';
});
```

**效果**：色块有一条 1 pt 的边框。用户切换浅色和深色模式后，边框换成新外观下的分隔线颜色。**这段代码未在模拟器验证**；验收用例验证的是「在 `traitchange` 之后写入图层颜色，读出的是新外观下的色值」。

原因见[浅色模式和深色模式](#浅色模式和深色模式)。事件的说明见[外观特征](ui-trait-collection.md)。

## 浅色模式和深色模式

固定颜色（十六进制、`rgb()`、固定色名）在两种模式下相同。语义色、系统色、`light-dark()` 和 `asset()` 得到的是**动态色**：颜色本身包含多个值，系统在绘制时按当时的外观选一个。

所以动态色只需要设置一次。用户切换外观时系统自动重新绘制，不需要重新赋值。

每个视图有自己的外观。默认跟随系统设置，也可以用 `overrideUserInterfaceStyle` 让某个视图和它的子视图固定用浅色或深色。动态色按它所在视图的外观取值，所以同一个 `'label'` 在一个被固定成深色的卡片里是白色，在卡片外面是黑色。

代码需要知道当前是哪种外观时，读 `view.traitCollection.userInterfaceStyle`。外观变化时视图和场景派发 `traitchange` 事件。两者的说明见[外观特征](ui-trait-collection.md)。只是让颜色跟着变，不需要用到它们。

**图层上的颜色是例外。** `layer.backgroundColor`、`layer.borderColor`、`layer.shadowColor`、形状图层的 `fillColor` 和 `strokeColor`、渐变图层的 `colors`，这些属性不保存动态色：

- 写入动态色时，颜色按图层所属视图**当时**的外观取一个固定的值。自己创建的子图层按它所挂的视图的外观取值。这一条在验收用例里验证过：视图被固定成深色之后写 `layer.borderColor = 'label'`，读出 `#ffffff`。
- 之后切换外观，图层上的颜色不变。
- 要跟随外观，在 `traitchange` 事件里重新写一次，见[让图层的颜色跟随深浅色模式](#让图层的颜色跟随深浅色模式)。

> **注意**：视图刚写了 `overrideUserInterfaceStyle` 时，它的外观不是立刻更新的。这时写图层颜色，取到的还是旧外观下的值。所以图层颜色统一放在 `traitchange` 的回调里写。

## 读出来的字符串

合法写入的字符串原样返回。下面两种情况例外。

**同一个色值用了不同的写法。** 对十六进制和 `rgb()` 写出的颜色，运行时按色值记录写法。同一个色值在任何地方用另一种写法写入之后，读出来的是最后写入的那种写法。

```js
box1.backgroundColor = '#112233';
box2.backgroundColor = 'rgb(17, 34, 51)';   // 同一个色值，另一种写法
console.log(box1.backgroundColor);
```

**效果**：控制台输出 `rgb(17, 34, 51)`，不是 `#112233`。

大小写不同也算不同的写法，比如 `'#5856D6'` 和 `'#5856d6'`。在整个 App 里对同一个色值使用同一种写法，就不会遇到这种情况，[把颜色集中定义成常量](#推荐的做法把颜色集中定义成常量)可以保证这一点。颜色名、`light-dark()` 不受影响。

**颜色不是 App 的代码写的。** 比如控件的默认颜色。这时运行时按颜色的实际内容生成一个字符串：

| 颜色 | 读出来 |
| --- | --- |
| 表里的 39 个颜色之一 | 它的名字，比如 `'label'` |
| 不透明的固定颜色 | `'#rrggbb'`，小写 |
| 半透明的固定颜色 | `'rgba(r, g, b, a)'`。`r`、`g`、`b` 是 0–255 的整数，`a` 最多三位小数 |
| 其他（没有名字的动态色等） | `'native(n)'`，`n` 是一个整数 |

`native(n)` 表示这个颜色无法用上面的写法表示。它可以原样赋给别的颜色属性，效果是同一个颜色。它只在当前这次运行里有效，不要保存到文件或发给服务器。

图层上的颜色属性（`layer.borderColor` 等）不保证读出写入的那个字符串。写入动态色时，读出来的是写入那一刻取到的固定色值，按这张表生成。验收用例验证了写入 `'#abcdef'` 后读出的是一个 `#rrggbb` 形式的字符串。

## 什么时候需要 `UIColor` 对象

日常不需要。字符串能做到 `UIColor` 对象在这里能做到的全部事情。

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

### 能用的颜色名

一共 39 个。名字区分大小写。不在表里的名字按写错处理，警告里会列出这张表。

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

其中 `green`、`orange`、`brown`、`darkGray`、`lightGray` 的色值和 CSS 的同名颜色不同，见[与浏览器写法的对照](#与浏览器写法的对照)。

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

`label` 在两种模式下的色值是实测的（浅色 `#000000`，深色 `#ffffff`）。`systemBackground` 的色值来自 Apple 的定义。其余语义色只写了用途，具体色值没有量过。

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
| [`UITabBar` 和 `UITabBarItem`](ui-tab-bar-controller.md) | `tintColor`、`unselectedItemTintColor`、`badgeColor` |
| [`CALayer`](ca-layer.md) | `backgroundColor`、`borderColor`、`shadowColor` |
| [`CAGradientLayer`](ca-layer.md) | `colors`（颜色数组） |
| [`CAShapeLayer`](ca-layer.md) | `fillColor`、`strokeColor` |
| [动画](ca-animation.md) | 对颜色属性做动画时的起止值 |

各属性的默认值、写 `null` 的含义见各自的页面。

### `UIColor` 类

继承关系：`EventTarget` → `NSObject` → `UIColor`。

**不能构造，也不能继承。** 写 `new UIColor()` 会抛异常：

```js
// @ts-expect-error 构造函数是私有的，类型检查也会报错
new UIColor();
```

**结果**：抛 `TypeError: Illegal constructor: UIColor is created by the runtime, not by new`。**未在模拟器验证。**

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

**结果**：控制台输出 `true`。

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

## 与浏览器写法的对照

这一节给熟悉 CSS 颜色的人查对应关系。

| | CSS | 这里 |
| --- | --- | --- |
| 写入不合法的颜色 | 不抛异常，保持原值，没有提示 | 不抛异常，保持原值，输出一条警告 |
| `light-dark()` | 要先声明 `color-scheme` 才生效 | 写了就生效 |
| 颜色名 | 一百多个，不区分大小写 | 39 个，区分大小写 |
| 系统颜色 | `Canvas`、`CanvasText` 等 | `systemBackground`、`label` 等语义色 |
| 全透明 | `transparent` | `'clear'` 或 `null` |

### 不支持的 CSS 写法

下面这些在 CSS 里合法，在这里都按写错处理（输出警告，保持原来的颜色）：

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

### 同名但色值不同的颜色名

这几个名字在 CSS 里也有，但色值不同。照 CSS 的印象使用会得到另一个颜色。

| 名字 | 这里的色值 | CSS 同名颜色的色值 |
| --- | --- | --- |
| `green` | `rgb(0, 255, 0)` | `#008000`。这里的 `green` 等于 CSS 的 `lime` |
| `orange` | `rgb(255, 128, 0)` | `#ffa500` |
| `brown` | `rgb(153, 102, 51)` | `#a52a2a` |
| `darkGray` | `rgb(85, 85, 85)` | `darkgray` 是 `#a9a9a9` |
| `lightGray` | `rgb(170, 170, 170)` | `lightgray` 是 `#d3d3d3` |

其余同名的固定色（`black`、`white`、`gray`、`red`、`blue`、`cyan`、`yellow`、`magenta`、`purple`）色值相同。

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 用色相、饱和度、亮度写颜色 | `colorWithHue:saturation:brightness:alpha:` | 未实现 |
| 写广色域（Display P3）颜色 | `colorWithDisplayP3Red:green:blue:alpha:` | 未实现 |
| 给颜色名加透明度，比如半透明的 `systemBlue` | `colorWithAlphaComponent:` | 未实现 |
| 读出一个颜色的红、绿、蓝、不透明度 | `getRed:green:blue:alpha:` | 未实现 |
| 按色值比较两个颜色 | `isEqual:` | 未实现 |
| 在写入之前检查一个字符串是不是合法的颜色 | — | 未实现。只能写入后看控制台的警告 |
| 用更多系统颜色：`systemGray2`–`systemGray6`、`systemFill` 一组、`systemGroupedBackground` 一组 | 对应的 `UIColor` 类级属性 | 未实现 |
| 用图片平铺作为颜色 | `colorWithPatternImage:` | 未实现 |
| 让图层上的颜色自动跟随深浅色模式 | 原生也不自动跟随 | 做法是在 `traitchange` 事件里重新写入，见[让图层的颜色跟随深浅色模式](#让图层的颜色跟随深浅色模式) |
| 在命令行工具生成的工程里添加 Asset Catalog 颜色 | Asset Catalog 的 Color Set | 未实现。生成的工程每次重建 |

## 参见

- [`UIView`](ui-view.md)：`backgroundColor` 在这里
- [`UILabel`](ui-label.md)：文字颜色
- [`UIButton`](ui-button.md)：按状态设置标题颜色
- [`CALayer`](ca-layer.md)：边框、阴影、渐变的颜色
- [外观特征](ui-trait-collection.md)：读当前是浅色还是深色，`traitchange` 事件，让某个视图固定用浅色或深色
- [枚举](enums.md)：枚举写错会抛异常，和颜色不同
- [原生类](native-classes.md)：为什么 `UIColor` 不能构造和继承
- [单位](units.md)
- [实现原理：颜色](../internals/ui-color.md)
