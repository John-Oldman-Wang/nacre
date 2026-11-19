# 响应手势

这一篇讲怎么用手势识别器让普通视图响应点按、长按、拖动、捏合、旋转和轻扫，以及识别器和按钮、和别的识别器、和滚动视图放在一起时谁生效。识别器的类是 [`UIGestureRecognizer`](../api/ui-gesture-recognizer.md) 和它的七个子类，每个属性、方法和事件的细节在各自的参考页。

## 推荐的做法

- **按钮式的交互用 [`UIButton`](../api/ui-button.md)，不用识别器。** 按钮自带按住时的外观变化和禁用状态。识别器只告诉 App「认出了手势」，按下时的视觉反馈要自己做。
- **不是控件的视图要响应点击时用识别器。** 比如一张卡片、一行文字、一张图片。
- **一个容器里有很多可点的子视图时，在容器上加一个识别器**，回调里用 `hitTest()` 查出点到了哪个子视图，见[在父视图上统一处理点击](#在父视图上统一处理点击)。子视图增加或移除时不用跟着加减识别器。
- **判断手势的阶段看事件名，读位置看事件对象。** 不在回调里读识别器的 `state`。
- **拖动一个视图时，在 `began` 里记下视图的起始位置，在 `changed` 里用「起始位置 + 事件的 `translation`」算新位置。** `translation` 是从手势开始累计的位移，这样写不需要在每次回调里把它清零，见[拖动一个视图](#拖动一个视图)。
- **松手之后要做惯性动画时，速度从 `ended` 事件的 `velocity` 读。** 回调执行时手势已经结束，这时再调 `velocityInView()` 读不到松手那一刻的速度。
- **轻扫要区分方向时，每个方向创建一个识别器。** 一个识别器可以识别多个方向，但事件不说明认出的是哪一个。


## 第一个例子
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

完整例子的开头几行是每个 App 都要有的：在 `sceneconnect` 的回调里建窗口和页面，见 [`UIWindowScene`](../api/ui-window-scene.md)。


以下各节沿用上面的 `page`、`card`、`tap` 和 `press`。单独试某一节时，先写这几行：

```js
const page = new UIViewController();
const card = new UIView();
page.view.addSubview(card);
const tap = new UITapGestureRecognizer();
card.addGestureRecognizer(tap);
const press = new UILongPressGestureRecognizer();
card.addGestureRecognizer(press);
```

## 拿到点的位置

事件对象上的 `location` 是手指的位置，在识别器所在视图的坐标系里，单位是 [pt](../api/units.md)。

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

## 响应双击

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

## 让单击等双击失败

`a.requireGestureRecognizerToFail(b)` 让识别器 `a` 等识别器 `b` 确定认不出之后再认。`b` 认出了手势，`a` 就不认。

```js
const doubleTap = new UITapGestureRecognizer();
doubleTap.numberOfTapsRequired = 2;
card.addGestureRecognizer(doubleTap);

const singleTap = new UITapGestureRecognizer();
singleTap.addEventListener('ended', () => {
  console.log('单击');
});
singleTap.requireGestureRecognizerToFail(doubleTap);
card.addGestureRecognizer(singleTap);
```

**效果**：快速连点两下矩形，只输出 `双击`。点一下矩形，输出 `单击`；这一行比没有这层关系时出现得晚，因为系统要先等一小段时间，确定没有第二下。**未在模拟器验证。**

开头三行建出上一节的双击识别器 `doubleTap`。完整例子里的 `tap` 也是单击识别器，这里另建一个是为了不改变它的行为。

这个关系建立之后不能撤销。两个识别器互不保管对方，都要加在视图上才有效，见[所有权](../api/ui-gesture-recognizer.md#所有权)。

## 改长按要按多久

```js
press.minimumPressDuration = 1;
```

**效果**：要按住 1 秒才派发 `began`。单位是秒，不是毫秒。**未在模拟器验证。**

## 手指按下时变暗

点按识别器要等手指松开才派发事件，做不出「按下时变暗、松开时恢复」。用长按识别器，把 [`minimumPressDuration`](../api/ui-long-press-gesture-recognizer/minimumpressduration.md) 设成 `0`：手指一按下它就开始。沿用 `card`：

```js
const touch = new UILongPressGestureRecognizer();
touch.minimumPressDuration = 0;
touch.addEventListener('began', () => {
  card.alpha = 0.6;
});
touch.addEventListener('ended', () => {
  card.alpha = 1;
  console.log('点了卡片');
});
touch.addEventListener('cancelled', () => {
  card.alpha = 1;
});
card.addGestureRecognizer(touch);
```

**效果**：手指按在卡片上，卡片立刻变淡；松开时恢复，控制台输出 `点了卡片`；触摸被系统打断（比如来电）时也恢复。**未在模拟器验证。**

> **注意**：这样设之后，这个识别器在手指按下的那一刻就认定了手势。卡片放在可以滚动的列表里时，它可能抢在滚动之前，让列表滚不动；和同一个视图上的别的识别器也可能冲突。**未在模拟器验证。** 这类效果用 [`UIButton`](../api/ui-button.md) 能做到的，优先用按钮。

## 长按之后跟着手指移动

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

## 拖动一个视图

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

`translation` 在识别器所在视图（这里是 `card`）的坐标系里，单位是 [pt](../api/units.md)。`card` 没有设置 `transform` 时，它和父视图坐标系里的位移相同，可以直接加到 `center` 上。`card` 设置了缩放或旋转的 `transform` 时两者不同，这时在回调里调 `drag.translationInView(page.view)` 取父视图坐标系里的位移。

## 松手时读速度

`ended` 事件的 `velocity` 是松手那一刻手指移动的速度，单位是 pt 每秒，横向和纵向各一个分量。

`drag` 是上一节加在 `card` 上的拖动识别器：

```js
const drag = new UIPanGestureRecognizer();
card.addGestureRecognizer(drag);

drag.addEventListener('ended', (e) => {
  const { velocity } = /** @type {UIPanGestureRecognizerEvent} */ (e);
  if (velocity.x > 500) {
    console.log('向右甩出去了');
  }
});
```

**效果**：向右快速拖动并松手，输出 `向右甩出去了`。慢慢拖动后松手，或者停住再松手，没有输出。

## 只认两根手指的拖动

```js
const twoFingerDrag = new UIPanGestureRecognizer();
twoFingerDrag.minimumNumberOfTouches = 2;
twoFingerDrag.maximumNumberOfTouches = 2;
card.addGestureRecognizer(twoFingerDrag);
```

**效果**：一根手指拖动矩形时，这个识别器不派发事件。两根手指一起拖动时才派发。

## 两指缩放

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

`CGAffineTransform` 的说明见[结构体](../api/cg-affine-transform.md)。

## 两指旋转

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

> **注意**：这一节和上一节的识别器加在同一个视图上时，一次触摸里只有先认出的那一个派发事件，不能边缩放边旋转。让两个识别器同时生效目前做不到，见[还不能做的](../api/ui-gesture-recognizer.md#还不能做的)。这一节的代码单独使用时，把上一节的 `pinch` 从 `card` 上移除。

## 响应轻扫

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

## 从屏幕边缘向内拖

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

页面在[导航控制器](../api/ui-navigation-controller.md)里时，屏幕左边缘已经被「向右滑返回上一页」占用。

## 让文字或图片可以点

[`UILabel`](../api/ui-label.md) 和 [`UIImageView`](../api/ui-image.md) 默认不接收触摸，加在它们上面的识别器收不到任何东西。要先打开 `isUserInteractionEnabled`。

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

## 在父视图上统一处理点击

识别器接收它所在视图的所有子视图上的触摸。所以只在父视图上加一个识别器，再用 `hitTest()` 查出点到了哪个子视图。`hitTest()` 的说明见 [`UIView`](../api/ui-view.md)。

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

## 暂时停用

```js
tap.isEnabled = false;
```

**效果**：点矩形不再有反应。设回 `true` 后恢复。**未在模拟器验证。**

## 取消监听和移除识别器

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

## 识别器接收哪些视图上的触摸

识别器接收它所在的视图和这个视图**所有子视图**上的触摸。把识别器加在父视图上，点子视图也会触发它。事件只派发在识别器上，不会传给别的对象。

视图要接收触摸，识别器才收得到。[`UILabel`](../api/ui-label.md) 和 [`UIImageView`](../api/ui-image.md) 默认不接收触摸，要先把 `isUserInteractionEnabled` 设成 `true`，见[让文字或图片可以点](#让文字或图片可以点)。

## 手势和按钮同时存在时谁生效

| 情况 | 结果 | 依据 |
| --- | --- | --- |
| 父视图上有单指单击的识别器，子视图里有 [`UIButton`](../api/ui-button.md)，用户点按钮 | 只有按钮的事件派发，父视图的识别器不触发 | 实测 |
| 同上，子视图是直接创建的 [`UIControl`](../api/ui-control.md) | 没有核对过 | **未在模拟器验证** |
| 父视图上有长按识别器，用户长按子视图里的控件 | 识别器认出长按后，系统取消控件正在处理的这次触摸。控件派发 `touchcancel`，不派发 `touchupinside` | **未在模拟器验证** |

要让识别器和控件的事件都派发，把识别器的 `cancelsTouchesInView` 设成 `false`，见[识别器和视图自己的触摸](../api/ui-gesture-recognizer.md#识别器和视图自己的触摸)。

## 一个视图上加多个识别器

一个视图可以加多个识别器。同一个视图上加一个点按和一个长按是常见的组合：点一下触发点按，按住触发长按（实测，见[第一个例子](#第一个例子)）。长按松手时点按识别器不触发，**未在模拟器验证**。

同一个视图上既有单击识别器又有双击识别器时，双击的第一下会先触发单击。**未在模拟器验证。** 要让单击等系统确定这不是双击之后再触发，用 `requireGestureRecognizerToFail()`，见[让单击等双击失败](#让单击等双击失败)。

同一个视图上的两个识别器默认不会同时认出手势：一次触摸里，先认出的那个生效。所以在同一个视图上加捏合和旋转，一次只有其中一个派发事件。让两个识别器同时生效需要 `UIGestureRecognizerDelegate`，目前做不到，见[还不能做的](../api/ui-gesture-recognizer.md#还不能做的)。这一条的依据是 Apple 的文档，**未在模拟器验证**。

一个识别器同一时刻只能在一个视图上。把它加到另一个视图时，它自动从原来的视图上移除。

## 滚动视图里的手势

识别器所在的视图可以放在[滚动视图](../api/ui-scroll-view.md)里。验收界面的手势区块就在一个滚动视图里，点按在那里用真实触摸核对过。

长按识别器在滚动视图里的表现**未在模拟器验证**。

滚动视图自己就是用一个拖动识别器来滚动的。在滚动视图里的视图上再加一个拖动识别器，用户拖这个视图时是它生效还是滚动视图滚动，**未在模拟器验证**。

## 参见

- [`UIGestureRecognizer`](../api/ui-gesture-recognizer.md)：事件、共同的属性、离散手势和连续手势
- [`UITapGestureRecognizer`](../api/ui-tap-gesture-recognizer.md)、[`UILongPressGestureRecognizer`](../api/ui-long-press-gesture-recognizer.md)、[`UIPanGestureRecognizer`](../api/ui-pan-gesture-recognizer.md)、[`UIPinchGestureRecognizer`](../api/ui-pinch-gesture-recognizer.md)、[`UIRotationGestureRecognizer`](../api/ui-rotation-gesture-recognizer.md)、[`UISwipeGestureRecognizer`](../api/ui-swipe-gesture-recognizer.md)、[`UIScreenEdgePanGestureRecognizer`](../api/ui-screen-edge-pan-gesture-recognizer.md)：七种识别器
- [`UIView`](../api/ui-view.md)：`addGestureRecognizer()`、`hitTest()`、`isUserInteractionEnabled`
- [处理控件的触摸](control-touches.md)：按钮这类控件自己的事件
- [结构体](../api/structs.md)：`CGPoint` 和 `CGAffineTransform`
