---
type: reference
native: UIGestureRecognizer
status: partial
---

# 手势识别器

**手势识别器**表示一个加在视图上的对象。它观察这个视图上的触摸，认出某种手势时派发事件。目前有两种：`UITapGestureRecognizer` 识别点按，`UILongPressGestureRecognizer` 识别长按。

普通的视图（[`UIView`](ui-view.md)、文字、图片）自己不派发任何触摸事件，只有[控件](ui-control.md)有自己的一套事件。手势识别器让任意视图都能响应点按和长按。

使用分三步：创建识别器，在识别器上监听事件，用 `addGestureRecognizer()` 把它加到视图上。监听器加在识别器上，不加在视图上。一个识别器只识别一种手势，点按和长按各是一个类。

## 派发哪些事件

事件名是手势所处的阶段，一共四个：`began`、`changed`、`ended`、`cancelled`。

- **点按**被认出时派发一次 `ended`。只有这一个事件。
- **长按**在手指按够时间时派发 `began`，默认是 0.5 秒，可以用 `minimumPressDuration` 改。之后手指每移动一次派发 `changed`，手指抬起时派发 `ended`。长按被打断时派发 `cancelled`。
- **手势没有被认出时不派发任何事件。** 比如长按没按够时间就抬起，或者按够之前手指移动超过了 10 pt。

事件对象带手指的位置 `location` 和手指个数 `numberOfTouches`，见[事件](#事件)。事件不能取消。回调在手势发生之后才执行，见[回调里读不到当时的状态](#回调里读不到当时的状态)。

目前在识别器上只能监听这四个事件。监听其他名字会抛 `TypeError`，所以还不能在识别器上使用自定义事件。这是已知的限制。

## 识别器接收哪些视图上的触摸

识别器接收它所在的视图和这个视图**所有子视图**上的触摸。把识别器加在父视图上，点子视图也会触发它。事件只派发在识别器上，不会传给别的对象。

视图要接收触摸，识别器才收得到。[`UILabel`](ui-label.md) 和 [`UIImageView`](ui-image.md) 默认不接收触摸，要先把 `isUserInteractionEnabled` 设成 `true`，见[让文字或图片可以点](#让文字或图片可以点)。

## 手势和按钮同时存在时谁生效

| 情况 | 结果 | 依据 |
| --- | --- | --- |
| 父视图上有单指单击的识别器，子视图里有 [`UIButton`](ui-button.md)，用户点按钮 | 只有按钮的事件派发，父视图的识别器不触发 | 实测 |
| 同上，子视图是直接创建的 [`UIControl`](ui-control.md) | 没有核对过 | **未在模拟器验证** |
| 父视图上有长按识别器，用户长按子视图里的控件 | 识别器认出长按后，系统取消控件正在处理的这次触摸。控件派发 `touchCancel`，不派发 `touchUpInside` | **未在模拟器验证** |

要让识别器和控件的事件都派发，把识别器的 `cancelsTouchesInView` 设成 `false`，见[识别器和视图自己的触摸](#识别器和视图自己的触摸)。

## 一个视图上加多个识别器

一个视图可以加多个识别器。同一个视图上加一个点按和一个长按是常见的组合：点一下触发点按，按住触发长按（实测，见[完整例子](#完整例子)）。长按松手时点按识别器不触发，**未在模拟器验证**。

同一个视图上既有单击识别器又有双击识别器时，双击的第一下会先触发单击。**未在模拟器验证。** 让单击等双击失败之后再触发，目前做不到，见[还不能做的](#还不能做的)。

一个识别器同一时刻只能在一个视图上。把它加到另一个视图时，它自动从原来的视图上移除。

## 滚动视图里的手势

识别器所在的视图可以放在[滚动视图](ui-scroll-view.md)里。验收界面的手势区块就在一个滚动视图里，点按在那里用真实触摸核对过。

长按识别器在滚动视图里的表现**未在模拟器验证**。

## 推荐的做法

- **按钮式的交互用 [`UIButton`](ui-button.md)，不用识别器。** 按钮自带按住时的外观变化和禁用状态。识别器只告诉 App「认出了手势」，按下时的视觉反馈要自己做。
- **不是控件的视图要响应点击时用识别器。** 比如一张卡片、一行文字、一张图片。
- **一个容器里有很多可点的子视图时，在容器上加一个识别器**，回调里用 `hitTest()` 查出点到了哪个子视图，见[在父视图上统一处理点击](#在父视图上统一处理点击)。子视图增加或移除时不用跟着加减识别器。
- **判断手势的阶段看事件名，读位置看事件对象。** 不在回调里读识别器的 `state`。

## 完整例子

下面的代码从空白 App 开始，在屏幕上放一个矩形。点一下它换颜色，按住它输出一行文字。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 一个普通的视图。它不是控件，自己不会响应点击
  const card = new UIView();
  card.frame = new CGRect(40, 120, 200, 120);
  card.backgroundColor = 'systemIndigo';
  card.layer.cornerRadius = 16;
  page.view.addSubview(card);

  // 2. 创建点按识别器，监听 ended，加到视图上
  const tap = new UITapGestureRecognizer();
  let on = false;
  tap.addEventListener('ended', () => {
    on = !on;
    card.backgroundColor = on ? 'systemOrange' : 'systemIndigo';
  });
  card.addGestureRecognizer(tap);

  // 3. 再加一个长按识别器。按住 0.5 秒时派发 began
  const press = new UILongPressGestureRecognizer();
  press.addEventListener('began', () => {
    console.log('按住了');
  });
  card.addGestureRecognizer(press);
});
```

**效果**：

- 屏幕左上方出现一个 200 × 120 pt 的靛蓝色圆角矩形。
- 点一下矩形，它变成橙色。再点一下变回靛蓝色。
- 按住矩形 0.5 秒，控制台输出 `按住了`。松手后颜色不变（**长按松手时点按不触发这一点未在模拟器验证**）。

这段代码没有作为一个整体在模拟器运行过。创建、属性的默认值、加到视图上这几步在验收用例里核对过；点一下派发 `ended`、按住派发 `began`、松手派发 `ended`，也在验收用例里用真实触摸核对过。

三个步骤是：创建识别器、在识别器上监听事件、把识别器加到视图上。后两步的先后没有关系。

完整例子的开头几行是每个 App 都要有的：在 `sceneconnect` 的回调里建窗口和页面，见 [`UIWindowScene`](ui-window-scene.md)。

## 常见用法

以下例子都沿用上面的 `page`、`card`、`tap` 和 `press`。

### 拿到点的位置

事件对象上的 `location` 是手指的位置，在识别器所在视图的坐标系里，单位是 [pt](units.md)。

```js
tap.addEventListener('ended', (e) => {
  const { location } = /** @type {UIGestureRecognizerEvent} */ (e);
  if (location !== null) {
    console.log(location.x, location.y);
  }
});
```

**效果**：点矩形的左上角附近，输出两个接近 0 的数。点右下角附近，输出接近 `200 120` 的两个数。

验收用例里核对过：点在视图内距左边 28 pt、距上边 28 pt 的位置，`location` 是 `(28, 28)`。

回调的参数类型是 `Event`，要读 `location` 需要像上面这样转成 `UIGestureRecognizerEvent`。

### 响应双击

```js
const doubleTap = new UITapGestureRecognizer();
doubleTap.numberOfTapsRequired = 2;
doubleTap.addEventListener('ended', () => {
  console.log('双击');
});
card.addGestureRecognizer(doubleTap);
```

**效果**：快速连点两下矩形，输出 `双击`。**未在模拟器验证。**

> **注意**：同一个视图上既有单击识别器又有双击识别器时，双击的第一下会先触发单击。**未在模拟器验证。** 让单击等双击失败之后再触发，现在做不到，见[还不能做的](#还不能做的)。

### 改长按要按多久

```js
press.minimumPressDuration = 1;
```

**效果**：要按住 1 秒才派发 `began`。单位是秒，不是毫秒。**未在模拟器验证。**

### 长按之后跟着手指移动

长按被认出之后，手指每次移动都派发 `changed`，抬起时派发 `ended`。

```js
press.addEventListener('changed', (e) => {
  const { location } = /** @type {UIGestureRecognizerEvent} */ (e);
  if (location !== null) {
    console.log('移到', location.x, location.y);
  }
});
press.addEventListener('ended', () => {
  console.log('松手');
});
```

**效果**：按住矩形 0.5 秒后不松手并移动手指，每移动一次输出一行 `移到` 和当前位置。手指抬起时输出 `松手`。

验收用例里核对过：按住之后分四步移动手指，收到 4 次 `changed`；`ended` 的 `location` 是手指抬起时的位置。按住不动时一次 `changed` 都没有。

长按被认出之前，手指移动超过 `allowableMovement`（默认 10 pt）就不算长按，不派发任何事件。被认出之后移动多远都可以。

### 让文字或图片可以点

[`UILabel`](ui-label.md) 和 [`UIImageView`](ui-image.md) 默认不接收触摸，加在它们上面的识别器收不到任何东西。要先打开 `isUserInteractionEnabled`。

```js
const link = new UILabel();
link.text = '查看详情';
link.frame = new CGRect(40, 260, 200, 24);
link.isUserInteractionEnabled = true;
page.view.addSubview(link);

const linkTap = new UITapGestureRecognizer();
linkTap.addEventListener('ended', () => {
  console.log('点了文字');
});
link.addGestureRecognizer(linkTap);
```

**效果**：矩形下方出现一行文字「查看详情」。点它输出 `点了文字`。**未在模拟器验证。**

### 在父视图上统一处理点击

识别器接收它所在视图的所有子视图上的触摸。所以只在父视图上加一个识别器，再用 `hitTest()` 查出点到了哪个子视图。`hitTest()` 的说明见 [`UIView`](ui-view.md)。

```js
const badge = new UIView();
badge.frame = new CGRect(16, 16, 40, 40);
badge.backgroundColor = 'systemOrange';
card.addSubview(badge);

const cardTap = new UITapGestureRecognizer();
cardTap.addEventListener('ended', (e) => {
  const { location } = /** @type {UIGestureRecognizerEvent} */ (e);
  if (location === null) return;
  const hit = card.hitTest(location);
  console.log(hit === badge ? '点了方块' : '点了矩形的其他地方');
});
card.addGestureRecognizer(cardTap);
```

**效果**：点橙色方块输出 `点了方块`。点矩形里方块以外的地方输出 `点了矩形的其他地方`。

这个写法在验收用例里用真实触摸核对过：点子视图时 `hitTest()` 返回子视图，点空白处时返回父视图自己。

`location` 在 `card` 的坐标系里，`card.hitTest()` 要的也是 `card` 坐标系里的点，所以可以直接传。

### 暂时停用

```js
tap.isEnabled = false;
```

**效果**：点矩形不再有反应。设回 `true` 后恢复。**未在模拟器验证。**

### 取消监听和移除识别器

```js
/** @param {Event} e */
function onTap(e) {
  console.log('点了');
}
tap.addEventListener('ended', onTap);

tap.removeEventListener('ended', onTap);   // 只取消这一个监听器
card.removeGestureRecognizer(tap);         // 把识别器从视图上拿掉
console.log(tap.view);
```

**效果**：控制台输出 `null`。识别器已经不在任何视图上，点矩形不再触发它。识别器对象还能用，可以再加到别的视图上。

## 概念

### 离散手势和连续手势

手势分两类，派发的事件不同。

| | 离散手势 | 连续手势 |
| --- | --- | --- |
| 例子 | 点按 | 长按 |
| 特点 | 认出来就结束，只通知一次 | 认出来之后持续一段时间，过程中不断通知 |
| 派发的事件 | 只有 `ended` | `began`，然后零次或多次 `changed`，最后是 `ended` 或 `cancelled` |

四个事件的含义：

| 事件 | 什么时候派发 |
| --- | --- |
| `began` | 连续手势被认出的那一刻。长按是按够 `minimumPressDuration` 的时候 |
| `changed` | 连续手势进行中，手指移动了 |
| `ended` | 连续手势正常结束（手指抬起）。离散手势被认出时也是这个事件 |
| `cancelled` | 连续手势被打断。长按进行中 App 退到后台时派发（真机实测）。长按进行中识别器的 `isEnabled` 被设成 `false` 时也应当派发，**未在模拟器验证** |

手势没被认出时不派发任何事件。比如手指按下后移动得太远、没按够时间就抬起。

### 回调里读不到当时的状态

回调不是在手势发生的那一刻执行的，而是稍后执行，背景见[运行时怎么工作](how-it-works.md)。回调里读 `recognizer.state` 得到的是回调执行那一刻的状态，不是事件发生那一刻的状态。实测：

| 在哪个回调里读 | 读到的 `state` | 原因 |
| --- | --- | --- |
| 点按的 `ended` | `'possible'` | 手势结束之后识别器立刻回到初始状态 |
| 长按的 `began`，手指还按着 | `'began'` | 手势还在进行。手指已经移动过时可能读到 `'changed'` |

所以：

- 要知道是哪个阶段，看事件名，不读 `state`。
- 手指的位置和个数从事件对象的 `location` 和 `numberOfTouches` 读。

### 识别器和视图自己的触摸

识别器和视图是同时收到触摸的。识别器认出手势之后，系统会取消视图正在处理的这次触摸。对[控件](ui-control.md)来说，表现是收到 `touchCancel` 而不是 `touchUpInside`。**未在模拟器验证。**

把 `cancelsTouchesInView` 设成 `false`，视图就照常收完这次触摸，识别器和控件事件都会触发。**未在模拟器验证。**

有一种情况系统已经处理好了：父视图上有一个单指单击的识别器，子视图里有 [`UIButton`](ui-button.md)。这时点按钮只触发按钮自己的 `touchUpInside`，父视图的识别器不触发（实测）。

### 所有权

视图保管加在它上面的识别器。把识别器加到视图上之后，App 的代码不需要另外保存它。只要视图还在，识别器和它上面的监听器就一直有效。

一个识别器同一时刻只能在一个视图上。把它加到另一个视图时，它会自动从原来的视图上移除。

## 成员说明

### 继承关系

```
EventTarget
  └─ NSObject
       └─ UIGestureRecognizer
            ├─ UITapGestureRecognizer
            └─ UILongPressGestureRecognizer
```

识别器不是视图，没有 `frame`、`backgroundColor` 这些成员。

### 创建

```js
const tap = new UITapGestureRecognizer();
const press = new UILongPressGestureRecognizer();
```

两个构造函数都没有参数。

- `UIGestureRecognizer` 是基类，不能直接创建：`TypeError: Illegal constructor: UIGestureRecognizer is abstract; construct UITapGestureRecognizer or UILongPressGestureRecognizer instead`
- 不能继承这几个类，见[原生类](native-classes.md)。

### `UIGestureRecognizer` 的属性

两个子类都有这些属性。

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `state` | 字符串 | 是 | 否 | `'possible'` | 当前状态，取值见下表。回调里读到的不一定是事件发生时的状态，见[回调里读不到当时的状态](#回调里读不到当时的状态) |
| `view` | [`UIView`](ui-view.md) 或 `null` | 是 | 否 | `null` | 识别器所在的视图。没有加到任何视图上时是 `null` |
| `isEnabled` | 布尔 | 是 | 是 | `true` | `true`：正常识别。`false`：不接收触摸；正在进行的手势被取消 |
| `cancelsTouchesInView` | 布尔 | 是 | 是 | `true` | `true`：认出手势后取消视图正在处理的这次触摸。`false`：视图照常收完这次触摸 |
| `delaysTouchesBegan` | 布尔 | 是 | 是 | `false` | `true`：识别器确定认不出之前，视图收不到触摸的开始。`false`：视图和识别器同时收到。设成 `true` 之后的效果**未在模拟器验证** |
| `delaysTouchesEnded` | 布尔 | 是 | 是 | `true` | `true`：识别器确定认不出之后，视图才收到触摸的结束。`false`：视图立刻收到。设成 `false` 之后的效果**未在模拟器验证** |
| `numberOfTouches` | 数 | 是 | 否 | `0` | 这一刻参与手势的手指个数 |

`state` 的取值：

| 取值 | 含义 |
| --- | --- |
| `'possible'` | 还没有认出手势。没有触摸时也是这个值 |
| `'began'` | 连续手势刚被认出 |
| `'changed'` | 连续手势进行中 |
| `'ended'` | 手势结束。离散手势被认出时也是这个值 |
| `'cancelled'` | 连续手势被打断 |
| `'failed'` | 这次触摸不是这个手势 |

`state` 的变化通过[事件](#事件)得知。`'possible'` 和 `'failed'` 没有对应的事件。

### `UITapGestureRecognizer` 的属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `numberOfTapsRequired` | 数 | 是 | 是 | `1` | 要连点几下才算，单位是次。`2` 是双击 |
| `numberOfTouchesRequired` | 数 | 是 | 是 | `1` | 要几根手指同时点，单位是根 |

### `UILongPressGestureRecognizer` 的属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `minimumPressDuration` | 数 | 是 | 是 | `0.5` | 要按住多久才算，单位是秒 |
| `allowableMovement` | 数 | 是 | 是 | `10` | 被认出之前手指最多能移动多远，单位 [pt](units.md)。超过就不算长按 |
| `numberOfTapsRequired` | 数 | 是 | 是 | `0` | 按住之前要先完整地点几下，单位是次 |
| `numberOfTouchesRequired` | 数 | 是 | 是 | `1` | 要几根手指同时按住，单位是根 |

这两张表里的属性都没有变化通知。只有你自己的代码能改它们。

**出错**：

- 次数和手指数是负数：`TypeError: numberOfTapsRequired must be a non-negative integer`
- 时长和距离是负数：`TypeError: minimumPressDuration must be a non-negative number`
- 给的值转不成数：`TypeError: minimumPressDuration must be a finite number, got "soon"`

次数和手指数给的是小数时去掉小数部分（写 `2.9` 读回 `2`）。给的是数字字符串时按数用（写 `'0.4'` 读回 `0.4`）。转换规则见[运行时怎么工作](how-it-works.md)。

出错时属性保持原来的值。

### 事件

用 `addEventListener()` 和 `removeEventListener()` 监听，写法和其他对象相同。

| 事件名 | 点按 | 长按 |
| --- | --- | --- |
| `began` | 不派发 | 按够时间时 |
| `changed` | 不派发 | 被认出之后手指移动时 |
| `ended` | 被认出时 | 手指抬起时 |
| `cancelled` | 不派发 | 被打断时 |

事件对象的类型是 `UIGestureRecognizerEvent`，比 `Event` 多两个只读字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `location` | `CGPoint` 或 `null` | 手势的位置，在识别器所在视图的坐标系里，单位 [pt](units.md)。多根手指时是它们的中心点。要换算到别的视图，用 [`convertPoint()`](ui-view.md) |
| `numberOfTouches` | 数 | 事件发生时参与手势的手指个数。单指点按的 `ended` 和单指长按抬起时的 `ended` 里都是 1（实测） |

- 事件不能取消，`preventDefault()` 没有作用。
- 事件只派发给识别器自己，不会传给视图或父视图。
- 回调里抛出异常不影响识别器。运行时把异常输出到控制台，以 `Event listener threw:` 开头，同一事件的其他回调照常执行。
- 没有 `'tap'`、`'longpress'` 这样的事件名。点按监听 `'ended'`，长按监听 `'began'`。
- **出错**：事件名不是上面四个之一：`TypeError: addEventListener has no value "tap"; expected one of: began / changed / ended / cancelled`。目前识别器上只能监听这四个事件，还不能使用自定义事件，这是已知的限制。

### `UIView` 上的成员

识别器通过视图的这三个成员加上和拿掉。

| 成员 | 说明 |
| --- | --- |
| `view.addGestureRecognizer(recognizer)` | 把识别器加到视图上。没有返回值。识别器原来在别的视图上时，先从那个视图上移除。重复加同一个识别器没有效果 |
| `view.removeGestureRecognizer(recognizer)` | 把识别器从视图上拿掉。没有返回值 |
| `view.gestureRecognizers` | 只读。视图上全部识别器的数组，没有时是空数组。每次读得到一个新数组，里面的对象是同一个，可以用 `===` 比较 |

- 系统自己加的识别器也在 `gestureRecognizers` 里，比如 [`UIScrollView`](ui-scroll-view.md) 用来滚动的那几个。它们读出来是 `UIGestureRecognizer`。**未在模拟器验证。**
- **出错**：参数不是识别器：`TypeError: addGestureRecognizer needs a UIGestureRecognizer`

## 与 iOS 原生写法的对照

如果你在看 Apple 的文档或 iOS 的示例代码，按这张表换成 JS 的写法。

| ObjC | JS |
| --- | --- |
| `[[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(onTap:)]` | `new UITapGestureRecognizer()`，再 `addEventListener('ended', onTap)` |
| `[recognizer addTarget:self action:@selector(onPress:)]` | `recognizer.addEventListener('began', onPress)`，每个阶段一个事件名 |
| `[recognizer removeTarget:self action:@selector(onPress:)]` | `recognizer.removeEventListener('began', onPress)` |
| 在 action 里判断 `recognizer.state == UIGestureRecognizerStateBegan` | 监听 `'began'` |
| `UIGestureRecognizerStateRecognized` | `'ended'` |
| `[recognizer locationInView:recognizer.view]` | 事件对象的 `location` |
| `[view addGestureRecognizer:recognizer]` | `view.addGestureRecognizer(recognizer)` |
| `[view removeGestureRecognizer:recognizer]` | `view.removeGestureRecognizer(recognizer)` |
| `recognizer.enabled = NO` | `recognizer.isEnabled = false` |
| `tap.numberOfTapsRequired = 2` | `tap.numberOfTapsRequired = 2` |
| `press.minimumPressDuration = 1.0` | `press.minimumPressDuration = 1` |

ObjC 里一个 action 方法收到手势的所有阶段，再用 `state` 区分。JS 里每个阶段是一个事件名。

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 识别拖动、捏合、轻扫、旋转 | `UIPanGestureRecognizer`、`UIPinchGestureRecognizer`、`UISwipeGestureRecognizer`、`UIRotationGestureRecognizer` | 未实现 |
| 让单击等双击失败之后再触发 | `requireGestureRecognizerToFail:` | 未实现 |
| 让两个识别器同时认出，或者按条件决定认不认 | `UIGestureRecognizerDelegate` | 未实现。需要先支持用 JS 继承原生类 |
| 随时查询手势在任意视图里的位置 | `locationInView:`、`locationOfTouch:inView:` | 未实现。位置从事件对象的 `location` 读 |
| 自己定义一种手势 | 继承 `UIGestureRecognizer` 并覆写 `touchesBegan:withEvent:` 等方法 | 未实现。需要先支持用 JS 继承原生类 |
| 限定只认手指、触控笔或鼠标 | `allowedTouchTypes`、`buttonMaskRequired` | 未实现 |
| 在识别器上监听自定义名字的事件 | 无 | 未实现。目前只能监听 `began`、`changed`、`ended`、`cancelled` |

## 参见

- [`UIView`](ui-view.md)：识别器加在视图上；`hitTest()`、`convertPoint()`、`isUserInteractionEnabled`
- [`UIControl`](ui-control.md)：按钮这类控件有自己的一套事件，不需要识别器
- [`UIButton`](ui-button.md)：按钮式的交互用它，不用识别器
- [`UIScrollView`](ui-scroll-view.md)：识别器所在的视图可以放在滚动视图里
- [运行时怎么工作](how-it-works.md)：回调为什么不是立刻执行
- [原生类](native-classes.md)：为什么这几个类不能继承
