---
type: reference
native: UIButton
status: partial
---

# `UIButton`

`UIButton` 是按钮：屏幕上一块能点的区域，上面可以有文字和图标，点了之后执行你的代码。

它相当于 HTML 的 `<button>`，有两点不同：

- 文字、文字颜色、图标都是**分状态**设置的。「平常」「手指按住」「禁用」可以各有一套，系统按当前状态自动切换。
- 没有 `click` 事件。点击对应的事件叫 `primaryActionTriggered`。

这一页分三部分：先给一个[能直接运行的完整例子](#完整例子)，再按[你想做的事](#常见用法)给出写法和效果，最后是[每个成员的说明](#成员说明)。

## 完整例子

下面的代码从空白 App 开始，在屏幕正中放一个按钮，点一下在控制台输出一行字。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 创建按钮
  const button = UIButton.buttonWithType('system');

  // 2. 设置按钮上的文字
  button.setTitle('点我', { forState: ['normal'] });

  // 3. 点击时做什么
  button.addEventListener('primaryActionTriggered', () => {
    console.log('按钮被点了');
  });

  // 4. 放到页面上，位置定在正中
  button.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(button);
  NSLayoutConstraint.activateConstraints([
    button.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    button.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
  ]);
});
```

**效果**

- 屏幕正中出现蓝色的「点我」两个字，没有边框，没有底色。
- 手指按住时文字变淡，松开恢复。
- 手指在按钮上松开，控制台输出 `按钮被点了`。
- 手指按下后滑到按钮外面再松开，不输出。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。

四步分别是：创建、设文字、监听点击、放到页面上。后面的每种用法都是在这四步上改。

## 常见用法

以下例子都假设已经有上面的 `button` 和 `page`。

### 响应点击

```js
button.addEventListener('primaryActionTriggered', () => {
  console.log('按钮被点了');
});
```

**效果**：用户点一次，回调执行一次。

回调收到的事件对象只有 `type` 和 `target`（就是这个按钮），没有触摸位置。

除了点击，还能监听按下、松开等更细的时刻，见[事件](#事件)。

### 改文字颜色

```js
button.setTitleColor('#FF3B30', { forState: ['normal'] });
```

**效果**：文字变成红色。按住时仍然自动变淡。

颜色的写法见[颜色](ui-color.md)，可以用 `'#RRGGBB'`，也可以用 `'systemRed'` 这类系统颜色名。

### 加底色和圆角

按钮本身也是一个视图，底色和圆角用视图的属性设。

```js
button.backgroundColor = '#007AFF';
button.layer.cornerRadius = 10;
button.setTitleColor('white', { forState: ['normal'] });

NSLayoutConstraint.activateConstraints([
  button.widthAnchor.constraintEqualToConstant(200),
  button.heightAnchor.constraintEqualToConstant(44),
]);
```

**效果**：一个宽 200 pt、高 44 pt 的蓝色圆角矩形，四个角的圆角半径是 10 pt，中间是白色的文字。

不设宽高时，按钮只有文字那么大，底色会紧贴着文字。

### 改字体和字号

按钮自己没有字体属性。文字是由按钮里面的一个 [`UILabel`](ui-label.md) 画的，通过 `titleLabel` 拿到它再设。

```js
const label = button.titleLabel;
if (label) {
  label.font = UIFont.systemFontOfSize(20, { weight: 'semibold' });
}
```

**效果**：文字变成 20 pt、半粗体。

`titleLabel` 的类型声明是「可能为 `null`」，所以要先判断。实际运行时它一直有值。

> **注意**：文字内容和颜色不要通过 `titleLabel` 改，要用 `setTitle()` 和 `setTitleColor()`。直接改 `titleLabel.text`，按钮下次切换状态时会把它覆盖掉。

### 按住时换一套文字和颜色

给 `highlighted` 状态单独设一套。

```js
button.setTitle('点我',   { forState: ['normal'] });
button.setTitle('松手！', { forState: ['highlighted'] });
button.setTitleColor('#FF3B30', { forState: ['highlighted'] });
```

**效果**：平常显示「点我」。手指按住期间显示红色的「松手！」，松开变回「点我」。

没有单独设过的状态，自动使用 `normal` 的那一套。所以大多数时候只设 `normal` 就够了。

### 禁用按钮

```js
button.isEnabled = false;
```

**效果**：文字变灰，点了没有反应，不再派发任何事件。设回 `true` 恢复。**「文字变灰」和「不再派发任何事件」未在模拟器验证。**

想让禁用时显示不同的文字，给 `disabled` 状态设：

```js
button.setTitle('提交', { forState: ['normal'] });
button.setTitle('请先填写表单', { forState: ['disabled'] });
```

### 加图标

```js
const icon = UIImage.systemImageNamed('heart.fill');
button.setImage(icon, { forState: ['normal'] });
```

**效果**：文字左边出现一个心形图标，颜色和文字一样是蓝色。只设图标不设文字，按钮就只有图标。**图标的位置和颜色未在模拟器验证。**

`'heart.fill'` 是系统自带图标库 SF Symbols 里的名字。用自己的图片见 [`UIImage`](ui-image.md)。

### 做一个开关式的按钮

「已关注 / 关注」这种点一下切换的按钮，用 `selected` 状态。这个状态系统不会自动改，要在点击回调里自己切。

```js
const follow = new UIButton();
follow.setTitle('关注',   { forState: ['normal'] });
follow.setTitle('已关注', { forState: ['selected'] });
follow.setTitleColor('#007AFF', { forState: ['normal'] });
follow.setTitleColor('#8E8E93', { forState: ['selected'] });

follow.addEventListener('primaryActionTriggered', () => {
  follow.isSelected = !follow.isSelected;
});
```

**效果**：初始显示蓝色的「关注」。点一下变成灰色的「已关注」，再点一下变回来。**这个例子未在模拟器验证。**

### 危险操作的按钮

```js
button.role = 'destructive';
```

**效果**：系统把文字显示成红色，表示这是删除一类的操作。**这条效果未在模拟器验证。**

## 两种按钮：`system` 和 `custom`

创建按钮有两种写法，得到的外观不同。

| 写法 | 得到什么 | 什么时候用 |
| --- | --- | --- |
| `UIButton.buttonWithType('system')` | 系统外观：蓝色文字，按住自动变淡，禁用自动变灰 | 普通的文字按钮 |
| `new UIButton()` | 类型是 `custom`：系统什么都不替你做 | 外观完全自己定的按钮 |

> **注意**：`custom` 按钮的文字默认是白色。放在白色背景上会看不见，要先 `setTitleColor()`。**默认白色这一点未在模拟器验证。**

类型在创建时确定，之后不能改。

## 状态

按钮在任一时刻处于某个状态，`setTitle()` 这类方法的 `forState` 指的就是它。

| 状态 | 什么时候处于这个状态 | 谁来切换 |
| --- | --- | --- |
| `normal` | 平常，以下三种都不是的时候 | — |
| `highlighted` | 手指按在按钮上 | 系统自动 |
| `disabled` | `isEnabled` 是 `false` | 你的代码 |
| `selected` | `isSelected` 是 `true` | 你的代码 |

状态可以同时有多个，比如「选中并且禁用」。所以 `forState` 是数组：

```js
button.setTitle('已关注（不可取消）', { forState: ['selected', 'disabled'] });
```

**效果**：只有 `isSelected` 是 `true` 并且 `isEnabled` 是 `false` 时才显示这行字。

读当前状态用 `button.state`，返回同样形状的数组，比如 `['normal']` 或 `['selected', 'disabled']`。

## 位置和大小

按钮是视图，定位方式和其他视图一样，见 [Auto Layout](auto-layout.md)。按钮特有的只有一点：

- **用 Auto Layout 时不用设宽高。** 按钮会按文字和图标算出自己的大小，只需要约束位置。要固定大小再加宽高约束。
- **用 `frame` 时必须自己给大小。** 不给的话宽高是 0，屏幕上什么都没有。可以调 `button.sizeToFit()` 让它按内容算。

所有尺寸的单位都是[点（pt）](units.md)。

Apple 建议可点击区域不小于 44 × 44 pt。

## 成员说明

### 创建

#### `UIButton.buttonWithType()`

创建一个指定类型的按钮。

```js
const button = UIButton.buttonWithType('system');
```

| `type` | 效果 |
| --- | --- |
| `'system'` | 系统外观的文字按钮 |
| `'custom'` | 系统不画任何东西。等同于 `new UIButton()` |
| `'close'` | 一个圆形的关闭图标（×） |
| `'contactAdd'` | 一个加号图标 |
| `'detailDisclosure'`、`'infoLight'`、`'infoDark'` | 一个圆圈里带 i 的信息图标 |

- **返回**：新建的 `UIButton`。
- 上表里 `'close'`、`'contactAdd'`、`'detailDisclosure'`、`'infoLight'`、`'infoDark'` 画出来的样子**未在模拟器验证**。
- **出错**：`type` 不在上表里时抛 `TypeError`，报错信息里列出所有可用的值。

#### `new UIButton()`

创建一个 `custom` 类型的按钮。没有参数。

### 文字、颜色、图片

这四个方法写法相同：第一个参数是要设的值，第二个参数用 `forState` 指定给哪个状态设。

| 方法 | 设什么 | 值的类型 |
| --- | --- | --- |
| `setTitle(title, { forState })` | 文字 | 字符串 |
| `setTitleColor(color, { forState })` | 文字颜色 | [颜色](ui-color.md) |
| `setImage(image, { forState })` | 图标，显示在文字左边 | [`UIImage`](ui-image.md) |
| `setBackgroundImage(image, { forState })` | 背景图，铺满整个按钮，在文字和图标后面 | [`UIImage`](ui-image.md) |

```js
button.setTitle('提交', { forState: ['normal'] });
```

- **`forState`**：状态名的数组，必填。可用的状态名见[状态](#状态)。
- **值传 `null`**：清除这个状态的设置，退回使用 `normal` 的。**未在模拟器验证。**
- **返回**：无。
- **出错**：
  - 没传 `forState`：`TypeError: setTitle needs { forState }`
  - 状态名写错：`TypeError: forState has no value "pressed"; expected one of: …`

对应有四个读取的方法，读某个状态下设的是什么：

| 方法 | 返回 |
| --- | --- |
| `titleForState(state)` | 字符串或 `null` |
| `titleColorForState(state)` | 颜色字符串或 `null` |
| `imageForState(state)` | `UIImage` 或 `null` |
| `backgroundImageForState(state)` | `UIImage` 或 `null` |

```js
button.setTitle('点我',   { forState: ['normal'] });
button.setTitle('松手！', { forState: ['highlighted'] });

button.titleForState('normal');        // '点我'
button.titleForState('highlighted');   // '松手！'
button.titleForState('disabled');      // '点我'，没设过，返回 normal 的
```

> **注意**：读的时候参数是**一个状态名**（字符串），设的时候是**数组**。两边不一样，这是 iOS 本身的设计。

### 当前显示的内容

这四个属性都是只读，返回按钮**此刻**实际显示的内容，也就是按当前状态选出来的那一套。

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `currentTitle` | 字符串或 `null` | 当前显示的文字。没设过文字时是 `null` |
| `currentTitleColor` | 颜色字符串 | 当前的文字颜色。永远有值 |
| `currentImage` | `UIImage` 或 `null` | 当前显示的图标 |
| `currentBackgroundImage` | `UIImage` 或 `null` | 当前显示的背景图 |

```js
button.setTitle('提交', { forState: ['normal'] });
button.setTitle('请先填写表单', { forState: ['disabled'] });

button.currentTitle;        // '提交'
button.isEnabled = false;
button.currentTitle;        // '请先填写表单'
```

### 其他属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `buttonType` | 字符串 | 是 | 否 | 创建时定 | 按钮类型，取值见 [`buttonWithType()`](#uibuttonbuttonwithtype) |
| `role` | `'normal'` \| `'primary'` \| `'cancel'` \| `'destructive'` | 是 | 是 | `'normal'` | 按钮的用途。系统据此调整外观，`'destructive'` 显示为红色 |
| `titleLabel` | [`UILabel`](ui-label.md) 或 `null` | 是 | 否 | — | 按钮里负责画文字的视图。用来设字体、行数 |
| `imageView` | [`UIImageView`](ui-image.md) 或 `null` | 是 | 否 | — | 按钮里负责画图标的视图 |

以下属性继承自 [`UIControl`](ui-control.md)，按钮最常用：

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `isEnabled` | 布尔 | 是 | 是 | `true` | `false` 时按钮禁用：不响应触摸，进入 `disabled` 状态 |
| `isSelected` | 布尔 | 是 | 是 | `false` | `true` 时进入 `selected` 状态。系统不会自动改它 |
| `isHighlighted` | 布尔 | 是 | 是 | `false` | 手指按住时系统自动设为 `true`，松开设回 `false` |
| `state` | 状态名数组 | 是 | 否 | `['normal']` | 当前状态 |

底色、圆角、透明度、隐藏等继承自 [`UIView`](ui-view.md)。

### 事件

用 `addEventListener()` 监听。按钮常用的是这几个：

| 事件 | 什么时候派发 |
| --- | --- |
| `primaryActionTriggered` | 用户完成了一次点击。**做「点击后执行」用这个** |
| `touchDown` | 手指刚按下 |
| `touchUpInside` | 手指在按钮范围内松开 |
| `touchUpOutside` | 手指按下后滑到按钮外面松开 |
| `touchCancel` | 触摸被系统打断，比如来电 |

- 事件对象只有 `type` 和 `target` 两个字段。
- 事件不能取消，`preventDefault()` 不起作用。
- 回调不是在触摸发生的那一刻同步执行，而是排到主线程的下一轮任务里执行。
- 监听不认识的事件名会抛 `TypeError`。

完整的 16 个事件见 [`UIControl`](ui-control.md)。

## 与 iOS 原生写法的对照

如果你在看 Apple 的文档或 iOS 的示例代码，按这张表换成 JS 的写法。

| ObjC | JS |
| --- | --- |
| `[UIButton buttonWithType:UIButtonTypeSystem]` | `UIButton.buttonWithType('system')` |
| `[btn setTitle:@"点我" forState:UIControlStateNormal]` | `btn.setTitle('点我', { forState: ['normal'] })` |
| `[btn setTitle:@"x" forState:UIControlStateSelected \| UIControlStateDisabled]` | `btn.setTitle('x', { forState: ['selected', 'disabled'] })` |
| `[btn titleForState:UIControlStateHighlighted]` | `btn.titleForState('highlighted')` |
| `[btn setTitleColor:color forState:UIControlStateNormal]` | `btn.setTitleColor(color, { forState: ['normal'] })` |
| `[btn setImage:img forState:UIControlStateNormal]` | `btn.setImage(img, { forState: ['normal'] })` |
| `[btn addTarget:self action:@selector(tap) forControlEvents:UIControlEventPrimaryActionTriggered]` | `btn.addEventListener('primaryActionTriggered', tap)` |
| `btn.currentTitle` | `btn.currentTitle` |
| `btn.titleLabel.font = …` | `btn.titleLabel.font = …` |
| `btn.role = UIButtonRoleDestructive` | `btn.role = 'destructive'` |
| `btn.enabled = NO` | `btn.isEnabled = false` |

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 用一个配置对象设置内边距、图标位置、副标题、填充样式 | `UIButton.Configuration` | 未实现 |
| 文字里混用多种字体和颜色 | `attributedTitle` | 未实现 |
| 点按钮弹出菜单 | `menu`、`showsMenuAsPrimaryAction` | 未实现 |
| 调整图标的粗细和大小 | `setPreferredSymbolConfiguration:` | 未实现 |
| 知道触摸点在按钮上的位置 | 事件对象带触点坐标 | 未实现 |

## 参见

- [`UIControl`](ui-control.md)：按钮的父类，全部事件和状态
- [`UILabel`](ui-label.md)：`titleLabel` 的类型
- [颜色](ui-color.md)
- [单位](units.md)
- [实现原理：事件](../internals/events.md)
