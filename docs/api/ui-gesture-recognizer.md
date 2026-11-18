---
type: reference
native: UIGestureRecognizer
status: partial
---

# 手势识别器

**手势识别器**表示一个加在视图上的对象。它观察这个视图上的触摸，认出某种手势时派发事件。一个识别器只识别一种手势，每种手势是一个类：

| 类 | 识别的手势 | 手指 |
| --- | --- | --- |
| `UITapGestureRecognizer` | 点按：按下后很快抬起 | 默认 1 根 |
| `UILongPressGestureRecognizer` | 长按：按住不动一段时间 | 默认 1 根 |
| `UIPanGestureRecognizer` | 拖动：按下后移动 | 默认 1 根以上 |
| `UIPinchGestureRecognizer` | 捏合：两根手指张开或捏拢 | 2 根 |
| `UIRotationGestureRecognizer` | 旋转：两根手指绕着彼此转 | 2 根 |
| `UISwipeGestureRecognizer` | 轻扫：朝一个方向快速划过 | 默认 1 根 |
| `UIScreenEdgePanGestureRecognizer` | 屏幕边缘拖动：从屏幕的边缘向内拖 | 1 根 |

普通的视图（[`UIView`](ui-view.md)、文字、图片）自己不派发任何触摸事件，只有[控件](ui-control.md)有自己的一套事件。手势识别器让任意视图都能响应上面这些手势。

使用分三步：创建识别器，在识别器上监听事件，用 `addGestureRecognizer()` 把它加到视图上。监听器加在识别器上，不加在视图上。

点按和长按在模拟器和真机上用真实触摸核对过。**拖动、捏合、旋转、轻扫、屏幕边缘拖动还没有用真实触摸核对过**：创建、属性的默认值和读写、出错情况在验收用例里核对过，手势本身和事件带的数据都**未在模拟器验证**。下文里这五种手势的「效果」都属于这种情况，不再逐条标注。

## 派发哪些事件

事件名是手势所处的阶段，一共四个：`began`、`changed`、`ended`、`cancelled`。

- **点按**被认出时派发一次 `ended`。只有这一个事件。**轻扫**相同。
- **长按**在手指按够时间时派发 `began`，默认是 0.5 秒，可以用 `minimumPressDuration` 改。之后手指每移动一次派发 `changed`，手指抬起时派发 `ended`。长按被打断时派发 `cancelled`。
- **拖动、捏合、旋转、屏幕边缘拖动**在手势被认出时派发 `began`，之后手指每移动一次派发 `changed`，手指抬起时派发 `ended`，被打断时派发 `cancelled`。
- **手势没有被认出时不派发任何事件。** 比如长按没按够时间就抬起，或者按够之前手指移动超过了 10 pt。

事件对象带手指的位置 `location` 和手指个数 `numberOfTouches`。拖动的事件另外带位移 `translation` 和速度 `velocity`，捏合的带倍数 `scale` 和速度 `velocity`，旋转的带角度 `rotation` 和速度 `velocity`，见[事件](#事件)。事件不能取消。回调在手势发生之后才执行，见[回调里读不到当时的状态](#回调里读不到当时的状态)。

系统在识别器上派发的是这四个事件。监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

## 识别器接收哪些视图上的触摸

识别器接收它所在的视图和这个视图**所有子视图**上的触摸。把识别器加在父视图上，点子视图也会触发它。事件只派发在识别器上，不会传给别的对象。

视图要接收触摸，识别器才收得到。[`UILabel`](ui-label.md) 和 [`UIImageView`](ui-image.md) 默认不接收触摸，要先把 `isUserInteractionEnabled` 设成 `true`，见[让文字或图片可以点](#让文字或图片可以点)。

## 手势和按钮同时存在时谁生效

| 情况 | 结果 | 依据 |
| --- | --- | --- |
| 父视图上有单指单击的识别器，子视图里有 [`UIButton`](ui-button.md)，用户点按钮 | 只有按钮的事件派发，父视图的识别器不触发 | 实测 |
| 同上，子视图是直接创建的 [`UIControl`](ui-control.md) | 没有核对过 | **未在模拟器验证** |
| 父视图上有长按识别器，用户长按子视图里的控件 | 识别器认出长按后，系统取消控件正在处理的这次触摸。控件派发 `touchcancel`，不派发 `touchupinside` | **未在模拟器验证** |

要让识别器和控件的事件都派发，把识别器的 `cancelsTouchesInView` 设成 `false`，见[识别器和视图自己的触摸](#识别器和视图自己的触摸)。

## 一个视图上加多个识别器

一个视图可以加多个识别器。同一个视图上加一个点按和一个长按是常见的组合：点一下触发点按，按住触发长按（实测，见[完整例子](#完整例子)）。长按松手时点按识别器不触发，**未在模拟器验证**。

同一个视图上既有单击识别器又有双击识别器时，双击的第一下会先触发单击。**未在模拟器验证。** 要让单击等系统确定这不是双击之后再触发，用 `requireGestureRecognizerToFail()`，见[让单击等双击失败](#让单击等双击失败)。

同一个视图上的两个识别器默认不会同时认出手势：一次触摸里，先认出的那个生效。所以在同一个视图上加捏合和旋转，一次只有其中一个派发事件。让两个识别器同时生效需要 `UIGestureRecognizerDelegate`，目前做不到，见[还不能做的](#还不能做的)。这一条的依据是 Apple 的文档，**未在模拟器验证**。

一个识别器同一时刻只能在一个视图上。把它加到另一个视图时，它自动从原来的视图上移除。

## 滚动视图里的手势

识别器所在的视图可以放在[滚动视图](ui-scroll-view.md)里。验收界面的手势区块就在一个滚动视图里，点按在那里用真实触摸核对过。

长按识别器在滚动视图里的表现**未在模拟器验证**。

滚动视图自己就是用一个拖动识别器来滚动的。在滚动视图里的视图上再加一个拖动识别器，用户拖这个视图时是它生效还是滚动视图滚动，**未在模拟器验证**。

## 推荐的做法

- **按钮式的交互用 [`UIButton`](ui-button.md)，不用识别器。** 按钮自带按住时的外观变化和禁用状态。识别器只告诉 App「认出了手势」，按下时的视觉反馈要自己做。
- **不是控件的视图要响应点击时用识别器。** 比如一张卡片、一行文字、一张图片。
- **一个容器里有很多可点的子视图时，在容器上加一个识别器**，回调里用 `hitTest()` 查出点到了哪个子视图，见[在父视图上统一处理点击](#在父视图上统一处理点击)。子视图增加或移除时不用跟着加减识别器。
- **判断手势的阶段看事件名，读位置看事件对象。** 不在回调里读识别器的 `state`。
- **拖动一个视图时，在 `began` 里记下视图的起始位置，在 `changed` 里用「起始位置 + 事件的 `translation`」算新位置。** `translation` 是从手势开始累计的位移，这样写不需要在每次回调里把它清零，见[拖动一个视图](#拖动一个视图)。
- **松手之后要做惯性动画时，速度从 `ended` 事件的 `velocity` 读。** 回调执行时手势已经结束，这时再调 `velocityInView()` 读不到松手那一刻的速度。
- **轻扫要区分方向时，每个方向创建一个识别器。** 一个识别器可以识别多个方向，但事件不说明认出的是哪一个。

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

> **注意**：同一个视图上既有单击识别器又有双击识别器时，双击的第一下会先触发单击。**未在模拟器验证。** 解决办法见下一节。

### 让单击等双击失败

`a.requireGestureRecognizerToFail(b)` 让识别器 `a` 等识别器 `b` 确定认不出之后再认。`b` 认出了手势，`a` 就不认。

```js
const singleTap = new UITapGestureRecognizer();
singleTap.addEventListener('ended', () => {
  console.log('单击');
});
singleTap.requireGestureRecognizerToFail(doubleTap);
card.addGestureRecognizer(singleTap);
```

**效果**：快速连点两下矩形，只输出 `双击`。点一下矩形，输出 `单击`；这一行比没有这层关系时出现得晚，因为系统要先等一小段时间，确定没有第二下。**未在模拟器验证。**

这段代码沿用上一节的 `doubleTap`。完整例子里的 `tap` 也是单击识别器，这里另建一个是为了不改变它的行为。

这个关系建立之后不能撤销。两个识别器互不保管对方，都要加在视图上才有效，见[所有权](#所有权)。

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

### 拖动一个视图

拖动识别器的事件带 `translation`：从手势开始到这个事件为止，手指移动了多少。在 `began` 里记下视图的起始位置，在 `changed` 里把位移加上去。

```js
const drag = new UIPanGestureRecognizer();
let start = card.center;
drag.addEventListener('began', () => {
  start = card.center;
});
drag.addEventListener('changed', (e) => {
  const { translation } = /** @type {UIPanGestureRecognizerEvent} */ (e);
  card.center = new CGPoint(start.x + translation.x, start.y + translation.y);
});
card.addGestureRecognizer(drag);
```

**效果**：按住矩形并移动手指，矩形跟着手指移动。松手后矩形停在松手的位置。再次拖动时从新位置继续。

`translation` 在识别器所在视图（这里是 `card`）的坐标系里，单位是 [pt](units.md)。`card` 没有设置 `transform` 时，它和父视图坐标系里的位移相同，可以直接加到 `center` 上。`card` 设置了缩放或旋转的 `transform` 时两者不同，这时在回调里调 `drag.translationInView(page.view)` 取父视图坐标系里的位移。

### 松手时读速度

`ended` 事件的 `velocity` 是松手那一刻手指移动的速度，单位是 pt 每秒，横向和纵向各一个分量。

```js
drag.addEventListener('ended', (e) => {
  const { velocity } = /** @type {UIPanGestureRecognizerEvent} */ (e);
  if (velocity.x > 500) {
    console.log('向右甩出去了');
  }
});
```

**效果**：向右快速拖动并松手，输出 `向右甩出去了`。慢慢拖动后松手，或者停住再松手，没有输出。

### 只认两根手指的拖动

```js
const twoFingerDrag = new UIPanGestureRecognizer();
twoFingerDrag.minimumNumberOfTouches = 2;
twoFingerDrag.maximumNumberOfTouches = 2;
card.addGestureRecognizer(twoFingerDrag);
```

**效果**：一根手指拖动矩形时，这个识别器不派发事件。两根手指一起拖动时才派发。

### 两指缩放

捏合识别器的事件带 `scale`：两指的间距相对手势开始时的倍数。每次手势都从 1 开始，所以要把上一次手势结束时的倍数记下来再乘。

```js
const pinch = new UIPinchGestureRecognizer();
let baseScale = 1;
pinch.addEventListener('changed', (e) => {
  const { scale } = /** @type {UIPinchGestureRecognizerEvent} */ (e);
  card.transform = CGAffineTransform.scale(baseScale * scale);
});
pinch.addEventListener('ended', (e) => {
  const { scale } = /** @type {UIPinchGestureRecognizerEvent} */ (e);
  baseScale = baseScale * scale;
});
card.addGestureRecognizer(pinch);
```

**效果**：两根手指放在矩形上张开，矩形变大；捏拢，矩形变小。松手后保持大小。再次捏合时从当前大小继续。

`CGAffineTransform` 的说明见[结构体](structs.md#cgaffinetransform)。

### 两指旋转

旋转识别器的事件带 `rotation`：相对手势开始时转过的角度，单位是弧度。每次手势都从 0 开始。

```js
const twist = new UIRotationGestureRecognizer();
let baseAngle = 0;
twist.addEventListener('changed', (e) => {
  const { rotation } = /** @type {UIRotationGestureRecognizerEvent} */ (e);
  card.transform = CGAffineTransform.rotation(baseAngle + rotation);
});
twist.addEventListener('ended', (e) => {
  const { rotation } = /** @type {UIRotationGestureRecognizerEvent} */ (e);
  baseAngle = baseAngle + rotation;
});
card.addGestureRecognizer(twist);
```

**效果**：两根手指放在矩形上转动，矩形跟着转。松手后保持角度。矩形转动的方向和手指是否一致**未在模拟器验证**。

> **注意**：这一节和上一节的识别器加在同一个视图上时，一次触摸里只有先认出的那一个派发事件，不能边缩放边旋转。让两个识别器同时生效目前做不到，见[还不能做的](#还不能做的)。这一节的代码单独使用时，把上一节的 `pinch` 从 `card` 上移除。

### 响应轻扫

轻扫识别器默认识别向右的轻扫。用 `direction` 指定方向。

```js
const swipeLeft = new UISwipeGestureRecognizer();
swipeLeft.direction = ['left'];
swipeLeft.addEventListener('ended', () => {
  console.log('向左扫');
});
card.addGestureRecognizer(swipeLeft);

const swipeRight = new UISwipeGestureRecognizer();
swipeRight.direction = ['right'];
swipeRight.addEventListener('ended', () => {
  console.log('向右扫');
});
card.addGestureRecognizer(swipeRight);
```

**效果**：手指在矩形上向左快速划过，输出 `向左扫`；向右快速划过，输出 `向右扫`。慢慢移动不算轻扫，没有输出。

`direction` 可以写多个方向，比如 `['left', 'right']`。这时两个方向都触发同一个 `ended`，事件不说明是哪个方向。要区分方向，像上面这样每个方向创建一个识别器。

### 从屏幕边缘向内拖

屏幕边缘拖动识别器只识别从屏幕边缘开始的拖动。`edges` 指定哪几条边，默认是空数组，不设置就认不出任何手势。

```js
const fromRight = new UIScreenEdgePanGestureRecognizer();
fromRight.edges = ['right'];
fromRight.addEventListener('began', () => {
  console.log('从右边缘拖进来了');
});
page.view.addGestureRecognizer(fromRight);
```

**效果**：手指从屏幕右边缘向左拖，输出 `从右边缘拖进来了`。从屏幕中间开始拖没有输出。

识别器加在 `page.view` 上，因为它占满整个屏幕，包含屏幕的边缘。它的事件和拖动识别器相同，也带 `translation` 和 `velocity`。

页面在[导航控制器](ui-navigation-controller.md)里时，屏幕左边缘已经被「向右滑返回上一页」占用。

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
| 例子 | 点按、轻扫 | 长按、拖动、捏合、旋转、屏幕边缘拖动 |
| 特点 | 认出来就结束，只通知一次 | 认出来之后持续一段时间，过程中不断通知 |
| 派发的事件 | 只有 `ended` | `began`，然后零次或多次 `changed`，最后是 `ended` 或 `cancelled` |

四个事件的含义：

| 事件 | 什么时候派发 |
| --- | --- |
| `began` | 连续手势被认出的那一刻。长按是按够 `minimumPressDuration` 的时候；拖动是手指移动了一小段距离的时候 |
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
- 拖动的位移和速度、捏合的倍数、旋转的角度也从事件对象读。识别器上也有读这些值的成员（`translationInView()`、`scale`、`rotation` 等），在回调里调用它们，得到的是回调执行那一刻的值。手势进行中，这个值可能比事件对象上的新；手势结束之后，这些值会不会被系统清零**未在模拟器验证**。

### 识别器和视图自己的触摸

识别器和视图是同时收到触摸的。识别器认出手势之后，系统会取消视图正在处理的这次触摸。对[控件](ui-control.md)来说，表现是收到 `touchcancel` 而不是 `touchupinside`。**未在模拟器验证。**

把 `cancelsTouchesInView` 设成 `false`，视图就照常收完这次触摸，识别器和控件事件都会触发。**未在模拟器验证。**

有一种情况系统已经处理好了：父视图上有一个单指单击的识别器，子视图里有 [`UIButton`](ui-button.md)。这时点按钮只触发按钮自己的 `touchupinside`，父视图的识别器不触发（实测）。

### 所有权

视图保管加在它上面的识别器。把识别器加到视图上之后，App 的代码不需要另外保存它。只要视图还在，识别器和它上面的监听器就一直有效。

一个识别器同一时刻只能在一个视图上。把它加到另一个视图时，它会自动从原来的视图上移除。

`requireGestureRecognizerToFail()` 建立的关系不保管识别器。`a.requireGestureRecognizerToFail(b)` 之后，`a` 和 `b` 仍然各自由它所在的视图保管。其中一个没有加到视图上、App 的代码也没有保存它时，它会被回收，这个关系随之失效。

## 成员说明

### 继承关系

```
EventTarget
  └─ NSObject
       └─ UIGestureRecognizer
            ├─ UITapGestureRecognizer
            ├─ UILongPressGestureRecognizer
            ├─ UIPanGestureRecognizer
            │    └─ UIScreenEdgePanGestureRecognizer
            ├─ UIPinchGestureRecognizer
            ├─ UIRotationGestureRecognizer
            └─ UISwipeGestureRecognizer
```

识别器不是视图，没有 `frame`、`backgroundColor` 这些成员。

### 创建

```js
const tap = new UITapGestureRecognizer();
const press = new UILongPressGestureRecognizer();
const pan = new UIPanGestureRecognizer();
const pinch = new UIPinchGestureRecognizer();
const rotation = new UIRotationGestureRecognizer();
const swipe = new UISwipeGestureRecognizer();
const edgePan = new UIScreenEdgePanGestureRecognizer();
```

七个构造函数都没有参数。

- `UIGestureRecognizer` 是基类，不能直接创建：`TypeError: Illegal constructor: UIGestureRecognizer is abstract; construct one of its subclasses instead: UITapGestureRecognizer, UILongPressGestureRecognizer, UIPanGestureRecognizer, UIPinchGestureRecognizer, UIRotationGestureRecognizer, UISwipeGestureRecognizer, UIScreenEdgePanGestureRecognizer`
- 不能继承这几个类，见[原生类](native-classes.md)。

### `UIGestureRecognizer` 的属性

所有子类都有这些属性。

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `state` | 字符串 | 是 | 否 | `'possible'` | 当前状态，取值见下表。回调里读到的不一定是事件发生时的状态，见[回调里读不到当时的状态](#回调里读不到当时的状态) |
| `view` | [`UIView`](ui-view.md) 或 `null` | 是 | 否 | `null` | 识别器所在的视图。没有加到任何视图上时是 `null` |
| `isEnabled` | 布尔 | 是 | 是 | `true` | `true`：正常识别。`false`：不接收触摸；正在进行的手势被取消 |
| `cancelsTouchesInView` | 布尔 | 是 | 是 | `true` | `true`：认出手势后取消视图正在处理的这次触摸。`false`：视图照常收完这次触摸 |
| `delaysTouchesBegan` | 布尔 | 是 | 是 | `false`；`UIScreenEdgePanGestureRecognizer` 是 `true` | `true`：识别器确定认不出之前，视图收不到触摸的开始。`false`：视图和识别器同时收到。设成 `true` 之后的效果**未在模拟器验证** |
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

### `UIGestureRecognizer` 的方法

| 方法 | 说明 |
| --- | --- |
| `recognizer.requireGestureRecognizerToFail(other)` | 让 `recognizer` 等 `other` 确定认不出之后再认；`other` 认出了手势，`recognizer` 就不认。`other` 是另一个识别器，可以是任何一种。没有返回值。建立之后不能撤销 |

```js
singleTap.requireGestureRecognizerToFail(doubleTap);
```

- **出错**：参数不是识别器（包括 `null`）：`TypeError: requireGestureRecognizerToFail needs a UIGestureRecognizer`

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

### `UIPanGestureRecognizer` 的属性和方法

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `minimumNumberOfTouches` | 数 | 是 | 是 | `1` | 最少要几根手指按着才算拖动，单位是根 |
| `maximumNumberOfTouches` | 数 | 是 | 是 | `4294967295` | 最多能有几根手指按着，单位是根。默认值等于不限制 |
| `allowedScrollTypesMask` | 字符串数组 | 是 | 是 | `[]` | 哪几种滚动输入也算拖动，取值见下表。空数组：滚动输入不触发这个识别器 |

`allowedScrollTypesMask` 数组里可以出现的值：

| 取值 | 含义 |
| --- | --- |
| `'discrete'` | 一格一格的滚动输入，比如鼠标滚轮 |
| `'continuous'` | 连续的滚动输入，比如触控板 |

这个属性针对外接的鼠标和触控板。它在 iPhone 上的效果**未在模拟器验证**。

方法：

| 方法 | 返回值 | 说明 |
| --- | --- | --- |
| `pan.translationInView(view)` | `CGPoint` | 从手势开始到现在手指移动了多少，换算到 `view` 的坐标系里，单位 [pt](units.md)。`view` 是 [`UIView`](ui-view.md) 或 `null`，`null` 表示窗口的坐标系。没有手势在进行时是 `(0, 0)` |
| `pan.velocityInView(view)` | `CGPoint` | 手指移动的速度，换算到 `view` 的坐标系里，单位是 pt 每秒。`view` 的含义同上。没有手势在进行时是 `(0, 0)` |
| `pan.setTranslation(translation, { inView })` | 无 | 把位移改成 `translation`，之后的移动从这个值接着累计。`translation` 是 `CGPoint` 或 `{ x, y }`，在 `inView` 的坐标系里。`inView` 必须写，值是 `UIView` 或 `null`。没有手势在进行时调用不生效，读回来仍是 `(0, 0)` |

```js
const moved = pan.translationInView(page.view);
const speed = pan.velocityInView(null);
pan.setTranslation(new CGPoint(0, 0), { inView: page.view });
```

在事件回调里调用这三个方法时，读到和改到的是回调执行那一刻的值，不是事件发生那一刻的值。事件发生那一刻的位移和速度在事件对象上，见[事件](#事件)。

- **出错**：`view` 或 `inView` 不是视图也不是 `null`：`TypeError: translationInView needs a UIView or null`
- **出错**：`setTranslation()` 没有写 `inView`：`TypeError: setTranslation needs { inView }`
- **出错**：`translation` 缺少字段或字段不是数：`TypeError: setTranslation is missing y, or it is not a finite number`

### `UIScreenEdgePanGestureRecognizer` 的属性

它是 `UIPanGestureRecognizer` 的子类，上一节的属性和方法它都有。

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `edges` | 字符串数组 | 是 | 是 | `[]` | 识别从哪几条边开始的拖动，按当前的界面方向算。空数组：认不出任何手势 |

`edges` 数组里可以出现的值是 `'top'`、`'left'`、`'bottom'`、`'right'`，分别是屏幕的上、左、下、右边缘。读出来的顺序固定是这个顺序，和写入的顺序无关。没有表示「全部」的值，要四条边就写四个。

三个默认值和父类不同：

| 属性 | `UIPanGestureRecognizer` | `UIScreenEdgePanGestureRecognizer` |
| --- | --- | --- |
| `maximumNumberOfTouches` | `4294967295` | `1` |
| `delaysTouchesBegan` | `false` | `true` |
| `edges` | 没有这个属性 | `[]` |

### `UIPinchGestureRecognizer` 的属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `scale` | 数 | 是 | 是 | `1` | 两指的间距相对手势开始时的倍数。大于 1 是张开，小于 1 是捏拢。写入之后从写入的值接着计算 |
| `velocity` | 数 | 是 | 否 | `0` | `scale` 每秒变化多少。没有手势在进行时是 0 |

### `UIRotationGestureRecognizer` 的属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `rotation` | 数 | 是 | 是 | `0` | 相对手势开始时转过的角度，单位是弧度。可以是负数，超过一圈时不折回，写 `-7` 读回 `-7`。写入之后从写入的值接着计算 |
| `velocity` | 数 | 是 | 否 | `0` | 旋转的速度，单位是弧度每秒。没有手势在进行时是 0 |

### `UISwipeGestureRecognizer` 的属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `numberOfTouchesRequired` | 数 | 是 | 是 | `1` | 要几根手指一起扫，单位是根 |
| `direction` | 字符串数组 | 是 | 是 | `['right']` | 识别哪几个方向的轻扫 |

`direction` 数组里可以出现的值是 `'right'`、`'left'`、`'up'`、`'down'`，分别是向右、向左、向上、向下。读出来的顺序固定是这个顺序，和写入的顺序无关。可以写空数组；空数组时识别器的表现**未在模拟器验证**。

### 属性的共同说明

以上各表里的属性都没有变化通知。`scale`、`rotation` 和两个 `velocity` 在手势进行中由系统更新，它们的值随[事件](#事件)一起送到；其余属性只有你自己的代码能改。

**出错**：

- 次数和手指数是负数：`TypeError: numberOfTapsRequired must be a non-negative integer`
- 时长和距离是负数：`TypeError: minimumPressDuration must be a non-negative number`
- 给的值转不成数：`TypeError: minimumPressDuration must be a finite number, got "soon"`
- 要数组的属性给的不是数组：`TypeError: direction needs an array of names; expected any of: right / left / up / down`

`direction`、`edges`、`allowedScrollTypesMask` 的数组里有不认识的名字时不抛异常：整次赋值不生效，属性保持原来的值，控制台输出一条警告，比如 `[Nacre] direction has no value "diagonal"; expected one of: right / left / up / down, ignored`。数组里写对的名字不会被单独应用。

次数和手指数给的是小数时去掉小数部分（写 `2.9` 读回 `2`）。给的是数字字符串时按数用（写 `'0.4'` 读回 `0.4`）。转换规则见[运行时怎么工作](how-it-works.md)。

`scale` 和 `rotation` 没有取值范围，0 和负数都可以写入并原样读回。

出错时属性保持原来的值。

### 事件

用 `addEventListener()` 和 `removeEventListener()` 监听，写法和其他对象相同。

| 事件名 | 点按、轻扫 | 长按 | 拖动、捏合、旋转、屏幕边缘拖动 |
| --- | --- | --- | --- |
| `began` | 不派发 | 按够时间时 | 手势被认出时 |
| `changed` | 不派发 | 被认出之后手指移动时 | 被认出之后手指移动时 |
| `ended` | 被认出时 | 手指抬起时 | 手指抬起时 |
| `cancelled` | 不派发 | 被打断时 | 被打断时 |

事件对象的类型是 `UIGestureRecognizerEvent`，比 `Event` 多两个只读字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `location` | `CGPoint` 或 `null` | 手势的位置，在识别器所在视图的坐标系里，单位 [pt](units.md)。多根手指时是它们的中心点。要换算到别的视图，用 [`convertPoint()`](ui-view.md) |
| `numberOfTouches` | 数 | 事件发生时参与手势的手指个数。单指点按的 `ended` 和单指长按抬起时的 `ended` 里都是 1（实测） |

三种手势的事件对象在这两个字段之外各多两个只读字段。它们是事件发生那一刻的值。

| 识别器 | 事件对象的类型 | 字段 | 类型 | 含义 |
| --- | --- | --- | --- | --- |
| `UIPanGestureRecognizer`、`UIScreenEdgePanGestureRecognizer` | `UIPanGestureRecognizerEvent` | `translation` | `CGPoint` | 从手势开始到这个事件为止手指移动了多少，在识别器所在视图的坐标系里，单位 pt |
| | | `velocity` | `CGPoint` | 手指移动的速度，坐标系同上，单位是 pt 每秒 |
| `UIPinchGestureRecognizer` | `UIPinchGestureRecognizerEvent` | `scale` | 数 | 两指的间距相对手势开始时的倍数 |
| | | `velocity` | 数 | `scale` 每秒变化多少 |
| `UIRotationGestureRecognizer` | `UIRotationGestureRecognizerEvent` | `rotation` | 数 | 相对手势开始时转过的角度，单位是弧度 |
| | | `velocity` | 数 | 旋转的速度，单位是弧度每秒 |

轻扫的事件对象只有 `location` 和 `numberOfTouches`。

- 事件不能取消，`preventDefault()` 没有作用。
- 事件只派发给识别器自己，不会传给视图或父视图。
- 回调里抛出异常不影响识别器，同一事件的其他回调照常执行。异常在 [`application`](application.md#没处理的异常不会让-app-退出) 上派发 `error`；没有监听器取消时，控制台输出以 `Uncaught` 开头的日志。
- 没有 `'tap'`、`'longpress'`、`'swipe'` 这样的事件名。点按和轻扫监听 `'ended'`，长按监听 `'began'`。
- 监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

### `UIView` 上的成员

识别器通过视图的这三个成员加上和拿掉。

| 成员 | 说明 |
| --- | --- |
| `view.addGestureRecognizer(recognizer)` | 把识别器加到视图上。没有返回值。识别器原来在别的视图上时，先从那个视图上移除。重复加同一个识别器没有效果 |
| `view.removeGestureRecognizer(recognizer)` | 把识别器从视图上拿掉。没有返回值 |
| `view.gestureRecognizers` | 只读。视图上全部识别器的数组，没有时是空数组。每次读得到一个新数组，里面的对象是同一个，可以用 `===` 比较 |

- 系统自己加的识别器也在 `gestureRecognizers` 里。[`UIScrollView`](ui-scroll-view.md) 一创建就带着几个，其中用来滚动的那个读出来是 `UIPanGestureRecognizer`（验收用例里核对过），它的 `minimumNumberOfTouches` 是 1，`maximumNumberOfTouches` 是 4294967295，和自己创建的拖动识别器相同。这两个值由系统决定，不要依赖它们。
- 系统的识别器属于上面七个类之一时，读出来就是那个类；不属于任何一个时，读出来是 `UIGestureRecognizer`。后一种情况**未在模拟器验证**。
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
| `[single requireGestureRecognizerToFail:dbl]` | `single.requireGestureRecognizerToFail(dbl)` |
| `[pan translationInView:view]` | 事件对象的 `translation`，或 `pan.translationInView(view)` |
| `[pan velocityInView:view]` | 事件对象的 `velocity`，或 `pan.velocityInView(view)` |
| `[pan setTranslation:CGPointZero inView:view]` | `pan.setTranslation(new CGPoint(0, 0), { inView: view })` |
| `pan.maximumNumberOfTouches = 2` | `pan.maximumNumberOfTouches = 2` |
| `pinch.scale`、`pinch.velocity` | 事件对象的 `scale`、`velocity`，或 `pinch.scale`、`pinch.velocity` |
| `rotation.rotation`、`rotation.velocity` | 事件对象的 `rotation`、`velocity`，或 `rotation.rotation`、`rotation.velocity` |
| `swipe.direction = UISwipeGestureRecognizerDirectionLeft` | `swipe.direction = ['left']` |
| `swipe.direction = UISwipeGestureRecognizerDirectionLeft \| UISwipeGestureRecognizerDirectionRight` | `swipe.direction = ['left', 'right']` |
| `edgePan.edges = UIRectEdgeRight` | `edgePan.edges = ['right']` |
| `edgePan.edges = UIRectEdgeAll` | `edgePan.edges = ['top', 'left', 'bottom', 'right']` |
| `pan.allowedScrollTypesMask = UIScrollTypeMaskAll` | `pan.allowedScrollTypesMask = ['discrete', 'continuous']` |

ObjC 里一个 action 方法收到手势的所有阶段，再用 `state` 区分。JS 里每个阶段是一个事件名。

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 让两个识别器同时认出手势，比如边缩放边旋转 | `UIGestureRecognizerDelegate` 的 `gestureRecognizer:shouldRecognizeSimultaneouslyWithGestureRecognizer:` | 未实现。系统在手势进行中当场询问，要求立刻回答，目前 JS 的回调做不到 |
| 按条件决定一个手势要不要开始、要不要接收某次触摸 | `UIGestureRecognizerDelegate` 的 `gestureRecognizerShouldBegin:`、`gestureRecognizer:shouldReceiveTouch:` 等 | 未实现。原因同上 |
| 撤销 `requireGestureRecognizerToFail()` 建立的关系 | 无。系统没有提供撤销的方法 | 做不到 |
| 随时查询手势在任意视图里的位置 | `locationInView:`、`locationOfTouch:inView:` | 未实现。位置从事件对象的 `location` 读 |
| 自己定义一种手势 | 继承 `UIGestureRecognizer` 并覆写 `touchesBegan:withEvent:` 等方法 | 未实现。原生里靠继承来做，而[原生类不能继承](native-classes.md) |
| 限定只认手指、触控笔或鼠标 | `allowedTouchTypes`、`buttonMaskRequired` | 未实现 |

## 参见

- [`UIView`](ui-view.md)：识别器加在视图上；`hitTest()`、`convertPoint()`、`isUserInteractionEnabled`
- [`UIControl`](ui-control.md)：按钮这类控件有自己的一套事件，不需要识别器
- [`UIButton`](ui-button.md)：按钮式的交互用它，不用识别器
- [`UIScrollView`](ui-scroll-view.md)：识别器所在的视图可以放在滚动视图里
- [结构体](structs.md)：`CGPoint`（位置、位移、速度）和 `CGAffineTransform`（把缩放和旋转应用到视图上）
- [`UINavigationController`](ui-navigation-controller.md)：它占用了屏幕左边缘的拖动，用来返回上一页
- [运行时怎么工作](how-it-works.md)：回调为什么不是立刻执行
- [原生类](native-classes.md)：为什么这几个类不能继承
