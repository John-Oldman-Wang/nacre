---
type: reference
native: UILayoutGuide
---

# `UILayoutGuide`

**`UILayoutGuide`** 表示一个只参与布局、不显示的矩形，叫 layout guide。它有和视图一样的锚点，可以用来建约束，但它不是视图：没有底色，不接收触摸，不出现在 `subviews` 里。

layout guide 用来占位、分组和对齐。需要一个只参与布局的矩形时，用它，不要建透明的 `UIView`。系统也提供几个现成的 layout guide，比如代表安全区的 `view.safeAreaLayoutGuide`。

**继承关系**：`EventTarget` → `NSObject` → `UILayoutGuide`

子类：[`UIKeyboardLayoutGuide`](ui-keyboard-layout-guide.md)（中间隔着 `UITrackingLayoutGuide`，那一层没有自己的成员）。

用法见指南[用约束排版](../guides/auto-layout.md#用不显示的矩形占位)。

## 构造函数

[`UILayoutGuide()`](ui-layout-guide/constructor.md)

创建一个 layout guide。要先用视图的 [`addLayoutGuide()`](ui-view/addlayoutguide.md) 加到一个视图上才能用。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`owningView`](ui-layout-guide/owningview.md) <small>只读</small> | 它被加到了哪个视图上 |
| [`layoutFrame`](ui-layout-guide/layoutframe.md) <small>只读</small> | 布局算出的矩形，在 `owningView` 的坐标系里 |
| [`identifier`](ui-layout-guide/identifier.md) | 调试时辨认用的名字 |

10 个锚点，含义和视图上的同名锚点相同。比视图少两个基线锚点，因为它没有文字：

| 属性 | 说明 |
| --- | --- |
| [`leadingAnchor`](ui-layout-guide/leadinganchor.md) <small>只读</small> | 起始边 |
| [`trailingAnchor`](ui-layout-guide/trailinganchor.md) <small>只读</small> | 结束边 |
| [`leftAnchor`](ui-layout-guide/leftanchor.md) <small>只读</small> | 左边 |
| [`rightAnchor`](ui-layout-guide/rightanchor.md) <small>只读</small> | 右边 |
| [`centerXAnchor`](ui-layout-guide/centerxanchor.md) <small>只读</small> | 水平中心线 |
| [`topAnchor`](ui-layout-guide/topanchor.md) <small>只读</small> | 上边 |
| [`bottomAnchor`](ui-layout-guide/bottomanchor.md) <small>只读</small> | 下边 |
| [`centerYAnchor`](ui-layout-guide/centeryanchor.md) <small>只读</small> | 垂直中心线 |
| [`widthAnchor`](ui-layout-guide/widthanchor.md) <small>只读</small> | 宽度 |
| [`heightAnchor`](ui-layout-guide/heightanchor.md) <small>只读</small> | 高度 |

## 事件

`UILayoutGuide` 不派发事件。`layoutFrame` 变化时没有通知，需要时在 `layoutIfNeeded()` 之后读。

## 概念

layout guide 是一个只参与布局、不显示的矩形。它有和视图一样的锚点，可以和它建约束。它不是视图：没有底色，不接收触摸，不出现在 `subviews` 里。

### 系统提供的 layout guide

从视图的属性上读：

| 属性 | 代表的区域 |
| --- | --- |
| [`view.safeAreaLayoutGuide`](ui-view/safearealayoutguide.md) | 安全区：视图里不会被刘海、状态栏、屏幕圆角和底部横条遮挡的部分 |
| [`view.layoutMarginsGuide`](ui-view/layoutmarginsguide.md) | 视图四边各向内缩进[内边距](ui-view/directionallayoutmargins.md)之后的区域。内边距默认四边各 8 pt，可以改 |
| [`view.readableContentGuide`](ui-view/readablecontentguide.md) | 适合阅读长文字的宽度范围。视图很宽时它比视图窄 |
| [`view.keyboardLayoutGuide`](ui-view/keyboardlayoutguide.md) | 键盘占的区域。见 [`UIKeyboardLayoutGuide`](ui-keyboard-layout-guide.md) |
| `scrollView.contentLayoutGuide`、`frameLayoutGuide` | 滚动视图的内容区和可视区。见 [`UIScrollView`](ui-scroll-view.md) |

`layoutMarginsGuide` 和 `readableContentGuide` 的具体范围**未在模拟器验证**。

### 自己建的 layout guide

用 `new UILayoutGuide()` 创建，再用 `view.addLayoutGuide()` 加到一个视图上。加上去之后才能和它建约束。例子见[用不显示的矩形占位](../guides/auto-layout.md#用不显示的矩形占位)。常见用途：

- 占位：表示一段间隔，让多个间隔相等。
- 分组：把几个视图框在一个矩形里，再让这个矩形整体居中。

layout guide 的大小和位置同样要由约束确定。布局完成后，从 `layoutFrame` 读出它的矩形。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 一个不显示的矩形，占满安全区的上半部分
  const top = new UILayoutGuide();
  page.view.addLayoutGuide(top);
  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    top.topAnchor.constraintEqualToAnchor(safe.topAnchor),
    top.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor),
    top.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor),
    top.heightAnchor.constraintEqualToAnchor(safe.heightAnchor, { multiplier: 0.5 }),
  ]);

  // 一个方块在这个矩形里居中
  const box = new UIView();
  box.backgroundColor = 'systemOrange';
  box.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(box);
  NSLayoutConstraint.activateConstraints([
    box.centerXAnchor.constraintEqualToAnchor(top.centerXAnchor),
    box.centerYAnchor.constraintEqualToAnchor(top.centerYAnchor),
    box.widthAnchor.constraintEqualToConstant(80),
    box.heightAnchor.constraintEqualToConstant(80),
  ]);
});
```

**效果**：一个 80 × 80 pt 的橙色方块，在安全区上半部分的正中。layout guide 本身看不见。**这段代码未在模拟器验证。**

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[UILayoutGuide alloc] init]` | `new UILayoutGuide()` |
| `[view addLayoutGuide:guide]` | `view.addLayoutGuide(guide)` |
| `view.safeAreaLayoutGuide` | `view.safeAreaLayoutGuide` |
| `guide.layoutFrame` | `guide.layoutFrame` |

## 参见

- [`NSLayoutConstraint`](auto-layout.md)
- [`UIView`](ui-view.md)：`addLayoutGuide()`、`removeLayoutGuide()`、`layoutGuides` 和系统提供的几个 layout guide
- [`UIKeyboardLayoutGuide`](ui-keyboard-layout-guide.md)
- [`UIScrollView`](ui-scroll-view.md)：`contentLayoutGuide`、`frameLayoutGuide`
