# 做一个按钮

这一篇讲怎么用 [`UIButton`](../api/ui-button.md) 做出常见的按钮：创建、响应点击、改外观、禁用、加图标。每个属性和方法的细节在 [`UIButton`](../api/ui-button.md) 的参考页。

## 推荐的做法

- **用 [`UIButton.buttonWithType('system')`](../api/ui-button/buttonwithtype.md) 创建。** `system` 按钮自带按住时变淡、禁用时变灰的外观，不用另外写代码。外观完全自己定的按钮用 [`new UIButton()`](../api/ui-button/constructor.md)，代价是文字颜色、按住时的样子都要自己设。
- **用 `click` 监听点击。** `click` 表示「按钮被触发了」。`touchupinside`（手指在按钮范围内松开）在点击时也会派发；两者选一个，同时监听的话一次点击执行两遍。需要触点位置时用 `touchupinside`，它的事件对象带 `location`，`click` 的不带。
- **可点击的范围就是按钮的范围。** 文字很短的按钮只有文字那么大，不容易点中。Apple 建议可点击区域不小于 44 × 44 pt，写法见[把点击范围放大到 44 pt](#把点击范围放大到-44-pt)。

## 第一个按钮

从空白 App 开始，在屏幕正中放一个按钮，点一下在控制台输出一行字。

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
  button.addEventListener('click', () => {
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

四步分别是：创建、设文字、监听点击、放到页面上。下面的每种用法都是在这四步上改，沿用 `button` 和 `page` 这两个变量。单独试某一节时，先写这几行：

```js
const page = new UIViewController();
const button = UIButton.buttonWithType('system');
page.view.addSubview(button);
```

## 新建的按钮为什么看不见

新建的按钮没有文字，也没有大小。按钮显示不出来通常是以下原因之一：

| 原因 | 处理 |
| --- | --- |
| 没有设文字和图标 | 调 [`setTitle()`](../api/ui-button/settitle.md) 或 [`setImage()`](../api/ui-button/setimage.md) |
| `new UIButton()` 创建的按钮，文字是白色，放在浅色背景上 | 调 [`setTitleColor()`](../api/ui-button/settitlecolor.md)。**默认白色未在模拟器验证** |
| 用 `frame` 定位但没给宽高，宽高是 0 | 给宽高，或者调 `sizeToFit()` 让按钮按内容算出大小 |
| 没有加到页面上 | 调 `addSubview()` |

用 Auto Layout 定位时不用给宽高，按钮按文字和图标算出自己的大小，只需要约束位置。

## 什么算一次点击

手指按在按钮上，然后在按钮范围内松开，算一次点击，按钮派发一次 `click`。

- **按下后滑到按钮外面再松手，不算点击。** 这时不派发 `click`。**未在模拟器验证。**
- **连点两下是两次点击。** 回调执行两次，按钮不会合并连续的点击。不希望重复执行时的写法见[防止重复提交](#防止重复提交)。实测连点两次时两次按下都派发了事件；`click` 派发两次**未在模拟器验证**。
- **禁用的按钮不响应触摸。** `isEnabled` 是 `false` 时点击没有反应，不派发任何事件。**未在模拟器验证。**
- **回调不是在手指松开的那一刻执行的。** 它排在当前这一轮代码之后执行，见[回调的执行时机](../api/ui-control.md#回调的执行时机)。
- **回调里抛出异常不影响按钮。** 异常在 [`application`](../api/application.md) 上派发 `error`，同一个事件的其他回调照常执行，按钮之后还能点。

## 防止重复提交

提交订单这类只应该执行一次的操作，在回调里用一个变量记住「正在处理」，同时禁用按钮。

```js
let submitting = false;
button.addEventListener('click', () => {
  if (submitting) return;
  submitting = true;
  button.isEnabled = false;
  console.log('开始提交');
  // 提交完成后：submitting = false; button.isEnabled = true;
});
```

**效果**：第一次点击输出 `开始提交`，按钮进入禁用状态，之后的点击不再输出。**未在模拟器验证。**

两样都要有。回调在点击之后才执行，按钮被禁用之前可能已经有第二次点击在等待执行，所以用变量判断；禁用按钮让用户看得出现在不能点。

## 改文字颜色

```js
button.setTitleColor('#FF3B30', { forState: ['normal'] });
```

**效果**：文字变成红色。按住时仍然自动变淡。

颜色可以写 `'#RRGGBB'`，也可以写 `'systemRed'` 这类系统颜色名，见[颜色](../api/ui-color.md)。

## 加底色和圆角

底色和圆角是按钮作为视图的属性。

```js
button.backgroundColor = '#007AFF';
button.layer.cornerRadius = 10;
button.setTitleColor('white', { forState: ['normal'] });

NSLayoutConstraint.activateConstraints([
  button.widthAnchor.constraintEqualToConstant(200),
  button.heightAnchor.constraintEqualToConstant(44),
]);
```

**效果**：一个宽 200 pt、高 44 pt 的蓝色圆角矩形，圆角半径 10 pt，中间是白色的文字。

不设宽高时，按钮只有文字那么大，底色紧贴着文字。

## 把点击范围放大到 44 pt

按钮按内容算出的大小不够 44 × 44 pt 时，加两条「不小于」的约束：

```js
NSLayoutConstraint.activateConstraints([
  button.widthAnchor.constraintGreaterThanOrEqualToConstant(44),
  button.heightAnchor.constraintGreaterThanOrEqualToConstant(44),
]);
```

**效果**：按钮的宽和高都不小于 44 pt。文字更长时按钮仍然按文字变宽。**未在模拟器验证。**

## 改字体和字号

按钮自己没有字体属性。文字由按钮里的一个 [`UILabel`](../api/ui-label.md) 显示，通过 [`titleLabel`](../api/ui-button/titlelabel.md) 拿到它再设。

```js
const label = button.titleLabel;
if (label) {
  label.font = UIFont.systemFontOfSize(20, { weight: 'semibold' });
}
```

**效果**：文字变成 20 pt 的半粗体。

> **注意**：文字内容和颜色不要通过 `titleLabel` 改，用 `setTitle()` 和 `setTitleColor()`。直接改 `titleLabel.text`，按钮下次切换状态时会把它换回去。

## 按住时换一套文字和颜色

给 `highlighted` 状态单独设一套。

```js
button.setTitle('点我', { forState: ['normal'] });
button.setTitle('松手！', { forState: ['highlighted'] });
button.setTitleColor('#FF3B30', { forState: ['highlighted'] });
```

**效果**：平常显示「点我」。手指按住期间显示红色的「松手！」，松开变回「点我」。

## 禁用按钮

```js
button.isEnabled = false;
```

**效果**：文字变灰，点了没有反应。设回 `true` 恢复。**「文字变灰」和「点了没有反应」未在模拟器验证。**

禁用时显示另一行字，给 `disabled` 状态设：

```js
button.setTitle('提交', { forState: ['normal'] });
button.setTitle('请先填写表单', { forState: ['disabled'] });
```

**效果**：`isEnabled` 是 `false` 时显示「请先填写表单」。

## 加图标

```js
button.setImage(UIImage.systemImageNamed('heart.fill'), { forState: ['normal'] });
```

**效果**：文字左边出现一个心形图标，颜色和文字一样。只设图标不设文字，按钮就只有图标。**图标的位置和颜色未在模拟器验证。**

`'heart.fill'` 是系统自带图标库 SF Symbols 里的名字。用自己的图片见 [`UIImage`](../api/ui-image.md)。

## 做一个开关式的按钮

「关注 / 已关注」这种点一下切换的按钮，用 `selected` 状态。系统不会自动改这个状态，要在点击回调里自己切。

```js
const follow = UIButton.buttonWithType('system');
follow.setTitle('关注', { forState: ['normal'] });
follow.setTitle('已关注', { forState: ['selected'] });
follow.setTitleColor('#8E8E93', { forState: ['selected'] });

follow.addEventListener('click', () => {
  follow.isSelected = !follow.isSelected;
});
```

**效果**：初始显示「关注」。点一下变成灰色的「已关注」，再点一下变回来。**未在模拟器验证。**

## 删除一类的按钮

```js
button.role = 'destructive';
```

**效果**：文字显示为红色，表示这是不可恢复的操作。**未在模拟器验证。**

## 参见

- [`UIButton`](../api/ui-button.md)：全部属性、方法和状态
- [`UIControl`](../api/ui-control.md)：全部事件、触点位置、回调的执行时机
- [Auto Layout](../api/auto-layout.md)：按钮的位置和大小
