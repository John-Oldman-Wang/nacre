# 做模糊和玻璃效果

这一篇讲怎么用 [`UIVisualEffectView`](../api/ui-visual-effect-view.md) 做半透明的模糊面板、让面板上的文字更鲜明、用 iOS 26 的玻璃，以及看不出效果时查哪里。效果对象的细节在 [`UIBlurEffect`](../api/ui-blur-effect.md)、[`UIVibrancyEffect`](../api/ui-vibrancy-effect.md)、[`UIGlassEffect`](../api/ui-glass-effect.md)、[`UIGlassContainerEffect`](../api/ui-glass-container-effect.md) 的参考页。

这一篇描述的屏幕效果（糊成什么样、玻璃是什么质感）全部**未在模拟器验证**。

## 推荐的做法

- **内容加在 [`contentView`](../api/ui-visual-effect-view/contentview.md) 上。** 直接对效果视图调 `addSubview()` 或 `insertSubview()` 会抛 `TypeError`。
- **模糊和鲜明效果可以共用。** 它们不可变，同一个对象可以交给多个效果视图，不必为每个视图各造一个。
- **玻璃效果先把属性设好，再交给视图。** 效果视图保存的是赋值那一刻的副本，之后要改，改完重新赋一次，见[改一块已经在用的玻璃](#改一块已经在用的玻璃)。
- **鲜明效果要多套一层效果视图。** 它不是加在模糊面板自己身上的，写法见[让面板上的文字更鲜明](#让面板上的文字更鲜明)。

## 第一个例子

从空白 App 开始，放四条彩色的色块，再在上面盖一块模糊的面板，面板上有一行字。

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

这段代码没有在模拟器运行过。长度的单位见[单位](../api/units.md)。

三步分别是：准备后面的画面、造效果并交给效果视图、把内容加到 `contentView`。下面各节沿用这里的 `page`、`blur`、`panel` 和 `label`。单独试某一节时，先写这几行：

```js
const page = new UIViewController();
const blur = UIBlurEffect.effectWithStyle('systemMaterial');
const panel = new UIVisualEffectView(blur);
page.view.addSubview(panel);
const label = new UILabel();
panel.contentView.addSubview(label);
```

## 为什么看不出效果

效果处理的是效果视图**后面**的画面。以下情况效果不明显或者不显示：

- **后面没有东西可处理。** 效果视图后面是一片纯色时，模糊之后仍然是一片纯色，看不出模糊。
- **效果视图或它的某一层父视图的 `alpha` 小于 1。** Apple 在头文件里注明这种情况下很多效果显示不正确或者完全不显示。要让内容半透明，改 `contentView` 里面的视图的 `alpha`。
- **`effect` 是 `null`。** 没有效果时效果视图只是一个装着 `contentView` 的容器。

这三条都**未在模拟器验证**。

## 换一种模糊

```js
panel.effect = UIBlurEffect.effectWithStyle('systemThinMaterialDark');
```

**效果**：面板换成较薄的、固定为深色的模糊。`contentView` 里的字还在。**未在模拟器验证。**

全部样式见 [`UIBlurEffect.effectWithStyle()`](../api/ui-blur-effect/effectwithstyle.md)。

## 让面板上的文字更鲜明

鲜明效果用在**另一个**效果视图上。这个效果视图放在模糊面板的 `contentView` 里，文字再放进它的 `contentView`。

```js
const vivid = new UIVisualEffectView(
  UIVibrancyEffect.effectForBlurEffect(blur, { style: 'label' }));
vivid.frame = new CGRect(0, 0, 240, 80);
panel.contentView.addSubview(vivid);

vivid.contentView.addSubview(label);   // label 从 panel.contentView 移到这里
```

**效果**：文字带上面板后面画面的颜色。**未在模拟器验证。**

`effectForBlurEffect()` 的第一个参数是面板用的那个模糊效果，鲜明效果按它来配。`style` 按内容是什么来选，见 [`UIVibrancyEffect.effectForBlurEffect()`](../api/ui-vibrancy-effect/effectforblureffect.md)。

## 用玻璃

```js
const glass = UIGlassEffect.effectWithStyle('regular');
const chip = new UIVisualEffectView(glass);
chip.frame = new CGRect(60, 360, 120, 44);
page.view.addSubview(chip);
```

**效果**：色块上多出一块 120 × 44 pt 的玻璃。**未在模拟器验证。**

## 给玻璃染色，让它对触摸有反应

```js
const tinted = UIGlassEffect.effectWithStyle('clear');
tinted.tintColor = 'rgba(255, 45, 85, 0.35)';
tinted.isInteractive = true;
const tintedChip = new UIVisualEffectView(tinted);
```

**效果**：玻璃带一层粉色。手指按在上面时玻璃有反应。**未在模拟器验证。**

颜色的写法见[颜色](../api/ui-color.md)。

## 改一块已经在用的玻璃

效果视图保存的是赋值时的副本，所以改完要重新赋一次。开头三行建出[用玻璃](#用玻璃)那一节的 `glass` 和 `chip`。

```js
const glass = UIGlassEffect.effectWithStyle('regular');
const chip = new UIVisualEffectView(glass);
page.view.addSubview(chip);

glass.tintColor = '#34C759';   // 这一行之后 chip 还是原来的颜色
chip.effect = glass;           // 重新赋一次才生效
```

**效果**：第二行执行之后，`chip.effect` 读出来的玻璃效果，`tintColor` 是 `'#34C759'`。屏幕上玻璃变成绿色**未在模拟器验证**。

`chip.effect === glass` 是 `false`：读回来的是副本。判断一个效果视图用的是不是某个玻璃效果，不能用 `===`，见 [`effect`](../api/ui-visual-effect-view/effect.md)。

## 把几块玻璃合成一组

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

## 加圆角

效果视图默认不裁剪。圆角要同时打开 `clipsToBounds`。

```js
panel.layer.cornerRadius = 16;
panel.clipsToBounds = true;
```

**效果**：面板的四个角变成半径 16 pt 的圆角，模糊的范围也跟着变成圆角。**未在模拟器验证。**

## 去掉效果

```js
panel.effect = null;
```

**效果**：`panel.effect` 读出来是 `null`。`contentView` 和里面的内容不变。面板不再模糊后面的画面**未在模拟器验证**。

## 参见

- [`UIVisualEffectView`](../api/ui-visual-effect-view.md)：效果视图，效果对象和副本
- [`UIBlurEffect`](../api/ui-blur-effect.md)、[`UIVibrancyEffect`](../api/ui-vibrancy-effect.md)、[`UIGlassEffect`](../api/ui-glass-effect.md)、[`UIGlassContainerEffect`](../api/ui-glass-container-effect.md)：四种效果
- [`CALayer`](../api/ca-layer.md)：`layer.cornerRadius`
- [外观特征](../api/ui-trait-collection.md)：深浅色模式，多数模糊样式跟随它
