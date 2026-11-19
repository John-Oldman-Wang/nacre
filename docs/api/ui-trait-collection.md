---
type: reference
native: UITraitCollection
status: partial
---

# `UITraitCollection`

**`UITraitCollection`** 表示界面当前所处环境的一组值：现在是深色还是浅色，屏幕上 1 [pt](units.md) 对应几个像素，用户把系统的文字大小设到了哪一档，等等。iOS 把其中的每一项叫作一个外观特征（trait）。

这组值不是整个 App 只有一份。[场景](ui-window-scene.md)、窗口、页面、每个视图各有一份，从各自的 `traitCollection` 属性读。值从外向里传：

```
场景  →  窗口  →  页面  →  视图  →  子视图
```

每一层默认和外面一层相同。场景的值来自系统设置。所以没有做过任何强制时，各层读到的深浅色都是系统设置里的那一种。

读 `traitCollection` 得到的是读的那一刻的一组值，之后环境变了，已经拿到的这个对象不会跟着变，要新的值就重新读 `traitCollection`。两次读到的对象不保证是同一个，不要用 `===` 比较两个 `UITraitCollection`，要比较就比较里面的属性。

围绕它有三件事可以做：

| 想做的事 | 用什么 |
| --- | --- |
| 读当前的值 | `traitCollection` 上的七个属性 |
| 让某一层固定用深色或浅色 | 写这一层的 `overrideUserInterfaceStyle` |
| 值变了时得到通知 | 监听这一层的 `traitchange` 事件 |

后两样是视图、页面、场景上的成员，在本页的[强制深浅色](#强制深浅色overrideuserinterfacestyle)和[`traitchange` 事件](#traitchange-事件)两节说明。

只是让颜色跟着深浅色变，不需要读外观特征，也不需要监听 `traitchange`：颜色写成语义色或 `light-dark()` 就会自动切换，见 [`UIColor`](ui-color.md)。

**继承关系**：`EventTarget` → `NSObject` → `UITraitCollection`

什么时候需要用到它、怎么做主题开关，见指南[适配深色模式](../guides/dark-mode.md)。

## 构造函数

不能用 `new` 创建，从视图、页面或场景的 `traitCollection` 取。`new UITraitCollection()` 抛：

```
TypeError: Illegal constructor: UITraitCollection is created by the runtime, not by new
```

## 实例属性

还继承 `NSObject` 的属性。全部只读，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`userInterfaceStyle`](ui-trait-collection/userinterfacestyle.md) <small>只读</small> | 深色还是浅色 |
| [`displayScale`](ui-trait-collection/displayscale.md) <small>只读</small> | 1 pt 对应几个像素 |
| [`preferredContentSizeCategory`](ui-trait-collection/preferredcontentsizecategory.md) <small>只读</small> | 用户在系统设置里选的文字大小 |
| [`horizontalSizeClass`](ui-trait-collection/horizontalsizeclass.md) <small>只读</small> | 横向的地方宽不宽裕 |
| [`verticalSizeClass`](ui-trait-collection/verticalsizeclass.md) <small>只读</small> | 纵向的地方宽不宽裕 |
| [`accessibilityContrast`](ui-trait-collection/accessibilitycontrast.md) <small>只读</small> | 用户有没有打开「增强对比度」 |
| [`layoutDirection`](ui-trait-collection/layoutdirection.md) <small>只读</small> | 文字的书写方向 |

深浅色、`displayScale` 和文字大小在模拟器上核对过（文字大小切到过 `extraExtraLarge`）。其余四项只读到过默认值（`compact`、`regular`、`normal`、`leftToRight`），别的取值**未在模拟器验证**。

## 实例方法

`UITraitCollection` 没有自己的实例方法。

## 事件

`UITraitCollection` 自己不派发事件。外观特征变了时，派发事件的是视图、页面和场景，见 [`traitchange` 事件](#traitchange-事件)。

## 从哪里读：`traitCollection`

[`UIView`](ui-view.md)、[`UIViewController`](ui-view-controller.md)、[`UIWindowScene`](ui-window-scene.md) 上都有。

| 属性 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `traitCollection` | `UITraitCollection` | 是 | 否 | 这个对象所处环境的外观特征 |

- 还没加到界面上的视图也读得到：深浅色是系统当前的设置，`displayScale` 是屏幕的倍率（实测是 3，不是 0）。
- 给 `traitCollection` 赋值抛 `TypeError`。
- 它变了会派发 [`traitchange`](#traitchange-事件)。

## 强制深浅色：`overrideUserInterfaceStyle`

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

- **写完立刻读，`traitCollection` 还是旧值。** 系统稍后才统一更新，更新完派发 `traitchange`。依赖新值的代码要写在 `traitchange` 的回调里。`overrideUserInterfaceStyle` 自己立刻读得到写入的值。见[强制之后不是立刻生效](#强制之后不是立刻生效)。
- **不在窗口里的视图，强制不体现在 `traitCollection` 上。** 一个还没加到界面上的视图写了强制，等 2 秒再读，它和它的子视图的 `traitCollection` 仍是原来的值。

### `overrideUserInterfaceStyle` 属性

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
- 写入表里没有的值时不抛异常，属性保持原来的值，控制台输出一条警告：`[Nacre] overrideUserInterfaceStyle has no value "night"; expected one of: unspecified / light / dark, ignored`

## 强制之后不是立刻生效

写 `overrideUserInterfaceStyle` 之后，系统不会马上更新这个视图的 `traitCollection`，而是稍后统一更新，更新完再派发 `traitchange`：

```js
const page = new UIViewController();
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

## `traitchange` 事件

`UIView`、`UIViewController`、`UIWindowScene` 上都能用 `addEventListener()` 监听。它们的子类也都能，比如在一个 [`UIButton`](ui-button.md) 或 [`UIScrollView`](ui-scroll-view.md) 上监听。

| 事件 | 什么时候派发 | 事件对象 |
| --- | --- | --- |
| `traitchange` | 这个对象的外观特征里，上面那七项中有任何一项变了 | 多一个字段 `previousTraitCollection`：变化之前的那组值 |

```js
const page = new UIViewController();
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
- 在不是视图、页面、场景的对象上（比如[手势识别器](ui-gesture-recognizer.md)）监听这个事件名不会报错，但系统不会派发，它只是一个自定义事件。

## 示例

### 显示当前外观，并切到深色

从空白 App 开始，显示当前是深色还是浅色，并放一个按钮把整个 App 切到深色。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const label = new UILabel();
  label.frame = new CGRect(40, 120, 300, 30);
  label.textColor = 'label';
  page.view.addSubview(label);

  function show() {
    label.text = '现在是 ' + page.view.traitCollection.userInterfaceStyle;
  }
  show();
  page.view.addEventListener('traitchange', show);

  const button = UIButton.buttonWithType('system');
  button.setTitle('切到深色', { forState: ['normal'] });
  button.frame = new CGRect(40, 170, 120, 44);
  page.view.addSubview(button);
  button.addEventListener('touchupinside', () => {
    win.overrideUserInterfaceStyle = 'dark';
  });
});
```

**效果**

- 系统是浅色时，屏幕是白底，上面一行黑字「现在是 light」，下面一个文字按钮「切到深色」。
- 点按钮，整屏变成黑底，文字变成白色，那行字变成「现在是 dark」。

这段代码没有作为一个整体在模拟器运行过。读取、在视图上强制、事件这三样在验收用例里分别核对过。在窗口上强制后整屏跟着变，**未在模拟器验证**：验收里有这样的按钮，但没有断言。

更多写法见指南[适配深色模式](../guides/dark-mode.md)。

## 对应的 iOS API

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

### 与浏览器的对照

| 浏览器 | Nacre |
| --- | --- |
| `matchMedia('(prefers-color-scheme: dark)').matches` | `scene.traitCollection.userInterfaceStyle === 'dark'` |
| `matchMedia(…).addEventListener('change', …)` | `scene.addEventListener('traitchange', …)` |
| `window.devicePixelRatio` | `view.traitCollection.displayScale` |
| CSS 的 `color-scheme: dark`，写在某个元素上 | `view.overrideUserInterfaceStyle = 'dark'` |

## 参见

- [适配深色模式](../guides/dark-mode.md)：判断深浅色、主题开关、跟着文字大小调整、图层颜色跟随外观
- [`UIColor`](ui-color.md)：语义色和 `light-dark()`，颜色自动跟随深浅色
- [`UIView`](ui-view.md)、[`UIViewController`](ui-view-controller.md)、[`UIWindowScene`](ui-window-scene.md)：`traitCollection` 和事件所在的三个类
- [`UIWindow`](ui-window.md)：做 App 内主题开关时写它的 `overrideUserInterfaceStyle`
- [`UIFont`](ui-font.md)：`preferredFontForTextStyle()`，字号跟随系统的文字大小
- [`application`](application.md)：`contentsizecategorychange` 事件，文字大小变化的另一个通知
- [单位](units.md)：pt 和像素
- [运行时怎么工作](how-it-works.md)：事件什么时候执行
