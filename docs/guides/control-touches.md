# 处理控件的触摸

这一篇讲怎么用 [`UIControl`](../api/ui-control.md) 的控件事件响应触摸：响应点击、按下时改外观、区分松手的位置、禁用、在代码里模拟点击，以及自己做一块可点击的区域。每个属性、方法和事件的细节在 [`UIControl`](../api/ui-control.md) 的参考页。

## 推荐的做法

- **按控件选点击事件。** 按钮监听 [`click`](../api/ui-control/click-event.md)。直接创建的 `UIControl` 不派发 `click`（实测），监听 [`touchupinside`](../api/ui-control/touchupinside-event.md)。按钮上两个事件选一个，同时监听会让一次点击执行两遍代码。
- **按下时改外观，要在三个结束事件里都恢复。** 在 [`touchdown`](../api/ui-control/touchdown-event.md) 里改，在 `touchupinside`、[`touchupoutside`](../api/ui-control/touchupoutside-event.md)、[`touchcancel`](../api/ui-control/touchcancel-event.md) 里恢复。一次触摸以这三者之一结束，只恢复一处的话，手指滑出去松开时外观就留在按下的样子。
- **不要在回调里读 `isHighlighted` 判断手指是否按着。** 回调排在触摸之后执行，读到的是执行那一刻的值，见[回调的执行时机](../api/ui-control.md#回调的执行时机)。
- **模拟用户操作用 [`sendActionsForControlEvents()`](../api/ui-control/sendactionsforcontrolevents.md)，不用 `dispatchEvent()`。** 前者和真实触摸走同一条途径，按钮的 `click` 也会跟着派发。

平时用到的事件只有下面几个。其余的描述手指拖动的细节，用于自己实现「按住并拖动」这类交互。

| 想做的事 | 监听的事件 |
| --- | --- |
| 按钮被点击后执行代码 | `click` |
| 直接创建的 `UIControl` 被点击后执行代码 | `touchupinside` |
| 手指按下时立刻改变外观 | `touchdown`，并在 `touchupinside`、`touchupoutside`、`touchcancel` 里恢复 |
| 开关、滑块这类控件的值变了 | [`change`](../api/ui-control/change-event.md) |
| 输入框的文字变了 | [`input`](../api/ui-control/input-event.md) |
| 输入框开始输入、结束输入、用户按了回车 | [`focus`](../api/ui-control/focus-event.md)、[`blur`](../api/ui-control/blur-event.md)、[`return`](../api/ui-control/return-event.md) |

## 第一个例子

从空白 App 开始，在屏幕正中放一块绿色的可点击区域。按住时它变淡，点一下计数加一。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 创建控件。它本身不显示任何内容，底色和圆角用视图的属性设
  const card = new UIControl();
  card.backgroundColor = 'systemGreen';
  card.layer.cornerRadius = 10;

  // 2. 在控件里放一行文字。文字不接收触摸，触摸由 card 处理
  const label = new UILabel();
  label.text = '点了 0 次';
  label.textColor = 'white';
  label.isUserInteractionEnabled = false;
  card.addSubview(label);

  // 3. 手指按下时变淡
  card.addEventListener('touchdown', () => {
    card.alpha = 0.6;
  });

  // 4. 手指在控件范围内松开：恢复外观，计数加一
  let count = 0;
  card.addEventListener('touchupinside', () => {
    card.alpha = 1;
    count += 1;
    label.text = '点了 ' + count + ' 次';
    console.log('点击', count);
  });

  // 5. 手指滑到控件外面松开，或者触摸被系统取消：只恢复外观
  card.addEventListener('touchupoutside', () => {
    card.alpha = 1;
  });
  card.addEventListener('touchcancel', () => {
    card.alpha = 1;
  });

  // 6. 放到页面上，宽 220 pt、高 52 pt，位置定在正中
  card.translatesAutoresizingMaskIntoConstraints = false;
  label.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(card);
  NSLayoutConstraint.activateConstraints([
    card.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    card.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
    card.widthAnchor.constraintEqualToConstant(220),
    card.heightAnchor.constraintEqualToConstant(52),
    label.centerXAnchor.constraintEqualToAnchor(card.centerXAnchor),
    label.centerYAnchor.constraintEqualToAnchor(card.centerYAnchor),
  ]);
});
```

**效果**

- 屏幕正中出现一个绿色圆角矩形，中间是白色的「点了 0 次」。
- 手指按住时矩形变淡，松开恢复。
- 手指在矩形上松开，文字变成「点了 1 次」，控制台输出 `点击 1`。
- 手指按下后滑到矩形外面再松开，文字不变，控制台不输出。

这段代码没有作为一个整体在模拟器运行过。`UIControl` 的创建、底色、圆角、约束、`touchdown` 和 `touchupinside` 在验收用例里运行过，真实点击时这两个事件依次派发。**`touchupoutside`、`touchcancel` 的派发，以及触摸落在文字上时由 `card` 接收，未在模拟器验证。**

下面各节沿用这里的 `card`、`label` 和 `page`。用到按钮和输入框的小节会自己创建。单独试某一节时，先写这几行：

```js
const page = new UIViewController();
const card = new UIControl();
page.view.addSubview(card);
const label = new UILabel();
label.isUserInteractionEnabled = false;
card.addSubview(label);
```

## 点击后执行代码

按钮监听 `click`：

```js
const button = UIButton.buttonWithType('system');
button.setTitle('提交', { forState: ['normal'] });
button.addEventListener('click', () => {
  console.log('提交');
});
```

**效果**：用户点一次按钮，控制台输出一次 `提交`。按钮还需要加到页面上并定位，写法见[做一个按钮](buttons.md)。

直接创建的 `UIControl` 监听 `touchupinside`：

```js
card.addEventListener('touchupinside', () => {
  console.log('点了 card');
});
```

**效果**：手指在 `card` 范围内松开，控制台输出 `点了 card`。

> **注意**：直接创建的 `UIControl` 被点击时不派发 `click`（实测）。在它上面监听这个事件，回调不会执行，也不会报错。

## 按下时立刻有反应

`touchdown` 在手指刚接触屏幕时派发，比松手早。

```js
card.addEventListener('touchdown', () => {
  card.backgroundColor = 'systemTeal';
});
card.addEventListener('touchupinside', () => {
  card.backgroundColor = 'systemGreen';
});
```

**效果**：手指按下，底色变成青色。手指在控件内松开，底色变回绿色。**颜色变化未在模拟器验证。**

手指也可能在控件外松开，或者触摸被系统取消。要在所有情况下都恢复外观，还要监听 `touchupoutside` 和 `touchcancel`，见[第一个例子](#第一个例子)的第 5 步。

## 区分在内部松手和滑出去松手

```js
card.addEventListener('touchupinside', () => {
  console.log('确认');
});
card.addEventListener('touchupoutside', () => {
  console.log('放弃');
});
```

**效果**

- 手指按下后在控件范围内松开，输出 `确认`。
- 手指按下后滑到控件外面再松开，输出 `放弃`。**未在模拟器验证。**

一次触摸只派发这两个事件中的一个。

## 手指滑出、滑回时改变外观

```js
card.addEventListener('touchdragexit', () => {
  card.alpha = 1;
});
card.addEventListener('touchdragenter', () => {
  card.alpha = 0.6;
});
```

**效果**

- 手指按住并滑出控件边界，控件恢复不透明。每次越过边界只派发一次 [`touchdragexit`](../api/ui-control/touchdragexit-event.md)（实测）。
- 手指不松开滑回控件内，控件再次变淡。**[`touchdragenter`](../api/ui-control/touchdragenter-event.md) 未在模拟器验证。**

## 读出手指的位置

`touch` 开头的九个事件带手指的位置，在控件自己的坐标系里。

```js
card.addEventListener('touchupinside', (e) => {
  const { location, tapCount } = /** @type {UIControlTouchEvent} */ (e);
  if (location !== null) {
    console.log(location.x, location.y, tapCount);
  }
});
```

**效果**：手指在 `card` 上松开时，控制台输出手指在 `card` 里的横坐标、纵坐标和连击次数。

用代码派发的事件没有手指，`location` 是 `null`，所以读之前先判断。细节见[触点位置](../api/ui-control.md#触点位置)。

## 禁用控件

```js
card.isEnabled = false;
```

**效果**：`card.state` 变成 `['disabled']`。控件不再接收触摸，不派发任何控件事件。设回 `true` 恢复。**「不派发事件」未在模拟器验证。**

直接创建的 `UIControl` 禁用后外观不变。要让它看起来是禁用的，自己改外观：

```js
card.isEnabled = false;
card.alpha = 0.4;
```

**效果**：`card` 变成半透明。

按钮禁用后的外观由按钮自己处理，见[做一个按钮](buttons.md#禁用按钮)。

## 只响应一次

```js
card.addEventListener('touchupinside', () => {
  console.log('只输出一次');
}, { once: true });
```

**效果**：第一次点击输出 `只输出一次`。之后再点不输出。

回调执行前监听就被移除了。

## 取消监听

把注册时的那个函数传给 [`removeEventListener()`](../api/ui-control/removeeventlistener.md)。

```js
const onTap = () => {
  console.log('点了');
};
card.addEventListener('touchupinside', onTap);

// 之后不想再收到
card.removeEventListener('touchupinside', onTap);
```

**效果**：移除之后点击 `card`，不输出。

传入的必须是同一个函数对象。重新写一个内容相同的箭头函数不能移除原来的监听。

## 用代码模拟一次点击

```js
card.addEventListener('touchdown', () => {
  console.log('touchdown');
});
card.addEventListener('touchupinside', () => {
  console.log('touchupinside');
});

card.sendActionsForControlEvents(['touchdown', 'touchupinside']);
console.log('已发出');
```

**效果**：控制台先输出 `已发出`，随后输出 `touchdown` 和 `touchupinside`。两个回调都在这段代码执行完之后才执行。**`touchdown` 和 `touchupinside` 之间的先后未在模拟器验证。**

这个方法只派发事件。它不改变 `isHighlighted`，屏幕上没有按下的效果。和 `dispatchEvent()` 的区别见 [`sendActionsForControlEvents()`](../api/ui-control/sendactionsforcontrolevents.md#和-dispatchevent-的区别)。

## 不要用定时器等事件

```js
card.addEventListener('touchupinside', () => {
  console.log('A');
});
card.sendActionsForControlEvents(['touchupinside']);
setTimeout(() => {
  console.log('B');
}, 0);
```

**效果**：`B` 可能先于 `A` 输出（实测）。

控件事件和定时器回调的先后没有保证。需要等事件时，在事件回调里继续后面的工作。

## 读当前状态

```js
console.log(card.state);                       // ['normal']

card.isSelected = true;
console.log(card.state);                       // ['selected']

card.isEnabled = false;
console.log(card.state.includes('disabled'));  // true
console.log(card.state.includes('selected'));  // true
```

**效果**：[`state`](../api/ui-control/state.md) 是状态名的数组。三个状态都不成立时是 `['normal']`。同时选中和禁用时，数组里有 `'selected'` 和 `'disabled'` 两项。

数组里各项的顺序没有保证。判断某个状态用 `includes()`，不要按下标取。

## 做一个点一下切换的控件

`selected` 状态系统不会自动切换。在点击回调里自己改 [`isSelected`](../api/ui-control/isselected.md)。

```js
card.addEventListener('touchupinside', () => {
  card.isSelected = !card.isSelected;
  card.backgroundColor = card.isSelected ? 'systemGray' : 'systemGreen';
  label.text = card.isSelected ? '已选中' : '未选中';
});
```

**效果**：点一下，底色变成灰色，文字变成「已选中」。再点一下变回绿色和「未选中」。**这个例子未在模拟器验证。**

## 让内容靠左或靠右

[`contentHorizontalAlignment`](../api/ui-control/contenthorizontalalignment.md) 和 [`contentVerticalAlignment`](../api/ui-control/contentverticalalignment.md) 决定控件的内容在控件范围内怎么摆放。内容指子类自己显示的东西，例如按钮的文字和图标。

```js
const wide = UIButton.buttonWithType('system');
wide.setTitle('靠左的文字', { forState: ['normal'] });
wide.contentHorizontalAlignment = 'leading';

wide.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(wide);
NSLayoutConstraint.activateConstraints([
  wide.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
  wide.topAnchor.constraintEqualToAnchor(page.view.safeAreaLayoutGuide.topAnchor, { constant: 20 }),
  wide.widthAnchor.constraintEqualToConstant(300),
]);
```

**效果**：按钮宽 300 pt，文字贴着按钮的左边缘。不设这个属性时文字在按钮正中。**文字的位置未在模拟器验证。**

这两个属性对直接创建的 `UIControl` 没有可见效果，因为它自己不显示内容。用 `addSubview()` 加进去的子视图不受它们影响，位置由约束决定。

## 监听输入框的文字变化

输入框是 `UIControl` 的子类，它派发 [`focus`](../api/ui-control/focus-event.md)、[`input`](../api/ui-control/input-event.md)、[`blur`](../api/ui-control/blur-event.md)、[`return`](../api/ui-control/return-event.md) 四个事件。

```js
const field = new UITextField();
field.addEventListener('input', () => {
  console.log('现在的文字：', field.text);
});
```

**效果**：用户每输入或删除一个字符，控制台输出一次当前的文字。**未在模拟器验证。**

输入框的创建、定位和键盘见 [`UITextField`](../api/ui-text-field.md)。

## 把可点击的区域写成函数

把[第一个例子](#第一个例子)里的做法整理成一个函数：创建控件，按住时变淡，手指滑出去恢复，点击时调用传入的函数。

```js
/**
 * @param {() => void} onTap 点击时执行
 * @returns {UIControl}
 */
function makeTappable(onTap) {
  const control = new UIControl();
  const restore = () => {
    control.alpha = 1;
  };
  control.addEventListener('touchdown', () => {
    control.alpha = 0.6;
  });
  control.addEventListener('touchdragexit', restore);
  control.addEventListener('touchdragenter', () => {
    control.alpha = 0.6;
  });
  control.addEventListener('touchupoutside', restore);
  control.addEventListener('touchcancel', restore);
  control.addEventListener('touchupinside', () => {
    restore();
    onTap();
  });
  return control;
}

const row = makeTappable(() => {
  console.log('点了这一行');
});
row.backgroundColor = 'secondarySystemBackground';
row.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(row);
NSLayoutConstraint.activateConstraints([
  row.leadingAnchor.constraintEqualToAnchor(page.view.leadingAnchor),
  row.trailingAnchor.constraintEqualToAnchor(page.view.trailingAnchor),
  row.topAnchor.constraintEqualToAnchor(page.view.safeAreaLayoutGuide.topAnchor, { constant: 80 }),
  row.heightAnchor.constraintEqualToConstant(52),
]);
```

**效果**：页面上方出现一条和屏幕等宽、高 52 pt 的浅灰色区域。按住时变淡，手指滑出去恢复，在它上面松手输出 `点了这一行`。**这个例子未在模拟器验证。**

往这个区域里加文字和图标时，把它们的 `isUserInteractionEnabled` 设成 `false`，让触摸由控件接收。

## 参见

- [`UIControl`](../api/ui-control.md)：全部属性、方法、事件和状态
- [做一个按钮](buttons.md)：按钮的点击、外观和禁用
- [`UITextField`](../api/ui-text-field.md)：输入框
- [手势识别器](../api/ui-gesture-recognizer.md)：让不是控件的视图响应点按和长按
- [Auto Layout](../api/auto-layout.md)：例子里定位用的约束
