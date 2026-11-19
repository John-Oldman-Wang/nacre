---
type: reference
native: UIVisualEffectView
status: partial
---

# `UIVisualEffectView`

**`UIVisualEffectView`** 表示一块带效果的区域。它对自己**后面**的画面做一种处理，比如把它变模糊，再把处理后的结果显示出来。半透明的面板、浮在内容上面的工具条、玻璃质感的按钮底，都用它做。下文把它叫作效果视图。

效果视图自己不决定做哪种处理，这由交给它的**效果**对象决定。效果对象不显示任何东西，只有交给效果视图才看得见。效果有四种，它们的父类是 [`UIVisualEffect`](ui-visual-effect.md)：

| 类 | 做什么 | 怎么得到 |
| --- | --- | --- |
| [`UIBlurEffect`](ui-blur-effect.md) | 模糊：把后面的画面变模糊，并盖上一层半透明的颜色 | `UIBlurEffect.effectWithStyle(style)` |
| [`UIVibrancyEffect`](ui-vibrancy-effect.md) | 鲜明：让放在模糊上面的文字和图标带上底下画面的颜色 | `UIVibrancyEffect.effectForBlurEffect(blur, { style })` |
| [`UIGlassEffect`](ui-glass-effect.md) | 玻璃：iOS 26 的新材质 | `UIGlassEffect.effectWithStyle(style)` |
| [`UIGlassContainerEffect`](ui-glass-container-effect.md) | 玻璃容器：把几块玻璃合成一组来画 | `new UIGlassContainerEffect()` |

内容加在效果视图的 [`contentView`](ui-visual-effect-view/contentview.md) 上，直接加在效果视图上会抛 `TypeError`。效果视图默认不裁剪，要圆角就设 `layer.cornerRadius` 并打开 `clipsToBounds`。

效果视图是[视图](ui-view.md)：位置、大小、圆角、隐藏都按视图的写法。

本页和成员页描述的屏幕效果（糊成什么样、玻璃是什么质感）全部**未在模拟器验证**。各成员的默认值、效果读回来是不是同一个对象、直接加子视图会被拒，是在模拟器上用原生代码实测的。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → `UIVisualEffectView`

怎么做一块模糊面板、让文字更鲜明、用玻璃，见指南[做模糊和玻璃效果](../guides/blur-and-glass.md)。

## 构造函数

[`UIVisualEffectView()`](ui-visual-effect-view/constructor.md)

创建一个效果视图，可以同时给它一个效果。

## 实例属性

还继承 [`UIView`](ui-view.md) 的属性。效果视图常用的继承属性是 `frame`、`layer`、`clipsToBounds`。

| 属性 | 说明 |
| --- | --- |
| [`effect`](ui-visual-effect-view/effect.md) | 显示哪个效果。`null` 是没有效果 |
| [`contentView`](ui-visual-effect-view/contentview.md) <small>只读</small> | 放内容的视图，大小跟着效果视图走 |

## 实例方法

继承 [`UIView`](ui-view.md) 的方法。其中 `addSubview()` 和 `insertSubview()` 在效果视图上调用时抛 `TypeError`，要在 `contentView` 上调用，见 [`contentView`](ui-visual-effect-view/contentview.md)。

## 效果处理的是后面的画面

效果视图不改变加在它 `contentView` 里的内容，它改变的是视图树里排在它后面、被它盖住的那部分画面。所以效果视图要放在要处理的内容**上面**：后加的视图在上面。

## 效果对象和副本

四种效果在「读回来是不是同一个对象」上分成两类：

| | 模糊、鲜明 | 玻璃、玻璃容器 |
| --- | --- | --- |
| 有没有可写的属性 | 没有 | 有 |
| 赋给 `effect` 之后读回来 | 是写进去的那个对象 | 是一份副本，不是写进去的那个对象 |
| 连续读两次 `effect` | 同一个对象 | 两个不同的对象 |
| 赋值之后改原来的对象 | 不适用 | 效果视图不跟着变 |
| 改读回来的对象 | 不适用 | 效果视图不跟着变 |

所以判断一个效果视图用的是不是某个玻璃效果，不能用 `===`。要改玻璃的属性，改自己手里的那个对象，然后重新赋给 `effect`。

工厂方法每次调用都返回新的对象。`UIBlurEffect.effectWithStyle('dark')` 调两次，得到两个不相等的对象。

## 示例

从空白 App 开始，放四条彩色的色块，再在上面盖一块模糊的面板，面板上有一行字。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  ['systemRed', 'systemOrange', 'systemGreen', 'systemBlue'].forEach((color, i) => {
    const stripe = new UIView();
    stripe.frame = new CGRect(40 + i * 70, 200, 70, 200);
    stripe.backgroundColor = color;
    page.view.addSubview(stripe);
  });

  const blur = UIBlurEffect.effectWithStyle('systemMaterial');
  const panel = new UIVisualEffectView(blur);
  panel.frame = new CGRect(60, 260, 240, 80);
  page.view.addSubview(panel);

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

这段代码没有在模拟器运行过。

更多写法见指南[做模糊和玻璃效果](../guides/blur-and-glass.md)。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[UIVisualEffectView alloc] initWithEffect:blur]` | `new UIVisualEffectView(blur)` |
| `view.effect = nil` | `view.effect = null` |
| `[view.contentView addSubview:label]` | `view.contentView.addSubview(label)` |

## 参见

- [做模糊和玻璃效果](../guides/blur-and-glass.md)：为什么看不出效果、鲜明的文字、玻璃、圆角
- [`UIBlurEffect`](ui-blur-effect.md)、[`UIVibrancyEffect`](ui-vibrancy-effect.md)、[`UIGlassEffect`](ui-glass-effect.md)、[`UIGlassContainerEffect`](ui-glass-container-effect.md)：四种效果
- [`UIView`](ui-view.md)：父类，位置、大小、层级
- [`CALayer`](ca-layer.md)：`layer.cornerRadius`，做圆角用
