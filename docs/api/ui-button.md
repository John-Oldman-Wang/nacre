---
type: reference
native: UIButton
status: partial
---

# `UIButton`

**`UIButton`** 表示一个按钮：屏幕上一块可以点击的区域，上面显示文字、图标，或者两者都有。用户点击按钮时，按钮派发 [`click`](ui-control/click-event.md) 事件。

按钮的文字、文字颜色、图标和背景图按[状态](#状态)分别设置，按钮显示当前状态对应的那一套。

按钮是[控件](ui-control.md)：禁用、状态和事件来自 `UIControl`。控件又是[视图](ui-view.md)：位置、大小、底色、圆角来自 `UIView`。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → [`UIControl`](ui-control.md) → `UIButton`

怎么做一个能用的按钮，见指南[做一个按钮](../guides/buttons.md)。

## 构造函数

[`UIButton()`](ui-button/constructor.md)

创建一个 `custom` 类型的按钮。系统不给它默认外观。

## 静态方法

[`UIButton.buttonWithType()`](ui-button/buttonwithtype.md)

创建一个指定类型的按钮。普通的文字按钮用 `'system'`。

## 实例属性

还继承 [`UIControl`](ui-control.md) 和 [`UIView`](ui-view.md) 的属性。按钮常用的继承属性是 `isEnabled`、`isSelected`、`backgroundColor`、`layer`。

| 属性 | 说明 |
| --- | --- |
| [`buttonType`](ui-button/buttontype.md) <small>只读</small> | 按钮的类型，创建时确定 |
| [`role`](ui-button/role.md) | 按钮的用途。系统据此调整外观 |
| [`currentTitle`](ui-button/currenttitle.md) <small>只读</small> | 按钮此刻显示的文字 |
| [`currentTitleColor`](ui-button/currenttitlecolor.md) <small>只读</small> | 按钮此刻的文字颜色 |
| [`currentImage`](ui-button/currentimage.md) <small>只读</small> | 按钮此刻显示的图标 |
| [`currentBackgroundImage`](ui-button/currentbackgroundimage.md) <small>只读</small> | 按钮此刻显示的背景图 |
| [`currentAttributedTitle`](ui-button/currentattributedtitle.md) <small>只读</small> | 按钮此刻显示的带样式的文字 |
| [`titleLabel`](ui-button/titlelabel.md) <small>只读</small> | 显示文字的 `UILabel`。用来设字体和行数 |
| [`imageView`](ui-button/imageview.md) <small>只读</small> | 显示图标的 `UIImageView` |

## 实例方法

还继承 [`UIControl`](ui-control.md) 和 [`UIView`](ui-view.md) 的方法。

设置的方法都带 `{ forState }`，给一个或几个状态设值：

| 方法 | 说明 |
| --- | --- |
| [`setTitle()`](ui-button/settitle.md) | 设文字 |
| [`setTitleColor()`](ui-button/settitlecolor.md) | 设文字颜色 |
| [`setImage()`](ui-button/setimage.md) | 设图标，显示在文字左边 |
| [`setBackgroundImage()`](ui-button/setbackgroundimage.md) | 设背景图，铺满整个按钮 |
| [`setAttributedTitle()`](ui-button/setattributedtitle.md) | 设带样式的文字 |

读取的方法每次读一个状态：

| 方法 | 说明 |
| --- | --- |
| [`titleForState()`](ui-button/titleforstate.md) | 某个状态的文字 |
| [`titleColorForState()`](ui-button/titlecolorforstate.md) | 某个状态的文字颜色 |
| [`imageForState()`](ui-button/imageforstate.md) | 某个状态的图标 |
| [`backgroundImageForState()`](ui-button/backgroundimageforstate.md) | 某个状态的背景图 |
| [`attributedTitleForState()`](ui-button/attributedtitleforstate.md) | 某个状态的带样式文字 |

## 事件

按钮的事件都继承自 [`UIControl`](ui-control.md#事件)，用 `addEventListener()` 监听。按钮常用的是这几个：

| 事件 | 什么时候派发 |
| --- | --- |
| [`click`](ui-control/click-event.md) | 用户完成了一次点击。响应点击用这个 |
| [`touchdown`](ui-control/touchdown-event.md) | 手指刚按下 |
| [`touchupinside`](ui-control/touchupinside-event.md) | 手指在按钮范围内松开 |
| [`touchupoutside`](ui-control/touchupoutside-event.md) | 手指按下后滑到按钮外面松开 |
| [`touchcancel`](ui-control/touchcancel-event.md) | 触摸被系统打断，比如来电 |

全部 16 个事件、事件对象带什么、什么时候执行回调，见 [`UIControl`](ui-control.md#事件)。

## 状态

按钮在任一时刻处于一个或几个状态。设置文字、颜色、图片的方法用 `forState` 指定给哪些状态设。

| 状态 | 什么时候处于这个状态 | 谁来切换 |
| --- | --- | --- |
| `normal` | 下面几种都不是的时候 | — |
| `highlighted` | 手指按在按钮上 | 系统 |
| `disabled` | `isEnabled` 是 `false` | App 的代码 |
| `selected` | `isSelected` 是 `true` | App 的代码 |
| `focused` | 按钮得到了焦点。**什么时候会得到焦点未在模拟器验证** | 系统 |

- 没有单独设过的状态，使用 `normal` 的那一套。所以多数按钮只设 `normal`。
- 几个状态可以同时成立，比如选中并且禁用。只在这种组合下用的值，`forState` 写成 `['selected', 'disabled']`。
- 当前状态从继承的 [`state`](ui-control.md#状态) 属性读，返回状态名的数组。

## 示例

### 屏幕正中的按钮

从空白 App 开始，在屏幕正中放一个按钮，点一下在控制台输出一行字。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const button = UIButton.buttonWithType('system');
  button.setTitle('点我', { forState: ['normal'] });
  button.addEventListener('click', () => {
    console.log('按钮被点了');
  });

  button.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(button);
  NSLayoutConstraint.activateConstraints([
    button.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    button.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
  ]);
});
```

**效果**

- 屏幕正中出现蓝色的「点我」，没有边框和底色。
- 手指按住时文字变淡，松开恢复。
- 点一下，控制台输出 `按钮被点了`。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。

### 按状态设不同的文字

```js
const follow = UIButton.buttonWithType('system');
follow.setTitle('关注', { forState: ['normal'] });
follow.setTitle('已关注', { forState: ['selected'] });

follow.addEventListener('click', () => {
  follow.isSelected = !follow.isSelected;
});
```

**效果**：初始显示「关注」，点一下变成「已关注」，再点一下变回来。**未在模拟器验证。**

更多写法见指南[做一个按钮](../guides/buttons.md)。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[UIButton buttonWithType:UIButtonTypeSystem]` | `UIButton.buttonWithType('system')` |
| `[btn setTitle:@"点我" forState:UIControlStateNormal]` | `btn.setTitle('点我', { forState: ['normal'] })` |
| `[btn setTitle:@"x" forState:UIControlStateSelected \| UIControlStateDisabled]` | `btn.setTitle('x', { forState: ['selected', 'disabled'] })` |
| `[btn titleForState:UIControlStateHighlighted]` | `btn.titleForState('highlighted')` |
| `[btn addTarget:self action:@selector(tap) forControlEvents:UIControlEventPrimaryActionTriggered]` | `btn.addEventListener('click', tap)` |
| `btn.role = UIButtonRoleDestructive` | `btn.role = 'destructive'` |
| `btn.enabled = NO` | `btn.isEnabled = false` |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 用一个配置对象设置内边距、图标位置、副标题、填充样式 | `UIButton.Configuration` |
| 点按钮弹出菜单 | `menu`、`showsMenuAsPrimaryAction` |
| 调整图标的粗细和大小 | `setPreferredSymbolConfiguration:forImageInState:` |

## 参见

- [做一个按钮](../guides/buttons.md)：创建、点击、防止重复提交、外观、禁用、图标
- [`UIControl`](ui-control.md)：全部事件和状态
- [`UILabel`](ui-label.md)：`titleLabel` 的类型
- [富文本](ns-attributed-string.md)
