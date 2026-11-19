# 在导航条上放按钮和标题

这一篇讲怎么设置导航条上的东西：正中的标题、右侧和左侧的按钮、返回按钮。涉及三个类：页面的配置 [`UINavigationItem`](../api/ui-navigation-item.md)、按钮 [`UIBarButtonItem`](../api/ui-bar-button-item.md)、它们共同的父类 [`UIBarItem`](../api/ui-bar-item.md)。导航条本身由 [`UINavigationController`](../api/ui-navigation-controller.md) 显示。

## 推荐的做法

- **标题只用 `page.title` 设。** 标题有两个入口：[`page.title`](../api/ui-view-controller/title.md) 和 [`page.navigationItem.title`](../api/ui-navigation-item/title.md)。写 `page.title` 会同时改 `navigationItem.title`，反过来不会，而且直接写过 `navigationItem.title` 之后两边就可能不一致，见[标题的两个入口](../api/ui-navigation-item.md#标题的两个入口)。只用 `page.title` 有两个好处：返回按钮上的字取的是它；页面放进 [`UITabBarController`](../api/ui-tab-bar-controller.md) 时，系统自动建的标签也用它。只有想让导航条上的标题和返回按钮上的字不一样时才需要 `navigationItem`，这时设 `backButtonTitle`，仍然不必写 `navigationItem.title`。
- **按钮在造页面的函数里建好，推入之前设上。** 按钮属于页面的配置，和页面一起建、一起被回收。按钮上加的监听器不需要手动移除：页面离开导航栈并被回收时，它的按钮和监听器一起被回收。
- **导航栈里的页面，按钮优先放右侧。** 左侧是返回按钮的位置。页面设了左侧按钮之后，返回按钮和左滑返回都受影响，见[左侧按钮和返回](#左侧按钮和返回)。左侧按钮适合没有上一页的场合，比如模态呈现的页面左上角的「取消」。

## 第一个导航条按钮

从空白 App 开始：首页上有一个按钮，点它进入「编辑」页；「编辑」页的导航条右侧有一个「保存」按钮，点它在控制台输出一行并返回首页。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口、首页和导航控制器
  const win = new UIWindow(e.scene);
  const home = new UIViewController();
  home.title = '首页';
  home.view.backgroundColor = 'systemBackground';
  const nav = new UINavigationController(home);
  win.rootViewController = nav;
  win.makeKeyAndVisible();

  function makeEditor() {
    const page = new UIViewController();
    // 1. 标题：导航条正中的字
    page.title = '编辑';
    page.view.backgroundColor = 'systemBackground';

    // 2. 建一个按钮
    const save = new UIBarButtonItem({ title: '保存', style: 'prominent' });

    // 3. 点击时做什么
    save.addEventListener('click', () => {
      console.log('保存了');
      nav.popViewController({ animated: true });
    });

    // 4. 放到这个页面的导航条右侧
    page.navigationItem.rightBarButtonItems = [save];
    return page;
  }

  // 首页正中的入口按钮
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

下面的例子沿用这里的 `nav` 和 `home`，`page` 是一个已经在导航栈里的页面。单独试某一节时，先写这几行：

```js
const home = new UIViewController();
const nav = new UINavigationController(home);
const page = new UIViewController();
nav.pushViewController(page, { animated: false });
```

## 在右侧放一个按钮

```js
const done = new UIBarButtonItem({ title: '完成' });
done.addEventListener('click', () => {
  console.log('点了完成');
});
page.navigationItem.rightBarButtonItems = [done];
```

**效果**：导航条右侧出现「完成」。用户点一次，控制台输出一次 `点了完成`。

回调收到的事件对象只有 `type` 和 `target`（就是这个按钮），见 [`click`](../api/ui-bar-button-item/click-event.md)。

## 用图标做按钮

```js
const share = new UIBarButtonItem({
  image: UIImage.systemImageNamed('square.and.arrow.up') ?? undefined,
});
page.navigationItem.rightBarButtonItems = [share];
```

**效果**：导航条右侧出现一个分享图标。**样子未在模拟器验证。**

`'square.and.arrow.up'` 是系统自带图标库 SF Symbols 里的名字，见 [`UIImage`](../api/ui-image.md)。`systemImageNamed()` 在名字不存在时返回 `null`，所以这里用 `?? undefined` 把 `null` 换成「不给」。

## 用系统预置的按钮

系统预置了二十几种常用按钮，文字会跟随系统语言，图标是系统统一的。

```js
const add = UIBarButtonItem.systemItem('add');
add.addEventListener('click', () => {
  console.log('新建');
});
page.navigationItem.rightBarButtonItems = [add];
```

**效果**：导航条右侧出现一个加号。点它，控制台输出 `新建`。**加号的样子未在模拟器验证。**

全部取值见 [`UIBarButtonItem.systemItem()`](../api/ui-bar-button-item/systemitem.md)。

## 放多个按钮

```js
const edit = new UIBarButtonItem({ title: '编辑' });
const more = UIBarButtonItem.systemItem('action');
page.navigationItem.rightBarButtonItems = [edit, more];
```

**效果**：导航条右侧有两个按钮。

按 iOS 的规则，`rightBarButtonItems` 的第一个最靠右，后面的依次往左排；`leftBarButtonItems` 的第一个最靠左。**排列顺序未在模拟器验证。**

两个按钮之间要多留一些距离时，中间插一个固定宽度的空白：

```js
page.navigationItem.rightBarButtonItems = [edit, UIBarButtonItem.fixedSpace(20), more];
```

**效果**：两个按钮之间多出 20 pt 的空白。**未在模拟器验证。**

## 去掉按钮

```js
page.navigationItem.rightBarButtonItems = [];
```

**效果**：右侧的按钮全部消失。

按钮数组读出来的是一份快照，往里 `push` 或删元素不改变导航条，要整个赋值。

## 禁用按钮

```js
const submit = new UIBarButtonItem({ title: '提交' });
page.navigationItem.rightBarButtonItems = [submit];

submit.isEnabled = false;
```

**效果**：「提交」变灰，点了没有反应。设回 `true` 恢复。**「变灰」和「点了没有反应」未在模拟器验证。**

表单没填完时禁用提交按钮，用的就是 [`isEnabled`](../api/ui-bar-item/isenabled.md)。

## 暂时隐藏按钮

接着上一节的「提交」按钮：

```js
const submit = new UIBarButtonItem({ title: '提交' });
page.navigationItem.rightBarButtonItems = [submit];

submit.isHidden = true;
```

**效果**：按钮从导航条上消失，但仍然在 `rightBarButtonItems` 里。设回 `false` 重新出现。**未在模拟器验证。**

## 改返回按钮上的字

返回按钮上的字由**上一页**决定。要改从 `page` 返回 `home` 的那个按钮，设 `home` 的 [`backButtonTitle`](../api/ui-navigation-item/backbuttontitle.md)：

```js
home.navigationItem.backButtonTitle = '返回';
```

**效果**：从首页进入的下一页，返回按钮上写「返回」，不再是「首页」。**按钮上的字未在模拟器验证。**

首页自己导航条上的标题不受影响，仍然是「首页」。

## 藏掉返回按钮

```js
page.navigationItem.hidesBackButton = true;
```

**效果**：`page` 在栈顶时，导航条左侧没有返回按钮。**未在模拟器验证。**

> **注意**：按 iOS 的规则，藏掉返回按钮之后左滑返回也不能用。这时页面上要有别的返回方式，比如一个调用 `nav.popViewController()` 的按钮，否则用户无法离开这个页面。

## 加副标题

```js
page.navigationItem.subtitle = '共 12 条';
```

**效果**：导航条的标题下面多出一行小字「共 12 条」。写 `null` 去掉。**样子未在模拟器验证。**

## 把自己的视图当标题

```js
const logo = new UILabel();
logo.text = 'Nacre';
logo.font = UIFont.systemFontOfSize(20, { weight: 'bold' });
page.navigationItem.titleView = logo;
```

**效果**：导航条正中显示这个 [`UILabel`](../api/ui-label.md)，不再显示 `title` 的文字。写 `null` 恢复显示 `title`。**样子未在模拟器验证。**

这时 `page.title` 仍然有用：下一页的返回按钮上显示的还是它。

## 把自己的视图放到导航条上

```js
const badge = new UILabel();
badge.text = '草稿';
badge.textColor = 'systemOrange';

const draft = new UIBarButtonItem({ customView: badge });
page.navigationItem.rightBarButtonItems = [draft];
```

**效果**：导航条右侧显示橙色的「草稿」。**样子未在模拟器验证。**

用了 [`customView`](../api/ui-bar-button-item/customview.md) 的按钮，画什么完全由这个视图决定，`title`、`image`、`style` 不再起作用。用户点它时是否派发 `click`，**未在模拟器验证**；要响应点击，把一个 [`UIButton`](../api/ui-button.md) 当作 `customView`，在那个按钮上监听。

## 左侧按钮和返回

导航条左侧原本是返回按钮的位置。页面设了 [`leftBarButtonItems`](../api/ui-navigation-item/leftbarbuttonitems.md) 或 `hidesBackButton` 之后，返回按钮不显示，左滑返回也不能用（**未在模拟器验证**），见[左侧按钮和返回](../api/ui-navigation-item.md#左侧按钮和返回)。这时要自己提供返回的方式：

```js
const back = new UIBarButtonItem({ title: '取消' });
back.addEventListener('click', () => {
  nav.popViewController({ animated: true });
});
page.navigationItem.leftBarButtonItems = [back];
```

**效果**：导航条左侧是「取消」，没有系统的返回按钮。点「取消」返回上一页。**未在模拟器验证。**

## 参见

- [`UINavigationItem`](../api/ui-navigation-item.md)：页面在导航条上的配置
- [`UIBarButtonItem`](../api/ui-bar-button-item.md)：导航条上的按钮
- [`UIBarItem`](../api/ui-bar-item.md)：按钮的父类
- [`UINavigationController`](../api/ui-navigation-controller.md)：导航条由它显示；推入、弹出、左滑返回
