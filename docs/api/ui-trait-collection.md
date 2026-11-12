---
type: reference
native: UITraitCollection
status: partial
---

# 外观特征（`UITraitCollection`）

外观特征是一组描述「当前环境是什么样」的值：现在是深色还是浅色、屏幕是几倍的、用户把文字调到多大。iOS 把这组值叫 trait，装在一个 `UITraitCollection` 对象里。

用它做三件事：

- **读**：现在是深色还是浅色，从 `traitCollection` 读。
- **强制**：让一个视图、一个页面或者整个 App 固定用深色或浅色，写 `overrideUserInterfaceStyle`。
- **得到通知**：这些值变了，监听 `traitchange` 事件。

它相当于浏览器里的 `matchMedia('(prefers-color-scheme: dark)')` 加上 `window.devicePixelRatio`。有三点不同：

- **值是一组属性，不是媒体查询。** 深浅色直接读 `userInterfaceStyle`。
- **不是全局只有一份。** 每个视图、每个页面都有自己的一份，默认和外层相同，可以单独强制成别的。
- **强制之后不是立刻生效。** 要等到 `traitchange` 事件到达，新的值才读得到。

> **注意**：只是让颜色跟着深浅色变，不需要用到这一页。把颜色写成语义色（比如 `'label'`、`'systemBackground'`）或者 `light-dark()`，系统会自动换，见[颜色](ui-color.md)。这一页用在要自己做判断的时候：换一张图、换一种布局、做 App 内的主题开关。

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

这段代码没有作为一个整体在模拟器运行过。读取、强制、事件这三样在验收用例里分别核对过。

`'systemBackground'` 和 `'label'` 是语义色，底色和文字的颜色是系统自动换的。代码只负责那行字的内容。

## 常见用法

以下例子都沿用上面的 `win` 和 `page`。

### 判断现在是不是深色

```js
const dark = page.view.traitCollection.userInterfaceStyle === 'dark';
console.log(dark ? '深色' : '浅色');
```

**效果**：系统是深色时输出 `深色`，否则输出 `浅色`。

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

### 在 App 里做一个主题开关

`overrideUserInterfaceStyle` 写在窗口上，整个 App 都跟着变：

```js
win.overrideUserInterfaceStyle = 'dark';          // 固定深色
win.overrideUserInterfaceStyle = 'light';         // 固定浅色
win.overrideUserInterfaceStyle = 'unspecified';   // 跟随系统
```

**效果**：三行分别让整个 App 固定用深色、固定用浅色、恢复成跟随系统设置。

用户的选择要自己保存，下次启动时再写一遍，见[本地存储](storage.md)。

### 只让一块区域用深色

```js
const panel = new UIView();
panel.frame = new CGRect(20, 240, 280, 120);
panel.backgroundColor = 'systemBackground';
panel.overrideUserInterfaceStyle = 'dark';
page.view.addSubview(panel);
```

**效果**：页面上出现一块黑色的矩形。系统是浅色时，页面其余部分仍是白色，只有这一块和它里面的内容用深色。

`UIViewController` 也有 `overrideUserInterfaceStyle`，写在页面上对整个页面生效。

### 读屏幕是几倍的

```js
const scale = page.view.traitCollection.displayScale;
console.log(scale);
console.log(1 / scale);
```

**效果**：现在的 iPhone 上输出 `3` 和 `0.3333333333333333`。

`displayScale` 是 1 [pt](units.md) 对应几个像素。两个常见用途：

- 要画一条 1 像素宽的细线，宽度写 `1 / scale` pt。
- 自己创建的[图层](ca-layer.md)要画得清晰，把它的 `contentsScale` 设成这个值。

### 跟着用户设的文字大小调整

```js
const size = page.view.traitCollection.preferredContentSizeCategory;
const large = size.startsWith('accessibility');
console.log(size, large ? '用单列布局' : '用双列布局');
```

**效果**：用户没改过文字大小时输出 `large 用双列布局`。用户在系统设置的「辅助功能」里把文字调到最大的几档时，输出形如 `accessibilityLarge 用单列布局`。

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

## 每个视图都有自己的一份

外观特征是从外向里传的：

```
场景  →  窗口  →  页面  →  视图  →  子视图
```

每一层默认和外面一层相同。在某一层写了 `overrideUserInterfaceStyle`，这一层和它里面的所有层都换成写入的值，外面的不受影响。

所以读的时候要想清楚问的是谁：

| 想知道的事 | 读哪个 |
| --- | --- |
| 系统设置里是深色还是浅色 | `scene.traitCollection` |
| 这个视图实际显示成深色还是浅色 | `view.traitCollection` |

没有强制过的时候，这两个相同。

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

所以依赖新值的代码要写在 `traitchange` 的回调里，不要写在赋值的下一行。

还有一点：**强制只对已经显示在屏幕上的视图生效。** 一个还没加到界面上的视图，写了 `overrideUserInterfaceStyle` 之后，它的 `traitCollection` 不会变（实测等了 2 秒仍是原值）。把它加到界面上之后才会更新。

## 成员说明

### `UITraitCollection`

从视图、页面或场景的 `traitCollection` 取，不能自己创建：

- `new UITraitCollection()` 抛 `TypeError: Illegal constructor: UITraitCollection is created by the runtime, not by new`

每次读 `traitCollection` 得到的是当时的一组值。拿到之后它不会自己变，要最新的值就重新读。

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
| `'unspecified'` | 没有指定。从 `traitCollection` 读的时候不会遇到，只在 `overrideUserInterfaceStyle` 上出现 |

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

- 还没加到界面上的视图也读得到，各项是系统的默认值（实测 `displayScale` 是 3，不是 0）。
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

- 写入之后不是立刻生效，见[强制之后不是立刻生效](#强制之后不是立刻生效)。
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
- 回调不是在变化的那一刻同步执行，而是稍后执行，见[运行时怎么工作](how-it-works.md#事件)。
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

## 参见

- [颜色](ui-color.md)：语义色和 `light-dark()`，颜色自动跟随深浅色
- [`UIView`](ui-view.md)、[`UIViewController`](ui-view-controller.md)、[`UIWindowScene`](ui-window-scene.md)：`traitCollection` 和事件所在的三个类
- [`UIWindow`](ui-window.md)：做 App 内主题开关时写它的 `overrideUserInterfaceStyle`
- [`CALayer`](ca-layer.md)：图层上的颜色为什么不会自己变
- [本地存储](storage.md)：保存用户选的主题
- [单位](units.md)：pt 和像素
- [运行时怎么工作](how-it-works.md)：事件什么时候执行
