---
type: reference
native: UIToolbar
status: partial
---

# `UIToolbar`

**`UIToolbar`** 表示一条工具条：一个横条，里面从左到右排着若干个按钮。每个按钮是一个 [`UIBarButtonItem`](ui-bar-button-item.md)，和导航条上的按钮是同一种对象。

工具条放在哪里由 App 决定，常见的是页面底部，或者键盘的上方。工具条不是控件，自己不派发事件：点击来自里面的每一个 `UIBarButtonItem`，在哪个按钮上监听 `click`，就在哪个按钮被点时收到。

按钮之间的空白也是一个项：弹性空白 `UIBarButtonItem.flexibleSpace()` 占满剩下的宽度，固定空白 `UIBarButtonItem.fixedSpace(width)` 占给定的宽度。工具条没有对齐和间距的属性。

这一组页面里的数值和状态变化（默认值、大小、读写的结果、报错）是在模拟器（iPhone Air，iOS 27.2）上的 App 里对没有放进窗口的工具条量的。画面上的样子（按钮怎么排、颜色、动画）和真实点击**未在模拟器验证**。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → `UIToolbar`

怎么排按钮、怎么放到页面底部和键盘上方，见指南[做一个工具条](../guides/toolbars.md)。

## 构造函数

[`UIToolbar()`](ui-toolbar/constructor.md)

创建一条空的工具条，`frame` 是 0 × 0。

## 实例属性

还继承 [`UIView`](ui-view.md) 的属性。工具条常用的继承属性是 `frame`、`isHidden`、`intrinsicContentSize`。

| 属性 | 说明 |
| --- | --- |
| [`items`](ui-toolbar/items.md) | 工具条上的项，从左到右。读出来是一份快照 |
| [`barStyle`](ui-toolbar/barstyle.md) | 条的明暗样式 |
| [`isTranslucent`](ui-toolbar/istranslucent.md) | 条的背景是不是半透明的 |
| [`tintColor`](ui-toolbar/tintcolor.md) | 按钮的文字和图标的颜色 |
| [`barTintColor`](ui-toolbar/bartintcolor.md) | 条自己的底色 |

## 实例方法

还继承 [`UIView`](ui-view.md) 的方法，比如 `sizeToFit()`。

| 方法 | 说明 |
| --- | --- |
| [`setItems()`](ui-toolbar/setitems.md) | 换一组项，可以带动画 |

## 事件

工具条自己没有事件。点击在每个 [`UIBarButtonItem`](ui-bar-button-item.md) 上监听 `click`。

## 大小

新建的工具条 `frame` 是 0 × 0。它自己想要的高度是 48 pt，对宽度没有要求：`intrinsicContentSize` 读出来宽是 -1（没有要求），高是 48。

- 用 [Auto Layout](auto-layout.md) 定位时，约束左右两边和上边（或下边），高度不用约束。
- 用 `frame` 定位时，先写 `frame` 给出位置和宽度，再调一次 `sizeToFit()`。`sizeToFit()` 只改高度，宽度和位置不变。

48 pt 是在 iPhone Air 模拟器（iOS 27.2）上量到的，别的机型和系统版本上是不是同一个数**未验证**。需要知道高度时读 `intrinsicContentSize.height`，不要把这个数写进代码。

## 示例

### 页面底部的工具条

从空白 App 开始，在页面底部放一条工具条，左边一个加号，右边一个垃圾桶。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const toolbar = new UIToolbar();
  const add = UIBarButtonItem.systemItem('add');
  add.addEventListener('click', () => console.log('新建'));
  const trash = UIBarButtonItem.systemItem('trash');
  trash.addEventListener('click', () => console.log('删除'));
  toolbar.items = [add, UIBarButtonItem.flexibleSpace(), trash];

  const safe = page.view.safeAreaLayoutGuide;
  toolbar.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(toolbar);
  NSLayoutConstraint.activateConstraints([
    toolbar.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor),
    toolbar.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor),
    toolbar.bottomAnchor.constraintEqualToAnchor(safe.bottomAnchor),
  ]);
});
```

**效果**

- 页面底部出现一条 48 pt 高的横条，左端一个加号，右端一个垃圾桶。
- 点加号，控制台输出 `新建`；点垃圾桶，输出 `删除`。

这段代码没有作为一个整体在模拟器运行过。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[UIToolbar alloc] init]` | `new UIToolbar()` |
| `toolbar.items = @[a, b]` | `toolbar.items = [a, b]` |
| `toolbar.items = nil` | `toolbar.items = null`（读回来是 `[]`） |
| `[toolbar setItems:@[a, b] animated:YES]` | `toolbar.setItems([a, b], { animated: true })` |
| `toolbar.barStyle = UIBarStyleBlack` | `toolbar.barStyle = 'black'` |
| `toolbar.translucent = NO` | `toolbar.isTranslucent = false` |
| `toolbar.tintColor = UIColor.systemRedColor` | `toolbar.tintColor = 'systemRed'` |
| `toolbar.barTintColor = nil` | `toolbar.barTintColor = null` |
| `[UIBarButtonItem flexibleSpaceItem]` | `UIBarButtonItem.flexibleSpace()` |
| `[UIBarButtonItem fixedSpaceItemOfWidth:24]` | `UIBarButtonItem.fixedSpace(24)` |

## 参见

- [做一个工具条](../guides/toolbars.md)：排按钮、放到页面底部和键盘上方
- [`UIBarButtonItem`](ui-bar-button-item.md)：`UIBarButtonItem` 怎么创建、有哪些成员
- [`UISearchBar`](ui-search-bar.md)：它的 `inputAccessoryView` 可以放工具条
- [`UIView`](ui-view.md)：工具条的父类，位置、大小、隐藏
