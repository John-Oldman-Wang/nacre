# 事件模型

iOS 的触摸事件怎么走，和 Web 差在哪。下面的顺序全是**实测**的——写了个探针 App 装进模拟器真点了一遍（探针没有留在仓库里）。

## 四套并行的机制

Web 只有一棵树一套派发。iOS 有四套：

| | 方向 | 干什么 |
| --- | --- | --- |
| **hit-testing** | 自上而下 | 只**找目标**，不派发任何东西 |
| **responder chain** | 自下而上 | 没人处理就交给 `nextResponder` |
| **UIGestureRecognizer** | 平行 | 可以**抢占**：识别成功就给 view 发 `touchesCancelled` |
| **UIControl 的 target-action** | 直接注册 | **不走 responder chain**，谁注册谁收 |

三个和 Web 对不上的地方：

- **hit-testing 不是捕获阶段。** `hitTest:withEvent:` 递归调 `pointInside:` 找出目标就结束，全程不派发、不回调
- **responder chain 的默认语义和冒泡相反。** Web 默认往上传、显式 `stopPropagation()` 才停；responder chain 是「我不处理才给下一个」，不调 `super` 链条就断。而且它**不等于视图树**——会经过 `UIViewController`（控制器不在视图树里），`nextResponder` 还能被覆写
- **手势默认抢占。** `cancelsTouchesInView` 默认 YES、`delaysTouchesEnded` 默认 YES，所以连「抬手」都可能被延后到手势失败之后

## 实测：点一下 `UIControl`

```
[02] hitTest 命中          ← 只是找目标，不派发
[03] hitTest 命中          ← 查了两次
[04] touchesBegan
[05]   beginTracking  (tracking=0, touchInside=0)
[06]     → TouchDown
[07] touchesEnded
[08]   endTracking
[09]     → TouchUpInside
```

三条结论：

1. **hitTest 会被调用多次**，而且不派发任何东西
2. **`UIControlEvent` 是从 `touches*` 二次加工出来的**。`UIControl` 重写 `touchesBegan/Moved/Ended`，调 `beginTracking` / `continueTracking` / `endTracking`，再翻译成控件事件。是**两层**不是一层
3. **裸 `UIControl` 不发 `PrimaryActionTriggered`**——把 `TouchUpInside` 翻译成「语义动作」是 `UIButton` 干的事

## 实测：拖出去

```
[17] → TouchDown
[19] → TouchDragInside      ← 手指在里面移动，每次都发
   …
[41] → TouchDragExit        ← 越过边界，只发一次
[42] → TouchDragOutside     ← 之后一直是 Outside
   …
```

`DragEnter` / `DragExit` 是**边界穿越**事件（各一次），`DragInside` / `DragOutside` 是**持续**事件。这四个在 Web 里没有对应物——`pointermove` 不区分在不在元素内。

## 实测：点输入框，focus 在按下那一刻

```
[10] TextField.touchesBegan
[11]   → UIControlEvent EditingDidBegin     ← focus
[12] becomeFirstResponder 返回 1
```

**`touchesEnded` 根本没来**——`UITextField` 内部用手势识别器，手势识别成功就把 responder chain 那条路掐断了。

所以顺序和 Web 是反的：

| Web | iOS |
| --- | --- |
| `pointerdown` | `touchesBegan` → `TouchDown` |
| `pointermove` | `touchesMoved` → `DragInside` / `DragOutside` / `DragEnter` / `DragExit` |
| `pointerup` | `touchesEnded` → `TouchUpInside` / `TouchUpOutside` |
| `pointercancel` | `touchesCancelled` → `TouchCancel` |
| `click` | `TouchUpInside`（语义上是 `PrimaryActionTriggered`） |
| `focus` | `becomeFirstResponder`，**发生在 down 不是 up** |

Web 是 down → up → click → focus；iOS 是 **down → focus → …**。

## 实测：`UIAction` 的四条，推翻了两个假设

做 4a 时本来打算用 iOS 14 的 `addAction:forControlEvents:` 代替 `addTarget:action:`，因为前者看着能省掉 trampoline。实测否了：

```
1. block 强捕获 control  → button 活着（泄漏）      ← 必须 __weak
2. block 弱捕获 control  → button 正常死
3. control 不持有 action → 局部引用丢掉 action 就死了
4. 同 identifier 加两次  → handler 变成 2 个，触发的是第 2 个
5. sendActionsForControlEvents 是同步的，返回时回调已经跑完
```

**第 3 条推翻了「用 `UIAction` 就不用自己保住对象」**：`addAction:` 之后 control 并不持有 action。

**第 4 条和文档不符**：头文件写「subsequent actions with the same identifier replace previously added actions」，实测是**两个都在，后加的被触发**。

结论：两条路都要我们自己持有那个对象，`UIAction` 没有省事。所以 4a 用**自己的 trampoline 对象**，它持有的是 **handle 而不是 JS 函数**——派发时拿 handle 查包装再 `dispatchEvent`。这样原生永远不直接持有 JS 函数，生命周期就只剩「包装活不活」一个问题，而那个[所有权镜像](wrapper.md)已经解决了。

## M1a：异步回调回 JS 怎么做的

三块，没有一块持有 JS 函数。

**订阅通道。** `EventTarget.addEventListener` 加了一个钩子：某个类型的监听器**从无到有**时调 `[kSubscribe](type, true)`，**从有到无**时调 `false`。默认实现是空的——纯 JS 的 `EventTarget` 不需要告诉谁。`UIControl` 覆写它，调 `native.subscribe(handle, type, on)`。

惰性而不是建对象时全订阅：`touchDragInside` 在手指移动时每帧都发，没人听还过桥是白费。

**trampoline。** 原生侧一个小对象，`control` 通过**关联对象**持有它（`addTarget:action:` 自己不持有 target，头文件原话 "the target is not retained"）。它只记一个事件名和一个回运行时的弱引用：

```
control ──关联对象──▶ NacreControlTarget ──weak──▶ NacreRuntime
                            │ 只有一个字符串
                            └── type = "touchUpInside"
```

**派发。** `fire:` → `postToJS`（延后一轮）→ `EmitObjectEvent` → 查包装 → 包装自己的 `dispatchEvent`。

所以**原生永远不直接持有 JS 函数**，回调的生命周期问题就只剩「包装活不活」——而那个[所有权镜像](wrapper.md)已经解决了。订阅本身也是一条所有权边：JS 侧一个强引用的 `Set` 兜着已订阅的包装，最后一个监听器移走时放开。

### 先订阅，成了再登记

`addEventListener` 遇到一个类型的第一个监听器时，要做两件事：告诉原生「我要听了」，以及把监听器记进自己的表。**顺序是先订阅、后登记。**

原生会拒绝它不认识的事件名（`TypeError: addEventListener has no value "mousedown"; expected one of: …`）。最初的写法是先登记再订阅，于是原生一抛，登记的那条还留在表里，后果有三个，都在模拟器上复现了（2026-11-12，来源是一份外部审查）：

- 同一个回调再注册一次：被当成重复，**静默返回**
- 换一个回调注册同一个名字：这个类型「已经有人听了」，不再去问原生，**也静默通过**
- `dispatchEvent(new Event('mousedown'))` 真的会调到那个本该被拒掉的回调

还有一个看不见的后果：那个残留的键让监听器表永远不为空，而各个类退出保活集合的条件正是「表空了」，所以这个对象一旦进了集合就再也出不来。

订阅是同步的，原生在里面不会回调进 JS（事件一律延后一轮派发），所以调换顺序不引入重入。

取消订阅那一侧没有对称的问题：`removeEventListener` 先从表里删、再通知原生，而能走到这一步的事件名一定是当初原生认过的。

### 延后一轮的代价：读到的是「此刻」

实测同一个按钮连点两次：

```
✓ 真实触摸：收到 touchDown，isHighlighted = true
✓ 真实触摸：收到 touchDown，isHighlighted = false   ← 手抬得快
```

事件到 JS 时手指可能已经抬起来了，`isHighlighted` 被 UIKit 清掉了。要事件发生那一刻的值，只能在事件对象上带——第一版没带。

和 `UIWindow` 的四个事件是同一回事。

### 不能靠「谁先发生」推断「谁先到 JS」

写验收用例时踩到的：`sendActionsForControlEvents` 之后紧接着 `setTimeout(fn, 0)`，fn 先跑，控件事件后到。

因为定时器用的是**一个共用的唤醒源**——队列里可能早就排着一次唤醒了，它一跑就把堆里所有到期的定时器都处理掉，而控件事件的 `postToJS` 是刚刚才排进去的。

这条[定时器的实现说明](timers.md#和原生事件的顺序)里本来就写着，验收用例要轮询等条件，不要数轮次。

## 状态作参数：第一次出现的不对称

`UIControlState` 这个位掩码在两个方向上形状不一样，而且这是 UIKit 自己的不对称，不是我们编的：

| | JS 形态 | 为什么 |
| --- | --- | --- |
| 读 `control.state` | 字符串**数组** | 它本来就是掩码，可能同时有 selected 和 disabled |
| `setTitle(…, { forState })` | 字符串**数组** | setter 接受组合掩码 |
| `titleForState(state)` | **单个**字符串 | 头文件原话 "these getters only take a single state value" |

还有一个坑：**`normal` 的值是 0**。所以

- **读**的那一侧要单独处理——掩码为 0 时给 `['normal']`，否则拆出来是空数组
- **写**的那一侧也要单独认——`['normal']` 是最常用的写法，但它不在位掩码表里

原生侧为此多了一个 `ControlStateArgFromNames`，和读用的 `ControlStateFromNames` 分开。

### 两条实测纠正

**`titleForState:` 会回退到 normal。** 没设过的状态返回的是 normal 的值，不是 `nil`：

```
setTitle('点我试试', forState: normal)
titleForState('disabled')  →  '点我试试'
```

头文件没写这条，Apple 的在线文档里才有。

**system 按钮一样有 `titleLabel` 和 `imageView`。** 头文件的注释写着「always returns nil for system buttons」，实测不对——`titleLabel.text` 就是当前标题。那条注释是老的。

> 第三种事件源（delegate）在 4a 之后才出现，见[滚动](scrolling.md#第三种事件源delegate-trampoline)。

## 两种事件源

现在运行时里有两种，不要混：

| | 怎么注册 | 例子 |
| --- | --- | --- |
| **全局观察者** | 启动时向 `NSNotificationCenter` 注册一次，收到后按对象派发 | `UIWindow` 的 `becomekey` 四个、场景和生命周期事件 |
| **按对象订阅** | 某个对象第一次有监听器时才向原生注册 | 4a 的控件事件 |

第一种适合「通知本来就是全局广播」的；第二种适合「每个对象各自注册」的。控件事件必须走第二种——`touchDragInside` 在手指移动时每帧都发，没人听还过桥是白费。

---

← 返回[实现原理](README.md) ・ [项目说明](../project.md)

## A8：触点位置怎么带上来

控件事件的对象原来只有 `type` 和 `target`。第 4a 步当时的决定是「要位置等手势那一步」，但实际上**不用等**——`UIControl` 的 action 可以是两参的：

```objc
- (void)fire:(UIControl*)sender forEvent:(UIEvent*)event
```

单参那版拿不到 `UIEvent`，而触点只能从它身上取。改个 selector 就有了，不需要手势识别器，也不需要 M2。

### 必须在派发那一刻取

事件延后一轮才进 JS，那时 `UIEvent` 已经没了。所以位置在 `fire:forEvent:` 里就快照成 JSON，走 A6-1 加的那条 JSON 负载通道。

判据和动画的 `stop` 带 `finished` 是同一条：**那个信息回头在对象上读不读得到**。读不到就必须带。滚动事件不带位置，因为 `contentOffset` 回头读得到。

### 按事件类型分，不是给空值

Web 的做法是：`clientX` 在 `MouseEvent` 接口上，`KeyboardEvent` **根本没有这个字段**——不是「有但为 null」。照这条分，16 个控件事件是三类：

| | |
| --- | --- |
| 九个 `touch*` | 带 |
| 四个 `editing*` | 不带，文本编辑和触点无关 |
| `valueChanged` / `primaryActionTriggered` / `menuActionTriggered` | 不带。**和触点没有固定关系**——多数来自点击或拖动，但程序改 `slider.value`、或 `sendActionsForControlEvents()` 也会发。不确定就不承诺 |

### 那张表只在原生层有一份

原生**只给那九个**带负载；JS 侧的规则是一句「收到负载就挂上」。所以名单不用镜像到 JS，也就不存在漂移。

这是前面几次教训的反面用法：凡是两边都要知道的名单，迟早会漂（`check-api.sh` 这一轮里已经抓过两次「名字藏进变量」）。能做到只有一份，就别做两份。

### 没有真实触点时给 `null` 不给 `(0, 0)`

`sendActionsForControlEvents()` 那条路上压根没有 `UIEvent`。Web 在这种情况下给 0（`el.click()` 之后 `clientX` 是 0），我们给 `null`——**`(0, 0)` 是个合法坐标，和「没有触点」分不开**，这正是仓库一路在消灭的那类分不开。

## A7 的第一片：点按和长按

试用者做 React 渲染器时报的第一条缺口是「任意视图可点」。四套机制里这是第三套，之前一直挂在「抢占语义没有 Web 参照，要单独设计」上没动。这次只切了最小的一片——点按和长按——抢占那部分**原样暴露 iOS 的属性**（`cancelsTouchesInView`、`delaysTouchesBegan`、`delaysTouchesEnded`），不发明任何语义。

### 不需要新机制

手势识别器是 target-action，和 `UIControl`、`CADisplayLink` 是同一条路（M1a）。`delegate` 那一半才要 M2，这一片不碰。

订阅是惰性的：第一个事件名有监听器时才 `addTarget:action:`，最后一个移走时 `removeTarget:`。trampoline 通过关联对象挂在识别器上（`addTarget:` 不持有 target），它对识别器没有引用，不成环。

所以它对**系统自带的识别器**同样成立——`scrollView.gestureRecognizers` 读出来的那几个，按基类 `UIGestureRecognizer` 包装，订阅时照样能挂上我们的 target。这条未验证。

### 事件名就是状态名

iOS 的原貌是一个 action，自己读 `state`。照搬成一个 `'action'` 事件行不通，原因写在头文件里：

> the action method will be called **at the next turn of the run loop** and the recognizer will be **reset to UIGestureRecognizerStatePossible**

action 本身就晚一轮，我们的事件再延后一轮，JS 回调执行时 `state` 已经不是事件发生那一刻的值了。状态必须跟着事件走，而把它当事件名正好是控件事件的做法（`UIControlEvents` 的位 → 事件名）。

**这条的实测比预想的细。** 动手前以为「回调里一律读到 `possible`」，真实触摸点出来是两种：

| 回调 | 读到的 `state` |
| --- | --- |
| 点按的 `ended` | `possible`——离散手势结束即重置 |
| 长按的 `began`（手指还按着） | `began`——连续手势还在进行，没有重置这回事 |

结论不变（事件名才是可靠的），但文档里「一律是 `possible`」那句是错的，已按实测改掉。

只有四个：`began` / `changed` / `ended` / `cancelled`。`failed` 那条头文件写着 "the action method will not be called"，`possible` 是初态，都没有事件。

**点按监听的是 `'ended'`，不是 `'tap'` 也不是 `'recognized'`。** `Recognized = Ended` 在头文件里是别名，按已定的规则主名取被赋值的那一侧。没有给事件名加别名：同一个事件两个名字，`removeEventListener` 和 `once` 都说不清该算几个监听器。

### 位置跟着事件走，不暴露 `locationInView:`

和 A8 是同一个判据。`locationInView:` 回头读不到当时的值，所以在 `fire:` 里快照成 JSON：`location`（识别器所在视图的坐标系）和 `numberOfTouches`。要别的坐标系用已有的 `convertPoint`。

sink 仍然按**负载的形状**认（`'numberOfTouches' in payload`），不按事件名——`ended`、`began` 这些名字太泛。

### 冒泡留给 JS

头文件原话：*a UIGestureRecognizer receives touches hit-tested to its view and any of that view's subviews*。所以在父视图上挂一个识别器，事件里的 `location` 交给早就暴露的 `hitTest()`，就得到了命中的那个子视图；往上怎么走是 JS 那棵树自己的事。运行时没有为「冒泡」加任何东西。

### 所有权和取参

视图强持有识别器，JS 侧镜像成一条多值边（`addGestureRecognizer` 记、`removeGestureRecognizer` 断，换视图时断旧边）。`check-api.sh` 的所有权检查认识了新的取参助手 `gestureArg`，在沙盒副本里去掉记边验过：会报。

`gestureArg` **带错误出口**——给的不是识别器就抛，不像 `viewArg` 那样当 nil 吞掉。那 11 处旧写法还是 TODO，新代码不再往里添。

### 实测

| | 结果 |
| --- | --- |
| 默认值 | 和头文件一致：`isEnabled` true、`cancelsTouchesInView` true、`delaysTouchesBegan` false、`delaysTouchesEnded` true、点按 1 下 1 指、长按 0.5 秒 / 10 pt / 0 下 / 1 指 |
| 没有识别器的视图读 `gestureRecognizers` | 空数组（ObjC 那边是 nil） |
| 同一个识别器加两次 | 还是一个 |
| 加到另一个视图 | `view` 换过去，原来那个视图上没有了——UIKit 自己摘的 |
| GC 之后 | 只被视图持有的识别器，包装和上面挂的状态都还在 |

真实触摸（手势没有 `sendActionsForControlEvents` 那样的程序触发方式，下面这些是在模拟器里点出来的；验收用例在屏幕右下放了一块靛蓝色的容器，里面一个普通子块、一个 `UIButton`）：

| 操作 | 结果 |
| --- | --- |
| 点子块 | 容器的点按派发 `ended`，`location` 是容器坐标系里的 (28, 28)，`hitTest` 返回子块 |
| 点容器的空白处 | `ended`，`hitTest` 返回容器自己 |
| 点 `UIButton` | **只有**按钮的 `touchUpInside`，容器的点按不触发——UIKit 文档说的那条属实 |
| 按住不动 1.2 秒再抬手 | `began`，然后 `ended`，中间 0 次 `changed` |
| 按住之后分四步移动再抬手 | `began`，4 次 `changed`，`ended` 的 `location` 是抬手的位置 |
| `ended` 里的 `numberOfTouches` | **1**，点按和长按都是。不是 0 |

同一套操作在真机（iPhone 14）上又点了一遍，结论一致，另外多验到两条：

| | 结果 |
| --- | --- |
| 长按进行中 App 退到后台 | 派发 **`cancelled`**，紧接着才是场景的 `inactive` / `background`。模拟器上没法制造这个场景 |
| `location` 的精度 | 真机上是三分之一点（`23.333333`、`25.666667`），因为屏幕是 @3x。模拟器里用工具点出来的是整数 |

没验的：双击、`isEnabled = false`、`cancelsTouchesInView = false`、系统自带识别器的订阅。

