# 适配深色模式

这一篇讲怎么让界面跟着浅色和深色模式变：什么时候只用颜色就够了、怎么判断当前外观、怎么在 App 里做主题开关、怎么让图层上的颜色和字号跟着变。用到的是 [`UITraitCollection`](../api/ui-trait-collection.md)，以及视图、页面、场景上的 `traitCollection`、`overrideUserInterfaceStyle` 和 `traitchange` 事件，细节都在 [`UITraitCollection`](../api/ui-trait-collection.md) 的参考页。颜色的写法见[设置颜色](colors.md)。

## 推荐的做法

- **颜色用语义色，不要在代码里判断深浅色再设颜色。** 语义色由系统自动切换，不用监听事件，也不会漏掉某个视图。
- **主题开关写在窗口上，把用户的选择保存下来。** 写在窗口上一次就覆盖整个 App，新建的页面和视图自动跟随。`overrideUserInterfaceStyle` 不会被保存，App 重新启动后回到 `'unspecified'`，所以要把选择存进[本地存储](../api/storage.md)，启动时再写一遍。代码见[在 App 里做一个主题开关](#在-app-里做一个主题开关)。
- **需要新值的代码写在 `traitchange` 的回调里。** 不管变化来自系统设置还是来自 `overrideUserInterfaceStyle`，回调执行时 `traitCollection` 已经是新值。把「按当前外观更新界面」写成一个函数，建界面时调一次，回调里再调，两处走同一段代码。
- **在离要更新的东西最近的那一层监听。** 一个视图被强制成深色时，变的是它自己的外观，事件派发在它自己身上。在这个视图上监听，系统切换和强制两种变化都能收到。
- **屏幕倍率从 `traitCollection.displayScale` 读，不要写死 3。** 还没加到界面上的视图也读得到正确的值。

## 什么时候需要写代码

**只是让颜色跟着深浅色变，不需要读外观特征，也不需要监听 `traitchange`。** 视图的颜色写成语义色（比如 `'label'`、`'systemBackground'`）或者 `light-dark()` 之后，系统切换深浅色时自动换成对应的颜色，App 的代码不用做任何事，见[设置颜色](colors.md)。

需要用到这一页的情况：

- 深色和浅色要用不同的图片或不同的布局，这要由代码判断。
- 在 App 里做一个主题开关，不跟随系统。
- 用户调大了系统的文字大小，布局要跟着调整。
- 自己创建的[图层](../api/ca-layer.md)要按屏幕的倍率绘制。
- 图层上的颜色（边框色、阴影色等）要跟着深浅色变。图层上的颜色不会自动换，见[让图层的边框颜色跟着深浅色变](#让图层的边框颜色跟着深浅色变)。

## 第一个例子

从空白 App 开始，显示当前是深色还是浅色，并放一个按钮把整个 App 切到深色。

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
  button.addEventListener('touchupinside', () => {
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

下面的例子都沿用这里的 `win` 和 `page`。单独试某一节时，先写这几行：

```js
const win = new UIWindow();
const page = new UIViewController();
win.rootViewController = page;
```

## 判断现在是不是深色

```js
const dark = page.view.traitCollection.userInterfaceStyle === 'dark';
console.log(dark ? '深色' : '浅色');
```

**效果**：这个视图显示成深色时输出 `深色`，否则输出 `浅色`。

从 `traitCollection` 读到的 `userInterfaceStyle` 实测只有 `'light'` 和 `'dark'` 两种，所以不是 `'dark'` 就是浅色。

这个判断只反映读的那一刻。之后还要跟着变化更新，就监听 `traitchange`，见下一节。

## 知道系统切换了深浅色

用户在系统设置里切换时，[场景](../api/ui-window-scene.md)上会派发 `traitchange`。场景从 `sceneconnect` 事件里拿，下面用 `scene` 表示它：

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

## 在 App 里做一个主题开关

`overrideUserInterfaceStyle` 写在窗口上，窗口里的全部界面都跟着变：

```js
win.overrideUserInterfaceStyle = 'dark';          // 固定深色
win.overrideUserInterfaceStyle = 'light';         // 固定浅色
win.overrideUserInterfaceStyle = 'unspecified';   // 跟随系统
```

**效果**：三行分别让整个 App 固定用深色、固定用浅色、恢复成跟随系统设置。**未在模拟器验证**：在视图上强制有断言，在窗口上强制只有手动点的按钮。

`overrideUserInterfaceStyle` 不会被保存，App 重新启动后是 `'unspecified'`。把用户的选择存进[本地存储](../api/storage.md)，启动时再写一遍：

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

## 只让一块区域用深色

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

## 读屏幕是几倍的

```js
const scale = page.view.traitCollection.displayScale;
console.log(scale);
console.log(1 / scale);
```

**效果**：iPhone Air 的模拟器上输出 `3` 和 `0.3333333333333333`。

`displayScale` 是 1 [pt](../api/units.md) 对应几个像素。两个常见用途：

- 要画一条 1 像素宽的细线，宽度写 `1 / scale` pt。
- 自己创建的[图层](../api/ca-layer.md)要画得清晰，把它的 `contentsScale` 设成这个值。

## 跟着用户设的文字大小调整

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

字体要用 [`UIFont.preferredFontForTextStyle()`](../api/ui-font/preferredfontfortextstyle.md) 取，它返回的字号取决于当前的设置。`UIFont.systemFontOfSize(17)` 永远是 17 pt，重新取也不会变。已经设给标签的字体不会自己变，所以要在回调里重新赋值。

在模拟器里改文字大小：终端执行 `xcrun simctl ui booted content_size extra-extra-large`。

## 让图层的边框颜色跟着深浅色变

[图层](../api/ca-layer.md)上的颜色在写入的那一刻就固定了，深浅色切换时不会自己变。在 `traitchange` 里重新写一遍：

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

## 参见

- [`UITraitCollection`](../api/ui-trait-collection.md)：外观特征的全部属性，强制和事件的规则
- [设置颜色](colors.md)：语义色和 `light-dark()`
- [`UIColor`](../api/ui-color.md)：图层上的颜色为什么不会自己变
- [`UIWindow`](../api/ui-window.md)：主题开关写在它上面
- [`UIFont`](../api/ui-font.md)：字号跟随系统的文字大小
- [本地存储](../api/storage.md)：保存用户选的主题
