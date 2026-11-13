---
type: reference
native: UITraitCollection
status: partial
---

# 外观特征（`UITraitCollection`）

**`UITraitCollection`** 表示界面当前所处环境的一组值：现在是深色还是浅色，屏幕上 1 [pt](units.md) 对应几个像素，用户把系统的文字大小设到了哪一档，等等。iOS 把其中的每一项叫作一个外观特征（trait）。

这组值不是整个 App 只有一份。[场景](ui-window-scene.md)、窗口、页面、每个视图各有一份，从各自的 `traitCollection` 属性读。值从外向里传：

```
场景  →  窗口  →  页面  →  视图  →  子视图
```

每一层默认和外面一层相同。场景的值来自系统设置。所以没有做过任何强制时，各层读到的深浅色都是系统设置里的那一种。

`UITraitCollection` 对象不能用 `new` 创建，全部属性只读。读 `traitCollection` 得到的是读的那一刻的一组值，之后环境变了，已经拿到的这个对象不会跟着变，要新的值就重新读 `traitCollection`。

围绕它有三件事可以做：

| 想做的事 | 用什么 |
| --- | --- |
| 读当前的值 | `traitCollection` 上的七个属性 |
| 让某一层固定用深色或浅色 | 写这一层的 `overrideUserInterfaceStyle` |
| 值变了时得到通知 | 监听这一层的 `traitchange` 事件 |

## 什么时候不需要它

**只是让颜色跟着深浅色变，不需要读外观特征，也不需要监听 `traitchange`。** 视图的颜色写成语义色（比如 `'label'`、`'systemBackground'`）或者 `light-dark()` 之后，系统切换深浅色时自动换成对应的颜色，App 的代码不用做任何事，见[颜色](ui-color.md)。

需要用到这一页的情况：

- 深色和浅色要用不同的图片或不同的布局，这要由代码判断。
- 在 App 里做一个主题开关，不跟随系统。
- 用户调大了系统的文字大小，布局要跟着调整。
- 自己创建的[图层](ca-layer.md)要按屏幕的倍率绘制。
- 图层上的颜色（边框色、阴影色等）要跟着深浅色变。图层上的颜色不会自动换，见[让图层的边框颜色跟着深浅色变](#让图层的边框颜色跟着深浅色变)。

## 强制深浅色

在某一层写 `overrideUserInterfaceStyle`，这一层和它里面的所有层都换成写入的值，外面的层不受影响。写 `'unspecified'` 取消强制，恢复成和外面一层相同。

写在哪一层，决定影响的范围：

| 写在哪 | 影响 |
| --- | --- |
| 窗口 | 这个窗口里的全部界面。做 App 内的主题开关写在这里 |
| 页面 | 这个页面和它里面的视图 |
| 视图 | 这个视图和它的子视图 |

场景上没有 `overrideUserInterfaceStyle`，场景的值总是系统设置。所以强制之后要分清读的是哪一层：

| 想知道的事 | 读哪个 |
| --- | --- |
| 系统设置里是深色还是浅色 | `scene.traitCollection` |
| 这个视图实际显示成深色还是浅色 | `view.traitCollection` |

写入之后有两点和直觉不同，都是实测的结果：

- **写完立刻读，`traitCollection` 还是旧值。** 系统稍后才统一更新，更新完派发 `traitchange`。依赖新值的代码要写在 `traitchange` 的回调里。`overrideUserInterfaceStyle` 自己立刻读得到写入的值。详见[强制之后不是立刻生效](#强制之后不是立刻生效)。
- **不在窗口里的视图，强制不体现在 `traitCollection` 上。** 一个还没加到界面上的视图写了强制，等 2 秒再读，它和它的子视图的 `traitCollection` 仍是原来的值。

## 推荐的做法

**颜色用语义色，不要在代码里判断深浅色再设颜色。** 语义色由系统自动切换，不用监听事件，也不会漏掉某个视图。

**主题开关写在窗口上，把用户的选择保存下来。** 写在窗口上一次就覆盖整个 App，新建的页面和视图自动跟随。`overrideUserInterfaceStyle` 不会被保存，App 重新启动后回到 `'unspecified'`，所以要把选择存进[本地存储](storage.md)，启动时再写一遍。代码见[在 App 里做一个主题开关](#在-app-里做一个主题开关)。

**需要新值的代码写在 `traitchange` 的回调里。** 不管变化来自系统设置还是来自 `overrideUserInterfaceStyle`，回调执行时 `traitCollection` 已经是新值。把「按当前外观更新界面」写成一个函数，建界面时调一次，回调里再调，两处走同一段代码。

**在离要更新的东西最近的那一层监听。** 一个视图被强制成深色时，变的是它自己的外观，事件派发在它自己身上。在这个视图上监听，系统切换和强制两种变化都能收到。

**屏幕倍率从 `traitCollection.displayScale` 读，不要写死 3。** 还没加到界面上的视图也读得到正确的值。

## 完整例子

下面的代码从空白 App 开始，显示当前是深色还是浅色，并放一个按钮把整个 App 切到深色。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const label = new UILabel();
  label.frame = new CGRect(40, 120, 300, 30);
  label.textColor = 'label';
  page.view.addSubview(label);

  // 1. 读当前是深色还是浅色
  function show() {
    label.text = '现在是 ' + page.view.traitCollection.userInterfaceStyle;
  }
  show();

  // 2. 变了就重新读一次
  page.view.addEventListener('traitchange', show);

  // 3. 一个按钮：强制整个窗口用深色
  const button = UIButton.buttonWithType('system');
  button.setTitle('切到深色', { forState: ['normal'] });
  button.frame = new CGRect(40, 170, 120, 44);
  page.view.addSubview(button);
  button.addEventListener('touchUpInside', () => {
    win.overrideUserInterfaceStyle = 'dark';
  });
});
```

**效果**：

- 系统是浅色时，屏幕是白底，上面一行黑字「现在是 light」，下面一个文字按钮「切到深色」。
- 点按钮，整屏变成黑底，文字变成白色，那行字变成「现在是 dark」。

这段代码没有作为一个整体在模拟器运行过。读取、在视图上强制、事件这三样在验收用例里分别核对过。在窗口上强制后整屏跟着变，**未在模拟器验证**：验收里有这样的按钮，但没有断言。

`'systemBackground'` 和 `'label'` 是语义色，底色和文字的颜色是系统自动换的。代码只负责那行字的内容。

`show()` 在建界面时调了一次，又注册成了 `traitchange` 的回调。点按钮之后不需要再手动调它：窗口被强制成深色，页面的视图在窗口里，它的外观跟着变，于是收到 `traitchange`。

## 常见用法

以下例子都沿用上面的 `win` 和 `page`。

### 判断现在是不是深色

```js
const dark = page.view.traitCollection.userInterfaceStyle === 'dark';
console.log(dark ? '深色' : '浅色');
```

**效果**：这个视图显示成深色时输出 `深色`，否则输出 `浅色`。

从 `traitCollection` 读到的 `userInterfaceStyle` 实测只有 `'light'` 和 `'dark'` 两种，所以不是 `'dark'` 就是浅色。

这个判断只反映读的那一刻。之后还要跟着变化更新，就监听 `traitchange`，见下一节。

### 知道系统切换了深浅色

用户在系统设置里切换时，[场景](ui-window-scene.md)上会派发 `traitchange`。场景从 `sceneconnect` 事件里拿，下面用 `scene` 表示它：

```js
application.addEventListener('sceneconnect', (e) => {
  const scene = e.scene;
  scene.addEventListener('traitchange', (event) => {
    const before = /** @type {UITraitChangeEvent} */ (event).previousTraitCollection;
    console.log(before.userInterfaceStyle + ' → ' + scene.traitCollection.userInterfaceStyle);
  });
});
```

**效果**：系统从浅色切到深色时，控制台输出 `light → dark`。切回来输出 `dark → light`。

在模拟器里切换：菜单 Features → Toggle Appearance。

在场景上监听收到的是系统设置的变化。某个视图或窗口被 `overrideUserInterfaceStyle` 强制而变了，场景的值没有变，要在那个视图上监听。强制视图时场景上确实不派发，**未在模拟器验证**。在视图上监听时，系统设置的变化也会收到（实测界面上的视图和场景各收到一次）；但这个视图已经被强制成固定的外观时，系统再怎么切换它都不变，是否仍派发**未在模拟器验证**。

### 在 App 里做一个主题开关

`overrideUserInterfaceStyle` 写在窗口上，窗口里的全部界面都跟着变：

```js
win.overrideUserInterfaceStyle = 'dark';          // 固定深色
win.overrideUserInterfaceStyle = 'light';         // 固定浅色
win.overrideUserInterfaceStyle = 'unspecified';   // 跟随系统
```

**效果**：三行分别让整个 App 固定用深色、固定用浅色、恢复成跟随系统设置。**未在模拟器验证**：在视图上强制有断言，在窗口上强制只有手动点的按钮。

`overrideUserInterfaceStyle` 不会被保存，App 重新启动后是 `'unspecified'`。把用户的选择存进[本地存储](storage.md)，启动时再写一遍：

```js
/** @param {UIUserInterfaceStyle} style */
function setTheme(style) {
  win.overrideUserInterfaceStyle = style;
  application.storage.set('theme', style);
}

// 启动时恢复上次的选择。没存过就不强制，跟随系统
const saved = application.storage.stringForKey('theme');
if (saved === 'dark' || saved === 'light') {
  win.overrideUserInterfaceStyle = saved;
}

setTheme('dark');
```

**效果**：整个 App 切到深色。下次启动时，恢复的那几行把窗口再次固定成深色。把恢复的那几行放在 `sceneconnect` 的回调里、`makeKeyAndVisible()` 之前。**这个例子未在模拟器验证。**

开关的三个选项对应三个取值：「深色」写 `'dark'`，「浅色」写 `'light'`，「跟随系统」写 `'unspecified'`。

### 只让一块区域用深色

```js
const panel = new UIView();
panel.frame = new CGRect(20, 240, 280, 120);
panel.backgroundColor = 'systemBackground';
panel.overrideUserInterfaceStyle = 'dark';
page.view.addSubview(panel);
```

**效果**：页面上出现一块黑色的矩形。系统是浅色时，页面其余部分仍是白色，只有这一块和它里面的内容用深色。

`UIViewController` 也有 `overrideUserInterfaceStyle`，写在页面上对整个页面生效：

```js
const player = new UIViewController();
player.overrideUserInterfaceStyle = 'dark';
console.log(player.view.traitCollection.userInterfaceStyle);
```

**效果**：输出 `dark`。这个页面不管系统是深色还是浅色，都显示成深色。页面的视图是在第一次读 `player.view` 时创建的，创建时已经带着页面的设置，所以这里立刻读到了新值。

### 读屏幕是几倍的

```js
const scale = page.view.traitCollection.displayScale;
console.log(scale);
console.log(1 / scale);
```

**效果**：iPhone Air 的模拟器上输出 `3` 和 `0.3333333333333333`。

`displayScale` 是 1 [pt](units.md) 对应几个像素。两个常见用途：

- 要画一条 1 像素宽的细线，宽度写 `1 / scale` pt。
- 自己创建的[图层](ca-layer.md)要画得清晰，把它的 `contentsScale` 设成这个值。

### 跟着用户设的文字大小调整

```js
const size = page.view.traitCollection.preferredContentSizeCategory;
const large = size.startsWith('accessibility');
console.log(size, large ? '用单列布局' : '用双列布局');
```

**效果**：用户没改过文字大小时输出 `large 用双列布局`。用户在系统设置的「辅助功能」里把文字调到最大的几档时，输出形如 `accessibilityLarge 用单列布局`。`accessibility` 开头的几档**未在模拟器验证**，模拟器上切到过的最大一档是 `extraExtraLarge`。

用户在 App 运行期间改了文字大小，会派发 `traitchange`。文字本身要跟着变大，在回调里重新取一次字体：

```js
const body = new UILabel();
body.frame = new CGRect(20, 480, 280, 60);
body.text = '正文';
page.view.addSubview(body);

function applyFont() {
  body.font = UIFont.preferredFontForTextStyle('body');
}
applyFont();

body.addEventListener('traitchange', applyFont);
```

**效果**：文字按系统当前的文字大小显示。用户到系统设置里改了文字大小再回到 App，这行文字换成新的字号。

`traitchange` 在文字大小变化时派发，这一点在模拟器上核对过。回调里重新取字体后字号确实变了，**未在模拟器验证**。

字体要用 [`UIFont.preferredFontForTextStyle()`](ui-font.md) 取，它返回的字号取决于当前的设置。`UIFont.systemFontOfSize(17)` 永远是 17 pt，重新取也不会变。已经设给标签的字体不会自己变，所以要在回调里重新赋值。

在模拟器里改文字大小：终端执行 `xcrun simctl ui booted content_size extra-extra-large`。

### 让图层的边框颜色跟着深浅色变

[图层](ca-layer.md)上的颜色在写入的那一刻就固定了，深浅色切换时不会自己变。在 `traitchange` 里重新写一遍：

```js
const card = new UIView();
card.frame = new CGRect(20, 380, 280, 80);
card.layer.borderWidth = 1;
card.layer.borderColor = 'separator';
page.view.addSubview(card);

card.addEventListener('traitchange', () => {
  card.layer.borderColor = 'separator';
});
```

**效果**：卡片有一圈细边框。系统切换深浅色之后，边框换成新外观下的分隔线颜色。不加最后三行的话，边框会停留在切换之前的颜色。

写入的那一刻按谁的外观算：

| 图层 | 按谁的外观 |
| --- | --- |
| 某个视图自己的图层（`view.layer`） | 这个视图的。视图被强制成深色，写进去的就是深色下的颜色 |
| 自己创建、挂在某个视图的图层下面的子图层 | 它挂在的那个视图的 |
| 还没挂到任何视图上的图层 | 系统当时的外观。挂上去之后不会重新算，要自己再写一遍 |

边框色、阴影色、图层的底色、形状图层的填充色和描边色、渐变图层的颜色数组都是这个规则。

## 强制之后不是立刻生效

写 `overrideUserInterfaceStyle` 之后，系统不会马上更新这个视图的 `traitCollection`，而是稍后统一更新，更新完再派发 `traitchange`：

```js
const before = page.view.traitCollection.userInterfaceStyle;
page.view.overrideUserInterfaceStyle = before === 'dark' ? 'light' : 'dark';
console.log(page.view.traitCollection.userInterfaceStyle === before);

page.view.addEventListener('traitchange', () => {
  console.log(page.view.traitCollection.userInterfaceStyle === before);
});
```

**效果**：先输出 `true`：写完立刻读，还是原来的值。稍后事件到达，输出 `false`：这时读到的是新值。

所以依赖新值的代码要写在 `traitchange` 的回调里，不要写在赋值的下一行。验收用例里写入 500 毫秒后事件已经到达；App 正忙时实测超过过 500 毫秒。所以不要用定时器等一个固定的时长。

写入的那一刻到事件到达之间，这个视图的 `traitCollection` 是旧值。这期间往它的图层上写颜色，颜色也按旧的外观计算。所以图层颜色同样在 `traitchange` 的回调里写。

变化会传到里面的每一层：一个视图被强制后，事件到达时它的子视图读到的也是新值。

**不在窗口里的视图，强制不体现在 `traitCollection` 上。** 一个还没加到界面上的视图，写了 `overrideUserInterfaceStyle` 之后，`overrideUserInterfaceStyle` 读得到写入的值，但它的 `traitCollection` 不变（实测等了 2 秒仍是原值），它的子视图也一样。把它加到界面上之后 `traitCollection` 才更新，这一步**未在模拟器验证**。

页面是例外：对一个还没显示的页面写 `overrideUserInterfaceStyle`，再读 `page.view.traitCollection`，读到的是新值。

## 成员说明

### `UITraitCollection`

从视图、页面或场景的 `traitCollection` 取，不能自己创建：

- `new UITraitCollection()` 抛 `TypeError: Illegal constructor: UITraitCollection is created by the runtime, not by new`

每次读 `traitCollection` 得到的是当时的一组值。拿到之后它不会自己变，要最新的值就重新读。两次读到的对象不保证是同一个，不要用 `===` 比较两个 `UITraitCollection`，要比较就比较里面的属性。

全部属性只读。

| 属性 | 类型 | 含义 |
| --- | --- | --- |
| `userInterfaceStyle` | 字符串 | 深色还是浅色，取值见下表 |
| `displayScale` | 数 | 1 pt 对应几个像素。现在的 iPhone 是 3 |
| `preferredContentSizeCategory` | 字符串 | 用户在系统设置里选的文字大小，取值见下表 |
| `horizontalSizeClass` | 字符串 | 横向的地方宽不宽裕，取值见下表 |
| `verticalSizeClass` | 字符串 | 纵向的地方宽不宽裕，取值同上 |
| `accessibilityContrast` | 字符串 | 用户有没有打开「增强对比度」，取值见下表 |
| `layoutDirection` | 字符串 | 文字的书写方向，取值见下表 |

`userInterfaceStyle` 的取值：

| 取值 | 含义 |
| --- | --- |
| `'light'` | 浅色 |
| `'dark'` | 深色 |
| `'unspecified'` | 没有指定。从 `traitCollection` 读时实测没有遇到过，只在 `overrideUserInterfaceStyle` 上出现 |

`preferredContentSizeCategory` 的取值，从小到大：

| 取值 | 含义 |
| --- | --- |
| `'extraSmall'`、`'small'`、`'medium'` | 比默认小的三档 |
| `'large'` | 默认 |
| `'extraLarge'`、`'extraExtraLarge'`、`'extraExtraExtraLarge'` | 比默认大的三档 |
| `'accessibilityMedium'`、`'accessibilityLarge'`、`'accessibilityExtraLarge'`、`'accessibilityExtraExtraLarge'`、`'accessibilityExtraExtraExtraLarge'` | 「辅助功能」里才能选到的更大的五档 |
| `'unspecified'` | 没有指定 |

`horizontalSizeClass` 和 `verticalSizeClass` 的取值：

| 取值 | 含义 |
| --- | --- |
| `'compact'` | 这个方向上地方紧凑。iPhone 竖屏时横向是它 |
| `'regular'` | 这个方向上地方宽裕。iPhone 竖屏时纵向是它 |
| `'unspecified'` | 没有指定 |

`accessibilityContrast` 的取值：`'normal'`（没打开）、`'high'`（打开了「增强对比度」）、`'unspecified'`。

`layoutDirection` 的取值：`'leftToRight'`（从左往右，中文和英文是它）、`'rightToLeft'`（从右往左，阿拉伯语和希伯来语是它）、`'unspecified'`。

深浅色、`displayScale` 和文字大小在模拟器上核对过（文字大小切到过 `extraExtraLarge`）。其余四项只读到过默认值（`compact`、`regular`、`normal`、`leftToRight`），别的取值**未在模拟器验证**。

### `traitCollection`

[`UIView`](ui-view.md)、[`UIViewController`](ui-view-controller.md)、[`UIWindowScene`](ui-window-scene.md) 上都有。

| 属性 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `traitCollection` | `UITraitCollection` | 是 | 否 | 这个对象所处环境的外观特征 |

- 还没加到界面上的视图也读得到：深浅色是系统当前的设置，`displayScale` 是屏幕的倍率（实测是 3，不是 0）。
- 给 `traitCollection` 赋值抛 `TypeError`。
- 它变了会派发 [`traitchange`](#traitchange-事件)。

### `overrideUserInterfaceStyle`

`UIView`（包括 [`UIWindow`](ui-window.md)）和 `UIViewController` 上有。场景上没有。

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `overrideUserInterfaceStyle` | 字符串 | 是 | 是 | `'unspecified'` | 强制这个对象和它里面的一切用哪种外观 |

| 取值 | 效果 |
| --- | --- |
| `'unspecified'` | 不强制，和外面一层相同 |
| `'light'` | 固定用浅色 |
| `'dark'` | 固定用深色 |

- 写入之后 `overrideUserInterfaceStyle` 立刻读得到新值，`traitCollection` 稍后才更新，见[强制之后不是立刻生效](#强制之后不是立刻生效)。
- 不会被保存，App 重新启动后回到 `'unspecified'`。
- 写入表里没有的值时抛异常，原值不变。
- **出错**：写入表里没有的值：`TypeError: overrideUserInterfaceStyle has no value "night"; expected one of: unspecified / light / dark`

### `traitchange` 事件

`UIView`、`UIViewController`、`UIWindowScene` 上都能用 `addEventListener()` 监听。它们的子类也都能，比如在一个 [`UIButton`](ui-button.md) 或 [`UIScrollView`](ui-scroll-view.md) 上监听。

| 事件 | 什么时候派发 | 事件对象 |
| --- | --- | --- |
| `traitchange` | 这个对象的外观特征里，上面那七项中有任何一项变了 | 多一个字段 `previousTraitCollection`：变化之前的那组值 |

```js
page.view.addEventListener('traitchange', (e) => {
  const event = /** @type {UITraitChangeEvent} */ (e);
  console.log(event.previousTraitCollection.userInterfaceStyle);   // 变之前
  console.log(page.view.traitCollection.userInterfaceStyle);       // 现在
});
```

**效果**：从浅色变成深色时，输出 `light` 和 `dark`。

- 现在的值不在事件对象上，从被监听的那个对象的 `traitCollection` 读。
- 系统切换深浅色时派发；写 `overrideUserInterfaceStyle` 让这个对象的外观变了时也派发；用户改了系统的文字大小时也派发。三种都在模拟器上核对过。
- 其余四项（两个 size class、对比度、书写方向）变化时是否派发，**未在模拟器验证**。
- 事件不能取消。
- 回调不是在变化的那一刻同步执行，而是稍后执行，见[运行时怎么工作](how-it-works.md)。回调执行时 `traitCollection` 已经是新值。
- 一次变化派发一次：把一个视图强制成另一种外观，这个视图实测收到一次。
- 只有外观特征真的变了才派发。把 `overrideUserInterfaceStyle` 写成和当前实际外观相同的值时是否派发，**未在模拟器验证**。
- 事件派发在被监听的那个对象上，不沿着视图树传递。一个视图的外观变了，它的子视图读到的值跟着变（已验证）；在子视图上监听能收到它自己的那一次，**未在模拟器验证**。
- 在不是视图、页面、场景的对象上监听这个事件名会抛 `TypeError`，比如在[手势识别器](ui-gesture-recognizer.md)上。

## 与 iOS 原生写法的对照

| ObjC | JS |
| --- | --- |
| `view.traitCollection.userInterfaceStyle == UIUserInterfaceStyleDark` | `view.traitCollection.userInterfaceStyle === 'dark'` |
| `view.traitCollection.displayScale` | `view.traitCollection.displayScale` |
| `view.traitCollection.preferredContentSizeCategory` | `view.traitCollection.preferredContentSizeCategory` |
| `window.overrideUserInterfaceStyle = UIUserInterfaceStyleDark` | `win.overrideUserInterfaceStyle = 'dark'` |
| `[view registerForTraitChanges:traits withTarget:self action:@selector(changed:previous:)]` | `view.addEventListener('traitchange', …)` |
| 覆写 `- traitCollectionDidChange:`（已废弃） | 同上 |
| `UIScreen.mainScreen.scale` | `view.traitCollection.displayScale` |

和原生有一处不同：原生注册时要列出关心哪几项，这里固定是上面那七项，任何一项变了都派发。

## 与浏览器的对照

| 浏览器 | Nacre |
| --- | --- |
| `matchMedia('(prefers-color-scheme: dark)').matches` | `scene.traitCollection.userInterfaceStyle === 'dark'` |
| `matchMedia(…).addEventListener('change', …)` | `scene.addEventListener('traitchange', …)` |
| `window.devicePixelRatio` | `view.traitCollection.displayScale` |
| CSS 的 `color-scheme: dark`，写在某个元素上 | `view.overrideUserInterfaceStyle = 'dark'` |

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 写了 `overrideUserInterfaceStyle` 之后让它立刻生效 | `updateTraitsIfNeeded` | 未实现 |
| 强制深浅色以外的其它项，比如固定文字大小 | `traitOverrides` | 未实现 |
| 读其余的十几项 | `userInterfaceLevel`、`legibilityWeight`、`displayGamut`、`activeAppearance` 等 | 未实现 |
| 自己定义一项特征，让它沿着视图树往下传 | 自定义 trait（`UITraitDefinition`） | 未实现 |
| 把一个会随深浅色变的颜色算成某种外观下的具体颜色 | `resolvedColorWithTraitCollection:` | 未实现 |
| 深色和浅色各用一张图 | 图片资源里的外观变体 | 未实现 |
| 图层上的颜色自动跟着深浅色变 | 无。原生也要自己处理 | 做不到。写法见[上面的例子](#让图层的边框颜色跟着深浅色变) |
| 让标签的字号自动跟随系统的文字大小 | `adjustsFontForContentSizeCategory` | 未实现。在 `traitchange` 里重新取字体 |

## 参见

- [颜色](ui-color.md)：语义色和 `light-dark()`，颜色自动跟随深浅色
- [`UIView`](ui-view.md)、[`UIViewController`](ui-view-controller.md)、[`UIWindowScene`](ui-window-scene.md)：`traitCollection` 和事件所在的三个类
- [`UIWindow`](ui-window.md)：做 App 内主题开关时写它的 `overrideUserInterfaceStyle`
- [`UIFont`](ui-font.md)：`preferredFontForTextStyle()`，字号跟随系统的文字大小
- [`application`](application.md)：`contentsizecategorychange` 事件，文字大小变化的另一个通知
- [`CALayer`](ca-layer.md)：图层上的颜色为什么不会自己变
- [本地存储](storage.md)：保存用户选的主题
- [单位](units.md)：pt 和像素
- [运行时怎么工作](how-it-works.md)：事件什么时候执行
