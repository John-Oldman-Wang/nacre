---
type: reference
native: UIToolbar
status: partial
---

# `UIToolbar`

**`UIToolbar`** 表示一条工具条：一个横条，里面从左到右排着若干个按钮。每个按钮是一个 [`UIBarButtonItem`](ui-bar-button-item.md)，和导航条上的按钮是同一种对象。

工具条是[视图](ui-view.md)，位置、宽度、隐藏、透明度都来自视图。它放在哪里由 App 决定：常见的是页面底部，或者键盘的上方。

这一页里的数值和状态变化（默认值、大小、读写的结果、报错）是在模拟器（iPhone Air，iOS 27.2）上的 App 里对没有放进窗口的工具条量的。画面上的样子（按钮怎么排、颜色、动画）和真实点击**未在模拟器验证**。

## 工具条自己没有事件

工具条不是控件，用户点它不会派发事件。点击来自里面的每一个 `UIBarButtonItem`：在哪个按钮上监听 `click`，就在哪个按钮被点时收到。

```js
const trash = UIBarButtonItem.systemItem('trash');
trash.addEventListener('click', () => console.log('删除'));
toolbar.items = [trash];
```

`UIBarButtonItem` 怎么创建、有哪些系统预置的图标、怎么禁用，见[导航条上的东西](ui-bar-button-item.md#uibarbuttonitem)。

## 新建的工具条为什么看不见

新建的工具条 `frame` 是 0 × 0。它自己想要的高度是 48 pt，对宽度没有要求。

- 用 [Auto Layout](auto-layout.md) 定位时，约束它的左右两边和上边（或下边）。高度不用约束，它自己是 48 pt。
- 用 `frame` 定位时，先写 `frame` 给出位置和宽度，再调一次 `sizeToFit()`，高度变成 48 pt。

48 pt 是系统给的值，在 iPhone Air 模拟器（iOS 27.2）上量到。不要把这个数写进代码：需要知道高度时读 `toolbar.intrinsicContentSize.height`，或者让约束去决定。别的机型和系统版本上是不是同一个数**未验证**。

新建的工具条里没有按钮，`items` 是空数组。

## 按钮之间的空白也是一个项

工具条没有「左对齐」「居中」「间距」这类属性。按钮从左边开始一个挨一个排，要在中间留出空白，往 `items` 里放一个占位的项：

| 占位的项 | 作用 |
| --- | --- |
| `UIBarButtonItem.flexibleSpace()` | 弹性空白：占满剩下的宽度。几个弹性空白平分 |
| `UIBarButtonItem.fixedSpace(width)` | 固定宽度的空白，`width` 的单位是 [pt](units.md) |

所以「一左一右」是 `[左, 弹性空白, 右]`，「居中」是 `[弹性空白, 中, 弹性空白]`。

## `items` 读出来是一份快照

`toolbar.items` 每次读都得到一个新数组，里面是工具条当时的那几个项。往这个数组里 `push`、`pop` 不会改变工具条。

要增减按钮，整个重新赋值：

```js
toolbar.items = [...toolbar.items, UIBarButtonItem.systemItem('add')];
```

数组里的每个项仍然是原来的对象：读出来的 `toolbar.items[0]` 和写进去的那个按钮 `===` 相等，按钮上的监听器和自定义属性都在。

## 推荐的做法

**用 Auto Layout 定位，约束左右和下边。** 屏幕宽度变化时工具条跟着变宽，高度由它自己决定，代码里不出现具体的高度。

**按钮只保留一份引用就够了。** 工具条持有它的项。把按钮放进 `items` 之后，自己不留变量，按钮和它的监听器也不会丢。

**增减按钮时用 `setItems(items, { animated: true })`。** 直接写 `items` 是立刻换掉，没有过渡。

**一个按钮只放进一个工具条。** 同一个 `UIBarButtonItem` 放进第二个工具条时不报错，两个工具条的 `items` 里都有它；画面上它出现在哪一个里**未在模拟器验证**。

## 完整例子

下面的代码从空白 App 开始，在页面底部放一条工具条，左边一个加号，右边一个垃圾桶。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 创建工具条
  const toolbar = new UIToolbar();

  // 2. 创建按钮，各自监听点击
  const add = UIBarButtonItem.systemItem('add');
  add.addEventListener('click', () => console.log('新建'));
  const trash = UIBarButtonItem.systemItem('trash');
  trash.addEventListener('click', () => console.log('删除'));

  // 3. 排进工具条：加号在左，垃圾桶在右，中间是弹性空白
  toolbar.items = [add, UIBarButtonItem.flexibleSpace(), trash];

  // 4. 放到页面底部：左右贴边，下边贴安全区。高度不用给
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

安全区是屏幕上不被刘海、圆角和底部横条遮挡的区域，见 [`UIView` 的安全区](ui-view.md#安全区)。

这段代码没有作为一个整体在模拟器运行过。

四步分别是：创建工具条、创建按钮、排进去、放到页面上。后面的每种用法都是在这四步上改。

## 常见用法

以下例子都假设已经有上面的 `toolbar`、`add`、`trash` 和 `page`。

### 把按钮排在中间

```js
const share = new UIBarButtonItem({ title: '分享' });
toolbar.items = [UIBarButtonItem.flexibleSpace(), share, UIBarButtonItem.flexibleSpace()];
```

**效果**：工具条上只有「分享」两个字，在正中间。

### 三个按钮均匀分开

```js
const share = new UIBarButtonItem({ title: '分享' });
toolbar.items = [
  add,
  UIBarButtonItem.flexibleSpace(),
  share,
  UIBarButtonItem.flexibleSpace(),
  trash,
];
```

**效果**：加号在左端，「分享」在中间，垃圾桶在右端。

### 在两个按钮之间留固定的距离

```js
toolbar.items = [add, UIBarButtonItem.fixedSpace(24), trash];
```

**效果**：加号和垃圾桶都靠左，中间隔 24 pt。

### 带动画地增减按钮

```js
toolbar.setItems([add, UIBarButtonItem.flexibleSpace()], { animated: true });
console.log(toolbar.items.length);
```

**效果**：垃圾桶淡出。控制台输出 `2`：`items` 在调用返回时已经是新的那一组。

### 清空工具条

```js
toolbar.items = [];
```

**效果**：工具条上没有按钮，横条还在。写 `null` 效果相同。

### 禁用其中一个按钮

```js
trash.isEnabled = false;
```

**效果**：垃圾桶变灰，点它没有反应。加号不受影响。

`isEnabled` 是按钮自己的属性，见 [`UIBarItem`](ui-bar-button-item.md#uibaritem)。

### 改按钮的颜色

```js
toolbar.tintColor = 'systemRed';
```

**效果**：工具条上所有按钮的文字和图标变成红色。

颜色的写法见[颜色](ui-color.md)。写 `null` 恢复成继承来的颜色。

### 改工具条的底色

```js
toolbar.barTintColor = '#1C1C1E';
```

**效果**：横条的底色变成深灰。**在 iOS 26 的界面风格下这个属性是否还改变画面，未在模拟器验证。**

### 用 `frame` 定位

```js
const fixed = new UIToolbar();
fixed.frame = new CGRect(0, 300, 390, 0);
fixed.sizeToFit();
page.view.addSubview(fixed);
console.log(fixed.frame.height);
```

**效果**：控制台输出 `48`。一条 390 pt 宽的工具条，上边在页面的 y = 300 处。

`sizeToFit()` 只改高度，宽度和位置不变。不调它，工具条的高度就是写进 `frame` 的那个值。

### 放在键盘上方

[`UISearchBar`](ui-search-bar.md) 的 `inputAccessoryView` 接受一个视图，键盘弹出时这个视图贴在键盘上面。放一个工具条，就得到键盘上方的一排按钮：

```js
const search = new UISearchBar();
const bar = new UIToolbar();
const done = UIBarButtonItem.systemItem('done');
done.addEventListener('click', () => search.resignFirstResponder());
bar.items = [UIBarButtonItem.flexibleSpace(), done];
bar.sizeToFit();
search.inputAccessoryView = bar;
```

**效果**：点搜索框弹出键盘时，键盘上面多一条工具条，右端是「完成」。点它，键盘收起。**这个例子未在模拟器验证。**

## 成员说明

### 创建

#### `new UIToolbar()`

创建一条工具条。没有参数。`frame` 是 0 × 0，没有按钮。

`UIToolbar` 不能被继承，`class X extends UIToolbar` 在 `new X()` 时抛 `TypeError`，见[原生类](native-classes.md#不能继承)。

### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `items` | `UIBarButtonItem` 的数组 | 是 | 是 | `[]` | 工具条上的项，从左到右。读出来是快照。写 `null` 等于写空数组。没有变化事件：改它的只有 App 自己的代码 |
| `barStyle` | `'default'` \| `'black'` | 是 | 是 | `'default'` | `'default'`：跟随系统的浅色或深色。`'black'`：深色的条。画面上的差别**未在模拟器验证** |
| `isTranslucent` | 布尔 | 是 | 是 | `true` | `true`：条的背景半透明，能透出下面的内容。`false`：不透明。画面上的差别**未在模拟器验证** |
| `tintColor` | [颜色](ui-color.md)字符串 | 是 | 是 | 继承来的颜色 | 按钮的文字和图标的颜色。读出来永远有值。写 `null` 是恢复成继承来的颜色 |
| `barTintColor` | [颜色](ui-color.md)字符串或 `null` | 是 | 是 | `null` | 条自己的底色。`null` 表示用系统的背景 |

写错时：

- `items` 写了不是数组的值（数、字符串），抛 `TypeError: items needs an array of UIBarButtonItem or null`。数组里有不是 `UIBarButtonItem` 的元素（别的对象、`null`、字符串），抛 `TypeError: items needs an array of UIBarButtonItem`。两种情况下原来的项都不变。
- `barStyle` 写了别的值，不抛，在控制台输出一条警告 `[Nacre] barStyle has no value "dark"; expected one of: default / black, ignored`，原值不变。
- 两个颜色属性写了不合法的颜色，不抛，在控制台输出一条警告，原值不变，见[颜色](ui-color.md#写错不抛打警告)。
- `isTranslucent` 写别的类型的值时按真假转成布尔：`0` 是 `false`，`'false'` 是 `true`。

`items` 除了数组，也接受 `Set` 这类可以遍历的对象。

位置、大小、隐藏、透明度等继承自 [`UIView`](ui-view.md)。自己想要的大小从 `intrinsicContentSize` 读：宽是 -1（没有要求），高是 48。

### 方法

#### `setItems(items, options)`

换一组项，可以带动画。

```js
toolbar.setItems([add, trash], { animated: true });
```

- **`items`**：`UIBarButtonItem` 的数组。`null` 等于空数组。
- **`options.animated`**：布尔，可以不传。`true` 时新加的项淡入、去掉的项淡出、留下的项移到新位置；不传或 `false` 时立刻换掉，等同于直接写 `items`。
- **返回**：无。
- 带动画时，`items` 属性在调用返回时已经是新的那一组。没有「动画结束」的通知。
- **出错**：`items` 不是数组时抛 `TypeError: setItems needs an array of UIBarButtonItem or null`；数组里有不是 `UIBarButtonItem` 的元素时抛 `TypeError: setItems needs an array of UIBarButtonItem`。原来的项不变。

## 与 iOS 原生写法的对照

如果你在看 Apple 的文档或 iOS 的示例代码，按这张表换成 JS 的写法。

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

`UIBarStyleBlackOpaque` 和 `UIBarStyleBlackTranslucent` 从 iOS 13 起废弃，没有对应的取值。

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 整体定制工具条的外观（背景、阴影、按钮的文字样式） | `standardAppearance` 等四个属性，`UIToolbarAppearance` | 未实现 |
| 给工具条换背景图和阴影图 | `setBackgroundImage:forToolbarPosition:barMetrics:`、`setShadowImage:forToolbarPosition:` | 未实现 |
| 告诉系统工具条在页面的顶部还是底部 | `barPosition`、`UIToolbarDelegate` 的 `positionForBar:` | 未实现。它要求同步返回一个值 |
| 使用导航控制器自带的工具条 | `UINavigationController.toolbar`、`UIViewController.toolbarItems` | 未实现 |
| 把工具条放到 [`UITextField`](ui-text-field.md) 的键盘上方 | `UITextField.inputAccessoryView` | 未实现。[`UISearchBar`](ui-search-bar.md) 的可以 |

## 参见

- [导航条上的东西](ui-bar-button-item.md)：`UIBarButtonItem` 怎么创建、有哪些成员
- [`UISearchBar`](ui-search-bar.md)：同一组里的另一个条；它的 `inputAccessoryView` 可以放工具条
- [`UIView`](ui-view.md)：工具条的父类，位置、大小、隐藏
- [Auto Layout](auto-layout.md)：约束左右和下边的写法
- [颜色](ui-color.md)
- [单位](units.md)
- [实现原理：工具条和搜索框](../internals/bars.md)
