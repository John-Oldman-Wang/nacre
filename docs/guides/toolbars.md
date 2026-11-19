# 做一个工具条

这一篇讲怎么用 [`UIToolbar`](../api/ui-toolbar.md) 做一排按钮：放到页面底部、排按钮、增减按钮、放到键盘上方。按钮本身是 [`UIBarButtonItem`](../api/ui-bar-button-item.md)。每个属性和方法的细节在参考页。

## 推荐的做法

- **用 Auto Layout 定位，约束左右和下边。** 屏幕宽度变化时工具条跟着变宽，高度由它自己决定（48 pt），代码里不出现具体的高度。
- **在按钮上监听点击。** 工具条自己没有事件，点击来自每个 `UIBarButtonItem` 的 `click`。
- **按钮只保留一份引用就够了。** 工具条持有它的项，把按钮放进 `items` 之后，自己不留变量，按钮和它的监听器也不会丢。
- **增减按钮时用 [`setItems(items, { animated: true })`](../api/ui-toolbar/setitems.md)。** 直接写 [`items`](../api/ui-toolbar/items.md) 是立刻换掉，没有过渡。
- **一个按钮只放进一个工具条。** 同一个 `UIBarButtonItem` 放进第二个工具条时不报错，两个工具条的 `items` 里都有它；画面上它出现在哪一个里**未在模拟器验证**。

## 第一个工具条

从空白 App 开始，在页面底部放一条工具条，左边一个加号，右边一个垃圾桶。

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

安全区是屏幕上不被刘海、圆角和底部横条遮挡的区域，见 [`UIView` 的安全区](../api/ui-view.md#安全区)。

这段代码没有作为一个整体在模拟器运行过。

四步分别是：创建工具条、创建按钮、排进去、放到页面上。下面的每种用法都是在这四步上改，沿用 `toolbar`、`add`、`trash` 和 `page` 这几个变量。单独试某一节时，先写这几行：

```js
const page = new UIViewController();
const toolbar = new UIToolbar();
const add = UIBarButtonItem.systemItem('add');
const trash = UIBarButtonItem.systemItem('trash');
page.view.addSubview(toolbar);
```

## 新建的工具条为什么看不见

新建的工具条 `frame` 是 0 × 0，里面没有按钮。

| 原因 | 处理 |
| --- | --- |
| 用 Auto Layout 定位，但没约束左右两边 | 约束左右两边和上边（或下边）。高度不用约束，它自己是 48 pt |
| 用 `frame` 定位，没给宽度 | 先写 `frame` 给出位置和宽度，再调一次 `sizeToFit()` |
| `items` 是空的 | 往 [`items`](../api/ui-toolbar/items.md) 里放按钮 |

48 pt 是在 iPhone Air 模拟器（iOS 27.2）上量到的。不要把这个数写进代码：需要知道高度时读 `toolbar.intrinsicContentSize.height`，或者让约束去决定。

## 把按钮排在中间

工具条没有「左对齐」「居中」「间距」这类属性。按钮从左边开始一个挨一个排，要在中间留出空白，往 `items` 里放一个占位的项：

| 占位的项 | 作用 |
| --- | --- |
| `UIBarButtonItem.flexibleSpace()` | 弹性空白：占满剩下的宽度。几个弹性空白平分 |
| `UIBarButtonItem.fixedSpace(width)` | 固定宽度的空白，`width` 的单位是 [pt](../api/units.md) |

```js
const share = new UIBarButtonItem({ title: '分享' });
toolbar.items = [UIBarButtonItem.flexibleSpace(), share, UIBarButtonItem.flexibleSpace()];
```

**效果**：工具条上只有「分享」两个字，在正中间。

## 三个按钮均匀分开

```js
const share2 = new UIBarButtonItem({ title: '分享' });
toolbar.items = [
  add,
  UIBarButtonItem.flexibleSpace(),
  share2,
  UIBarButtonItem.flexibleSpace(),
  trash,
];
```

**效果**：加号在左端，「分享」在中间，垃圾桶在右端。

## 在两个按钮之间留固定的距离

```js
toolbar.items = [add, UIBarButtonItem.fixedSpace(24), trash];
```

**效果**：加号和垃圾桶都靠左，中间隔 24 pt。

## 加一个按钮

`items` 读出来是一份快照，往这个数组里 `push` 不改变工具条。要增减按钮，整个重新赋值：

```js
toolbar.items = [...toolbar.items, UIBarButtonItem.systemItem('done')];
```

**效果**：「完成」加到最右边。原来的按钮还是原来的对象，监听器都在。

## 带动画地增减按钮

```js
toolbar.setItems([add, UIBarButtonItem.flexibleSpace()], { animated: true });
console.log(toolbar.items.length);
```

**效果**：垃圾桶淡出。控制台输出 `2`：`items` 在调用返回时已经是新的那一组。

## 清空工具条

```js
toolbar.items = [];
```

**效果**：工具条上没有按钮，横条还在。写 `null` 效果相同。

## 禁用其中一个按钮

```js
trash.isEnabled = false;
```

**效果**：垃圾桶变灰，点它没有反应。加号不受影响。

`isEnabled` 是按钮自己的属性，见 [`UIBarItem` 的 `isEnabled`](../api/ui-bar-item/isenabled.md)。

## 改按钮的颜色

```js
toolbar.tintColor = 'systemRed';
```

**效果**：工具条上所有按钮的文字和图标变成红色。

颜色的写法见[颜色](../api/ui-color.md)。写 `null` 恢复成继承来的颜色。

## 改工具条的底色

```js
toolbar.barTintColor = '#1C1C1E';
```

**效果**：横条的底色变成深灰。**在 iOS 26 的界面风格下这个属性是否还改变画面，未在模拟器验证。**

## 用 `frame` 定位

```js
const fixed = new UIToolbar();
fixed.frame = new CGRect(0, 300, 390, 0);
fixed.sizeToFit();
page.view.addSubview(fixed);
console.log(fixed.frame.height);
```

**效果**：控制台输出 `48`。一条 390 pt 宽的工具条，上边在页面的 y = 300 处。

`sizeToFit()` 只改高度，宽度和位置不变。不调它，工具条的高度就是写进 `frame` 的那个值。

## 放在键盘上方

[`UISearchBar`](../api/ui-search-bar.md) 的 [`inputAccessoryView`](../api/ui-search-bar/inputaccessoryview.md) 接受一个视图，键盘弹出时这个视图贴在键盘上面。放一个工具条，就得到键盘上方的一排按钮：

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

## 参见

- [`UIToolbar`](../api/ui-toolbar.md)：全部属性和方法
- [`UIBarButtonItem`](../api/ui-bar-button-item.md)：`UIBarButtonItem` 怎么创建、有哪些系统预置的图标
- [Auto Layout](../api/auto-layout.md)：约束左右和下边的写法
