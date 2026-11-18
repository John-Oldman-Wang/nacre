---
type: reference
native: UIVisualEffectView
status: partial
---

# `UIVisualEffectView`

**`UIVisualEffectView`** 表示一块带效果的区域。它对自己**后面**的画面做一种处理，比如把它变模糊，再把处理后的结果显示出来。半透明的面板、浮在内容上面的工具条、玻璃质感的按钮底，都用它做。本页把它叫作效果视图。

效果视图自己不决定做哪种处理，这由交给它的**效果**对象决定。效果对象不显示任何东西，只有交给效果视图才看得见。效果有四种：

| 类 | 做什么 | 怎么得到 |
| --- | --- | --- |
| `UIBlurEffect` | 模糊：把后面的画面变模糊，并盖上一层半透明的颜色 | `UIBlurEffect.effectWithStyle(style)` |
| `UIVibrancyEffect` | 鲜明：让放在模糊上面的文字和图标带上底下画面的颜色 | `UIVibrancyEffect.effectForBlurEffect(blur, { style })` |
| `UIGlassEffect` | 玻璃：iOS 26 的新材质 | `UIGlassEffect.effectWithStyle(style)` |
| `UIGlassContainerEffect` | 玻璃容器：把几块玻璃合成一组来画 | `new UIGlassContainerEffect()` |

效果视图是[视图](ui-view.md)。位置、大小、圆角、隐藏都按视图的写法。

本页描述的屏幕效果（糊成什么样、玻璃是什么质感）全部**未在模拟器验证**。各成员的默认值、效果读回来是不是同一个对象、直接加子视图会被拒，是在模拟器上用原生代码实测的。

## 内容加在 `contentView` 上

效果视图上面要显示文字、图标、按钮时，把它们加到效果视图的 **`contentView`** 上，不加到效果视图自己上面。

```js
panel.contentView.addSubview(label);   // 对
panel.addSubview(label);               // 抛 TypeError
```

直接对效果视图调 `addSubview()` 或 `insertSubview()` 会抛 `TypeError`，报错信息是 `addSubview: a UIVisualEffectView takes no subviews of its own; add them to its contentView`。被拒的视图不会进入任何视图树。

`contentView` 是效果视图自带的一个普通视图，大小始终和效果视图相同。它一直是同一个对象：换效果、把效果清掉，`contentView` 和里面的内容都不变。

## 为什么看不出效果

效果处理的是效果视图**后面**的画面。以下情况效果不明显或者不显示：

- **后面没有东西可处理。** 效果视图后面是一片纯色时，模糊之后仍然是一片纯色，看不出模糊。
- **效果视图或它的某一层父视图的 `alpha` 小于 1。** Apple 在头文件里注明这种情况下很多效果显示不正确或者完全不显示。要让内容半透明，改 `contentView` 里面的视图的 `alpha`。
- **`effect` 是 `null`。** 没有效果时效果视图只是一个装着 `contentView` 的容器。

这三条都**未在模拟器验证**。

## 推荐的做法

**模糊和鲜明效果可以共用。** 它们不可变，同一个对象可以交给多个效果视图，不必为每个视图各造一个。

**玻璃效果先把属性设好，再交给视图。** 效果视图保存的是赋值那一刻的副本，见[效果对象和副本](#效果对象和副本)。之后要改，改完重新赋一次。

**鲜明效果要多套一层效果视图。** 它不是加在模糊面板自己身上的，写法见[让面板上的文字更鲜明](#让面板上的文字更鲜明)。

## 完整例子

下面的代码从空白 App 开始，放四条彩色的色块，再在上面盖一块模糊的面板，面板上有一行字。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 先放一些有颜色的东西。效果处理的是它后面的画面
  ['systemRed', 'systemOrange', 'systemGreen', 'systemBlue'].forEach((color, i) => {
    const stripe = new UIView();
    stripe.frame = new CGRect(40 + i * 70, 200, 70, 200);
    stripe.backgroundColor = color;
    page.view.addSubview(stripe);
  });

  // 2. 造一个模糊效果，交给效果视图
  const blur = UIBlurEffect.effectWithStyle('systemMaterial');
  const panel = new UIVisualEffectView(blur);
  panel.frame = new CGRect(60, 260, 240, 80);
  page.view.addSubview(panel);

  // 3. 内容加在 contentView 上
  const label = new UILabel();
  label.text = '毛玻璃';
  label.textAlignment = 'center';
  label.frame = new CGRect(0, 0, 240, 80);
  panel.contentView.addSubview(label);
});
```

**效果**

- 屏幕上有红、橙、绿、蓝四条竖着的色块。
- 色块中间盖着一块 240 × 80 pt 的面板。面板范围内的色块是模糊的，边界看不清。
- 面板正中有「毛玻璃」三个字，字本身是清晰的。

这段代码没有在模拟器运行过。长度的单位见[单位](units.md)。

三步分别是：准备后面的画面、造效果并交给效果视图、把内容加到 `contentView`。

## 常见用法

以下例子都假设已经有上面的 `page`、`blur`、`panel` 和 `label`。

### 换一种模糊

```js
panel.effect = UIBlurEffect.effectWithStyle('systemThinMaterialDark');
```

**效果**：面板换成较薄的、固定为深色的模糊。`contentView` 里的字还在。**未在模拟器验证。**

全部样式见 [`UIBlurEffect.effectWithStyle()`](#uiblureffecteffectwithstyle)。

### 让面板上的文字更鲜明

鲜明效果用在**另一个**效果视图上。这个效果视图放在模糊面板的 `contentView` 里，文字再放进它的 `contentView`。

```js
const vivid = new UIVisualEffectView(
  UIVibrancyEffect.effectForBlurEffect(blur, { style: 'label' }));
vivid.frame = new CGRect(0, 0, 240, 80);
panel.contentView.addSubview(vivid);

vivid.contentView.addSubview(label);   // label 从 panel.contentView 移到这里
```

**效果**：文字带上面板后面画面的颜色。**未在模拟器验证。**

`effectForBlurEffect()` 的第一个参数是面板用的那个模糊效果，鲜明效果按它来配。`style` 按内容是什么来选，见[鲜明的样式](#鲜明的样式)。

### 用玻璃

```js
const glass = UIGlassEffect.effectWithStyle('regular');
const chip = new UIVisualEffectView(glass);
chip.frame = new CGRect(60, 360, 120, 44);
page.view.addSubview(chip);
```

**效果**：色块上多出一块 120 × 44 pt 的玻璃。**未在模拟器验证。**

### 给玻璃染色，让它对触摸有反应

```js
const glass = UIGlassEffect.effectWithStyle('clear');
glass.tintColor = 'rgba(255, 45, 85, 0.35)';
glass.isInteractive = true;
const chip = new UIVisualEffectView(glass);
```

**效果**：玻璃带一层粉色。手指按在上面时玻璃有反应。**未在模拟器验证。**

颜色的写法见[颜色](ui-color.md)。

### 改一块已经在用的玻璃

效果视图保存的是赋值时的副本，所以改完要重新赋一次。下面沿用上一个例子的 `glass` 和 `chip`。

```js
glass.tintColor = '#34C759';   // 这一行之后 chip 还是原来的颜色
chip.effect = glass;           // 重新赋一次才生效
```

**效果**：第二行执行之后，`chip.effect.tintColor` 读出来是 `'#34C759'`。屏幕上玻璃变成绿色**未在模拟器验证**。

### 把几块玻璃合成一组

把玻璃容器效果交给一个效果视图，再把几块玻璃放进它的 `contentView`。

```js
const group = new UIGlassContainerEffect();
group.spacing = 16;
const groupView = new UIVisualEffectView(group);
groupView.frame = new CGRect(40, 420, 300, 60);
page.view.addSubview(groupView);

for (let i = 0; i < 2; i++) {
  const piece = new UIVisualEffectView(UIGlassEffect.effectWithStyle('regular'));
  piece.frame = new CGRect(i * 70, 8, 60, 44);
  groupView.contentView.addSubview(piece);
}
```

**效果**：两块玻璃相距 10 pt，小于 `spacing` 的 16 pt，它们融合在一起。**未在模拟器验证。**

### 加圆角

效果视图默认不裁剪。圆角要同时打开 `clipsToBounds`。

```js
panel.layer.cornerRadius = 16;
panel.clipsToBounds = true;
```

**效果**：面板的四个角变成半径 16 pt 的圆角，模糊的范围也跟着变成圆角。**未在模拟器验证。**

### 去掉效果

```js
panel.effect = null;
```

**效果**：`panel.effect` 读出来是 `null`。`contentView` 和里面的内容不变。面板不再模糊后面的画面**未在模拟器验证**。

## 概念

### 效果处理的是后面的画面

效果视图不改变加在它 `contentView` 里的内容，它改变的是视图树里排在它后面、被它盖住的那部分画面。所以效果视图要放在要处理的内容**上面**：后加的视图在上面。

### 效果对象和副本

四种效果在「读回来是不是同一个对象」上分成两类。下面的 `panel` 和 `blur` 来自完整例子，`chip` 和 `glass` 来自[用玻璃](#用玻璃)。

| | 模糊、鲜明 | 玻璃、玻璃容器 |
| --- | --- | --- |
| 有没有可写的属性 | 没有 | 有 |
| 赋给 `effect` 之后读回来 | 是写进去的那个对象 | 是一份副本，不是写进去的那个对象 |
| 连续读两次 `effect` | 同一个对象 | 两个不同的对象 |
| 赋值之后改原来的对象 | 不适用 | 效果视图不跟着变 |
| 改读回来的对象 | 不适用 | 效果视图不跟着变 |

```js
panel.effect = blur;
panel.effect === blur;          // true

chip.effect = glass;
chip.effect === glass;          // false
chip.effect === chip.effect;    // false
```

所以判断一个效果视图用的是不是某个玻璃效果，不能用 `===`。要改玻璃的属性，改自己手里的那个对象，然后重新赋给 `effect`。

工厂方法每次调用都返回新的对象。`UIBlurEffect.effectWithStyle('dark')` 调两次，得到两个不相等的对象。

## 成员说明

### 继承关系

```
NSObject
├── UIVisualEffect              基类，不能 new
│   ├── UIBlurEffect
│   ├── UIVibrancyEffect
│   ├── UIGlassEffect
│   └── UIGlassContainerEffect
└── UIResponder
    └── UIView
        └── UIVisualEffectView
```

### `UIVisualEffectView`

#### `new UIVisualEffectView()`

```js
const panel = new UIVisualEffectView(blur);
const empty = new UIVisualEffectView();
```

- **参数**：一个效果对象，可以不给或给 `null`。不给时 `effect` 是 `null`。
- **出错**：参数不是效果对象也不是 `null` 时抛 `TypeError: UIVisualEffectView needs a UIVisualEffect or null`。传样式名字符串（`new UIVisualEffectView('systemMaterial')`）也是这个错，要先用工厂方法造出效果对象。

新建的效果视图大小是 0 × 0，要自己给 `frame` 或者用 [Auto Layout](auto-layout.md) 定位。

#### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `effect` | `UIVisualEffect` 或 `null` | 是 | 是 | 构造时给的，没给是 `null` | 显示哪个效果。读回来是不是同一个对象见[效果对象和副本](#效果对象和副本) |
| `contentView` | [`UIView`](ui-view.md) | 是 | 否 | — | 放内容的视图。大小跟随效果视图 |

- `effect` 写入不是效果的对象时抛 `TypeError: effect needs a UIVisualEffect or null`；写入字符串、数字时抛 `TypeError: effect needs a native object or null, got "systemMaterial"`。被拒之后 `effect` 保持原值。
- `effect` 变化没有事件。它只会被 App 自己的代码改。
- `contentView` 赋值会抛 `TypeError`。

以下属性继承自 [`UIView`](ui-view.md)，效果视图上的默认值是：

| 属性 | 默认值 | 说明 |
| --- | --- | --- |
| `backgroundColor` | `null` | 不需要设。效果自己决定底色 |
| `clipsToBounds` | `false` | 做圆角时要改成 `true` |
| `isUserInteractionEnabled` | `true` | 效果视图和 `contentView` 默认都接收触摸 |

#### 不能用的方法

`addSubview()` 和 `insertSubview()` 在效果视图上调用时抛 `TypeError`，见[内容加在 contentView 上](#内容加在-contentview-上)。在 `contentView` 上调用它们。

`subviews` 读出来的是效果视图内部使用的视图，其中包括 `contentView`。个数随效果变化，不要依赖它，也不要移动或移除这些视图。

### `UIBlurEffect.effectWithStyle()`

造一个模糊效果。

```js
const blur = UIBlurEffect.effectWithStyle('systemMaterial');
```

样式分三组。**各样式的实际观感未在模拟器验证**，下表的说明来自 Apple 的头文件和样式的名字。

| `style` | 效果 |
| --- | --- |
| `'systemUltraThinMaterial'` | 材质，最薄：后面的画面透出来最多。跟随[深浅色模式](ui-trait-collection.md) |
| `'systemThinMaterial'` | 材质，较薄。跟随深浅色模式 |
| `'systemMaterial'` | 材质，标准厚度。跟随深浅色模式 |
| `'systemThickMaterial'` | 材质，较厚：后面的画面透出来最少。跟随深浅色模式 |
| `'systemChromeMaterial'` | 材质，名字里的 chrome 指工具栏这类界面外框。跟随深浅色模式 |
| 上面五个加 `Light` 后缀，如 `'systemMaterialLight'` | 同一种材质，固定为浅色模式下的样子，不跟随深浅色模式 |
| 上面五个加 `Dark` 后缀，如 `'systemMaterialDark'` | 同一种材质，固定为深色模式下的样子 |
| `'regular'` | 浅色模式下等于 `'light'`，深色模式下等于 `'dark'` |
| `'prominent'` | 浅色模式下等于 `'extraLight'`，深色模式下等于 `'dark'` |
| `'extraLight'` | 模糊并盖一层很亮的颜色。不跟随深浅色模式 |
| `'light'` | 模糊并盖一层亮的颜色。不跟随深浅色模式 |
| `'dark'` | 模糊并盖一层暗的颜色。不跟随深浅色模式 |

- **返回**：新建的 `UIBlurEffect`。每次调用都是新的对象。
- **出错**：`style` 不在上表里时抛 `TypeError`，报错信息里列出所有可用的值，形如 `style has no value "frosted"; expected one of: extraLight / light / dark / …`。

模糊效果没有属性。造出来之后读不出它是哪种样式。

### `UIVibrancyEffect.effectForBlurEffect()`

造一个鲜明效果。

```js
const plain = UIVibrancyEffect.effectForBlurEffect(blur);
const forText = UIVibrancyEffect.effectForBlurEffect(blur, { style: 'secondaryLabel' });
```

- **`blurEffect`**：底下那块模糊用的效果对象，必填。
- **`style`**：可选，取值见下表。配 `system…Material` 的模糊时给一个 `style`；不给时是较早的那种鲜明效果，不区分内容的类型。
- **返回**：新建的 `UIVibrancyEffect`。每次调用都是新的对象。
- **出错**：
  - `blurEffect` 不是 `UIBlurEffect`（没给、`null`、别的效果、样式名字符串）：`TypeError: effectForBlurEffect needs a UIBlurEffect`
  - `style` 不在下表里：`TypeError`，报错信息里列出所有可用的值

#### 鲜明的样式

**各样式的实际观感未在模拟器验证**，说明来自 Apple 的头文件。

| `style` | 给什么内容用 |
| --- | --- |
| `'label'` | 文字，最醒目的一级。它保留内容自己的颜色 |
| `'secondaryLabel'` | 文字，次一级 |
| `'tertiaryLabel'` | 文字，再次一级 |
| `'quaternaryLabel'` | 文字，最淡的一级 |
| `'fill'` | 填充的色块，最醒目的一级 |
| `'secondaryFill'` | 填充的色块，次一级 |
| `'tertiaryFill'` | 填充的色块，最淡的一级 |
| `'separator'` | 分隔线 |

除 `'label'` 之外的样式只使用内容的透明度，内容自己的颜色被忽略。

鲜明效果没有属性。

### `UIGlassEffect`

#### `UIGlassEffect.effectWithStyle()`

```js
const glass = UIGlassEffect.effectWithStyle('regular');
```

| `style` | 效果 |
| --- | --- |
| `'regular'` | 标准的玻璃 |
| `'clear'` | 透明的玻璃 |

两种样式的实际观感**未在模拟器验证**。

- **返回**：新建的 `UIGlassEffect`。每次调用都是新的对象。
- **出错**：`style` 不是上面两个值时抛 `TypeError: style has no value "frosted"; expected one of: regular / clear`。

#### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `isInteractive` | 布尔 | 是 | 是 | `false` | `true` 时手指按在玻璃上，玻璃有反应；`false` 时没有 |
| `tintColor` | [颜色](ui-color.md)字符串或 `null` | 是 | 是 | `null` | 给玻璃染的颜色。`null` 是不染。写入接受颜色字符串或 `UIColor` 对象 |

- `tintColor` 写了不合法的颜色时不抛，输出一条警告，保留原值。这是所有颜色属性共同的行为，见[颜色](ui-color.md#写错不抛打警告)。
- 这两个属性只会被 App 自己的代码改，没有变化事件。
- 改这两个属性不影响已经用了这个效果的视图，见[效果对象和副本](#效果对象和副本)。

### `UIGlassContainerEffect`

#### `new UIGlassContainerEffect()`

没有参数。

#### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `spacing` | 数，单位 [pt](units.md) | 是 | 是 | `0` | 两块玻璃相距小于这个值时开始融合 |

- **出错**：写入负数抛 `TypeError: spacing must be a non-negative number`；写入转不成数的值抛 `TypeError: spacing must be a finite number, got "wide"`。
- 改 `spacing` 不影响已经用了这个效果的视图，见[效果对象和副本](#效果对象和副本)。

### `UIVisualEffect`

四种效果的基类。它没有成员，不能 `new`。它的用处是做类型：`effect` 属性接受任何一种效果。

`UIBlurEffect`、`UIVibrancyEffect`、`UIGlassEffect` 也不能 `new`，要用各自的工厂方法。`new UIBlurEffect()` 抛 `TypeError: Illegal constructor: UIBlurEffect is not created with new; use UIBlurEffect.effectWithStyle(style)`。

## 与 iOS 原生写法的对照

如果你在看 Apple 的文档或 iOS 的示例代码，按这张表换成 JS 的写法。

| ObjC | JS |
| --- | --- |
| `[UIBlurEffect effectWithStyle:UIBlurEffectStyleSystemMaterial]` | `UIBlurEffect.effectWithStyle('systemMaterial')` |
| `[UIVibrancyEffect effectForBlurEffect:blur]` | `UIVibrancyEffect.effectForBlurEffect(blur)` |
| `[UIVibrancyEffect effectForBlurEffect:blur style:UIVibrancyEffectStyleLabel]` | `UIVibrancyEffect.effectForBlurEffect(blur, { style: 'label' })` |
| `[UIGlassEffect effectWithStyle:UIGlassEffectStyleRegular]` | `UIGlassEffect.effectWithStyle('regular')` |
| `glass.interactive = YES` | `glass.isInteractive = true` |
| `glass.tintColor = color` | `glass.tintColor = '#FF2D55'` |
| `[[UIGlassContainerEffect alloc] init]` | `new UIGlassContainerEffect()` |
| `container.spacing = 16` | `container.spacing = 16` |
| `[[UIVisualEffectView alloc] initWithEffect:blur]` | `new UIVisualEffectView(blur)` |
| `view.effect = nil` | `view.effect = null` |
| `[view.contentView addSubview:label]` | `view.contentView.addSubview(label)` |

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 用一个纯色当效果 | `UIColorEffect`（它的工厂方法从 iOS 26.1 才有） | 未实现 |
| 换效果时带过渡动画 | 在 `UIView` 的动画里改 `effect` | 未实现 |
| 给玻璃指定和系统控件一致的圆角 | `UIView.cornerConfiguration` | 未实现 |
| 读出一个模糊或鲜明效果是哪种样式 | 无，iOS 没有公开这个属性 | 做不到 |
| 用 tvOS 的 `extraDark` 模糊 | `UIBlurEffectStyleExtraDark`，iOS 上不可用 | 不适用 |

## 参见

- [`UIView`](ui-view.md)：效果视图的父类，位置、大小、层级
- [`CALayer`](ca-layer.md)：`layer.cornerRadius`，做圆角用
- [颜色](ui-color.md)：`tintColor` 的写法，写错时的行为
- [外观特征](ui-trait-collection.md)：深浅色模式，多数模糊样式跟随它
- [枚举](enums.md)：样式为什么是字符串
- [单位](units.md)
- [实现原理：毛玻璃](../internals/effects.md)
