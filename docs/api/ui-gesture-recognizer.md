---
type: reference
native: UIGestureRecognizer
status: partial
---

# `UIGestureRecognizer`

**`UIGestureRecognizer`** 表示一个手势识别器：一个加在视图上的对象，它观察这个视图上的触摸，认出某种手势时派发事件。普通的视图（[`UIView`](ui-view.md)、文字、图片）自己不派发任何触摸事件，只有[控件](ui-control.md)有自己的一套事件；识别器让任意视图都能响应手势。

`UIGestureRecognizer` 是所有识别器的父类，它自己不识别任何手势，不能直接创建。一个识别器只识别一种手势，每种手势是一个子类：

| 类 | 识别的手势 | 手指 |
| --- | --- | --- |
| [`UITapGestureRecognizer`](ui-tap-gesture-recognizer.md) | 点按：按下后很快抬起 | 默认 1 根 |
| [`UILongPressGestureRecognizer`](ui-long-press-gesture-recognizer.md) | 长按：按住不动一段时间 | 默认 1 根 |
| [`UIPanGestureRecognizer`](ui-pan-gesture-recognizer.md) | 拖动：按下后移动 | 默认 1 根以上 |
| [`UIPinchGestureRecognizer`](ui-pinch-gesture-recognizer.md) | 捏合：两根手指张开或捏拢 | 2 根 |
| [`UIRotationGestureRecognizer`](ui-rotation-gesture-recognizer.md) | 旋转：两根手指绕着彼此转 | 2 根 |
| [`UISwipeGestureRecognizer`](ui-swipe-gesture-recognizer.md) | 轻扫：朝一个方向快速划过 | 默认 1 根 |
| [`UIScreenEdgePanGestureRecognizer`](ui-screen-edge-pan-gesture-recognizer.md) | 屏幕边缘拖动：从屏幕的边缘向内拖 | 1 根 |

使用分三步：创建识别器，在识别器上监听事件，用视图的 `addGestureRecognizer()` 把它加到视图上。监听器加在识别器上，不加在视图上。识别器接收它所在的视图和这个视图**所有子视图**上的触摸。视图通过 `addGestureRecognizer()`、`removeGestureRecognizer()`、`gestureRecognizers` 三个成员管理识别器，见 [`UIView`](ui-view.md)。

点按和长按在模拟器和真机上用真实触摸核对过。**拖动、捏合、旋转、轻扫、屏幕边缘拖动还没有用真实触摸核对过**：创建、属性的默认值和读写、出错情况在验收用例里核对过，手势本身和事件带的数据都**未在模拟器验证**。

**继承关系**：`EventTarget` → `NSObject` → `UIGestureRecognizer`

识别器不是视图，没有 `frame`、`backgroundColor` 这些成员。

怎么用识别器响应点按、长按、拖动和缩放，见指南[响应手势](../guides/gestures.md)。

## 构造函数

[`UIGestureRecognizer()`](ui-gesture-recognizer/constructor.md)

不能直接调用，总是抛 `TypeError`。用上表里的子类创建识别器。

## 实例属性

所有子类都有这些属性。

| 属性 | 说明 |
| --- | --- |
| [`state`](ui-gesture-recognizer/state.md) <small>只读</small> | 识别器当前的状态 |
| [`view`](ui-gesture-recognizer/view.md) <small>只读</small> | 识别器所在的视图 |
| [`isEnabled`](ui-gesture-recognizer/isenabled.md) | 识别器是否接收触摸 |
| [`cancelsTouchesInView`](ui-gesture-recognizer/cancelstouchesinview.md) | 认出手势之后是否取消视图正在处理的触摸 |
| [`delaysTouchesBegan`](ui-gesture-recognizer/delaystouchesbegan.md) | 确定认不出之前，视图是否收得到触摸的开始 |
| [`delaysTouchesEnded`](ui-gesture-recognizer/delaystouchesended.md) | 确定认不出之前，视图是否收得到触摸的结束 |
| [`numberOfTouches`](ui-gesture-recognizer/numberoftouches.md) <small>只读</small> | 这一刻参与手势的手指个数 |
| [`recognizesSimultaneouslyWith`](ui-gesture-recognizer/recognizessimultaneouslywith.md) | 可以和这个识别器同时认出手势的其他识别器。只能写在自己创建的识别器上 |

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`addEventListener()`](ui-gesture-recognizer/addeventlistener.md) | 监听一个手势事件 |
| [`removeEventListener()`](ui-gesture-recognizer/removeeventlistener.md) | 移除一个监听 |
| [`requireGestureRecognizerToFail()`](ui-gesture-recognizer/requiregesturerecognizertofail.md) | 等另一个识别器确定认不出之后再认 |

## 事件

四个事件的名字是手势所处的阶段，它们不能取消。另有一个 `beforebegin` 在手势开始之前派发，可以取消。事件只派发给识别器自己。

| 事件 | 点按、轻扫 | 长按 | 拖动、捏合、旋转、屏幕边缘拖动 |
| --- | --- | --- | --- |
| [`beforebegin`](ui-gesture-recognizer/beforebegin-event.md) | 即将认出时，问要不要开始 | 即将认出时，问要不要开始 | 即将认出时，问要不要开始 |
| [`began`](ui-gesture-recognizer/began-event.md) | 不派发 | 按够时间时 | 手势被认出时 |
| [`changed`](ui-gesture-recognizer/changed-event.md) | 不派发 | 被认出之后手指移动时 | 被认出之后手指移动时 |
| [`ended`](ui-gesture-recognizer/ended-event.md) | 被认出时 | 手指抬起时 | 手指抬起时 |
| [`cancelled`](ui-gesture-recognizer/cancelled-event.md) | 不派发 | 被打断时 | 被打断时 |

手势没有被认出时不派发任何事件。比如长按没按够时间就抬起，或者按够之前手指移动超过了 10 pt。

事件对象带手指的位置 `location` 和手指个数 `numberOfTouches`。拖动的事件另外带位移 `translation` 和速度 `velocity`，捏合的带倍数 `scale` 和速度 `velocity`，旋转的带角度 `rotation` 和速度 `velocity`，见各事件页。

`beforebegin` 是当场派发的：系统等监听器执行完，监听器里调 `preventDefault()`，这一次手势就不开始。它只能用在 App 用 `new` 创建的识别器上，UIKit 自带的识别器（比如滚动视图的 `panGestureRecognizer`）上监听抛 `TypeError`，见[事件页](ui-gesture-recognizer/beforebegin-event.md)。

没有 `'tap'`、`'longpress'`、`'swipe'` 这样的事件名。监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

## 离散手势和连续手势

手势分两类，派发的事件不同。

| | 离散手势 | 连续手势 |
| --- | --- | --- |
| 例子 | 点按、轻扫 | 长按、拖动、捏合、旋转、屏幕边缘拖动 |
| 特点 | 认出来就结束，只通知一次 | 认出来之后持续一段时间，过程中不断通知 |
| 派发的事件 | 只有 `ended` | `began`，然后零次或多次 `changed`，最后是 `ended` 或 `cancelled` |

## 回调里读不到当时的状态

回调不是在手势发生的那一刻执行的，而是稍后执行，背景见[运行时怎么工作](how-it-works.md)。回调里读 [`state`](ui-gesture-recognizer/state.md) 得到的是回调执行那一刻的状态。实测：

| 在哪个回调里读 | 读到的 `state` | 原因 |
| --- | --- | --- |
| 点按的 `ended` | `'possible'` | 手势结束之后识别器立刻回到初始状态 |
| 长按的 `began`，手指还按着 | `'began'` | 手势还在进行。手指已经移动过时可能读到 `'changed'` |

所以：

- 要知道是哪个阶段，看事件名，不读 `state`。
- 手指的位置和个数从事件对象的 `location` 和 `numberOfTouches` 读。
- 拖动的位移和速度、捏合的倍数、旋转的角度也从事件对象读。识别器上也有读这些值的成员（`translationInView()`、`scale`、`rotation` 等），在回调里调用它们，得到的是回调执行那一刻的值。手势进行中，这个值可能比事件对象上的新；手势结束之后，这些值会不会被系统清零**未在模拟器验证**。

## 识别器和视图自己的触摸

识别器和视图是同时收到触摸的。识别器认出手势之后，系统会取消视图正在处理的这次触摸。对[控件](ui-control.md)来说，表现是收到 `touchcancel` 而不是 `touchupinside`。**未在模拟器验证。**

把 [`cancelsTouchesInView`](ui-gesture-recognizer/cancelstouchesinview.md) 设成 `false`，视图就照常收完这次触摸，识别器和控件事件都会触发。**未在模拟器验证。**

有一种情况系统已经处理好了：父视图上有一个单指单击的识别器，子视图里有 [`UIButton`](ui-button.md)。这时点按钮只触发按钮自己的事件，父视图的识别器不触发（实测）。

## 所有权

视图保管加在它上面的识别器。把识别器加到视图上之后，App 的代码不需要另外保存它。只要视图还在，识别器和它上面的监听器就一直有效。

一个识别器同一时刻只能在一个视图上。把它加到另一个视图时，它会自动从原来的视图上移除。

[`requireGestureRecognizerToFail()`](ui-gesture-recognizer/requiregesturerecognizertofail.md) 建立的关系不保管识别器。两个识别器仍然各自由它所在的视图保管。其中一个没有加到视图上、App 的代码也没有保存它时，它会被回收，这个关系随之失效。

[`recognizesSimultaneouslyWith`](ui-gesture-recognizer/recognizessimultaneouslywith.md) 的列表同样不保管里面的识别器。列表里的识别器被回收之后，从列表里消失。

## 示例

从空白 App 开始，在屏幕上放一个矩形。点一下它换颜色，按住它输出一行文字。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const card = new UIView();
  card.frame = new CGRect(40, 120, 200, 120);
  card.backgroundColor = 'systemIndigo';
  card.layer.cornerRadius = 16;
  page.view.addSubview(card);

  const tap = new UITapGestureRecognizer();
  let on = false;
  tap.addEventListener('ended', () => {
    on = !on;
    card.backgroundColor = on ? 'systemOrange' : 'systemIndigo';
  });
  card.addGestureRecognizer(tap);

  const press = new UILongPressGestureRecognizer();
  press.addEventListener('began', () => {
    console.log('按住了');
  });
  card.addGestureRecognizer(press);
});
```

**效果**

- 屏幕左上方出现一个 200 × 120 pt 的靛蓝色圆角矩形。
- 点一下矩形，它变成橙色。再点一下变回靛蓝色。
- 按住矩形 0.5 秒，控制台输出 `按住了`。松手后颜色不变（**长按松手时点按不触发这一点未在模拟器验证**）。

这段代码没有作为一个整体在模拟器运行过。创建、属性的默认值、加到视图上这几步在验收用例里核对过；点一下派发 `ended`、按住派发 `began`、松手派发 `ended`，也在验收用例里用真实触摸核对过。

更多写法见指南[响应手势](../guides/gestures.md)。

## 对应的 iOS API

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
| `[single requireGestureRecognizerToFail:dbl]` | `single.requireGestureRecognizerToFail(dbl)` |
| 委托的 `gestureRecognizerShouldBegin:` 返回 `NO` | 监听 `'beforebegin'`，调 `event.preventDefault()` |
| 委托的 `gestureRecognizer:shouldRecognizeSimultaneouslyWithGestureRecognizer:` 返回 `YES` | 把对方写进 `recognizesSimultaneouslyWith` |
| `recognizer.delegate = self` | 不用设。上面两项直接写在识别器上 |

ObjC 里一个 action 方法收到手势的所有阶段，再用 `state` 区分。JS 里每个阶段是一个事件名。各子类的属性对照见各自的类页。

## 参见

- [响应手势](../guides/gestures.md)：各种手势的写法、和按钮同时存在时谁生效、一个视图上加多个识别器、让两个手势同时生效
- [`UIView`](ui-view.md)：识别器加在视图上；`hitTest()`、`convertPoint()`、`isUserInteractionEnabled`
- [`UIControl`](ui-control.md)：按钮这类控件有自己的一套事件，不需要识别器
- [结构体](structs.md)：`CGPoint`（位置、位移、速度）和 `CGAffineTransform`（把缩放和旋转应用到视图上）
- [原生类](native-classes.md)：为什么这几个类不能继承
