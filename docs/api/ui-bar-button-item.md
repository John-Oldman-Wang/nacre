---
type: reference
native: UIBarButtonItem
status: partial
---

# `UIBarButtonItem`

**`UIBarButtonItem`** 表示导航条上的一个按钮。导航条是 [`UINavigationController`](ui-navigation-controller.md) 在屏幕顶部画的一条，上面有正中的标题、左侧的返回按钮、左右两侧的按钮。用户点了按钮，按钮派发 [`click`](ui-bar-button-item/click-event.md) 事件。

导航条上的东西由三个类描述：

- [`UINavigationItem`](ui-navigation-item.md) 表示一个页面在导航条上的配置：标题、副标题、返回按钮上的字、左右两侧各有哪些按钮。每个页面自带一个，从页面的 [`navigationItem`](ui-view-controller/navigationitem.md) 读到。
- `UIBarButtonItem`（本页）表示其中的一个按钮。
- [`UIBarItem`](ui-bar-item.md) 是 `UIBarButtonItem` 和 [`UITabBarItem`](ui-tab-bar-item.md) 共同的父类，提供 `title`、`image`、`isEnabled`、`tag` 四个属性。

按钮放进页面的 [`rightBarButtonItems`](ui-navigation-item/rightbarbuttonitems.md) 或 [`leftBarButtonItems`](ui-navigation-item/leftbarbuttonitems.md) 才显示。

**继承关系**：`EventTarget` → `NSObject` → [`UIBarItem`](ui-bar-item.md) → `UIBarButtonItem`

怎么在导航条上放按钮、改标题和返回按钮，见指南[在导航条上放按钮和标题](../guides/bar-buttons.md)。

## 构造函数

[`UIBarButtonItem()`](ui-bar-button-item/constructor.md)

创建一个按钮，可以同时给出文字、图标、样式，或者一个代替按钮的视图。

## 静态方法

| 方法 | 说明 |
| --- | --- |
| [`UIBarButtonItem.systemItem()`](ui-bar-button-item/systemitem.md) | 创建一个系统预置的按钮，比如加号、分享、完成 |
| [`UIBarButtonItem.flexibleSpace()`](ui-bar-button-item/flexiblespace.md) | 创建一个宽度自动伸缩的空白 |
| [`UIBarButtonItem.fixedSpace()`](ui-bar-button-item/fixedspace.md) | 创建一个固定宽度的空白 |

## 实例属性

还继承 [`UIBarItem`](ui-bar-item.md) 的属性：[`title`](ui-bar-item/title.md)、[`image`](ui-bar-item/image.md)、[`isEnabled`](ui-bar-item/isenabled.md)、[`tag`](ui-bar-item/tag.md)。

| 属性 | 说明 |
| --- | --- |
| [`style`](ui-bar-button-item/style.md) | 样式：普通，或者强调这个页面最主要的操作 |
| [`width`](ui-bar-button-item/width.md) | 宽度。只对固定宽度的空白有意义 |
| [`isHidden`](ui-bar-button-item/ishidden.md) | 暂时不显示 |
| [`customView`](ui-bar-button-item/customview.md) | 代替系统画的按钮的视图 |

## 事件

| 事件 | 什么时候派发 |
| --- | --- |
| [`click`](ui-bar-button-item/click-event.md) | 用户点了这个按钮 |

## 按钮不是视图

`UIBarButtonItem` 只描述「这里要一个按钮，上面写什么、是什么样式」，由系统按这份描述画出按钮。它不是 [`UIView`](ui-view.md)：

- 没有 `frame`、`backgroundColor`，不能 `addSubview()`。按钮的位置和大小由系统安排。
- 没有 [`UIControl`](ui-control.md) 的那些触摸事件，只有一个 `click`。

要在导航条上放一个完全自己画的东西，把一个视图交给 [`customView`](ui-bar-button-item/customview.md)。

## 示例

### 编辑页右上角的「保存」

从空白 App 开始：首页上有一个按钮，点它进入「编辑」页；「编辑」页的导航条右侧有一个「保存」按钮，点它在控制台输出一行并返回首页。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const home = new UIViewController();
  home.title = '首页';
  home.view.backgroundColor = 'systemBackground';
  const nav = new UINavigationController(home);
  win.rootViewController = nav;
  win.makeKeyAndVisible();

  function makeEditor() {
    const page = new UIViewController();
    page.title = '编辑';
    page.view.backgroundColor = 'systemBackground';
    const save = new UIBarButtonItem({ title: '保存', style: 'prominent' });
    save.addEventListener('click', () => {
      console.log('保存了');
      nav.popViewController({ animated: true });
    });
    page.navigationItem.rightBarButtonItems = [save];
    return page;
  }

  const open = UIButton.buttonWithType('system');
  open.setTitle('去编辑', { forState: ['normal'] });
  open.translatesAutoresizingMaskIntoConstraints = false;
  home.view.addSubview(open);
  NSLayoutConstraint.activateConstraints([
    open.centerXAnchor.constraintEqualToAnchor(home.view.centerXAnchor),
    open.centerYAnchor.constraintEqualToAnchor(home.view.centerYAnchor),
  ]);
  open.addEventListener('click', () => {
    nav.pushViewController(makeEditor(), { animated: true });
  });
});
```

**效果**

- 首页的导航条正中是「首页」，左右两侧没有按钮。
- 点「去编辑」，进入编辑页。导航条正中是「编辑」，左侧是写着「首页」的返回按钮，右侧是「保存」按钮。
- 点「保存」，控制台输出 `保存了`，屏幕回到首页。

导航条右侧的按钮能显示、能点击，在验收用例里用真实的点击验证过。`'prominent'` 样式画出来的样子**未在模拟器验证**。这段代码没有作为一个整体在模拟器运行过，其中用到的每个 API 都在验收用例里运行过。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[UIBarButtonItem alloc] initWithTitle:@"保存" style:UIBarButtonItemStyleProminent target:self action:@selector(save)]` | `new UIBarButtonItem({ title: '保存', style: 'prominent' })`，再 `addEventListener('click', save)` |
| `[[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemAdd target:… action:…]` | `UIBarButtonItem.systemItem('add')` |
| `[[UIBarButtonItem alloc] initWithCustomView:v]` | `new UIBarButtonItem({ customView: v })` |
| `[UIBarButtonItem flexibleSpaceItem]` | `UIBarButtonItem.flexibleSpace()` |
| `[UIBarButtonItem fixedSpaceItemOfWidth:20]` | `UIBarButtonItem.fixedSpace(20)` |
| `item.style = UIBarButtonItemStyleDone` | `item.style = 'done'`（读回 `'prominent'`） |
| `item.enabled = NO` | `item.isEnabled = false` |
| `item.hidden = YES` | `item.isHidden = true` |
| `item.target` / `item.action` | 不开放。用 `addEventListener()` |
| `UIBarButtonItemStyleBordered` | 不开放。Apple 已废弃 |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 点按钮弹出菜单 | `UIMenu`、`UIAction`、`primaryAction`、`menu` |
| 调整图标的位置、横屏时换一张图 | `imageInsets`、`landscapeImagePhone` |
| 统一定制所有按钮的外观 | `UIAppearance`、`setBackgroundImage:forState:barMetrics:` |
| 给按钮单独设颜色 | `tintColor` |

## 参见

- [在导航条上放按钮和标题](../guides/bar-buttons.md)：放按钮、图标、预置按钮、禁用、返回按钮
- [`UINavigationItem`](ui-navigation-item.md)：按钮放在哪里
- [`UIBarItem`](ui-bar-item.md)：父类，`title`、`image`、`isEnabled`、`tag`
- [`UINavigationController`](ui-navigation-controller.md)：导航条由它显示
- [`UIButton`](ui-button.md)：页面里的按钮。点击事件同名
- [实现原理：导航](../internals/navigation.md)
