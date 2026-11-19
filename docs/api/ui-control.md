---
type: reference
native: UIControl
status: partial
---

# `UIControl`

**`UIControl`** 表示一个控件：一种能接收触摸的视图，它把一次触摸的过程转换成一组「控件事件」派发出来。它是所有可交互控件的共同父类，[`UIButton`](ui-button.md)（按钮）、[`UITextField`](ui-text-field.md)（输入框）、[`UISwitch`](ui-switch.md)（开关）、[`UISlider`](ui-slider.md)（滑块）都继承它。

控件提供两样东西：

- **[状态](#状态)**：平常、手指按住、禁用、选中。子类按状态显示不同的外观。
- **[控件事件](#事件)**：手指按下、移出、松开等 16 个事件，用 [`addEventListener()`](ui-control/addeventlistener.md) 监听。

`UIControl` 也可以直接创建。直接创建的控件不显示任何内容，用来做自定义的可点击区域：给它底色，往里面加文字和图标，再监听它的事件。普通的 [`UIView`](ui-view.md) 不派发控件事件，要让普通视图响应点击，用[手势识别器](ui-gesture-recognizer.md)。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → `UIControl`

怎么用控件事件做一个可点击的区域、处理按下和松开，见指南[处理控件的触摸](../guides/control-touches.md)。

## 构造函数

[`UIControl()`](ui-control/constructor.md)

创建一个不显示任何内容的控件，用来做自定义的可点击区域。

## 实例属性

还继承 [`UIView`](ui-view.md) 的属性。控件常用的继承属性是 `backgroundColor`、`alpha`、`layer`、`isUserInteractionEnabled`。

| 属性 | 说明 |
| --- | --- |
| [`isEnabled`](ui-control/isenabled.md) | 控件是否接收触摸。`false` 时进入 `disabled` 状态 |
| [`isSelected`](ui-control/isselected.md) | 控件是否处于 `selected` 状态。只有 App 的代码会改 |
| [`isHighlighted`](ui-control/ishighlighted.md) | 控件是否处于 `highlighted` 状态。手指按住时系统设为 `true` |
| [`state`](ui-control/state.md) <small>只读</small> | 当前的全部状态，状态名的数组 |
| [`isTracking`](ui-control/istracking.md) <small>只读</small> | 控件是否正在跟踪一次触摸 |
| [`isTouchInside`](ui-control/istouchinside.md) <small>只读</small> | 正在跟踪的触摸此刻是否在控件范围内 |
| [`contentHorizontalAlignment`](ui-control/contenthorizontalalignment.md) | 子类显示的内容在控件里的水平位置 |
| [`contentVerticalAlignment`](ui-control/contentverticalalignment.md) | 子类显示的内容在控件里的垂直位置 |

## 实例方法

还继承 [`UIView`](ui-view.md) 的方法，以及 `EventTarget` 的 `dispatchEvent()`。

| 方法 | 说明 |
| --- | --- |
| [`addEventListener()`](ui-control/addeventlistener.md) | 监听一个控件事件 |
| [`removeEventListener()`](ui-control/removeeventlistener.md) | 移除一个监听 |
| [`sendActionsForControlEvents()`](ui-control/sendactionsforcontrolevents.md) | 让控件派发指定的事件，途径和真实触摸相同 |

## 事件

控件事件一共 16 个，用 [`addEventListener()`](ui-control/addeventlistener.md) 监听，名字区分大小写。事件只派发给注册监听的那个控件，不冒泡，不能取消。

**触摸类**：所有控件都派发，下表按一次触摸的过程排列。事件对象带[触点位置](#触点位置)。

| 事件 | 什么时候派发 |
| --- | --- |
| [`touchdown`](ui-control/touchdown-event.md) | 手指按在控件上 |
| [`touchdownrepeat`](ui-control/touchdownrepeat-event.md) | 短时间内连续点击时，从第二次按下起 |
| [`touchdraginside`](ui-control/touchdraginside-event.md) | 手指按住，在控件范围内移动 |
| [`touchdragexit`](ui-control/touchdragexit-event.md) | 手指按住，从控件内移到控件外的那一刻 |
| [`touchdragoutside`](ui-control/touchdragoutside-event.md) | 手指按住，在控件范围外移动 |
| [`touchdragenter`](ui-control/touchdragenter-event.md) | 手指按住，从控件外移回控件内的那一刻 |
| [`touchupinside`](ui-control/touchupinside-event.md) | 手指在控件范围内松开 |
| [`touchupoutside`](ui-control/touchupoutside-event.md) | 手指在控件范围外松开 |
| [`touchcancel`](ui-control/touchcancel-event.md) | 触摸被系统取消，没有正常松开 |

一次触摸以 `touchupinside`、`touchupoutside`、`touchcancel` 三者之一结束。

**其他**：只有特定的子类派发，事件对象不带触点位置。

| 事件 | 什么时候派发 |
| --- | --- |
| [`click`](ui-control/click-event.md) | 用户完成了控件的主要操作。对按钮来说就是一次点击 |
| [`change`](ui-control/change-event.md) | 用户改了控件的值。开关、滑块这类有值的控件派发 |
| [`menuaction`](ui-control/menuaction-event.md) | 控件弹出菜单前 |
| [`focus`](ui-control/focus-event.md) | 输入框开始编辑 |
| [`input`](ui-control/input-event.md) | 输入框的文字被用户改了 |
| [`blur`](ui-control/blur-event.md) | 输入框结束编辑 |
| [`return`](ui-control/return-event.md) | 用户按了键盘上的回车键 |

所有视图都有的 [`traitchange`](ui-trait-collection.md) 也能在控件上监听。输入框另有五个可取消的事件，见 [`UITextField`](ui-text-field.md#事件)。

监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。以 `@` 开头的名字是运行时保留的，监听它们抛 `TypeError`。

## 状态

控件在任一时刻处于一个或几个状态。子类按状态显示不同的外观，例如按钮可以给每个状态设不同的文字。

| 状态 | 什么时候处于这个状态 | 谁来切换 |
| --- | --- | --- |
| `normal` | 以下四种都不成立 | 无 |
| `highlighted` | [`isHighlighted`](ui-control/ishighlighted.md) 是 `true`：手指按在控件上 | 系统自动。按下时设为 `true`，松开时设回 `false`。App 的代码也可以写 |
| `disabled` | [`isEnabled`](ui-control/isenabled.md) 是 `false` | App 的代码 |
| `selected` | [`isSelected`](ui-control/isselected.md) 是 `true` | App 的代码。系统不会自动改 |
| `focused` | 控件拥有焦点。**未在模拟器验证** | 系统 |

`normal` 之外的状态可以同时成立，例如「选中并且禁用」。所以 [`state`](ui-control/state.md) 读出来是数组。

状态变化不派发事件。`isEnabled` 和 `isSelected` 只有 App 的代码会改，不需要通知。`isHighlighted` 由系统在触摸时改，用 `touchdown` 和三个结束事件得知触摸的开始和结束。

## 触点位置

`touch` 开头的九个事件，事件对象的类型是 `UIControlTouchEvent`，比普通的 `Event` 多两个只读字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `location` | [`CGPoint`](structs.md) 或 `null` | 手指的位置，在**这个控件自己的坐标系**里，单位 [pt](units.md)。没有真实触摸时是 `null` |
| `tapCount` | 数 | 连击次数，单位是次。没有真实触摸时是 0 |

- 回调参数的类型声明是 `Event`。要读这两个字段，用 `/** @type {UIControlTouchEvent} */ (e)` 转一下类型。
- [`sendActionsForControlEvents()`](ui-control/sendactionsforcontrolevents.md) 派发的事件没有对应的触摸：`location` 是 `null`，`tapCount` 是 0。`null` 和 `(0, 0)` 不同，`(0, 0)` 是控件左上角，是一个真实存在的位置。
- 这两个值只能从事件对象上读。回调执行时触摸可能已经结束，控件上没有保存触摸的位置。要把位置换算到别的视图的坐标系，用 [`UIView`](ui-view.md) 的 `convertPoint()`。
- 其余七个事件的对象上没有这两个字段，读它们得到 `undefined`，`'location' in e` 是 `false`。`focus`、`input`、`blur`、`return` 是文字输入的事件，和触点无关；`change`、`click`、`menuaction` 不一定来自触摸，代码调用 `sendActionsForControlEvents()` 也会派发它们。

## 回调的执行时机

触摸发生时回调不会立刻执行。回调排在当前这一轮代码之后执行，背景见[运行时怎么工作](how-it-works.md)。

这带来两个后果：

- **回调里读到的是执行那一刻的状态，不是事件发生那一刻的状态。** 在 `touchdown` 的回调里读 `isHighlighted`，手指按住不放时是 `true`；手指按下后很快松开时可能是 `false`，因为回调执行时系统已经把它改回去了（实测）。事件对象不带事件发生那一刻的控件状态，只带触点位置。
- **控件事件和定时器回调的先后没有保证。** `sendActionsForControlEvents()` 之后紧接着设一个 0 毫秒的定时器，定时器的回调可能先执行（实测）。需要等事件时，在事件回调里继续后面的工作。

回调里抛出的异常不影响控件。异常在 [`application`](application.md#没处理的异常不会让-app-退出) 上派发 `error`；没有监听器取消时，控制台输出以 `Uncaught` 开头的日志。同一个事件的其他回调照常执行，控件之后照常派发事件。

## 示例

### 自己做一个可点击的区域

从空白 App 开始，在屏幕正中放一块绿色的可点击区域。按住时它变淡，点一下计数加一。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const card = new UIControl();
  card.backgroundColor = 'systemGreen';
  card.layer.cornerRadius = 10;

  const label = new UILabel();
  label.text = '点了 0 次';
  label.textColor = 'white';
  label.isUserInteractionEnabled = false;
  card.addSubview(label);

  card.addEventListener('touchdown', () => {
    card.alpha = 0.6;
  });
  let count = 0;
  card.addEventListener('touchupinside', () => {
    card.alpha = 1;
    count += 1;
    label.text = '点了 ' + count + ' 次';
    console.log('点击', count);
  });
  card.addEventListener('touchupoutside', () => {
    card.alpha = 1;
  });
  card.addEventListener('touchcancel', () => {
    card.alpha = 1;
  });

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

- 屏幕正中出现一个宽 220 pt、高 52 pt 的绿色圆角矩形，中间是白色的「点了 0 次」。
- 手指按住时矩形变淡，松开恢复。
- 手指在矩形上松开，文字变成「点了 1 次」，控制台输出 `点击 1`。
- 手指按下后滑到矩形外面再松开，文字不变，控制台不输出。

这段代码没有作为一个整体在模拟器运行过。`UIControl` 的创建、底色、圆角、约束、`touchdown` 和 `touchupinside` 在验收用例里运行过，真实点击时这两个事件依次派发。**`touchupoutside`、`touchcancel` 的派发，以及触摸落在文字上时由 `card` 接收，未在模拟器验证。**

### 读当前状态

```js
const control = new UIControl();
console.log(control.state.join(', '));

control.isSelected = true;
control.isEnabled = false;
console.log(control.state.includes('selected'), control.state.includes('disabled'));
```

**结果**：先输出 `normal`，再输出 `true true`。三个状态都不成立时数组只有 `'normal'` 一项；同时选中和禁用时有两项，顺序没有保证。

更多写法见指南[处理控件的触摸](../guides/control-touches.md)。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[UIControl alloc] init]` | `new UIControl()` |
| `[c addTarget:self action:@selector(tap:) forControlEvents:UIControlEventTouchUpInside]` | `c.addEventListener('touchupinside', fn)` |
| `[c removeTarget:self action:@selector(tap:) forControlEvents:UIControlEventTouchUpInside]` | `c.removeEventListener('touchupinside', fn)` |
| `[c sendActionsForControlEvents:UIControlEventTouchDown \| UIControlEventTouchUpInside]` | `c.sendActionsForControlEvents(['touchdown', 'touchupinside'])` |
| `c.enabled = NO` | `c.isEnabled = false` |
| `c.selected = YES` | `c.isSelected = true` |
| `c.highlighted` | `c.isHighlighted` |
| `c.state & UIControlStateSelected` | `c.state.includes('selected')` |
| `c.tracking` | `c.isTracking` |
| `c.touchInside` | `c.isTouchInside` |
| `c.contentHorizontalAlignment = UIControlContentHorizontalAlignmentLeading` | `c.contentHorizontalAlignment = 'leading'` |
| `c.contentVerticalAlignment = UIControlContentVerticalAlignmentTop` | `c.contentVerticalAlignment = 'top'` |

事件名的对应：

| ObjC | JS |
| --- | --- |
| `UIControlEventTouchDown` 等九个触摸事件 | 去掉 `UIControlEvent` 前缀后全小写：`'touchdown'`、`'touchupinside'` …… |
| `UIControlEventPrimaryActionTriggered` | `'click'` |
| `UIControlEventValueChanged` | `'change'` |
| `UIControlEventMenuActionTriggered` | `'menuaction'` |
| `UIControlEventEditingDidBegin` | `'focus'` |
| `UIControlEventEditingChanged` | `'input'` |
| `UIControlEventEditingDidEnd` | `'blur'` |
| `UIControlEventEditingDidEndOnExit` | `'return'` |

- 状态名是 ObjC 常量去掉 `UIControlState` 前缀，首字母小写。原生的位掩码在 JS 里是字符串数组。
- 原生的 `addTarget:action:forControlEvents:` 叫 target-action：给控件登记一个对象和它的一个方法，事件发生时控件调用这个方法。JS 里用 `addEventListener()` 代替。

## 与浏览器事件的对照

这张表只用来查对应关系，给熟悉浏览器事件的人用。

| 浏览器 | 控件事件 |
| --- | --- |
| `pointerdown` | `touchdown` |
| `pointermove` | `touchdraginside`、`touchdragoutside`、`touchdragenter`、`touchdragexit` |
| `pointerup` | `touchupinside`、`touchupoutside` |
| `pointercancel` | `touchcancel` |
| `click` | `click`（按钮）、`touchupinside`（直接创建的 `UIControl`） |
| `input`、`focus`、`blur` | 同名，含义相同 |
| `clientX`、`clientY` | `touch` 开头的事件的 `location`，坐标系是控件自己的 |
| `element.disabled = true` | `control.isEnabled = false` |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 在回调里得到事件发生那一刻的控件状态 | 事件对象带状态。触点位置已经在事件对象上 |
| 自己处理原始触摸，决定控件怎么跟踪手指 | 覆写 `touchesBegan:withEvent:`、`beginTrackingWithTouch:withEvent:` 等方法 |
| 一次监听所有触摸事件 | `UIControlEventAllTouchEvents` 等聚合掩码。现在逐个事件名调用 `addEventListener()` |
| 点控件弹出菜单 | `contextMenuInteraction`、`showsMenuAsPrimaryAction` |
| 让父视图收到子控件的事件 | 无。原生的控件事件也不冒泡 |

## 参见

- [处理控件的触摸](../guides/control-touches.md)：可点击的区域、按下时的外观、模拟点击、禁用
- [`UIButton`](ui-button.md)：最常用的控件，文字和图标按状态设置
- [`UITextField`](ui-text-field.md)：输入框，派发 `focus`、`input`、`blur`、`return`
- [`UISwitch`](ui-switch.md)、[`UISlider`](ui-slider.md)、[`UIStepper`](ui-stepper.md)、[`UISegmentedControl`](ui-segmented-control.md)、[`UIPageControl`](ui-page-control.md)、[`UIDatePicker`](ui-date-picker.md)：派发 `change` 的控件
- [`UIView`](ui-view.md)：父类，位置、大小、底色、`isUserInteractionEnabled`
- [手势识别器](ui-gesture-recognizer.md)：让不是控件的视图响应点按和长按
- [原生类](native-classes.md)：为什么不能继承 `UIControl`
- [实现原理：事件](../internals/events.md)：触摸在 iOS 里经过的四套机制和实测的派发顺序
