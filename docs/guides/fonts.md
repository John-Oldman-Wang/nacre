# 设置字体

这一篇讲怎么用 [`UIFont`](../api/ui-font.md) 给文字设字体：字号、粗细、斜体、等宽、跟随用户的文字大小设置、用指定名字的字体。每个方法和属性的细节在 [`UIFont`](../api/ui-font.md) 的参考页。

## 推荐的做法

- **界面上的文字用系统字体。** 它一定存在，取字体的方法不会返回 `null`，并且有九种粗细可选。
- **正文、说明这类供阅读的文字用 [`preferredFontForTextStyle()`](../api/ui-font/preferredfontfortextstyle.md)**，让它跟随用户的文字大小设置；**位置和大小都固定的文字**（比如标签栏、固定高度的按钮）用 [`systemFontOfSize()`](../api/ui-font/systemfontofsize.md)，避免字号变大后放不下。
- **跟随文字大小设置要两步**：用 `preferredFontForTextStyle()` 取字体；在设置变化时重新取一次并赋给 `font`。已经取到的字体对象不会自己变。

## 第一个例子

从空白 App 开始，在页面上从上到下放两行文字，一行是粗体的标题，一行是正文。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 创建一个纵向排列的容器
  const column = new UIStackView();
  column.translatesAutoresizingMaskIntoConstraints = false;
  column.axis = 'vertical';
  column.spacing = 12;          // 每两行之间空 12 pt
  page.view.addSubview(column);

  // 2. 标题：系统字体，34 pt，粗体
  const title = new UILabel();
  title.text = 'Hello, Nacre';
  title.font = UIFont.systemFontOfSize(34, { weight: 'bold' });
  column.addArrangedSubview(title);

  // 3. 正文：系统字体，17 pt，常规粗细
  const body = new UILabel();
  body.text = 'The quick brown fox';
  body.font = UIFont.systemFontOfSize(17);
  column.addArrangedSubview(body);

  // 4. 容器放在页面顶部，左右各留 16 pt
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

每一行的写法都相同：创建 `UILabel`，设 `text`，把一个字体对象赋给 `font`。下面的用法只改「得到字体对象」这一步，沿用这里的 `body`（正文那个 `UILabel`）和 `column`（放文字的容器）。容器和约束见 [`UIStackView`](../api/ui-stack-view.md) 和 [Auto Layout](../api/auto-layout.md)。单独试某一节时，先写这几行：

```js
const page = new UIViewController();
const column = new UIStackView();
column.axis = 'vertical';
page.view.addSubview(column);
const body = new UILabel();
column.addArrangedSubview(body);
```

## 指定字号

```js
body.font = UIFont.systemFontOfSize(20);
```

**效果**：这一行文字变成 20 pt 的系统字体，常规粗细。标签的高度跟着变大，下面的内容下移。

字号的单位是 [pt](../api/units.md)，不随屏幕大小变化。

## 指定粗细

在第二个参数里传 `weight`。

```js
body.font = UIFont.systemFontOfSize(17, { weight: 'semibold' });
```

**效果**：文字变成半粗体，字号仍是 17 pt。

`weight` 有九个取值，见[字重](../api/ui-font.md#字重)。只要常规粗体，可以用简写：

```js
body.font = UIFont.boldSystemFontOfSize(17);
```

**效果**：文字变成 17 pt 的粗体。**未在模拟器验证。**

写了不认识的字重名抛 `TypeError`，不会退回 `'regular'`：

```js
try {
  // @ts-expect-error 'extrabold' 不是合法的字重名
  UIFont.systemFontOfSize(17, { weight: 'extrabold' });
} catch (err) {
  console.log(String(err));
}
```

**效果**：控制台输出 `TypeError: weight has no value "extrabold"; expected one of: ultraLight / thin / light / regular / medium / semibold / bold / heavy / black`。

## 用斜体

```js
body.font = UIFont.italicSystemFontOfSize(17);
```

**效果**：文字变成 17 pt 的斜体，粗细是常规。**未在模拟器验证。**

这个方法不接受 `weight`，不能同时指定斜体和粗细。

## 显示代码：用等宽字体

```js
body.text = '0123456789';
body.font = UIFont.monospacedSystemFontOfSize(20, { weight: 'medium' });
```

**效果**：十个数字每个占的宽度相同。

## 显示会变的数字：只让数字等宽

计时器、倒计时、价格这类数字会不断变化。系统字体里各个数字的宽度不同，数字一变，整行文字的宽度跟着变（**未在模拟器验证**）。

```js
body.text = '00:59';
body.font = UIFont.monospacedDigitSystemFontOfSize(17, { weight: 'regular' });
```

**效果**：文字的样子和普通系统字体相同。把 `text` 从 `'00:59'` 改成 `'01:11'`，文字的总宽度不变。**未在模拟器验证。**

## 跟随系统的文字大小设置

用户可以在系统的「设置 → 显示与亮度 → 文字大小」里调整文字大小。`preferredFontForTextStyle()` 按用途返回一个字体，字号取决于用户当前的设置。

```js
body.font = UIFont.preferredFontForTextStyle('body');
console.log(body.font.pointSize);
```

**效果**

- 文字用「正文」样式显示。
- 控制台输出当前设置下正文的字号。用户把文字调大后重新启动 App，输出的数变大，文字跟着变大。**「调大后变大」未在模拟器验证。**

可用的样式名见[文本样式](../api/ui-font.md#文本样式)。

## 用户改了系统文字大小后更新字体

已经创建的字体对象不会自己变。用户改了设置后，`application` 派发 `contentsizecategorychange` 事件，在回调里重新取一次字体。

```js
application.addEventListener('contentsizecategorychange', () => {
  body.font = UIFont.preferredFontForTextStyle('body');
});
```

**效果**：App 在运行时，用户到系统设置里改了文字大小，回到 App 后这一行文字换成新的字号。**未在模拟器验证。**

有多个标签要更新时，把「取字体并赋值」写成一个函数，建界面时调用一次，事件回调里再调用一次。

文字变大后标签需要更多的空间。标签用约束定位并且不约束高度时，大小随新字体自动调整。间距、图标大小这些点值不会跟着变，要不要加大由 App 的代码决定。

## 用指定名字的字体

```js
const helvetica = UIFont.fontWithName('Helvetica', { size: 17 });
if (helvetica) {
  body.font = helvetica;
}
```

**效果**：系统里有这个字体时，文字换成 17 pt 的 Helvetica。**未在模拟器验证。**

系统里没有这个名字的字体时，方法返回 `null`，不抛异常，所以要先判断。只能用系统自带的字体，随 App 打包的字体文件目前不能用。

## 基于现有字体改字号

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

## 读字体的度量

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

这些数只和字体有关，和文字内容无关。要知道一段具体的文字占多宽多高，问显示它的标签：

```js
const size = body.intrinsicContentSize;
console.log(size.width, size.height);
```

**效果**：控制台输出这一行文字按当前字体显示时的宽和高，单位 pt。

## 把字体用到按钮上

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

`titleLabel` 可能是 `null`，所以要先判断。详见 [`UIButton`](../api/ui-button.md)。

## 把字体用到输入框上

[`UITextField`](../api/ui-text-field.md)（单行输入框）有自己的 `font` 属性，写法和 `UILabel` 相同。

```js
const field = new UITextField();
field.font = UIFont.systemFontOfSize(20);
column.addArrangedSubview(field);
```

**效果**：容器最下面多出一个输入框，输入的文字是 20 pt。**未在模拟器验证。**

## 判断两个字体是否相同

```js
const a = UIFont.systemFontOfSize(17);
const b = UIFont.systemFontOfSize(17);
console.log(a === b);

body.font = a;
console.log(body.font === a);
```

**效果**：控制台输出两行 `true`。

> **注意**：`fontWithName()` 取两次是否得到同一个对象没有保证。不要依赖 `===` 比较指定名字的字体，改为比较 `fontName` 和 `pointSize`。

## 参见

- [`UIFont`](../api/ui-font.md)：全部方法和属性
- [`UILabel`](../api/ui-label.md)、[显示文字](labels.md)：字体用在哪
- [`application`](../api/application.md)：`contentsizecategorychange` 事件
