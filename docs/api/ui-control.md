---
type: reference
native: UIControl
status: partial
---

# `UIControl`

`UIControl` 是控件：能接收触摸、并把触摸过程转换成一组「控件事件」的视图。它是所有可交互控件的共同父类，[`UIButton`](ui-button.md)（按钮）和 [`UITextField`](ui-text-field.md)（输入框）都继承它。

它提供两样东西：

- **状态**：平常、手指按住、禁用、选中。
- **控件事件**：手指按下、移出、松开等 16 个事件，用 `addEventListener()` 监听。

它相当于 HTML 表单控件共有的那部分，也就是 `disabled` 属性和 `click`、`input` 这类事件。有五点不同：

- **没有 `click` 事件。** 按钮的点击对应 `primaryActionTriggered`。直接创建的 `UIControl` 的点击对应 `touchUpInside`。两者的区别见[点击用哪个事件](#点击用哪个事件)。
- **事件不冒泡。** 事件只派发到注册监听的那个控件上，父视图收不到。
- **事件对象只有 `type` 和 `target`。** 没有触点坐标。
- **事件不能取消。** `preventDefault()` 不起作用。
- **回调不是同步执行的。** 触摸发生后，回调稍后才执行，见[回调的执行时机](#回调的执行时机)。

`UIControl` 也可以直接创建。它本身不显示任何内容，可以用来做一块自定义的可点击区域。

这一页分三部分：先给一个[能直接运行的完整例子](#完整例子)，再按[你想做的事](#常见用法)给出写法和效果，最后是[每个成员的说明](#成员说明)。

## 完整例子

下面的代码从空白 App 开始，在屏幕正中放一块绿色的可点击区域。按住时它变淡，点一下计数加一。

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
  card.addEventListener('touchDown', () => {
    card.alpha = 0.6;
  });

  // 4. 手指在控件范围内松开：恢复外观，计数加一
  let count = 0;
  card.addEventListener('touchUpInside', () => {
    card.alpha = 1;
    count += 1;
    label.text = '点了 ' + count + ' 次';
    console.log('点击', count);
  });

  // 5. 手指滑到控件外面松开，或者触摸被系统取消：只恢复外观
  card.addEventListener('touchUpOutside', () => {
    card.alpha = 1;
  });
  card.addEventListener('touchCancel', () => {
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

这段代码没有作为一个整体在模拟器运行过。`UIControl` 的创建、底色、圆角、约束、`touchDown` 和 `touchUpInside` 在验收用例里运行过，真实点击时这两个事件依次派发。**`touchUpOutside`、`touchCancel` 的派发，以及触摸落在文字上时由 `card` 接收，未在模拟器验证。**

## 常见用法

以下例子都假设已经有上面的 `card`、`label` 和 `page`。用到按钮和输入框的小节会自己创建。

### 点击后执行代码

按钮监听 `primaryActionTriggered`：

```js
const button = UIButton.buttonWithType('system');
button.setTitle('提交', { forState: ['normal'] });
button.addEventListener('primaryActionTriggered', () => {
  console.log('提交');
});
```

**效果**：用户点一次按钮，控制台输出一次 `提交`。按钮还需要加到页面上并定位，写法见 [`UIButton`](ui-button.md)。

直接创建的 `UIControl` 监听 `touchUpInside`：

```js
card.addEventListener('touchUpInside', () => {
  console.log('点了 card');
});
```

**效果**：手指在 `card` 范围内松开，控制台输出 `点了 card`。

> **注意**：直接创建的 `UIControl` 被点击时不派发 `primaryActionTriggered`（实测）。在它上面监听这个事件，回调不会执行，也不会报错。

### 按下时立刻有反应

`touchDown` 在手指刚接触屏幕时派发，比松手早。

```js
card.addEventListener('touchDown', () => {
  card.backgroundColor = 'systemTeal';
});
card.addEventListener('touchUpInside', () => {
  card.backgroundColor = 'systemGreen';
});
```

**效果**：手指按下，底色变成青色。手指在控件内松开，底色变回绿色。**颜色变化未在模拟器验证。**

手指也可能在控件外松开，或者触摸被系统取消。要在所有情况下都恢复外观，还要监听 `touchUpOutside` 和 `touchCancel`，见[完整例子](#完整例子)的第 5 步。

### 区分在内部松手和滑出去松手

```js
card.addEventListener('touchUpInside', () => {
  console.log('确认');
});
card.addEventListener('touchUpOutside', () => {
  console.log('放弃');
});
```

**效果**

- 手指按下后在控件范围内松开，输出 `确认`。
- 手指按下后滑到控件外面再松开，输出 `放弃`。**未在模拟器验证。**

一次触摸只派发这两个事件中的一个。

### 手指滑出、滑回时改变外观

```js
card.addEventListener('touchDragExit', () => {
  card.alpha = 1;
});
card.addEventListener('touchDragEnter', () => {
  card.alpha = 0.6;
});
```

**效果**

- 手指按住并滑出控件边界，控件恢复不透明。每次越过边界只派发一次 `touchDragExit`（实测）。
- 手指不松开滑回控件内，控件再次变淡。**`touchDragEnter` 未在模拟器验证。**

### 禁用控件

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

按钮禁用后的外观由按钮自己处理，见 [`UIButton`](ui-button.md)。

### 只响应一次

```js
card.addEventListener('touchUpInside', () => {
  console.log('只输出一次');
}, { once: true });
```

**效果**：第一次点击输出 `只输出一次`。之后再点不输出。

回调执行前监听就被移除了。

### 取消监听

把注册时的那个函数传给 `removeEventListener()`。

```js
const onTap = () => {
  console.log('点了');
};
card.addEventListener('touchUpInside', onTap);

// 之后不想再收到
card.removeEventListener('touchUpInside', onTap);
```

**效果**：移除之后点击 `card`，不输出。

传入的必须是同一个函数对象。重新写一个内容相同的箭头函数不能移除原来的监听。

### 用代码模拟一次点击

```js
card.addEventListener('touchDown', () => {
  console.log('touchDown');
});
card.addEventListener('touchUpInside', () => {
  console.log('touchUpInside');
});

card.sendActionsForControlEvents(['touchDown', 'touchUpInside']);
console.log('已发出');
```

**效果**：控制台先输出 `已发出`，随后输出 `touchDown` 和 `touchUpInside`。两个回调都在这段代码执行完之后才执行。**`touchDown` 和 `touchUpInside` 之间的先后未在模拟器验证。**

这个方法只派发事件。它不改变 `isHighlighted`，屏幕上没有按下的效果。

和 `dispatchEvent()` 的区别见[`sendActionsForControlEvents()` 和 `dispatchEvent()`](#sendactionsforcontrolevents-和-dispatchevent)。

### 读当前状态

```js
console.log(card.state);                       // ['normal']

card.isSelected = true;
console.log(card.state);                       // ['selected']

card.isEnabled = false;
console.log(card.state.includes('disabled'));  // true
console.log(card.state.includes('selected'));  // true
```

**效果**：`state` 是状态名的数组。三个状态都不成立时是 `['normal']`。同时选中和禁用时，数组里有 `'selected'` 和 `'disabled'` 两项。

数组里各项的顺序没有保证。判断某个状态用 `includes()`，不要按下标取。

### 做一个点一下切换的控件

`selected` 状态系统不会自动切换。在点击回调里自己改。

```js
card.addEventListener('touchUpInside', () => {
  card.isSelected = !card.isSelected;
  card.backgroundColor = card.isSelected ? 'systemGray' : 'systemGreen';
  label.text = card.isSelected ? '已选中' : '未选中';
});
```

**效果**：点一下，底色变成灰色，文字变成「已选中」。再点一下变回绿色和「未选中」。**这个例子未在模拟器验证。**

### 让内容靠左或靠右

`contentHorizontalAlignment` 和 `contentVerticalAlignment` 决定控件的内容在控件范围内怎么摆放。内容指子类自己显示的东西，例如按钮的文字和图标。

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

这两个属性对直接创建的 `UIControl` 没有可见效果，因为它自己不显示内容。你用 `addSubview()` 加进去的子视图不受它们影响，位置由你的约束决定。

### 监听输入框的文字变化

输入框是 `UIControl` 的子类，它使用 `editing` 开头的四个事件。

```js
const field = new UITextField();
field.addEventListener('editingChanged', () => {
  console.log('现在的文字：', field.text);
});
```

**效果**：用户每输入或删除一个字符，控制台输出一次当前的文字。**未在模拟器验证。**

输入框的创建、定位和键盘见 [`UITextField`](ui-text-field.md)。

### 自己做一个可点击的区域

把[完整例子](#完整例子)里的做法整理成一个函数：创建控件，按住时变淡，点击时调用传入的函数。

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
  control.addEventListener('touchDown', () => {
    control.alpha = 0.6;
  });
  control.addEventListener('touchDragExit', restore);
  control.addEventListener('touchDragEnter', () => {
    control.alpha = 0.6;
  });
  control.addEventListener('touchUpOutside', restore);
  control.addEventListener('touchCancel', restore);
  control.addEventListener('touchUpInside', () => {
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

## 控件事件

控件事件是 `UIControl` 把一次触摸的过程拆开后派发的事件。Web 里的 `pointermove` 不区分手指在不在元素内，控件事件把「在内部」「在外部」「越过边界」分成了不同的事件。

事件一共 16 个，名字区分大小写。

### 触摸类：9 个

所有控件都派发。下表按一次触摸的过程排列。

| 事件 | 什么时候派发 | 派发次数 |
| --- | --- | --- |
| `touchDown` | 手指按在控件上 | 每次触摸一次 |
| `touchDownRepeat` | 短时间内连续点击时，从第二次按下起派发。**未在模拟器验证** | 每次重复按下一次 |
| `touchDragInside` | 手指按住，在控件范围内移动 | 移动期间持续派发 |
| `touchDragExit` | 手指按住，从控件内移到控件外，越过边界的那一刻 | 每次越过边界一次 |
| `touchDragOutside` | 手指按住，在控件范围外移动 | 移动期间持续派发 |
| `touchDragEnter` | 手指按住，从控件外移回控件内，越过边界的那一刻。**未在模拟器验证** | 每次越过边界一次 |
| `touchUpInside` | 手指在控件范围内松开 | 每次触摸最多一次 |
| `touchUpOutside` | 手指在控件范围外松开。**未在模拟器验证** | 每次触摸最多一次 |
| `touchCancel` | 触摸被系统取消，没有正常松开。例如触摸被手势识别器接管。**未在模拟器验证** | 每次触摸最多一次 |

手势识别器是 iOS 里另一套识别滑动、长按等动作的机制，它识别成功后可以取消视图上正在进行的触摸。

一次触摸以 `touchUpInside`、`touchUpOutside`、`touchCancel` 三者之一结束。

### 一次触摸的事件序列

**普通点击**（按下，不移动，松开），在直接创建的 `UIControl` 上实测：

```
touchDown → touchUpInside
```

**按下后滑出去再松手**，前四步实测：

```
touchDown
→ touchDragInside（手指在内部每移动一次派发一次）
→ touchDragExit（一次）
→ touchDragOutside（手指在外部每移动一次派发一次）
→ touchUpOutside
```

**最后一步 `touchUpOutside` 未在模拟器验证。**

**滑出去又滑回来再松手**：在上面的 `touchDragOutside` 之后是 `touchDragEnter`、`touchDragInside`，最后是 `touchUpInside`。**未在模拟器验证。**

### 其他：7 个

这些事件只有特定的子类派发。

| 事件 | 什么时候派发 | 哪些控件派发 |
| --- | --- | --- |
| `primaryActionTriggered` | 用户完成了控件的主要操作。对按钮来说就是一次点击 | [`UIButton`](ui-button.md)（实测）。直接创建的 `UIControl` 不派发（实测） |
| `valueChanged` | 控件的值变了 | 开关、滑块这类有值的控件。这些控件还没有实现，见[还不能做的](#还不能做的) |
| `menuActionTriggered` | 控件弹出菜单前。**未在模拟器验证** | 带菜单的控件。菜单还没有实现 |
| `editingDidBegin` | 输入框开始编辑 | [`UITextField`](ui-text-field.md) |
| `editingChanged` | 输入框的文字被用户改了。**未在模拟器验证** | [`UITextField`](ui-text-field.md) |
| `editingDidEnd` | 输入框结束编辑 | [`UITextField`](ui-text-field.md) |
| `editingDidEndOnExit` | 用户按了键盘上的回车键 | [`UITextField`](ui-text-field.md) |

在任何控件上监听这 16 个事件都不会报错。控件不派发的事件，回调不会执行。

用户点输入框时，`editingDidBegin` 在手指按下时派发，不等松手（实测）。

### 点击用哪个事件

| 控件 | 用哪个事件 | 原因 |
| --- | --- | --- |
| [`UIButton`](ui-button.md) | `primaryActionTriggered` | 它表示「用户触发了这个按钮」，不限定触发方式 |
| 直接创建的 `UIControl` | `touchUpInside` | 它不派发 `primaryActionTriggered` |

`touchUpInside` 描述的是触摸过程：手指在控件内松开。`primaryActionTriggered` 描述的是结果：控件的主要操作被触发了。Web 的 `click` 也是描述结果的事件，键盘和辅助功能都能触发它，所以它对应 `primaryActionTriggered`。

按钮被点击时两个事件都派发。**两者的先后未在模拟器验证。**

没有 `'click'` 这个事件名。监听它会抛 `TypeError`，见 [`addEventListener()`](#addeventlistener)。

## 和 Web 事件的差别

| Web | 控件事件 |
| --- | --- |
| `pointerdown` | `touchDown` |
| `pointermove` | `touchDragInside`、`touchDragOutside`、`touchDragEnter`、`touchDragExit` |
| `pointerup` | `touchUpInside`、`touchUpOutside` |
| `pointercancel` | `touchCancel` |
| `click` | `primaryActionTriggered`（按钮）、`touchUpInside`（直接创建的 `UIControl`） |
| `input` | `editingChanged` |
| `focus`、`blur` | `editingDidBegin`、`editingDidEnd` |

除了名字，还有这些差别：

- **不冒泡，也没有捕获阶段。** 事件只派发到调用 `addEventListener()` 的那个控件上。在父视图上监听收不到子控件的事件。`stopPropagation()` 可以调用，没有任何效果。
- **只有 `touch*` 那九个带触点坐标**，见下面一节。其余事件的对象只有 `type` 和 `target`。
- **不能取消。** 事件对象的 `cancelable` 是 `false`。`preventDefault()` 可以调用，没有任何效果。
- **回调延后执行。** 见下一节。
- **事件名是固定的 16 个。** 在控件上监听其他名字会抛 `TypeError`。Web 里可以在任何元素上监听自定义事件名，控件上不行。

## 触点位置

九个 `touch*` 事件的对象上有两个额外字段：

```js
button.addEventListener('touchUpInside', (e) => {
  e.location;    // CGPoint，**这个控件自己的坐标系**
  e.tapCount;    // 连击次数
});
```

**只有这九个有**：`touchDown` / `touchDownRepeat` / `touchDragInside` / `touchDragOutside` / `touchDragEnter` / `touchDragExit` / `touchUpInside` / `touchUpOutside` / `touchCancel`。

其余事件**根本没有这两个字段**，不是「有但为 null」：

| 事件 | 为什么没有 |
| --- | --- |
| `editingDidBegin` / `editingChanged` / `editingDidEnd` / `editingDidEndOnExit` | 文本编辑，和触点无关 |
| `valueChanged` / `primaryActionTriggered` / `menuActionTriggered` | **和触点没有固定关系**——多数来自一次点击或拖动，但程序改 `slider.value`、或者 `sendActionsForControlEvents()` 也会发。不确定就不承诺 |

这是 Web 的做法：`clientX` 在 `MouseEvent` 上，`KeyboardEvent` 这个接口上根本没有它。

### 没有真实触点时 `location` 是 `null`

```js
button.sendActionsForControlEvents(['touchUpInside']);
// 收到的事件：location === null，tapCount === 0
```

这条路上压根没有触摸，所以给 `null` 而**不是 `(0, 0)`**——后者是个合法坐标，和「没有触点」分不开。

> 类型上这两个字段在 `UIControlTouchEvent` 接口里。回调参数的类型没有窄化（`EventTarget` 的基类签名不允许），要拿就转一下型，和导航的 `willshow` 一样。

## 回调的执行时机

触摸发生时回调不会立刻执行。它会稍后执行，背景见[运行时怎么工作](how-it-works.md#事件)。

这带来两个后果。

**回调里读到的是执行那一刻的状态，不是事件发生那一刻的状态。**

```js
card.addEventListener('touchDown', () => {
  console.log(card.isHighlighted);
});
```

**效果**：手指按住不放时输出 `true`。手指按下后很快松开时可能输出 `false`，因为回调执行时系统已经把 `isHighlighted` 改回去了（实测）。

事件对象上没有事件发生那一刻的状态。

**控件事件和定时器回调的先后没有保证。**

```js
card.addEventListener('touchUpInside', () => {
  console.log('A');
});
card.sendActionsForControlEvents(['touchUpInside']);
setTimeout(() => {
  console.log('B');
}, 0);
```

**效果**：`B` 可能先于 `A` 输出（实测）。不要用「等一个 0 毫秒的定时器」来等事件到达。需要等事件时，在事件回调里继续后面的工作。

## 状态

控件在任一时刻处于一个或多个状态。子类按状态显示不同的外观，例如按钮可以给每个状态设不同的文字。

| 状态 | 什么时候处于这个状态 | 谁来切换 |
| --- | --- | --- |
| `normal` | 以下四种都不成立 | 无 |
| `highlighted` | `isHighlighted` 是 `true`：手指按在控件上 | 系统自动。按下时设为 `true`，松开时设回 `false`。你的代码也可以写 |
| `disabled` | `isEnabled` 是 `false` | 你的代码 |
| `selected` | `isSelected` 是 `true` | 你的代码。系统不会自动改 |
| `focused` | 控件拥有焦点。**未在模拟器验证** | 系统 |

`normal` 之外的状态可以同时成立，例如「选中并且禁用」。所以 `state` 读出来是数组：

```js
card.isSelected = true;
card.isEnabled = false;
console.log(card.state);   // 包含 'selected' 和 'disabled'
```

**效果**：数组里有两项。各项的顺序没有保证。

`state` 是只读的。要改变状态，写 `isEnabled`、`isSelected`、`isHighlighted`。

状态变化不派发事件。`isEnabled` 和 `isSelected` 只有你的代码会改，不需要通知。`isHighlighted` 由系统在触摸时改，可以用 `touchDown` 和三个结束事件得知触摸的开始和结束。

## `sendActionsForControlEvents()` 和 `dispatchEvent()`

两个方法都能让监听器的回调执行，途径不同。

| | `sendActionsForControlEvents()` | `dispatchEvent()` |
| --- | --- | --- |
| 途径 | 交给原生控件，由原生控件派发 | 只在 JS 侧派发 |
| 谁会收到 | 这个控件上该事件的所有接收方，包括 JS 监听器和系统自己的处理 | 只有 JS 监听器 |
| 回调什么时候执行 | 下一轮任务。方法返回时回调还没执行（实测） | 立刻。方法返回时回调已经执行完 |
| 参数 | 事件名的数组 | 一个 `Event` 对象 |
| 返回值 | 无 | 布尔值 |

```js
card.addEventListener('touchUpInside', () => {
  console.log('回调');
});

card.dispatchEvent(new Event('touchUpInside'));
console.log('dispatchEvent 之后');

card.sendActionsForControlEvents(['touchUpInside']);
console.log('sendActions 之后');
```

**效果**：控制台依次输出 `回调`、`dispatchEvent 之后`、`sendActions 之后`、`回调`。**这个例子作为整体未在模拟器验证。**

要模拟用户操作，用 `sendActionsForControlEvents()`。它和真实触摸走同一条途径。

两个方法都不改变控件的状态，屏幕上没有按下的效果。

## 成员说明

### 继承关系

```
EventTarget → NSObject → UIResponder → UIView → UIControl
```

`UIControl` 的子类：[`UIButton`](ui-button.md)、[`UITextField`](ui-text-field.md)。

底色、圆角、透明度、隐藏、位置和大小等成员继承自 [`UIView`](ui-view.md)，本页不重复。

### 创建

#### `new UIControl()`

创建一个控件。没有参数。

```js
const control = new UIControl();
```

- 新建的控件不显示任何内容。位置是 `(0, 0)`，宽高是 0。要给它大小和底色才能看到。
- 不能继承：`class MyControl extends UIControl {}` 在 `new MyControl()` 时抛 `TypeError`，见[原生类](native-classes.md)。

### 状态属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `isEnabled` | 布尔 | 是 | 是 | `true` | `true`：控件接收触摸。`false`：控件不接收触摸，进入 `disabled` 状态，子类会改变外观 |
| `isSelected` | 布尔 | 是 | 是 | `false` | `true`：进入 `selected` 状态。`false`：离开。系统不会自动改它，含义由你的代码决定 |
| `isHighlighted` | 布尔 | 是 | 是 | `false` | `true`：进入 `highlighted` 状态。`false`：离开。手指按下时系统自动设为 `true`，松开时设回 `false` |
| `state` | 状态名的数组 | 是 | 否 | `['normal']` | 当前的全部状态，由上面三个属性合成。取值见[状态](#状态) |
| `isTracking` | 布尔 | 是 | 否 | `false` | `true`：控件正在跟踪一次触摸，从手指按下到松开或取消。`false`：没有触摸在进行 |
| `isTouchInside` | 布尔 | 是 | 否 | `false` | `true`：正在跟踪的触摸此刻在控件范围内。`false`：在范围外，或者没有触摸在进行。**默认值未在模拟器验证** |

这些属性的变化都不派发事件，原因见[状态](#状态)。

写 `state` 抛 `TypeError`。

### 内容对齐

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `contentHorizontalAlignment` | 字符串，取值见下表 | 是 | 是 | `'center'` | 内容在控件范围内的水平位置 |
| `contentVerticalAlignment` | 字符串，取值见下表 | 是 | 是 | `'center'`。**未在模拟器验证** | 内容在控件范围内的垂直位置 |

内容指子类自己显示的东西：按钮的文字和图标，输入框的文字。直接创建的 `UIControl` 没有内容，这两个属性对它没有可见效果。

下面两张表里各取值的显示效果**未在模拟器验证**。

| `contentHorizontalAlignment` | 效果 |
| --- | --- |
| `'center'` | 内容水平居中 |
| `'left'` | 内容贴左边缘 |
| `'right'` | 内容贴右边缘 |
| `'fill'` | 内容在水平方向拉伸到和控件一样宽 |
| `'leading'` | 内容贴起始边缘。从左到右的语言里是左边，从右到左的语言（如阿拉伯语）里是右边 |
| `'trailing'` | 内容贴结束边缘。和 `'leading'` 相反 |

| `contentVerticalAlignment` | 效果 |
| --- | --- |
| `'center'` | 内容垂直居中 |
| `'top'` | 内容贴上边缘 |
| `'bottom'` | 内容贴下边缘 |
| `'fill'` | 内容在垂直方向拉伸到和控件一样高 |

这两个属性没有变化通知，只有你的代码会改它们。

写入表里没有的值抛 `TypeError`：

```
contentHorizontalAlignment has no value "middle"; expected one of: center / left / right / fill / leading / trailing
contentVerticalAlignment has no value "middle"; expected one of: center / top / bottom / fill
```

### 方法

#### `sendActionsForControlEvents()`

让控件派发指定的事件，途径和真实触摸相同。

```js
card.sendActionsForControlEvents(['touchDown', 'touchUpInside']);
```

- **参数** `types`：事件名的数组，可以一次给多个。可用的名字见[控件事件](#控件事件)。空数组不派发任何事件。
- **返回**：无。
- 监听器的回调在下一轮任务里执行。方法返回时回调还没执行。
- 一次给多个事件时，**它们到达的先后未在模拟器验证**。
- **出错**：
  - 参数不是数组：`TypeError: sendActionsForControlEvents needs an array of names; expected any of: touchDown / touchDownRepeat / …`
  - 数组里有不认识的名字：`TypeError: sendActionsForControlEvents has no value "tap"; expected one of: touchDown / touchDownRepeat / …`。这时一个事件都不派发。

#### `addEventListener()`

监听一个控件事件。

```js
card.addEventListener('touchUpInside', (e) => {
  console.log(e.type);            // 'touchUpInside'
  console.log(e.target === card); // true
});
```

- **参数** `type`：事件名，16 个之一，见[控件事件](#控件事件)。
- **参数** `callback`：回调函数，参数是事件对象。传 `null` 时什么都不做。
- **参数** `options`：可选。`{ once: true }` 表示回调执行一次后自动移除。
- **返回**：无。
- 同一个事件名和同一个函数重复注册，只算一次。
- 回调里抛出的异常不影响同一事件的其他回调。运行时把异常输出到控制台，以 `Event listener threw:` 开头。
- **出错**：
  - 事件名不在 16 个之内：`TypeError: addEventListener has no value "click"; expected one of: touchDown / touchDownRepeat / touchDragInside / touchDragOutside / touchDragEnter / touchDragExit / touchUpInside / touchUpOutside / touchCancel / valueChanged / primaryActionTriggered / menuActionTriggered / editingDidBegin / editingChanged / editingDidEnd / editingDidEndOnExit`
  - `callback` 不是函数也不是 `null`：`TypeError: Failed to execute 'addEventListener': parameter 2 is not of type 'Function'.`

事件对象的成员：

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `type` | 字符串 | 事件名 |
| `target` | 控件 | 派发事件的控件。`currentTarget` 和它相同 |
| `cancelable` | 布尔 | 固定是 `false` |
| `defaultPrevented` | 布尔 | 固定是 `false` |
| `preventDefault()` | 方法 | 可以调用，没有效果 |
| `stopPropagation()` | 方法 | 可以调用，没有效果 |
| `stopImmediatePropagation()` | 方法 | 同一个事件里排在后面的回调不再执行 |

#### `removeEventListener()`

移除一个监听。

```js
const onTap = () => {
  console.log('点了');
};
card.addEventListener('touchUpInside', onTap);
card.removeEventListener('touchUpInside', onTap);
```

- **参数** `type`：注册时的事件名。
- **参数** `callback`：注册时的那个函数。
- **返回**：无。
- 没有注册过的事件名和函数，什么都不做，不报错。

#### `dispatchEvent()`

只在 JS 侧派发一个事件。原生控件不参与。

```js
const notPrevented = card.dispatchEvent(new Event('touchUpInside'));
console.log(notPrevented);   // true
```

- **参数** `event`：一个 `Event` 对象。用 `new Event(事件名)` 创建。
- **返回**：布尔值。有回调调用了 `preventDefault()` 并且事件的 `cancelable` 是 `true` 时返回 `false`，其他情况返回 `true`。
- 回调在方法返回前执行完。
- **出错**：参数不是 `Event` 对象：`TypeError: Failed to execute 'dispatchEvent': parameter 1 is not of type 'Event'.`

和 `sendActionsForControlEvents()` 的区别见[上文](#sendactionsforcontrolevents-和-dispatchevent)。

### 事件

16 个控件事件的名字、派发时机、派发的控件见[控件事件](#控件事件)。

- 事件对象只有 `type` 和 `target` 有用，见 [`addEventListener()`](#addeventlistener)。
- 事件不能取消。
- 事件不冒泡。
- 回调在下一轮任务里执行，见[回调的执行时机](#回调的执行时机)。
- 一次只能监听一个事件名。要监听多个，分别调用 `addEventListener()`。

## 与 iOS 原生写法的对照

如果你在看 Apple 的文档或 iOS 的示例代码，按这张表换成 JS 的写法。

| ObjC | JS |
| --- | --- |
| `[[UIControl alloc] init]` | `new UIControl()` |
| `[c addTarget:self action:@selector(tap:) forControlEvents:UIControlEventTouchUpInside]` | `c.addEventListener('touchUpInside', fn)` |
| `[c removeTarget:self action:@selector(tap:) forControlEvents:UIControlEventTouchUpInside]` | `c.removeEventListener('touchUpInside', fn)` |
| `[c sendActionsForControlEvents:UIControlEventTouchDown \| UIControlEventTouchUpInside]` | `c.sendActionsForControlEvents(['touchDown', 'touchUpInside'])` |
| `c.enabled = NO` | `c.isEnabled = false` |
| `c.selected = YES` | `c.isSelected = true` |
| `c.highlighted` | `c.isHighlighted` |
| `c.state & UIControlStateSelected` | `c.state.includes('selected')` |
| `c.tracking` | `c.isTracking` |
| `c.touchInside` | `c.isTouchInside` |
| `c.contentHorizontalAlignment = UIControlContentHorizontalAlignmentLeading` | `c.contentHorizontalAlignment = 'leading'` |
| `c.contentVerticalAlignment = UIControlContentVerticalAlignmentTop` | `c.contentVerticalAlignment = 'top'` |

命名规则：

- 事件名是 ObjC 常量去掉 `UIControlEvent` 前缀，首字母小写。`UIControlEventTouchUpInside` 是 `'touchUpInside'`。
- 状态名是 ObjC 常量去掉 `UIControlState` 前缀，首字母小写。
- 原生的位掩码（多个值用 `|` 组合）在 JS 里是字符串数组。
- 原生的 `addTarget:action:forControlEvents:` 叫 target-action：给控件登记一个对象和它的一个方法，事件发生时控件调用这个方法。JS 里用 `addEventListener()` 代替。

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 在回调里得到事件发生那一刻的状态 | 事件对象带状态 | 未实现 |
| 响应长按、拖动、捏合、轻扫 | `UIGestureRecognizer` 及其子类 | 未实现 |
| 自己处理原始触摸，决定控件怎么跟踪手指 | 覆写 `touchesBegan:withEvent:`、`beginTrackingWithTouch:withEvent:` 等方法 | 未实现 |
| 用开关、滑块、分段选择、步进器、日期选择 | `UISwitch`、`UISlider`、`UISegmentedControl`、`UIStepper`、`UIDatePicker` | 未实现 |
| 一次监听所有触摸事件 | `UIControlEventAllTouchEvents` 等聚合掩码 | 未实现。逐个事件名调用 `addEventListener()` |
| 在控件上监听自定义名字的事件 | 无。Web 的 `EventTarget` 允许 | 未实现 |
| 点控件弹出菜单 | `contextMenuInteraction`、`showsMenuAsPrimaryAction` | 未实现 |
| 让父视图收到子控件的事件 | 无。原生的控件事件也不冒泡 | 未实现 |

## 参见

- [`UIButton`](ui-button.md)：最常用的控件，文字和图标按状态设置
- [`UITextField`](ui-text-field.md)：输入框，使用 `editing` 开头的四个事件
- [`UIView`](ui-view.md)：父类，位置、大小、底色、`isUserInteractionEnabled`
- [`UILabel`](ui-label.md)：例子里显示文字用的视图
- [Auto Layout](auto-layout.md)：例子里定位用的约束
- [颜色](ui-color.md)：`'systemGreen'` 这类颜色字符串的写法
- [单位](units.md)：pt 和像素的关系
- [原生类](native-classes.md)：为什么不能继承 `UIControl`
- [实现原理：事件](../internals/events.md)：触摸在 iOS 里经过的四套机制和实测的派发顺序
