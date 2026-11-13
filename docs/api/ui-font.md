---
type: reference
native: UIFont
status: partial
---

# `UIFont`

**`UIFont`** 表示一个字体。一个 `UIFont` 对象同时确定三件事：用哪种字体、字号多大、笔画多粗。把它赋给 [`UILabel`](ui-label.md) 这类显示文字的视图的 `font` 属性，文字就用这个字体显示。

字体对象通过 `UIFont` 上的静态方法得到，例如 `UIFont.systemFontOfSize(17)`，不能用 `new` 创建。字体对象不可变：创建之后字号和粗细都不能改。要换字号，就再取一个字体对象，重新赋给 `font`。

## 字号的单位

字号的单位是点（[pt](units.md)），和视图的位置、大小用同一种单位。没有其他单位可选。标签不设字体时用的是 17 pt 的系统字体。

字号是一个固定的数。`UIFont.systemFontOfSize(17)` 得到的字体永远是 17 pt，不随屏幕大小变化，也不随用户的系统设置变化。

## 用哪种字体

| 来源 | 写法 | 取不到时 |
| --- | --- | --- |
| 系统字体 | `systemFontOfSize()` 等五个方法 | 一定取得到 |
| 按用途取的系统字体，字号跟随用户设置 | `preferredFontForTextStyle()` | 一定取得到 |
| 系统里装着的其他字体，按名字取 | `fontWithName()` | 返回 `null`，不抛异常 |

「系统字体」是 iOS 界面默认使用的字体。**界面上的文字推荐用系统字体**：它一定存在，取字体的方法不会返回 `null`，并且有九种粗细可选。

`fontWithName()` 按名字取字体。名字不存在时返回 `null`，所以使用前要判空。没有回退列表：一次只能指定一个名字，取不到时换成什么由 App 的代码决定。

**随 App 打包的字体文件目前不能用。** 运行时没有注册字体文件的接口，命令行工具生成的工程里也没有声明字体文件的配置。能用的只有系统自带的字体。

## 用户调大系统字号后

用户可以在系统的「设置 → 显示与亮度 → 文字大小」里调整文字大小。App 的文字是否跟着变，取决于字体是怎么取的：

| 取法 | 用户改了设置之后 |
| --- | --- |
| `systemFontOfSize(17)`、`fontWithName()` 等指定字号的方法 | 不变，仍是指定的字号 |
| `preferredFontForTextStyle('body')` | 取到的是当时设置下的字号。已经取到的字体对象不变，已经显示的文字也不变 |

所以要让文字跟随设置，需要两步：用 `preferredFontForTextStyle()` 取字体；在设置变化时重新取一次并赋给 `font`。写法见[用户改了系统文字大小后更新字体](#用户改了系统文字大小后更新字体)。

推荐的做法：正文、说明这类供阅读的文字用 `preferredFontForTextStyle()`，让它跟随用户的设置；位置和大小都固定的文字（比如标签栏、固定高度的按钮）用 `systemFontOfSize()`，避免字号变大后放不下。

## 完整例子

下面的代码从空白 App 开始，在页面上从上到下放五行文字，每行用一种字体。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 创建一个纵向排列的容器，用来放五行文字
  const column = new UIStackView();
  column.translatesAutoresizingMaskIntoConstraints = false;
  column.axis = 'vertical';
  column.spacing = 12;          // 每两行之间空 12 pt
  page.view.addSubview(column);

  // 2. 第一行：系统字体，34 pt，粗体
  const title = new UILabel();
  title.text = 'Hello, Nacre';
  title.font = UIFont.systemFontOfSize(34, { weight: 'bold' });
  column.addArrangedSubview(title);

  // 3. 第二行：系统字体，17 pt，常规粗细
  const body = new UILabel();
  body.text = 'The quick brown fox';
  body.font = UIFont.systemFontOfSize(17);
  column.addArrangedSubview(body);

  // 4. 第三行：系统字体，17 pt，斜体
  const italic = new UILabel();
  italic.text = 'The quick brown fox';
  italic.font = UIFont.italicSystemFontOfSize(17);
  column.addArrangedSubview(italic);

  // 5. 第四行：等宽字体，17 pt
  const code = new UILabel();
  code.text = 'const x = 0123456789;';
  code.font = UIFont.monospacedSystemFontOfSize(17);
  column.addArrangedSubview(code);

  // 6. 第五行：「脚注」文本样式，字号由用户的系统设置决定
  const note = new UILabel();
  note.text = 'Footnote text';
  note.font = UIFont.preferredFontForTextStyle('footnote');
  column.addArrangedSubview(note);

  // 7. 读出字体对象上的信息
  console.log(title.font.fontName, title.font.pointSize);

  // 8. 容器放在页面顶部，左右各留 16 pt
  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    column.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 16 }),
    column.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
    column.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
  ]);
});
```

**效果**

- 第一行「Hello, Nacre」是粗体的大字，字号 34 pt。
- 第二行是常规粗细的 17 pt 文字。
- 第三行和第二行同样大小，字形向右倾斜。**未在模拟器验证。**
- 第四行每个字符占的宽度相同，字母和数字上下对齐成列。
- 第五行比第二行小。用户在系统设置里把文字调大后重新启动 App，这一行跟着变大，前四行不变。**未在模拟器验证。**
- 控制台输出 `.SFUI-Bold 34`。

这段代码没有作为一个整体在模拟器运行过。其中 `systemFontOfSize()`、`monospacedSystemFontOfSize()`、`preferredFontForTextStyle()`、`fontName`、`pointSize` 在验收用例里运行过，`italicSystemFontOfSize()` 没有。

每一行的写法都相同：创建 `UILabel`，设 `text`，把一个字体对象赋给 `font`。后面的用法只改「得到字体对象」这一步。

第 1 步和第 8 步用到的容器和约束见 [`UIStackView`](ui-stack-view.md) 和 [Auto Layout](auto-layout.md)。

## 常见用法

以下例子都假设已经有上面的 `body`（第二行的 `UILabel`）和 `column`（放这几行文字的容器）。

### 用系统字体并指定字号

```js
body.font = UIFont.systemFontOfSize(20);
```

**效果**：这一行文字变成 20 pt 的系统字体，常规粗细。标签的高度跟着变大，下面几行下移。

字号的单位是 [pt](units.md)。

### 指定粗细

在第二个参数里传 `weight`。

```js
body.font = UIFont.systemFontOfSize(17, { weight: 'semibold' });
```

**效果**：文字变成半粗体，字号仍是 17 pt。

`weight` 有九个取值，从细到粗见[字重](#字重)。不传 `weight` 时是 `'regular'`。

只要常规粗体，可以用简写：

```js
body.font = UIFont.boldSystemFontOfSize(17);
```

**效果**：文字变成 17 pt 的粗体。**未在模拟器验证。**

### 用斜体

```js
body.font = UIFont.italicSystemFontOfSize(17);
```

**效果**：文字变成 17 pt 的斜体，粗细是常规。**未在模拟器验证。**

这个方法不接受 `weight`，不能同时指定斜体和粗细，见[还不能做的](#还不能做的)。

### 显示代码：用等宽字体

等宽字体里每个字符占的宽度相同。显示代码、需要上下对齐成列的文字时用它。

```js
body.text = '0123456789';
body.font = UIFont.monospacedSystemFontOfSize(20, { weight: 'medium' });
console.log(body.font.fontName);
```

**效果**

- 十个数字每个占的宽度相同。
- 控制台输出这个等宽字体的名字。具体是什么名字本文档没有记录。

### 显示会变的数字：只让数字等宽

计时器、倒计时、价格这类数字会不断变化。系统字体里各个数字的宽度不同，数字一变，整行文字的宽度跟着变（**未在模拟器验证**）。`monospacedDigitSystemFontOfSize()` 得到的字体只把数字做成等宽，字母的样子和普通系统字体相同。

```js
body.text = '00:59';
body.font = UIFont.monospacedDigitSystemFontOfSize(17, { weight: 'regular' });
```

**效果**：文字的样子和普通系统字体相同。把 `text` 从 `'00:59'` 改成 `'01:11'`，文字的总宽度不变。**未在模拟器验证。**

### 跟随系统的文字大小设置

用户可以在系统的「设置 → 显示与亮度 → 文字大小」里调整文字大小。`preferredFontForTextStyle()` 按用途（正文、标题、脚注等）返回一个字体，字号取决于用户当前的设置。

```js
body.font = UIFont.preferredFontForTextStyle('body');
console.log(body.font.pointSize);
```

**效果**

- 文字用「正文」样式显示。
- 控制台输出当前设置下正文的字号。用户把文字调大后重新启动 App，输出的数变大，文字跟着变大。**「调大后变大」未在模拟器验证。**

可用的样式名见[文本样式](#文本样式)。这个机制的限制见[动态字体](#动态字体)。

### 用户改了系统文字大小后更新字体

已经创建的字体对象不会自己变。用户改了设置后，`application` 派发 `contentsizecategorychange` 事件，在回调里重新取一次字体。

```js
application.addEventListener('contentsizecategorychange', () => {
  body.font = UIFont.preferredFontForTextStyle('body');
});
```

**效果**：App 在运行时，用户到系统设置里改了文字大小，回到 App 后这一行文字换成新的字号。**未在模拟器验证。**

有多个标签要更新时，把「取字体并赋值」写成一个函数，建界面时调用一次，事件回调里再调用一次。

事件的说明见 [`application`](application.md)。视图和场景的 `traitchange` 事件也会在文字大小变化时派发，见[外观特征](ui-trait-collection.md)。

### 用指定名字的字体

```js
const helvetica = UIFont.fontWithName('Helvetica', { size: 17 });
if (helvetica) {
  body.font = helvetica;
}
```

**效果**：系统里有这个字体时，文字换成 17 pt 的 Helvetica。**未在模拟器验证。**

系统里没有这个名字的字体时，方法返回 `null`，不抛异常。所以要先判断：

```js
const missing = UIFont.fontWithName('NoSuchFont', { size: 17 });
console.log(missing);
```

**效果**：控制台输出 `null`。

名字可以是字体家族名（如 `'Helvetica'`），也可以是具体字体名（如 `'Helvetica-Bold'`）。只能用系统自带的字体，随 App 打包的字体文件目前不能用。系统里有哪些字体名目前不能在 JS 里列出，要查 Apple 的资料。

### 基于现有字体改字号

字体对象不可变，也没有「复制一份并改字号」的方法。做法是按原来的方式再创建一个。

系统字体：重新调用原来的静态方法，传新的字号。

```js
const small = UIFont.systemFontOfSize(15, { weight: 'medium' });
const large = UIFont.systemFontOfSize(small.pointSize * 2, { weight: 'medium' });
body.font = large;
```

**效果**：文字变成 30 pt 的中等粗细系统字体。

指定名字的字体：用原字体的 `fontName` 再取一次。

```js
const base = UIFont.fontWithName('Helvetica', { size: 17 });
if (base) {
  const bigger = UIFont.fontWithName(base.fontName, { size: 24 });
  if (bigger) {
    body.font = bigger;
  }
}
```

**效果**：文字变成 24 pt 的 Helvetica。**未在模拟器验证。**

> **注意**：第二种写法不要用在系统字体上。系统字体的 `fontName` 是 `.SFUI-Regular` 这类以点开头的内部名字，不保证能用 `fontWithName()` 取回。**未在模拟器验证。**

### 读字体的度量

字体对象上有一组只读的数，说明这个字体在当前字号下的各项高度。

```js
const font = UIFont.systemFontOfSize(17);
console.log(font.pointSize);
console.log(font.lineHeight);
console.log(font.ascender, font.descender);
```

**效果**

- 第一行输出 `17`。
- 第二行输出一行文字的高度，单位 pt。
- 第三行输出基线以上和基线以下的高度，单位 pt。具体数值**未在模拟器验证**。

各项度量的含义见[字体度量](#字体度量)。

这些数只和字体有关，和文字内容无关。要知道一段具体的文字占多宽多高，问显示它的标签：

```js
const size = body.intrinsicContentSize;
console.log(size.width, size.height);
```

**效果**：控制台输出这一行文字按当前字体显示时的宽和高，单位 pt。

两类信息分在两个对象上：字体的高度信息在 `UIFont` 上，某段文字的大小在 [`UILabel`](ui-label.md) 上。

### 把字体用到按钮上

按钮自己没有 `font` 属性。按钮上的文字由按钮内部的一个 `UILabel` 显示，通过 `titleLabel` 拿到它再设。

```js
const button = UIButton.buttonWithType('system');
button.setTitle('确定', { forState: ['normal'] });
const titleLabel = button.titleLabel;
if (titleLabel) {
  titleLabel.font = UIFont.systemFontOfSize(20, { weight: 'semibold' });
}
column.addArrangedSubview(button);
```

**效果**：容器最下面多出一个按钮，文字是 20 pt 的半粗体。

`titleLabel` 的类型是「可能为 `null`」，所以要先判断。详见 [`UIButton`](ui-button.md)。

### 把字体用到输入框上

[`UITextField`](ui-text-field.md)（单行输入框）有自己的 `font` 属性，写法和 `UILabel` 相同。

```js
const field = new UITextField();
field.font = UIFont.systemFontOfSize(20);
column.addArrangedSubview(field);
```

**效果**：容器最下面多出一个输入框，输入的文字是 20 pt。**未在模拟器验证。**

### 判断两个字体是否相同

```js
const a = UIFont.systemFontOfSize(17);
const b = UIFont.systemFontOfSize(17);
console.log(a === b);

body.font = a;
console.log(body.font === a);
```

**效果**：控制台输出两行 `true`。

系统对相同参数的系统字体返回同一个对象，所以 `===` 成立。赋给标签再读回来，得到的也是原来那个对象。

> **注意**：`fontWithName()` 取两次是否得到同一个对象没有保证。不要依赖 `===` 比较指定名字的字体，改为比较 `fontName` 和 `pointSize`。

## 字重

字重是笔画的粗细。一共九个名字，按从细到粗排列：

| 取值 | 效果 |
| --- | --- |
| `'ultraLight'` | 最细 |
| `'thin'` | 比 `'ultraLight'` 粗一级 |
| `'light'` | 比常规细一级 |
| `'regular'` | 常规粗细。不传 `weight` 时用它 |
| `'medium'` | 比常规粗一级 |
| `'semibold'` | 半粗体 |
| `'bold'` | 粗体 |
| `'heavy'` | 比粗体粗一级 |
| `'black'` | 最粗 |

只能写这九个名字，不能写数字。

写了不认识的名字会抛 `TypeError`，不会退回 `'regular'`：

```js
try {
  // @ts-expect-error 'extrabold' 不是合法的字重名
  UIFont.systemFontOfSize(17, { weight: 'extrabold' });
} catch (err) {
  console.log(String(err));
}
```

**效果**：控制台输出 `TypeError: weight has no value "extrabold"; expected one of: ultraLight / thin / light / regular / medium / semibold / bold / heavy / black`。

## 文本样式

文本样式是按用途命名的一组字体。每种样式的字号和粗细由系统规定，并且随用户的文字大小设置变化。用户调整文字大小时，每种样式各自变化多少也由系统规定。

| 取值 | 用途 |
| --- | --- |
| `'largeTitle'` | 页面顶部的大标题 |
| `'title1'` | 一级标题 |
| `'title2'` | 二级标题 |
| `'title3'` | 三级标题 |
| `'headline'` | 段落的小标题 |
| `'subheadline'` | 小标题下面的副标题 |
| `'body'` | 正文 |
| `'callout'` | 标注文字 |
| `'footnote'` | 脚注 |
| `'caption1'` | 图片或控件的说明文字 |
| `'caption2'` | 更小一级的说明文字 |

每种样式在当前设置下的具体字号，用 `pointSize` 读：

```js
console.log(UIFont.preferredFontForTextStyle('title1').pointSize);
```

**效果**：控制台输出当前设置下一级标题的字号，单位 pt。

写了不认识的名字会抛 `TypeError`：

```js
try {
  // @ts-expect-error 'subtitle' 不是合法的文本样式名
  UIFont.preferredFontForTextStyle('subtitle');
} catch (err) {
  console.log(String(err));
}
```

**效果**：控制台输出 `TypeError: textStyle has no value "subtitle"; expected one of: largeTitle / title1 / title2 / title3 / headline / subheadline / body / callout / footnote / caption1 / caption2`。

## 动态字体

「动态字体」是 iOS 的一项系统功能：用户在系统设置里选一个文字大小档位，各个 App 的文字跟着变大或变小。[文本样式](#文本样式)是 App 接入这项功能的方式。

三条规则：

- **只有 `preferredFontForTextStyle()` 得到的字体跟随设置。** `systemFontOfSize(17)` 永远是 17 pt。
- **跟随发生在创建的时刻。** `preferredFontForTextStyle('body')` 返回的是「此刻的设置下」的正文字体。它仍然是一个不可变的对象，用户之后改了设置，这个对象的 `pointSize` 不变，已经用了它的标签也不变。
- **要在 App 运行期间跟着变，需要重新赋值。** 监听 `application` 的 `contentsizecategorychange` 事件，在回调里重新调用 `preferredFontForTextStyle()` 并赋给 `font`。写法见[用户改了系统文字大小后更新字体](#用户改了系统文字大小后更新字体)。

当前的档位可以从 `application.contentSizeCategory` 读到，见 [`application`](application.md)。

iOS 原生还有一个让标签自动完成上面第三步的开关 `adjustsFontForContentSizeCategory`，它还没有实现，见[还不能做的](#还不能做的)。

间距、图标大小这些[点值](units.md)不会跟着文字大小设置变化。文字变大后要不要加大间距，由 App 的代码决定。

文字变大后标签需要更多的空间。标签用约束定位并且不约束高度时，大小随新字体自动调整，见 [`UILabel`](ui-label.md)。

## 字体度量

一行文字在竖直方向上分成几段，字体对象上的度量属性给出每一段的高度。

```
        ┬ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   最高处
        │  ascender
        │        ┬ capHeight（大写字母的高度）
        │        │    ┬ xHeight（小写 x 的高度）
基线 ───┴────────┴────┴─────────
        │  descender
        ┴ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   最低处
```

- **基线**：字母站立的那条线。`g`、`y` 这类字母有一部分在基线以下。
- **`ascender`**：基线到字体最高处的距离。
- **`descender`**：基线到字体最低处的距离。它表示的是基线以下的位置，读出来通常是负数。**未在模拟器验证。**
- **`capHeight`**：大写字母的高度。
- **`xHeight`**：小写字母 x 的高度。
- **`lineHeight`**：一行文字的高度。单行的 `UILabel` 按它决定自己的高度。
- **`leading`**：字体建议的行与行之间的额外间距。

这些值都随字号变化，单位都是 [pt](units.md)。`lineHeight` 是字体自带的只读数值，不能通过它调整行距。调整行距目前做不到，见 [`UILabel`](ui-label.md) 的「还不能做的」。

## 成员说明

### 继承关系

```
EventTarget → NSObject → UIFont
```

`UIFont` 不派发任何事件。字体对象不可变，所有属性的值在对象存在期间不会变，所以没有变化通知。

### 创建

`UIFont` 不能用 `new` 创建，也不能被继承。

- `new UIFont()` 抛 `TypeError: Illegal constructor: UIFont is created by the runtime, not by new`。
- 继承的限制见[原生类](native-classes.md)。

字体对象全部通过下面的静态方法得到。

#### 系统字体的五个方法

五个方法的共同点：

- **`size`**：数字，字号，单位 [pt](units.md)。
- **`options.weight`**：[字重](#字重)名。只有表里标了「可选」的方法接受它。
- **返回**：`UIFont`，不会是 `null`。
- **出错**：`weight` 不是九个名字之一时抛 `TypeError: weight has no value "<写的值>"; expected one of: ultraLight / thin / light / regular / medium / semibold / bold / heavy / black`。

| 方法 | `weight` | 返回的字体 |
| --- | --- | --- |
| `UIFont.systemFontOfSize(size, options?)` | 可选，默认 `'regular'` | 系统字体 |
| `UIFont.boldSystemFontOfSize(size)` | 不接受 | 粗体的系统字体 |
| `UIFont.italicSystemFontOfSize(size)` | 不接受 | 斜体的系统字体 |
| `UIFont.monospacedSystemFontOfSize(size, options?)` | 可选，默认 `'regular'` | 系统的等宽字体，所有字符等宽 |
| `UIFont.monospacedDigitSystemFontOfSize(size, options?)` | 可选，默认 `'regular'` | 系统字体，只有数字等宽 |

```js
const regular = UIFont.systemFontOfSize(17);
const heavy = UIFont.systemFontOfSize(28, { weight: 'heavy' });
const mono = UIFont.monospacedSystemFontOfSize(14);
console.log(regular.fontName, heavy.pointSize, mono.pointSize);
```

**效果**：控制台输出 `.SFUI-Regular 28 14`。

#### `UIFont.fontWithName(name, options)`

按名字取一个字体。

```js
const font = UIFont.fontWithName('Helvetica', { size: 17 });
```

- **`name`**：字符串。字体家族名或具体字体名。
- **`options.size`**：数字，必填，字号，单位 [pt](units.md)。
- **返回**：`UIFont`。系统里没有这个名字的字体时返回 `null`。
- **出错**：没有传 `options`，或 `options` 里没有 `size`，抛 `TypeError: fontWithName needs { size }`。

「找不到字体」返回 `null`，不抛异常。「调用方式不对」才抛。

#### `UIFont.preferredFontForTextStyle(style)`

按用途取一个字体，字号取决于用户当前的文字大小设置。见[动态字体](#动态字体)。

```js
const font = UIFont.preferredFontForTextStyle('headline');
```

- **`style`**：[文本样式](#文本样式)名。
- **返回**：`UIFont`，不会是 `null`。
- **出错**：`style` 不是十一个名字之一时抛 `TypeError: textStyle has no value "<写的值>"; expected one of: largeTitle / title1 / title2 / title3 / headline / subheadline / body / callout / footnote / caption1 / caption2`。

### 属性

全部只读。字体对象不可变，值不会变，所以没有「默认值」，表里写的是值的来源。

| 属性 | 类型 | 可读 | 可写 | 值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `familyName` | 字符串 | 是 | 否 | 由字体决定 | 字体家族名。同一家族包含不同粗细和斜体的多个字体 |
| `fontName` | 字符串 | 是 | 否 | 由字体决定 | 具体字体名。系统字体是 `.SFUI-Regular`、`.SFUI-Bold` 这类名字 |
| `pointSize` | 数字 | 是 | 否 | 创建时给的字号 | 字号，单位 [pt](units.md) |
| `ascender` | 数字 | 是 | 否 | 由字体和字号决定 | 基线到字体最高处的距离，单位 [pt](units.md) |
| `descender` | 数字 | 是 | 否 | 由字体和字号决定 | 基线到字体最低处的距离，单位 [pt](units.md)。通常是负数，**未在模拟器验证** |
| `capHeight` | 数字 | 是 | 否 | 由字体和字号决定 | 大写字母的高度，单位 [pt](units.md) |
| `xHeight` | 数字 | 是 | 否 | 由字体和字号决定 | 小写字母 x 的高度，单位 [pt](units.md) |
| `lineHeight` | 数字 | 是 | 否 | 由字体和字号决定 | 一行文字的高度，单位 [pt](units.md) |
| `leading` | 数字 | 是 | 否 | 由字体和字号决定 | 字体建议的行间额外间距，单位 [pt](units.md) |

各项度量的图示见[字体度量](#字体度量)。

`fontName`、`pointSize`、`lineHeight` 在验收用例里读过。其余六个属性的取值**未在模拟器验证**。

### 哪些地方接受字体

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| [`UILabel`](ui-label.md) 的 `font` | 读出是 `UIFont`，写入接受 `UIFont` 或 `null` | 标签的字体 |
| [`UITextField`](ui-text-field.md) 的 `font` | `UIFont` | 输入框的字体 |
| [`UIButton`](ui-button.md) 的 `titleLabel.font` | 同 `UILabel` | 按钮文字的字体 |

## 与 iOS 原生写法的对照

方法名取 ObjC 方法名的第一段。其余各段放进 options 对象，键名就是 ObjC 的段名。字重和文本样式的常量去掉前缀、首字母小写后作为字符串。

| ObjC | JS |
| --- | --- |
| `[UIFont systemFontOfSize:17]` | `UIFont.systemFontOfSize(17)` |
| `[UIFont systemFontOfSize:28 weight:UIFontWeightBold]` | `UIFont.systemFontOfSize(28, { weight: 'bold' })` |
| `[UIFont boldSystemFontOfSize:17]` | `UIFont.boldSystemFontOfSize(17)` |
| `[UIFont italicSystemFontOfSize:17]` | `UIFont.italicSystemFontOfSize(17)` |
| `[UIFont monospacedSystemFontOfSize:20 weight:UIFontWeightMedium]` | `UIFont.monospacedSystemFontOfSize(20, { weight: 'medium' })` |
| `[UIFont monospacedDigitSystemFontOfSize:17 weight:UIFontWeightRegular]` | `UIFont.monospacedDigitSystemFontOfSize(17, { weight: 'regular' })` |
| `[UIFont fontWithName:@"Helvetica" size:17]` | `UIFont.fontWithName('Helvetica', { size: 17 })` |
| `[UIFont preferredFontForTextStyle:UIFontTextStyleBody]` | `UIFont.preferredFontForTextStyle('body')` |
| `UIFontWeightSemibold` | `'semibold'` |
| `UIFontTextStyleLargeTitle` | `'largeTitle'` |
| `font.familyName`、`font.fontName`、`font.pointSize` | 同名属性 |
| `font.ascender`、`font.descender`、`font.capHeight`、`font.xHeight`、`font.lineHeight`、`font.leading` | 同名属性 |
| `UIContentSizeCategoryDidChangeNotification` | `application.addEventListener('contentsizecategorychange', …)` |

两处和原生不同：

- 原生的 `monospacedSystemFontOfSize:weight:` 和 `monospacedDigitSystemFontOfSize:weight:` 必须传字重。JS 里 `weight` 可以省略，省略时是 `'regular'`。
- 原生的字重是浮点数常量，可以写任意中间值。JS 只接受九个名字。

## 与浏览器写法的对照

这张表给熟悉 CSS 的人查对应关系。

| CSS | 这里 |
| --- | --- |
| `font-family`、`font-size`、`font-weight`、`font-style` 四个属性 | 合在一个 `UIFont` 对象里，赋给 `font` |
| `font-family: system-ui` | `UIFont.systemFontOfSize(size)` |
| `font-family: monospace` | `UIFont.monospacedSystemFontOfSize(size)` |
| `font-variant-numeric: tabular-nums` | `UIFont.monospacedDigitSystemFontOfSize(size)` |
| `font-weight: 100`–`900` | 九个字重名。每一级和 CSS 的数值是否一一对应没有核对过 |
| `font-family: A, B, sans-serif` 回退列表 | 没有。`fontWithName()` 取不到时返回 `null` |
| `px`、`em`、`rem` | 只有 pt |
| `@font-face` 加载字体文件 | 未实现 |
| `line-height` | 没有对应的可写属性。`lineHeight` 是只读的字体度量 |
| Canvas 的 `measureText()` | 字体的高度信息读 `UIFont` 的度量属性，一段文字的宽高读标签的 `intrinsicContentSize` |

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 复制一个字体并改字号 | `fontWithSize:` | 未实现。替代写法见[基于现有字体改字号](#基于现有字体改字号) |
| 同时指定斜体和粗细，或使用小型大写字母等字体特性 | `UIFontDescriptor` | 未实现 |
| 列出系统里有哪些字体 | `UIFont.familyNames`、`fontNamesForFamilyName:` | 未实现 |
| 使用随 App 打包的字体文件 | `CTFontManagerRegisterFontsForURL`、Info.plist 的 `UIAppFonts` | 未实现 |
| 让标签在用户改了文字大小后自动换字号 | `UILabel.adjustsFontForContentSizeCategory` | 未实现。替代写法见[用户改了系统文字大小后更新字体](#用户改了系统文字大小后更新字体) |
| 让自己指定的字体按文字大小设置缩放 | `UIFontMetrics` | 未实现 |
| 用圆体、衬线体等系统字体的其他设计 | `UIFontDescriptor` 的 `fontDescriptorWithDesign:` | 未实现 |
| 用数字指定字重 | `UIFontWeight` 的任意浮点值 | 未实现。只接受九个名字 |
| 不经过视图，直接量一段文字的宽高 | `NSString` 的 `sizeWithAttributes:`、`boundingRectWithSize:…` | 未实现。替代写法是读标签的 `intrinsicContentSize` 或调用 `sizeThatFits()` |

## 参见

- [`UILabel`](ui-label.md)：显示文字的视图，`font` 属性在它上面
- [`UIButton`](ui-button.md)：按钮文字的字体通过 `titleLabel` 设
- [`UITextField`](ui-text-field.md)：输入框的 `font`
- [`application`](application.md)：`contentSizeCategory` 和 `contentsizecategorychange` 事件
- [枚举](enums.md)：字符串取值的通用规则，写错时怎么报错
- [单位](units.md)：pt 是什么，文字大小设置会不会影响点值
- [原生类](native-classes.md)：为什么不能 `new`、不能继承
- [`UIStackView`](ui-stack-view.md) 和 [Auto Layout](auto-layout.md)：完整例子里用来排列和定位的写法
- [实现原理：桥接](../internals/bridge.md)

← 返回 [API 文档](README.md)
