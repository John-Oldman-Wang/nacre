---
type: reference
native: UIBarButtonItem
status: partial
---

# 导航条上的东西

导航条是 [`UINavigationController`](ui-navigation-controller.md) 在屏幕顶部画的一条。它上面有四样东西：正中的标题、左侧的返回按钮、左侧的按钮、右侧的按钮。这一页说明怎么设置它们，涉及三个类：

- **`UINavigationItem`** 表示一个页面在导航条上的配置：标题、副标题、返回按钮上的字、左右两侧各有哪些按钮。每个页面（[`UIViewController`](ui-view-controller.md)）自带一个，从 `page.navigationItem` 读到。
- **`UIBarButtonItem`** 表示导航条上的一个按钮。
- **`UIBarItem`** 是 `UIBarButtonItem` 和 [`UITabBarItem`](ui-tab-bar-controller.md) 共同的父类，提供 `title`、`image`、`isEnabled`、`tag` 四个属性。它不能直接创建。

导航条只有一条，配置却是每个页面一份。导航控制器显示哪个页面，导航条就显示那个页面的 `navigationItem`。页面切换时导航条的内容跟着换，不需要代码处理。

## 配置什么时候生效

`navigationItem` 在页面创建时就有，页面不在导航栈里时也可以读写。这时没有导航条显示它，设置的内容被保存下来，页面进入导航栈、成为栈顶时显示。

所以配置可以在推入之前全部设好。页面已经显示在屏幕上时再改 `navigationItem`，导航条是否立刻更新，**未在模拟器验证**。

## 返回按钮是系统加的

返回按钮不属于当前页面的配置。导航栈里不止一页时，系统自动在导航条左侧放一个返回按钮，点它弹出当前页面。

返回按钮上的字来自**上一页**，不是当前页：

1. 上一页设了 `navigationItem.backButtonTitle`，用它。
2. 没设，用上一页的标题。

所以想改「从详情页返回」那个按钮上的字，要改的是列表页的 `backButtonTitle`。`backButtonTitle` 的读写在验收用例里核对过，它在屏幕上的效果**未在模拟器验证**。

## `UIBarButtonItem` 不是视图

`UIBarButtonItem` 只描述「这里要一个按钮，上面写什么、是什么样式」，由系统按这份描述画出按钮。它不是 [`UIView`](ui-view.md)：

- 没有 `frame`、`backgroundColor`，不能 `addSubview()`。按钮的位置和大小由系统安排。
- 没有 [`UIControl`](ui-control.md) 的那些触摸事件，只有一个 `primaryActionTriggered`，在用户点了它时派发。

要在导航条上放一个完全自己画的东西，把一个视图交给 `customView`，见[把自己的视图放到导航条上](#把自己的视图放到导航条上)。

## 推荐的做法

**标题只用 `page.title` 设。** 标题有两个入口：`page.title` 和 `page.navigationItem.title`。写 `page.title` 会同时改 `navigationItem.title`，反过来不会，而且直接写过 `navigationItem.title` 之后两边就可能不一致，详见[标题的两个入口](#标题的两个入口)。只用 `page.title` 有两个好处：返回按钮上的字取的是它；页面放进 [`UITabBarController`](ui-tab-bar-controller.md) 时，系统自动建的标签也用它。

**按钮在造页面的函数里建好，推入之前设上。** 按钮属于页面的配置，和页面一起建、一起被回收。按钮上加的监听器不需要手动移除：页面离开导航栈并被回收时，它的按钮和监听器一起被回收。

**导航栈里的页面，按钮优先放右侧。** 左侧是返回按钮的位置。页面设了左侧按钮之后，返回按钮和[左滑返回](ui-navigation-controller.md#左滑返回默认就有)都受影响，见[左侧按钮和返回](#左侧按钮和返回)。左侧按钮适合没有上一页的场合，比如模态呈现的页面左上角的「取消」。

## 完整例子

下面的代码从空白 App 开始：首页上有一个按钮，点它进入「编辑」页；「编辑」页的导航条右侧有一个「保存」按钮，点它在控制台输出一行并返回首页。

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
    save.addEventListener('primaryActionTriggered', () => {
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
  open.addEventListener('primaryActionTriggered', () => {
    nav.pushViewController(makeEditor(), { animated: true });
  });
});
```

**效果**

- 首页的导航条正中是「首页」，左右两侧没有按钮。
- 点「去编辑」，进入编辑页。导航条正中是「编辑」，左侧是写着「首页」的返回按钮，右侧是「保存」按钮。
- 点「保存」，控制台输出 `保存了`，屏幕回到首页。

导航条右侧的按钮能显示、能点击，在验收用例里用真实的点击验证过。`'prominent'` 样式画出来的样子**未在模拟器验证**。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。

## 常见用法

以下例子都沿用上面的 `nav` 和 `home`，并假设 `page` 是一个已经在导航栈里的页面。

### 在右侧放一个按钮

```js
const done = new UIBarButtonItem({ title: '完成' });
done.addEventListener('primaryActionTriggered', () => {
  console.log('点了完成');
});
page.navigationItem.rightBarButtonItems = [done];
```

**效果**：导航条右侧出现「完成」。用户点一次，控制台输出一次 `点了完成`。

回调收到的事件对象只有 `type` 和 `target`（就是这个按钮）。

### 用图标做按钮

```js
const share = new UIBarButtonItem({
  image: UIImage.systemImageNamed('square.and.arrow.up') ?? undefined,
});
page.navigationItem.rightBarButtonItems = [share];
```

**效果**：导航条右侧出现一个分享图标。**样子未在模拟器验证。**

`'square.and.arrow.up'` 是系统自带图标库 SF Symbols 里的名字，见 [`UIImage`](ui-image.md)。`systemImageNamed()` 在名字不存在时返回 `null`，所以这里用 `?? undefined` 把 `null` 换成「不给」。

### 用系统预置的按钮

系统预置了二十几种常用按钮，文字会跟随系统语言，图标是系统统一的。

```js
const add = UIBarButtonItem.systemItem('add');
add.addEventListener('primaryActionTriggered', () => {
  console.log('新建');
});
page.navigationItem.rightBarButtonItems = [add];
```

**效果**：导航条右侧出现一个加号。点它，控制台输出 `新建`。**加号的样子未在模拟器验证。**

全部取值见 [`UIBarButtonItem.systemItem()`](#uibarbuttonitemsystemitem)。

### 放多个按钮

```js
const edit = new UIBarButtonItem({ title: '编辑' });
const more = UIBarButtonItem.systemItem('action');
page.navigationItem.rightBarButtonItems = [edit, more];

console.log(page.navigationItem.rightBarButtonItems.length);
console.log(page.navigationItem.rightBarButtonItems[0] === edit);
```

**效果**：导航条右侧有两个按钮。控制台输出 `2` 和 `true`。

按 iOS 的规则，`rightBarButtonItems` 的第一个最靠右，后面的依次往左排；`leftBarButtonItems` 的第一个最靠左。**排列顺序未在模拟器验证。**

两个按钮之间要多留一些距离时，中间插一个固定宽度的空白：

```js
page.navigationItem.rightBarButtonItems = [edit, UIBarButtonItem.fixedSpace(20), more];
```

**效果**：两个按钮之间多出 20 pt 的空白。**未在模拟器验证。**

### 去掉按钮

```js
page.navigationItem.rightBarButtonItems = [];
console.log(page.navigationItem.rightBarButtonItems.length);
```

**效果**：右侧的按钮全部消失。控制台输出 `0`。

### 禁用按钮

```js
const submit = new UIBarButtonItem({ title: '提交' });
page.navigationItem.rightBarButtonItems = [submit];

submit.isEnabled = false;
```

**效果**：「提交」变灰，点了没有反应。设回 `true` 恢复。**「变灰」和「点了没有反应」未在模拟器验证。**

表单没填完时禁用提交按钮，用的就是这个属性。

### 暂时隐藏按钮

```js
submit.isHidden = true;
```

**效果**：按钮从导航条上消失，但仍然在 `rightBarButtonItems` 里。设回 `false` 重新出现。**未在模拟器验证。**

### 改返回按钮上的字

返回按钮上的字由**上一页**决定。要改从 `page` 返回 `home` 的那个按钮，设 `home` 的 `backButtonTitle`：

```js
home.navigationItem.backButtonTitle = '返回';
console.log(home.navigationItem.backButtonTitle);
```

**效果**：从首页进入的下一页，返回按钮上写「返回」，不再是「首页」。控制台输出 `返回`。**按钮上的字未在模拟器验证。**

首页自己导航条上的标题不受影响，仍然是「首页」。

### 藏掉返回按钮

```js
page.navigationItem.hidesBackButton = true;
```

**效果**：`page` 在栈顶时，导航条左侧没有返回按钮。**未在模拟器验证。**

> **注意**：按 iOS 的规则，藏掉返回按钮之后左滑返回也不能用。这时页面上要有别的返回方式，比如一个调用 `nav.popViewController()` 的按钮，否则用户无法离开这个页面。

### 加副标题

```js
page.navigationItem.subtitle = '共 12 条';
```

**效果**：导航条的标题下面多出一行小字「共 12 条」。写 `null` 去掉。**样子未在模拟器验证。**

### 把自己的视图当标题

```js
const logo = new UILabel();
logo.text = 'Nacre';
logo.font = UIFont.systemFontOfSize(20, { weight: 'bold' });

page.navigationItem.titleView = logo;
console.log(page.navigationItem.titleView === logo);
```

**效果**：导航条正中显示这个 [`UILabel`](ui-label.md)，不再显示 `title` 的文字。控制台输出 `true`。写 `null` 恢复显示 `title`。**样子未在模拟器验证。**

这时 `page.title` 仍然有用：下一页的返回按钮上显示的还是它。

### 把自己的视图放到导航条上

```js
const badge = new UILabel();
badge.text = '草稿';
badge.textColor = 'systemOrange';

const item = new UIBarButtonItem({ customView: badge });
page.navigationItem.rightBarButtonItems = [item];
```

**效果**：导航条右侧显示橙色的「草稿」。**样子未在模拟器验证。**

用了 `customView` 的按钮，画什么完全由这个视图决定，`title`、`image`、`style` 不再起作用。用户点它时是否派发 `primaryActionTriggered`，**未在模拟器验证**；要响应点击，把一个 [`UIButton`](ui-button.md) 当作 `customView`，在那个按钮上监听。

## 标题的两个入口

导航条的标题可以从两个属性写：`page.title` 和 `page.navigationItem.title`。它们是两份数据，同步是单向的（实测）：

```js
const p = new UIViewController();

p.title = '首页';
console.log(p.navigationItem.title);    // '首页'

p.navigationItem.title = '改过的';
console.log(p.title);                   // '首页'
console.log(p.navigationItem.title);    // '改过的'

p.navigationItem.title = null;
console.log(p.navigationItem.title);    // null

p.title = '首页';
console.log(p.navigationItem.title);    // '首页'
```

**结果**：控制台依次输出 `首页`、`首页`、`改过的`、`null`、`首页`。

| 操作 | `page.title` | `page.navigationItem.title` |
| --- | --- | --- |
| 写 `page.title` | 新值 | 跟着变成新值 |
| 写 `page.navigationItem.title` | 不变 | 新值 |
| 把 `page.navigationItem.title` 写成 `null` | 不变 | `null`，不会退回 `page.title` 的值 |

导航条显示的是 `navigationItem.title`。

两个属性只用其中一个。推荐用 `page.title`，理由见[推荐的做法](#推荐的做法)。只有想让导航条上的标题和返回按钮上的字不一样时，才需要 `navigationItem`，这种情况设 `backButtonTitle`，仍然不必写 `navigationItem.title`。

## 左侧按钮和返回

导航条左侧原本是返回按钮的位置。按 iOS 的规则：

| 页面的设置 | 返回按钮 | [左滑返回](ui-navigation-controller.md#左滑返回默认就有) |
| --- | --- | --- |
| 什么都不设 | 显示 | 可用 |
| `leftBarButtonItems` 里有按钮 | 不显示，位置让给这些按钮 | 不可用 |
| `hidesBackButton` 是 `true` | 不显示 | 不可用 |

后两行**未在模拟器验证**。

这是 iOS 的行为：左侧换成别的按钮之后，系统不再认为「往回走」是这个页面默认的操作。

页面设了左侧按钮之后，要自己提供返回的方式：

```js
const back = new UIBarButtonItem({ title: '取消' });
back.addEventListener('primaryActionTriggered', () => {
  nav.popViewController({ animated: true });
});
page.navigationItem.leftBarButtonItems = [back];
```

**效果**：导航条左侧是「取消」，没有系统的返回按钮。点「取消」返回上一页。**未在模拟器验证。**

## 成员说明

### `UIBarItem`

`UIBarButtonItem` 和 [`UITabBarItem`](ui-tab-bar-controller.md) 的父类。不能直接创建：

- `new UIBarItem()` 抛 `TypeError: Illegal constructor: UIBarItem is abstract; construct UIBarButtonItem instead`

```
EventTarget
  └─ NSObject
       └─ UIBarItem
            ├─ UIBarButtonItem
            └─ UITabBarItem
```

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `title` | 字符串或 `null` | 是 | 是 | `null` | 按钮上的文字 |
| `image` | [`UIImage`](ui-image.md) 或 `null` | 是 | 是 | `null` | 按钮上的图标 |
| `isEnabled` | 布尔 | 是 | 是 | `true` | `true`：可以点。`false`：变灰，点了没有反应 |
| `tag` | 整数 | 是 | 是 | `0` | 给自己用的编号，系统不看它 |

- `title` 写入的不是字符串时按 `String()` 转；写 `null` 或 `undefined` 得到 `null`。
- 这些值变了没有事件。它们只会被代码改变。
- **出错**：`image` 写入别的原生对象：`TypeError: image needs a UIImage or null`。写入字符串、数字这类普通的值：`TypeError`，信息以 `image needs a native object or null, got` 开头。

### `UIBarButtonItem`

导航条上的一个按钮。

#### `new UIBarButtonItem()`

```js
const plain = new UIBarButtonItem();
const save = new UIBarButtonItem({ title: '保存', style: 'prominent' });
console.log(plain.title, save.title, save.style);
```

**结果**：控制台输出 `null 保存 prominent`。

参数是一个对象，每一项都可以不给：

| 成员 | 类型 | 含义 |
| --- | --- | --- |
| `title` | 字符串 | 按钮上的文字 |
| `image` | `UIImage` | 按钮上的图标 |
| `style` | `'plain'` \| `'prominent'` \| `'done'` | 样式，见[属性](#属性) |
| `isEnabled` | 布尔 | 能不能点 |
| `customView` | [`UIView`](ui-view.md) | 用这个视图代替系统画的按钮 |

`title`、`image`、`style`、`isEnabled` 在参数里给，和建好之后再写同名属性效果相同。

#### `UIBarButtonItem.systemItem()`

创建一个系统预置的按钮。预置的种类只能在创建时指定，之后不能改。

```js
const trash = UIBarButtonItem.systemItem('trash');
console.log(trash instanceof UIBarButtonItem);
```

**结果**：控制台输出 `true`。

- **参数**：下表里的一个名字。
- **返回**：新建的 `UIBarButtonItem`。
- **出错**：名字不在表里时抛 `TypeError`，信息是 `systemItem has no value "explode"; expected one of: …`，后面列出全部可用的名字。

下表的效果来自 Apple 的文档，**全部未在模拟器验证**。文字类的按钮显示什么字跟随系统语言。

| 取值 | 效果 |
| --- | --- |
| `'done'` | 文字「完成」 |
| `'cancel'` | 文字「取消」 |
| `'edit'` | 文字「编辑」 |
| `'save'` | 文字「保存」 |
| `'undo'` | 文字「撤销」 |
| `'redo'` | 文字「重做」 |
| `'add'` | 加号图标 |
| `'compose'` | 新建内容的图标：一个方框加一支笔 |
| `'reply'` | 回复的图标：一个向左的弯箭头 |
| `'action'` | 分享的图标：一个方框加向上的箭头 |
| `'organize'` | 文件夹图标 |
| `'bookmarks'` | 书签图标：一本打开的书 |
| `'search'` | 放大镜图标 |
| `'refresh'` | 刷新的图标：一个环形箭头 |
| `'stop'` | 停止的图标：一个叉 |
| `'close'` | 关闭的图标：一个叉 |
| `'camera'` | 相机图标 |
| `'trash'` | 垃圾桶图标 |
| `'play'` | 播放图标 |
| `'pause'` | 暂停图标 |
| `'rewind'` | 快退图标 |
| `'fastForward'` | 快进图标 |
| `'pageCurl'` | 翻页图标。Apple 已不建议使用 |
| `'writingTools'` | 系统「写作工具」的图标 |
| `'flexibleSpace'` | 不显示任何东西的空白，宽度自动伸缩。等同于 `UIBarButtonItem.flexibleSpace()` |
| `'fixedSpace'` | 不显示任何东西的空白，宽度由 `width` 决定 |

#### `UIBarButtonItem.flexibleSpace()` 和 `UIBarButtonItem.fixedSpace()`

创建不显示任何东西、只占位置的空白。

```js
const flexible = UIBarButtonItem.flexibleSpace();
const fixed = UIBarButtonItem.fixedSpace(20);
console.log(fixed.width);
```

**结果**：控制台输出 `20`。

| 方法 | 参数 | 返回 |
| --- | --- | --- |
| `UIBarButtonItem.flexibleSpace()` | 无 | 一个宽度自动伸缩的空白，占满两侧按钮之间剩下的位置 |
| `UIBarButtonItem.fixedSpace(width)` | 宽度，单位 [pt](units.md) | 一个固定宽度的空白 |

- **出错**：`fixedSpace()` 的参数转不成有限的数时抛 `TypeError`。

#### 属性

除了从 [`UIBarItem`](#uibaritem) 继承的四个，还有：

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `style` | `'plain'` \| `'prominent'` | 是 | 是 | `'plain'` | 样式。取值见下表 |
| `width` | 数，单位 [pt](units.md) | 是 | 是 | `0` | 宽度。只对固定宽度的空白有意义 |
| `isHidden` | 布尔 | 是 | 是 | `false` | `true`：不显示，但仍在按钮数组里。`false`：显示 |
| `customView` | [`UIView`](ui-view.md) 或 `null` | 是 | 是 | `null` | 代替系统画的按钮的视图。`null`：由系统画 |

`style` 的取值。两种样式画出来的样子**未在模拟器验证**：

| 取值 | 效果 |
| --- | --- |
| `'plain'` | 普通样式 |
| `'prominent'` | 强调样式，用于这个页面最主要的操作，比如「保存」「完成」 |
| `'done'` | 可以写入，和 `'prominent'` 是同一个值。读出来是 `'prominent'` |

```js
const item = new UIBarButtonItem({ title: '完成' });
item.style = 'done';
console.log(item.style);
```

**结果**：控制台输出 `prominent`。写入 `'done'` 之后读到的是 `'prominent'`，所以判断样式时和 `'prominent'` 比较。

- **出错**：`style` 写入其他值抛 `TypeError: style has no value "bordered"; expected one of: plain / prominent / done`。
- **出错**：`customView` 写入的不是视图：`TypeError: customView needs a UIView or null`。
- 这些值变了没有事件。它们只会被代码改变。

#### 事件

| 事件 | 什么时候派发 |
| --- | --- |
| `primaryActionTriggered` | 用户点了这个按钮 |

```js
const item = new UIBarButtonItem({ title: '完成' });
item.addEventListener('primaryActionTriggered', (ev) => {
  console.log(ev.type, ev.target === item);
});
```

**效果**：用户点一次，输出 `primaryActionTriggered true`。

- 事件名和 [`UIButton`](ui-button.md) 的点击事件相同。
- 事件对象只有 `type` 和 `target` 两个字段。
- 事件不能取消。
- 回调不是在点击的那一刻同步执行，而是稍后执行，见[运行时怎么工作](how-it-works.md)。
- **出错**：监听其他事件名抛 `TypeError: addEventListener has no value "click"; expected one of: primaryActionTriggered`。

### `UINavigationItem`

一个页面在导航条上的配置。不能自己创建，从页面的 `navigationItem` 读：

- `new UINavigationItem()` 抛 `TypeError: Illegal constructor: UINavigationItem is created by the runtime, not by new`

```js
const p = new UIViewController();
console.log(p.navigationItem instanceof UINavigationItem);
console.log(p.navigationItem === p.navigationItem);
```

**结果**：控制台输出 `true` 和 `true`。每个页面只有一个，每次读到的是同一个对象。

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `title` | 字符串或 `null` | 是 | 是 | 页面的 `title` | 导航条正中的文字。和 `page.title` 的关系见[标题的两个入口](#标题的两个入口) |
| `subtitle` | 字符串或 `null` | 是 | 是 | `null` | 标题下面的一行小字。`null`：没有 |
| `backButtonTitle` | 字符串或 `null` | 是 | 是 | `null` | **下一页**的返回按钮上的字。`null`：用这一页的标题 |
| `hidesBackButton` | 布尔 | 是 | 是 | `false` | `true`：这一页在栈顶时不显示返回按钮。`false`：显示 |
| `titleView` | [`UIView`](ui-view.md) 或 `null` | 是 | 是 | `null` | 显示在导航条正中的视图，代替 `title` 的文字。`null`：显示 `title` |
| `leftBarButtonItems` | `UIBarButtonItem` 的数组 | 是 | 是 | 空数组 | 左侧的按钮。有按钮时的影响见[左侧按钮和返回](#左侧按钮和返回) |
| `rightBarButtonItems` | `UIBarButtonItem` 的数组 | 是 | 是 | 空数组 | 右侧的按钮 |

- 两个按钮数组读出来的是当时的一份快照。往数组里 `push` 不会改变导航条，要整个赋值。读到的每个元素和当初放进去的是同一个对象。
- `titleView` 读回来的和写进去的是同一个对象。
- 三个字符串属性写入的不是字符串时按 `String()` 转；写 `null` 或 `undefined` 得到 `null`。
- 这些值变了没有事件。它们只会被代码改变。
- **出错**：按钮数组里有不是 `UIBarButtonItem` 的东西：`TypeError: bar button items only accept UIBarButtonItem`。这时原来的按钮不变。
- **出错**：`titleView` 写入的不是视图：`TypeError: titleView needs a UIView or null`。

## 与 iOS 原生写法的对照

| ObjC | JS |
| --- | --- |
| `[[UIBarButtonItem alloc] initWithTitle:@"保存" style:UIBarButtonItemStyleProminent target:self action:@selector(save)]` | `new UIBarButtonItem({ title: '保存', style: 'prominent' })`，再 `addEventListener('primaryActionTriggered', save)` |
| `[[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemAdd target:… action:…]` | `UIBarButtonItem.systemItem('add')` |
| `[[UIBarButtonItem alloc] initWithCustomView:v]` | `new UIBarButtonItem({ customView: v })` |
| `[UIBarButtonItem flexibleSpaceItem]` | `UIBarButtonItem.flexibleSpace()` |
| `[UIBarButtonItem fixedSpaceItemOfWidth:20]` | `UIBarButtonItem.fixedSpace(20)` |
| `item.style = UIBarButtonItemStyleDone` | `item.style = 'done'`（读回 `'prominent'`） |
| `item.enabled = NO` | `item.isEnabled = false` |
| `item.hidden = YES` | `item.isHidden = true` |
| `item.target` / `item.action` | 不开放。用 `addEventListener()` |
| `UIBarButtonItemStyleBordered` | 不开放。Apple 已废弃 |
| `vc.navigationItem.rightBarButtonItems = @[a, b]` | `vc.navigationItem.rightBarButtonItems = [a, b]` |
| `vc.navigationItem.rightBarButtonItem = a` | `vc.navigationItem.rightBarButtonItems = [a]` |
| `vc.navigationItem.titleView = v` | `vc.navigationItem.titleView = v` |
| `vc.navigationItem.backButtonTitle = @"返回"` | `vc.navigationItem.backButtonTitle = '返回'` |

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 点按钮弹出菜单 | `UIMenu`、`UIAction`、`primaryAction`、`menu` | 未实现 |
| 大标题和大副标题 | `largeTitleDisplayMode`、`largeTitle`、`largeSubtitle` | 未实现 |
| 换掉返回按钮本身，或者拦截返回 | `backBarButtonItem`、`backAction` | 未实现 |
| 设了左侧按钮之后仍然保留返回按钮 | `leftItemsSupplementBackButton` | 未实现 |
| 把自己的视图当副标题 | `subtitleView` | 未实现 |
| 调整图标的位置、横屏时换一张图 | `imageInsets`、`landscapeImagePhone` | 未实现 |
| 屏幕底部的工具条 | `UIToolbar`、`toolbarItems` | 未实现 |
| 统一定制所有按钮的外观 | `UIAppearance`、`setBackgroundImage:forState:barMetrics:` | 未实现 |
| 给按钮单独设颜色 | `tintColor` | 未实现 |

## 参见

- [`UINavigationController`](ui-navigation-controller.md)：导航条由它显示；推入、弹出、左滑返回
- [`UIViewController`](ui-view-controller.md)：页面。`title` 和 `navigationItem` 在它上面
- [`UITabBarController`](ui-tab-bar-controller.md)：`UITabBarItem` 也继承 `UIBarItem`
- [`UIButton`](ui-button.md)：页面里的按钮。点击事件同名
- [`UIImage`](ui-image.md)：按钮的图标，`systemImageNamed()`
- [单位](units.md)：`width` 的单位
- [实现原理：导航](../internals/navigation.md)
