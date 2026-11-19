---
type: concept
status: partial
---

# 枚举

**枚举**表示只能从一组固定取值里选一个的值，比如文字的对齐方式只能是靠左、居中、靠右、两端对齐、跟随语言方向这五种之一。在 Nacre 的 API 里，枚举的值一律是字符串：写入时给字符串，读出时得到字符串。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const label = new UILabel();
  label.frame = { x: 20, y: 100, width: 300, height: 40 };
  label.text = 'Hello';
  label.textAlignment = 'center';           // 写入一个取值
  page.view.addSubview(label);

  console.log(label.textAlignment);         // 读出来也是字符串
});
```

**效果**

- 屏幕上有一行文字 `Hello`，在宽 300 pt 的范围内居中。
- 控制台输出 `center`。

每个枚举有哪些取值、每个取值是什么效果，写在用到它的那个类的文档里。这一页说明所有枚举共同的规则。下面的例子沿用这里的 `label` 和 `page`。

## 取值的名字

取值的名字区分大小写，以小写字母开头，多个单词用驼峰写法连接：`'center'`、`'scaleAspectFit'`、`'byTruncatingTail'`。

读出来的字符串和可以写进去的字符串是同一组，所以读出的值可以直接和字符串比较，也可以原样写回去：

```js
if (label.textAlignment === 'center') {
  label.textAlignment = 'natural';
}
```

**效果**

- 文字原来居中时，改为跟随语言方向对齐（从左往右书写的语言里靠左）。

熟悉 iOS 的读者可以从 iOS 的常量名得到这里的名字，规则见本页末尾的[对照表](#与-ios-原生写法的对照)。不熟悉 iOS 的读者不需要这条规则：各类文档里列出了全部取值，写错时警告或报错信息里也会列出来。

## 写错了会怎样

写了一个不在取值表里的值，结果取决于枚举出现的位置：

| 枚举出现在哪 | 写错时 |
| --- | --- |
| 给属性赋值：`label.textAlignment = '…'` | 不抛异常。属性保持原来的值，控制台输出一条警告 |
| 方法的参数、options 对象的成员、构造函数的参数 | 抛 `TypeError`，这次调用不生效 |

两种情况的说明文字里都列出全部可用的取值。

### 属性：输出警告，值不变

```js
label.textAlignment = 'center';
// @ts-expect-error 没有 'centre' 这个取值，类型检查会报错
label.textAlignment = 'centre';
console.log(label.textAlignment);

// @ts-expect-error 没有 'night' 这个取值
page.view.overrideUserInterfaceStyle = 'night';
console.log(page.view.overrideUserInterfaceStyle);
```

**效果**

- 两处写错的赋值都不抛异常，后面的语句照常执行。
- 控制台先输出警告 `[Nacre] textAlignment has no value "centre"; expected one of: left / center / right / justified / natural, ignored`，接着输出 `center`：赋值没有生效，属性保持原来的值。
- 然后输出警告 `[Nacre] overrideUserInterfaceStyle has no value "night"; expected one of: unspecified / light / dark, ignored`，接着输出 `unspecified`。

警告用 `console.warn` 输出。它以 `[Nacre] ` 开头，中间是属性名、写入的值和全部可用的取值，以 `, ignored` 结尾。

读者此刻关心的几件事：

- **App 会不会崩溃，后面的代码还执行吗。** 不会崩溃。赋值语句不抛异常，它后面的语句照常执行。
- **原来的值还在不在。** 在。属性保持写入之前的值，不会被改成默认值。
- **怎么知道写错了。** 写代码时类型检查会报错，见[下一节](#在写代码时就发现错误)。运行时看控制台的警告，或者赋值之后把属性读回来。
- **大小写写错算不算错。** 算。`'Center'` 和 `'center'` 是不同的字符串。
- **给了数字或 `null` 会怎样。** 同样是输出警告、属性保持原来的值。枚举不做类型转换。少数属性的类型里本来就有 `null`（各类文档的类型一栏写着「或 `null`」），对它们 `null` 是合法的值。

[颜色](ui-color.md)写错时也是输出警告、保持原来的值。

### 方法参数、options、构造参数：抛 `TypeError`

```js
try {
  // @ts-expect-error 没有 'subtitle' 这个文本样式
  label.font = UIFont.preferredFontForTextStyle('subtitle');
} catch (err) {
  console.log(String(err));
}
```

**效果**

- 控制台输出 `TypeError: textStyle has no value "subtitle"; expected one of: largeTitle / title1 / title2 / title3 / headline / subheadline / body / callout / footnote / caption1 / caption2`。
- 调用在抛出的位置中断，`label.font` 没有被赋值，文字的字体不变。

抛出的是普通的 JS 异常，可以用 `try / catch` 捕获，App 不会崩溃。没有捕获时，这一段代码在抛出的位置中断，后面的语句不执行，运行时把这个异常交给 [`application`](application.md) 的 `error` 事件并在控制台输出。

大小写写错、给了数字，同样抛 `TypeError`。

## 在写代码时就发现错误

**推荐开启类型检查。** 类型定义（`@nacrejs/types`）把每个枚举声明成它的全部取值，所以写错的取值在编辑器里就会报错，不用等到运行。属性里的枚举和方法参数里的枚举都会报。配置方法见[建一个自己的 App](../guides/your-own-app.md)。

```js
// @ts-expect-error
label.textAlignment = 'centre';
```

类型检查在这一行报：

```
Type '"centre"' is not assignable to type 'NSTextAlignment'. Did you mean '"center"'?
```

编辑器在输入引号时还会列出全部取值供选择。

`// @ts-expect-error` 是写给类型检查看的注释，表示「下一行是故意写错的」。本页的例子用它标出错误的写法；正常的代码里不需要它。

取值来自变量、类型检查推断不出具体字符串时（比如来自用户输入或网络），只有运行时能发现写错：

- **属性**：写错时不抛异常。需要知道写入有没有生效时，赋值之后把属性读回来，和写入的值比较。少数取值读出的名字和写入的不同，见[一个效果有两个名字的取值](#一个效果有两个名字的取值)。
- **方法参数、options、构造参数**：用 `try / catch` 包住调用。

## 可以同时选多个的：字符串数组

有些值不是「选一个」，而是「选若干个」，比如一个矩形的四个角里哪几个是圆角。这类值写成字符串数组，数组里的每一项是一个取值：

```js
const card = new UIView();
card.frame = { x: 20, y: 160, width: 200, height: 100 };
card.backgroundColor = 'systemBlue';
page.view.addSubview(card);

const layer = card.layer;
layer.cornerRadius = 16;
layer.maskedCorners = ['minXMinY', 'maxXMinY'];

console.log(layer.maskedCorners.join(','));
console.log(layer.maskedCorners.includes('minXMaxY'));
```

**效果**

- 屏幕上有一个蓝色矩形，上面两个角是半径 16 pt 的圆角，下面两个角是直角。
- 控制台输出 `minXMinY,maxXMinY` 和 `false`。

规则：

| 情况 | 结果 |
| --- | --- |
| 空数组 `[]` | 一项都不选。对 `maskedCorners` 来说是四个角都不圆 |
| 只选一项 | 仍然要写成数组：`['minXMinY']`。直接写字符串 `'minXMinY'` 会抛 `TypeError` |
| 同一项写了两次 | 和写一次相同 |
| 数组里有不认识的名字 | 整个赋值不生效，不会只应用认识的那几项。属性不抛异常，保持原来的值，控制台输出一条警告；方法参数抛 `TypeError` |

读出来的也是数组。数组里各项的顺序是固定的，和写入时的顺序无关，所以判断是否选了某一项用 `includes()`，不要比较下标。

给属性写了不认识的名字，和给属性写了不是数组的值，结果不同。前一种是取值写错，后一种是类型不对：

```js
layer.maskedCorners = ['minXMinY', 'maxXMinY'];
// @ts-expect-error 没有 'topLeft' 这个取值
layer.maskedCorners = ['maxXMaxY', 'topLeft'];
console.log(layer.maskedCorners.join(','));

try {
  // @ts-expect-error 要数组，不是单个字符串
  layer.maskedCorners = 'minXMinY';
} catch (err) {
  console.log(String(err));
}
```

**效果**

- 第二次赋值不抛异常。控制台输出警告 `[Nacre] maskedCorners has no value "topLeft"; expected one of: minXMinY / maxXMinY / minXMaxY / maxXMaxY, ignored`，接着输出 `minXMinY,maxXMinY`：数组里认识的 `'maxXMaxY'` 没有被单独应用，属性保持原来的值。
- 最后一段输出 `TypeError: maskedCorners needs an array of names; expected any of: minXMinY / maxXMinY / minXMaxY / maxXMaxY`。

用字符串数组的地方：

| 在哪 | 取值 | 文档 |
| --- | --- | --- |
| `layer.maskedCorners` | 哪几个角是圆角 | [`CALayer`](ca-layer.md) |
| `UIBezierPath.bezierPathWithRoundedRect()` 的 `byRoundingCorners` | 哪几个角是圆角 | [`UIBezierPath`](ui-bezier-path.md) |
| `control.state`（只读） | 控件当前处于哪些状态 | [`UIControl`](ui-control.md) |
| `button.setTitle()` 等方法的 `forState` | 这个设置用于哪种状态组合 | [`UIButton`](ui-button.md) |
| `control.sendActionsForControlEvents()` | 触发哪几种控件事件 | [`UIControl`](ui-control.md) |

`maskedCorners` 是属性，写错时输出警告、值不变。`byRoundingCorners`、`forState` 和 `sendActionsForControlEvents()` 的参数是方法参数，数组里有不认识的名字时抛 `TypeError`。`control.state` 只读。

## 一个效果有两个名字的取值

少数枚举里，两个名字表示同一个效果。两个名字都可以写入，读出来的总是其中固定的一个：

```js
const row = new UIStackView();
row.alignment = 'top';
console.log(row.alignment);
```

**结果**

- 输出 `leading`，不是 `top`。

| 枚举 | 写入时等价的名字 | 读出来是 |
| --- | --- | --- |
| [`UIStackView`](ui-stack-view.md) 的 `alignment` | `'top'` 和 `'leading'` | `'leading'` |
| 同上 | `'bottom'` 和 `'trailing'` | `'trailing'` |
| [`UIBarButtonItem`](ui-bar-button-item.md) 的 `style` | `'done'` 和 `'prominent'` | `'prominent'` |

所以对这几个属性，不要假设读出的字符串等于写入的字符串。比较时用读出来的那个名字。

## 既可以是数、也可以是名字的属性

有几个属性平时是一个数，同时接受一个表示特殊含义的名字：

| 属性 | 类型 | 名字的含义 |
| --- | --- | --- |
| [`UIStackView`](ui-stack-view.md) 的 `spacing` | 数（pt）或 `'system'` | `'system'` 表示使用系统的标准间距 |
| 约束的 `priority` | 数（1 到 1000）或 `'required'` 等名字 | 见 [Auto Layout](auto-layout.md) |
| [`UIScrollView`](ui-scroll-view.md) 的 `decelerationRate` | 数或 `'normal'`、`'fast'` | 系统预设的两档减速速度 |

```js
row.spacing = 12;
console.log(row.spacing);

row.spacing = 'system';
console.log(row.spacing);
```

**效果**

- 依次输出 `12` 和 `system`。写入名字之后读出来的是名字，不是一个数。

读这类属性时先判断类型：`typeof row.spacing === 'number'`。

给这类属性写了不认识的名字时，和其他枚举属性相同：不抛异常，属性保持原来的值，控制台输出一条警告。

```js
row.spacing = 12;
// @ts-expect-error 名字只有 'system'
row.spacing = 'default';
console.log(row.spacing);
```

**效果**

- 赋值不抛异常。控制台输出警告 `[Nacre] spacing has no value "default"; expected one of: a number / "system", ignored`，接着输出 `12`。

写的值既不是字符串、也转不成数时（比如 `undefined` 或一个对象），是类型不对，抛 `TypeError`。看起来像数的字符串按数处理：`'12'` 是 12。

## 在 iOS 里不是枚举、这里同样写成字符串的值

字重和文本样式在 iOS 里是常量而不是枚举，在这里的写法和枚举相同。它们都出现在方法的参数里，所以写错时抛 `TypeError`：

```js
label.font = UIFont.systemFontOfSize(17, { weight: 'semibold' });
label.font = UIFont.preferredFontForTextStyle('headline');

try {
  // @ts-expect-error 没有 'extrabold' 这个字重
  UIFont.systemFontOfSize(17, { weight: 'extrabold' });
} catch (err) {
  console.log(String(err));
}
```

**效果**

- 文字先变成 17 pt 的半粗体，再变成系统的「标题」样式。
- 控制台输出 `TypeError: weight has no value "extrabold"; expected one of: ultraLight / thin / light / regular / medium / semibold / bold / heavy / black`。

| 类型 | 取值举例 | 文档 |
| --- | --- | --- |
| 字重 `UIFontWeight` | `'regular'`、`'semibold'`、`'bold'` | [`UIFont`](ui-font.md) |
| 文本样式 `UIFontTextStyle` | `'body'`、`'headline'`、`'largeTitle'` | [`UIFont`](ui-font.md) |

事件名不在此列：事件名是开放的，监听一个对象不会派发的名字不会报错，它被当成自定义事件。

## 「没有这个东西」不是写错

取值写错和「要找的东西不存在」是两种情况，结果不同：

```js
const font = UIFont.fontWithName('NoSuchFont', { size: 17 });
console.log(font);
```

**结果**

- 输出 `null`，不抛异常。

字体名不是枚举：系统里装了哪些字体不是固定的，一个名字找不到字体是一个正常的结果，所以返回 `null`。`'extrabold'` 不在字重的取值表里，是代码写错了，所以抛异常。返回值可能是 `null` 的方法，使用返回值之前要先判空。

## 与 iOS 原生写法的对照

从 iOS 的常量名得到 JS 的字符串：去掉表示类型的前缀，剩下的部分首字母改成小写。

| ObjC | JS |
| --- | --- |
| `NSTextAlignmentCenter` | `'center'` |
| `NSLineBreakByTruncatingTail` | `'byTruncatingTail'` |
| `UIViewContentModeScaleAspectFit` | `'scaleAspectFit'` |
| `UIImageRenderingModeAlwaysTemplate` | `'alwaysTemplate'` |
| `NSLayoutRelationGreaterThanOrEqual` | `'greaterThanOrEqual'` |
| `UIFontWeightSemibold` | `'semibold'` |
| `UIFontTextStyleLargeTitle` | `'largeTitle'` |
| `kCACornerCurveContinuous` | `'continuous'` |
| `kCALayerMinXMinYCorner \| kCALayerMaxXMinYCorner` | `['minXMinY', 'maxXMinY']` |
| `UIControlStateNormal` | `['normal']` |
| `UIControlStateSelected \| UIControlStateDisabled` | `['selected', 'disabled']` |
| `UIStackViewSpacingUseSystem` | `'system'` |

## 参见

- [颜色](ui-color.md)：另一种写成字符串的值，写错时同样输出警告、保持原来的值。
- [原生类](native-classes.md)：怎么开启类型检查，以及数、字符串、对象这几类参数的转换规则。
- [结构体](structs.md)：由几个数组成的值。
