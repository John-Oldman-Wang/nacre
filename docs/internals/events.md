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

所以**原生永远不直接持有 JS 函数**，回调的生命周期问题就只剩「包装活不活」——而那个[所有权镜像](wrapper.md)已经解决了。订阅**不是**一条所有权边：加监听器只通知原生「我要听了」，不改变对象的寿命。这里曾经有一个强引用的 `Set` 把订阅过的包装全拿着，后来删掉了，见[包装机制](wrapper.md#加监听器不改变对象的寿命)。

### 先订阅，成了再登记

`addEventListener` 遇到一个类型的第一个监听器时，要做两件事：告诉原生「我要听了」，以及把监听器记进自己的表。**顺序是先订阅、后登记。**

原生会拒绝它不认识的事件名（`TypeError: addEventListener has no value "mousedown"; expected one of: …`）。最初的写法是先登记再订阅，于是原生一抛，登记的那条还留在表里，后果有三个，都在模拟器上复现了（2026-11-12，来源是一份外部审查）：

- 同一个回调再注册一次：被当成重复，**静默返回**
- 换一个回调注册同一个名字：这个类型「已经有人听了」，不再去问原生，**也静默通过**
- `dispatchEvent(new Event('mousedown'))` 真的会调到那个本该被拒掉的回调

还有一个看不见的后果：那个残留的键让监听器表永远不为空，而各个类退出保活集合的条件正是「表空了」，所以这个对象一旦进了集合就再也出不来。

订阅是同步的，原生在里面只做登记（加 target、设委托、加通知的观察者），这些操作不会让系统当场回调，所以调换顺序不引入重入。这句话原来的依据是「事件一律延后一轮派发」，有了[同步回调](#m1b同步回调系统问js-当场答)之后那个依据不成立了，结论还成立：会当场进 JS 的只有系统来问的那几个委托方法和动画的代码块，订阅这个动作本身不触发它们。

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

## M1b：同步回调（系统问，JS 当场答）

M1a 的事件全部延后一轮派发：原生把事件排进主队列，当前这一轮结束之后才进 JS。这对「发生了什么」够用，对下面三类接口不够，它们要求在调用返回之前拿到结果：

| 类别 | 例子 | 系统要什么 |
| --- | --- | --- |
| 问「要不要」的委托方法 | `textFieldShouldBeginEditing:`、`textField:shouldChangeCharactersInRange:replacementString:`、`gestureRecognizerShouldBegin:` | 立刻返回一个布尔 |
| 问「给我数据」的委托方法 | `collectionView:numberOfItemsInSection:`、`collectionView:cellForItemAtIndexPath:` | 立刻返回一个数或者一个对象 |
| 在调用里面执行的 block | `+[UIView animateWithDuration:animations:]` 的 animations、`performWithoutAnimation:`、`performBatchUpdates:` | block 在调用返回之前执行完 |

延后一轮的话，第一类只能先答一个固定的值，第二类没有东西可返回，第三类的 block 执行时 UIKit 已经不在记录属性变化了。

不需要同步的是「已经发生了」的通知：控件事件、`did…` 开头的委托方法、生命周期通知、网络和定时器、动画结束的 completion。这些照旧延后一轮。判据是系统等不等答案，不是事件重不重要。

第一类和第三类各接了一组：输入框的五个 `should…`，`UIView` 的两个动画类方法。第二类的第一个使用者是列表的 `cellProvider`，它要带回一个对象而不是布尔，做法见[列表](collection-view.md#单元格是怎么带回去的)。

### 两种形态

**「要不要」写成可取消的事件。** 原生的委托方法里调 `NacreEmitEventSync`，它当场派发一个 `cancelable` 为 `true` 的事件，返回「监听器调了 `preventDefault()` 没有」：

```objc
- (BOOL)textFieldShouldBeginEditing:(UITextField*)textField {
  return !NacreEmitEventSync(textField, "UITextField", @"shouldbeginediting", nil);
}
```

JS 这一侧没有新的写法，就是 `addEventListener` 加 `preventDefault()`。这是 [project.md 的 `cancelable` 表](#cancelable-按派发来源定)里说的第一种情况：派发方当场拿得到返回值，可取消就有效。网页的 `will-navigate` 是另一种（系统给了一个可以晚点再调的回调，原生等延后的那一轮派发完再答）；这里是系统不给晚答的机会。

事件带的数据走和 `NacreEmitEventWithJSON` 一样的路：JSON 对象的每个键成为事件对象上的只读字段。字段要换成别的类型时，在 `ctx.eventFieldConverters` 里按事件名登记一个转换（`beforeinput` 用它把 `range` 换成 `NSRange`）。

**在调用里面执行的 block 写成「代码块」。** JS 的函数过不了桥，所以 JS 侧把函数登记成一个号（`registerBlock`），号作为普通的整数参数过桥，原生在它的 block 里按号调回来：

```objc
[UIView animateWithDuration:duration delay:delay options:options
                 animations:^{ NacreCallBlock(animations, @"[]"); }
                 completion:^(BOOL finished) {
                   NacreCallBlockLater(completion, finished ? @"[true]" : @"[false]");
                 }];
```

`NacreCallBlock` 当场执行；`NacreCallBlockLater` 延后一轮，给系统不等答案的 block 用（动画结束的 completion）。JS 侧用 `callWithBlock(fn, invoke)` 包住：登记、调原生、注销在一个函数里，号的寿命就是这一次调用。completion 那种只调一次的用 `registerBlock(fn, true)`，调过自动注销。

`animations` 是函数参数，不是 Promise，原因在它的语义：它不是「晚点通知你」，是「现在执行这一段，我在前后各记一次属性的值」。completion 才是一次性的通知，按原则 4 换成了返回的 Promise。

### 进 JS 的两种时机

同步回调当场进 JS，不经过 `postToJS`。进来的时候有两种情况：

| | 例子 | 引擎的状态 |
| --- | --- | --- |
| JS 没在执行 | 用户点了输入框，系统从 run loop 里来问 `textFieldShouldBeginEditing:` | 和延后派发的事件一样，是最外层 |
| JS 正在调原生 | JS 调 `field.becomeFirstResponder()`，UIKit 在这个调用里回头问；JS 调 `animateWithDuration`，UIKit 在里面执行 animations | 嵌套：外面那一层 JS 的调用还没返回 |

V8 允许第二种：宿主的函数回调里可以再调 JS 函数。宿主靠 `Engine::IsInJS()`（就是 `isolate->InContext()`）分辨这两种，只在最外层处理 V8 平台投递的任务。

这和 Node 的 `process.nextTick` 不是一回事。`nextTick` 是「这一轮结束之后、别的任务之前」执行，仍然是排队。同步回调不排队，它在调用栈的中间执行。微任务的时机由 V8 的 `kAuto` 策略决定：调用深度回到 0 时执行。所以嵌套进来的监听器里 `Promise.resolve().then(…)` 排的微任务，要等最外层那次 JS 调用返回才执行，不会插在 UIKit 的调用中间。这一条是 V8 的规则，**没有单独写断言**。

### 异常

两种形态的规矩不同，各自跟着它在 JS 里的样子走：

- **事件的监听器抛了**：和别的事件一样，`dispatchEvent` 接住，同一事件的其他监听器照常执行，异常照未捕获的异常报（`application` 的 `error` 事件，见[下面](#监听器的两处语义对齐-chrome)）。抛异常不算 `preventDefault()`，系统按默认的做。实测监听器抛了之后输入框照常拿到焦点。
- **代码块抛了**：原样抛给调用方，和 `[].forEach` 的回调里抛异常是一个效果。异常不能直接穿过 UIKit 的 block，所以 `callWithBlock` 在登记的那层函数里接住，等原生返回之后再抛。UIKit 那一侧看到的是 block 正常返回，动画照常建立。

### 重入：过了一遍依赖「不会重入」的地方

延后一轮的那条规矩原来保证了一件事：JS 调原生期间，原生不会回头进 JS。嵌套的同步回调让这个保证不再成立。逐处看了依赖它的地方：

| 地方 | 结论 |
| --- | --- |
| 引擎里调宿主的四十来处 | 都是先把参数取成局部变量再调，调用前后没有拿着 `handle_to_ptr` 一类容器的迭代器 |
| `EmitObjectEventWithJSON` / `CallBlock` | 各自带 `TryCatch`，嵌套那一层的异常不会留给外层的 `Rejected()` |
| `FireDueTimers` 的 `firing_timer_id` | 嵌套进来的是事件和代码块，不是定时器；监听器里调 `clearTimeout` 和定时器回调里调是同一条路 |
| 内置脚本里模块级的开关（`allowConstruct` 一类） | 只在装载期间或者纯 JS 的构造里翻转，中间不调原生 |
| `addEventListener` 的「先订阅，成了再登记」 | 订阅里原生只做登记，不触发系统的回调，见[上面那一节](#先订阅成了再登记) |
| 所有权镜像 | 记边在原生调用返回之后。嵌套的监听器看到的是外层调用记边之前的镜像；这一步接的两组里，外层调用（`becomeFirstResponder`、`animateWithDuration`）都不记边 |
| 外层调用正在用的原生对象 | 它的包装是外层 JS 帧的接收者或者参数，嵌套期间的 GC 回收不到 |

所有权镜像那一条是今后要留意的：给一个会记边的方法加同步回调时，要看监听器里读到没记完的镜像有没有后果。

### 委托的槽位

`UITextField.delegate` 只有一个。五个 `should…` 事件共用一个 `NacreTextFieldDelegate`，第一次订阅其中任何一个时才建、才设（关联对象持有），和控件事件的 trampoline 一样是惰性的。没人听的时候委托是空的，系统不来问，没有过桥的开销。

委托对象实现了全部五个方法，系统每一个都会来问。它记着哪几个事件名有人听，没人听的那几个直接答 `YES`，不过桥。五个都没人听时把委托摘掉。

同一个委托对象上后来多了第六个名字 `selectionchange`（`textFieldDidChangeSelection:`）。它不是同步回调：系统不等答案，延后一轮派发。见[输入框怎么搭的](text-input.md#选区selectedrange-和-selectionchange)。

### 没做的和没验证的

- **`beforeinput` / `shouldclear` / `shouldreturn` 只有真实的键盘输入和触摸会触发**，自动跑的验收只验到它们订得上、退得掉。探针里用代码调 `insertText:` 不触发 `shouldChange` 这个委托方法。验收里留了一个「只能输入数字」的输入框给真实键盘。
- **带 `'repeat'` 的动画，completion 永远不来**，登记的那个号不会注销，一次漏一个表项。
- 动画在屏幕上的样子没有核对，验到的是：代码块当场执行、图层上多了动画、Promise 按时兑现、被打断时值是 `false`。
- 真机没跑。

## 监听器的两处语义：对齐 Chrome

（2026-11-16 改的，来源是一份外部审查，两处都先在运行时里复现过。用户定的判据是「对齐 Chrome」。）

**派发中被移除的监听器不再调用。** `dispatchEvent` 遍历的是名单的快照。原来快照里的每一条都会被调，于是第一个监听器里移除了第二个，第二个照样执行（探针量到的顺序是 `first, second`，Chrome 是 `first`）。现在每一条登记带一个「已移除」的标记，`removeEventListener` 置上，轮到时先看一眼。这也是 DOM 标准的写法。

连带的几条，验收里各有一条断言：

| 情况 | 结果 |
| --- | --- |
| 监听器里移除还没轮到的另一个 | 那一个这一轮不调 |
| 监听器里移除自己 | 这一轮照常跑完，下一轮不在 |
| 移除之后当场加回同一个函数 | 是一次新的登记，不在快照里，这一轮不调，下一轮调 |
| 派发中新加的监听器 | 这一轮不调（原来就是这样） |
| `once` 的监听器轮到之前被移除 | 不调 |
| 监听器里对同一个目标再派发一次 | 里面那一次用当时的名单，外层移除了的两层都不调 |

project.md 的事件模型里原来把「监听器列表快照的精确语义」列在「不借」那一栏，理由是那是浏览器用来防御病态代码的。这一条不是病态代码：在一个监听器里摘掉另一个是常见的写法，摘掉了还被调才是意外。

**监听器抛的异常照未捕获的异常报。** 原来 `dispatchEvent` 接住之后只打一行 `Event listener threw: …`，`application` 的 `error` 事件收不到，于是 `sceneconnect` 的回调、点击的回调里出的错进不了统一的错误处理，文档里只好教人把每个回调包一层。现在接住之后交给引擎（`native.reportError`），走和 `main.js` 顶层抛异常同一条路：派发 `error`，没人 `preventDefault()` 就打以 `Uncaught` 开头的默认日志。浏览器里监听器的异常进 `window.onerror` 是同一件事。

- 一个监听器抛了不打断其余的，这一点没变。
- `error` 在下一个监听器执行之前就派发了，是同步的。
- `error` 的监听器自己抛：引擎那边有一个「正在派发 error」的标记，不会再派发一次，直接打默认日志。验收里有一条断言盯着它只被调一次。
- 同步的可取消事件（输入框的 `should…`）里监听器抛了，仍然按「没取消」处理。

这一条在 `docs/findings.md` 里早就记过（M1），当时只改了文档没改运行时。

顺带修过一处：没被拦下的异常，默认日志里「Uncaught」原来写了两遍。

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

所以它对**系统自带的识别器**同样成立——`scrollView.gestureRecognizers` 读出来的那几个，按基类 `UIGestureRecognizer` 包装，订阅时照样能挂上我们的 target。这条未验证。（接了拖动之后，其中用来滚动的那个读出来是 `UIPanGestureRecognizer` 了，见[第二片](#a7-的第二片拖动捏合旋转轻扫屏幕边缘拖动)。）

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

## A7 的第二片：拖动、捏合、旋转、轻扫、屏幕边缘拖动

（2026-11-15，和另外四组类同时接的。写的时候验收没有跑过——模拟器由合并的那个对话统一跑；合并后跑的结果见最后的[验收跑出来的一处错](#验收跑出来的一处错探针里先设了缩放范围再读的数)。**真实触摸没有试过。** 下面写「实测」的都是不带界面的探针在 iPhone Air 模拟器（iOS 27.2）上量的：一个命令行程序，建出识别器读属性，不经过运行时。）

五个类加在手势域原来的文件里，没有新机制：构造、属性、订阅都是第一片那条路。新东西只有三样——位掩码属性、识别器自己的方法、按类多带的事件负载。

### 默认值：三条和头文件的注释或者直觉不一样

| | 实测 |
| --- | --- |
| `UIPanGestureRecognizer.maximumNumberOfTouches` | **4294967295**（`UINT_MAX`），不是 `NSUIntegerMax`。头文件的注释写的就是 `UINT_MAX`，这次它是对的 |
| `UIScreenEdgePanGestureRecognizer.delaysTouchesBegan` | **true**。基类和另外六个子类都是 false |
| `UIScreenEdgePanGestureRecognizer.maximumNumberOfTouches` | **1**，父类是 4294967295 |
| `UIScreenEdgePanGestureRecognizer.edges` | 0，也就是不设就什么都认不出 |
| 其余 | 拖动最少 1 指、`allowedScrollTypesMask` 0；捏合 `scale` 1、`velocity` 0；旋转 `rotation` 0、`velocity` 0；轻扫 1 指、方向 `right` |

第一条省掉了一个设计问题。动手前担心的是 `NSUIntegerMax` 过不了桥：2^64−1 放不进 JS 的数，`NSJSONSerialization` 写出来是 `18446744073709551615`，JS 读成 2^64，再写回去就溢出。那样就得给「不限」另找一个写法（`Infinity`，或者一个字符串令牌）。量出来是 `UINT_MAX`，一个普通的数，什么都不用发明。

### UIKit 不拦的，这里也不拦

实测这些写进去都原样读得回来，没有异常：`scale` 写 0 和 −1、`rotation` 写 −7（不按一圈折回）、轻扫的 `direction` 写 0、`edges` 写 0、拖动的最少手指数写得比最多的大（3 和 2）、手指数写 0。

所以范围检查只留了第一片就有的那一条（个数不能是负的——那是因为 `NSUInteger` 装不下负数，不是 UIKit 的规则）。空的方向数组也收下。

### 位掩码

`direction`（`UISwipeGestureRecognizerDirection`）、`edges`（`UIRectEdge`）、`allowedScrollTypesMask`（`UIScrollTypeMask`）在 JS 侧是字符串数组，用的是 `NACRE_MASK_MAP`，表写在 `NacreGesture.mm` 里。

- **没有 `all`。** `UIRectEdgeAll` 和 `UIScrollTypeMaskAll` 是几个位或起来的值，不是另一个位；读的时候它会被拆成四个名字，写的时候再认一个 `all` 就成了「写进去的和读出来的不一样」。和 `UIRectCorner` 不收 `allCorners` 是同一条。
- **读出来的顺序是位的顺序**，不是写进去的顺序（宏是按数值排的）。`['down', 'right']` 读回 `['right', 'down']`。
- **表的名字带 `Gesture` 前缀**（`GestureRectEdge`）。这个宏定义出来的函数不是 `static` 的，同时在接的别的域要是也给 `UIRectEdge` 建一张表，链接时会撞。类型那一侧的 `type UIRectEdge` 没法加前缀，两个域都声明的话合并时要去掉一个。

### 事件带什么：还是「回头读不读得到」

| 手势 | 多带的字段 | 取法 |
| --- | --- | --- |
| 拖动、屏幕边缘拖动 | `translation`、`velocity`（点） | `translationInView:` / `velocityInView:`，视图给识别器自己所在的那个，和 `location` 一致 |
| 捏合 | `scale`、`velocity` | 属性 |
| 旋转 | `rotation`、`velocity` | 属性 |
| 轻扫 | 没有 | 离散手势，只有 `location` 和 `numberOfTouches` |

判据和 `location` 一样：action 本身晚一轮，我们的事件再晚一轮，回调执行时手势可能已经往前走了，结束的那一次识别器已经重置。**重置之后这几个量还在不在没有量**（要真实触摸），所以按「读不到」处理，一律快照进负载。

两个同名不同型的字段：拖动的 `velocity` 是点，捏合和旋转的 `velocity` 是数。照的是 ObjC 的原样（`velocityInView:` 返回 `CGPoint`，`velocity` 属性是 `CGFloat`），类型定义里是三个不同的事件接口。

轻扫认出来时**不说是哪个方向**，这是 iOS 的事实：`direction` 是配置，不是结果。所以事件里没有方向，文档里的做法是一个方向建一个识别器。

### 负载到了 JS 这一侧挂不上：核心的 sink 改了 9 行

`NacreEmitEventWithJSON` 把负载送到 JS 的 `setObjectEventSink` 回调，那个回调在核心的 `17-scene.js` 里。它不是「负载里有什么就挂什么」，而是按负载的形状逐个认，手势那个分支只挂两个字段：

```js
defineField(event, 'location', …);
defineField(event, 'numberOfTouches', payload.numberOfTouches);
```

于是原生给的 `translation` / `velocity` / `scale` / `rotation` 到这里被丢掉。要挂上，得改 `17-scene.js`——它不是手势域的文件，几组类同时接的时候不许碰。这一片先是没改、把改法报了上去，用户确认之后才改：手势分支在那两个字段之后，把负载里其余的键也挂上，值是 `{ x, y }` 的转成 `CGPoint`。原生给了什么就挂什么，JS 这边不镜像「哪种手势带哪些字段」那张表。

**这 9 行没有跑过。** 手势没有程序触发的办法，自动跑的验收里没有一条断言经过这段代码，只能靠真实触摸。

这是登记机制的一个缺口，不只是手势的事，而且改了手势分支并没有补上它：`NacreExtension.h` 里那句注释说带 JSON 的事件「事件对象上多出那几个字段」，但新的域发一个 sink 不认识的形状，字段到不了 JS，而落点在核心的 part 里，「接一组类只加新文件」在这一步做不到。手势域以前没事，是因为它的分支在改成登记之前就写在 sink 里了。

动 `17-scene.js` 之前，没有在域里绕过去。想过两条路：覆写识别器的 `dispatchEvent`，从原生再取一次数据（要自己维护一个和事件一一对应的队列，对不上时是静默给错数据）；或者把数据塞进 sink 原样透传的 `numberOfTouches` 字段再拆开。两条都是给一个该改的地方打补丁，而且都要在 sink 改好之后拆掉。

### 识别器自己的方法

`translationInView:`、`velocityInView:`、`setTranslation:inView:` 是这个域第一次在识别器上（而不是视图上）走方法通道，`GestureCallMethod` 按对象是视图还是识别器分成了两个函数。

- **视图参数可以是 `null`**（窗口的坐标系），但给了别的东西要抛。核心里的 `optionalViewArg` 只看句柄：`convertPoint(p, { toView: 5 })` 那个 5 没有句柄，被当成了 nil。这里的 `optionalViewArg` 多看一眼标量那一栏，不是 null 就报 `… needs a UIView or null`。
- **没有手势在进行时 `setTranslation:inView:` 不生效**（实测：写 (12, 34) 读回 (0, 0)）。所以验收只验得到「调了不抛」。
- **三个都标了 `nacre:ownership-exempt`**：视图只是拿来换算坐标的。

回调里调 `setTranslation()` 把位移清零、再读后面事件带的 `translation`，这种原生里常见的写法在这里有一个没验证的风险：后面那个事件的快照可能是在清零之前拍的。文档推荐的是另一种写法（`began` 记起点，位置 = 起点 + `translation`），它不依赖清零。

### `requireGestureRecognizerToFail:` 不记所有权边

它收一个对象参数，按规矩要么记边要么说明为什么不记。实测是**两边都不持有对方**：

| | 结果 |
| --- | --- |
| A 要求 B 失败，然后放掉 B | B 当场释放 |
| A 要求 B 失败，然后放掉 A | A 当场释放 |
| 自己要求自己、两个互相要求、参数给 nil | 都不抛异常 |

所以 JS 侧不记边，`.mm` 里就地标了豁免。两个识别器各自由它所在的视图持有，和原生一样。参数给的不是识别器（含 `null`）由 `gestureArg` 拒掉。自己要求自己、互相要求没有拦：UIKit 收下了，后果（多半是谁都认不出）没有量。

系统没有给撤销这个关系的方法，所以 JS 这边也没有。

### 系统自己的识别器按最近的公开父类包装

`GestureClassName` 原来只认点按和长按，其余落到基类。现在按「是哪个公开类的子类」认，子类排在父类前面（屏幕边缘拖动先于拖动）。

实测一个刚建出来的 `UIScrollView` 带着七个识别器：

| 实际的类 | 读出来是 |
| --- | --- |
| `UIScrollViewPanGestureRecognizer`（`UIPanGestureRecognizer` 的子类） | `UIPanGestureRecognizer`。**以前是 `UIGestureRecognizer`**；它的最少和最多手指数是 1 和 4294967295，和自己建的拖动一样 |
| `UIScrollViewKnobLongPressGestureRecognizer` × 2（`UILongPressGestureRecognizer` 的子类） | `UILongPressGestureRecognizer`，和以前一样 |
| `UIScrollViewDelayedTouchesBeganGestureRecognizer`、`UIHoverGestureRecognizer`、`_UIDragAutoScrollGestureRecognizer`、`_UIPressGestureRecognizer` | `UIGestureRecognizer` |

设了缩放范围之后多一个 `UIScrollViewPinchGestureRecognizer`，读出来是 `UIPinchGestureRecognizer`；同时拖动那个的最多手指数从 4294967295 变成 **2**。缩放范围改回 1 到 1，它又变回 4294967295。只设 `minimumZoomScale` 或者只设 `maximumZoomScale` 都会触发。缩放范围现在从 JS 设不了，所以 JS 里读到的总是 4294967295。

这是这一片里唯一改到已有行为的地方（另一处是基类构造函数的报错文案，从点名两个子类改成列出七个）。

### 委托那一组没做

`UIGestureRecognizerDelegate` 的方法都是系统在手势进行中当场问、要立刻拿到答案的（两个识别器能不能同时认、这个手势要不要开始、这次触摸收不收），是同步回调，卡在 M1b。后果里最常被问到的一条：**同一个视图上的捏合和旋转不能同时认**，边缩放边旋转做不了。

### 没验证的

- 验收是合并的那个对话跑的（见下一节），这里没有亲自跑过。
- 五种手势的事件，以及事件带的每一个字段，都没有真实触摸过。sink 里新加的那 9 行因此也没有执行过。
- 手势结束之后 `translationInView:`、`scale`、`rotation` 还读不读得到。
- 拖动识别器放在滚动视图里时，和滚动视图自己的拖动谁生效。
- `allowedScrollTypesMask` 在 iPhone 上有没有效果。
- 只编了 Debug 的模拟器切片；Release 和真机没有编。

### 验收跑出来的一处错：探针里先设了缩放范围再读的数

五组合并之后的完整验收（iPhone Air 模拟器，Debug 和 Release 结果相同，合并的那个对话跑的）里，这一片的七十来条断言只有一条不过：

```
系统的拖动识别器上读得到拖动的属性 = 1,4294967295（期望 1,2）
```

错的是用例的期望。「滚动视图自带的拖动识别器最多 2 根手指」是从探针里读来的，而那个探针是**先给滚动视图设了缩放范围、再读的手指数**（设缩放范围本来是为了看会不会多出一个捏合识别器）。验收里的滚动视图没有缩放范围。重新量了一遍，把两种情况分开：

| 滚动视图 | 拖动识别器的最少 / 最多手指数 |
| --- | --- |
| `alloc init`，或者 `initWithFrame:`，没设缩放范围 | 1 / 4294967295 |
| 设了 `minimumZoomScale` 或 `maximumZoomScale` | 1 / 2 |
| 缩放范围改回 1 到 1 | 1 / 4294967295 |

所以不是「探针和 App 两种环境不一样」，是探针读数的顺序不对。断言改成不依赖具体的上限（读出来是整数、上限不小于下限），实际的数另打一行日志。

顺带核对了 4294967295 是不是桥上截断出来的：不是。探针里直接比，`maximumNumberOfTouches == UINT_MAX` 成立、`== NSUIntegerMax` 不成立，普通的拖动识别器和滚动视图那个都一样。原生那一侧读它用的是 `@(pan.maximumNumberOfTouches)`，装的是 64 位的 `NSUInteger`，`NSJSONSerialization` 写出来是 `4294967295`，中间没有任何一步转成 32 位。

这一条留下的做法：**探针里每读一个数之前，对象只做过和验收里一样的事。** 一个探针顺手验两件事的时候，后面的读数已经带着前面的改动了。

## 事件名：按用户做了什么来命名

（2026-11-17 定。起因是客户反馈：同一件事在三个输入控件上名字不一样。）

事件名是给写 App 的人看的语义。四条规则：

1. **名字说的是用户做了什么、或者发生了什么**，不照系统回调的说法起。不带 will、did、Triggered、Clicked。
2. **Web 上有含义相同的事件，就用它的名字**，并且在所有有这件事的类上用同一个。
3. **长得像但含义不同的 Web 词不借**，另取一个。
4. 全小写。网页那一组（`will-navigate`、`did-finish-load` 等）照的是 Electron，不动。

改名时旧名字不保留，也不做「两个名字都认」的别名。

### 对照表

**输入**（单行输入框、多行输入框、搜索框用同一套）

| 原来 | 现在 | 说明 |
| --- | --- | --- |
| `editingDidBegin` / `editingbegin` | `focus` | 和 Web 含义相同 |
| `editingDidEnd` / `editingend` | `blur` | 同上 |
| `editingChanged` / `textchange` | `input` | 同上：用户改了内容才发，代码写 `text` 不发 |
| `shouldchange` | `beforeinput` | 同上：内容要变之前，可以拦住 |
| `shouldbeginediting` / `shouldendediting` / `shouldclear` / `shouldreturn` | `beforefocus` / `beforeblur` / `beforeclear` / `beforereturn` | 和 `beforeinput` 成一套：发生之前、可以拦住 |
| `editingDidEndOnExit` | `return` | 用户按了回车。和 `beforereturn` 成一对：`beforereturn` 在回车生效之前、可以拦住，`return` 是事后的通知。Web 上没有对应的事件（那边是 `keydown` 里判断按键）。2026-11-18 改的，比上面几行晚一天 |

**控件**

| 原来 | 现在 | 说明 |
| --- | --- | --- |
| `primaryActionTriggered` | `click` | 含义相同：点了、按键触发的、辅助功能触发的都算 |
| `valueChanged` | `change` | 开关、分段选择、日期选择上含义相同。滑块默认拖动中一直发（`isContinuous`），这一点和 Web 的 `change` 不同 |
| `menuActionTriggered` | `menuaction` | Web 上没有对应的 |
| `touchDown`、`touchUpInside` 等九个 | `touchdown`、`touchupinside` 等 | 只改成小写。不叫 `click`：`click` 还包括键盘和辅助功能触发，`touchupinside` 只是手指在控件里面抬起 |

**页面、列表、搜索框**

| 原来 | 现在 | 说明 |
| --- | --- | --- |
| `willdismiss` / `diddismiss` / `dismissattempted` | `beforedismiss` / `dismiss` / `dismissattempt` | 用户把页面拖走 |
| `viewwillappear` / `viewdidappear` / `viewwilldisappear` / `viewdiddisappear` | `beforeappear` / `appear` / `beforedisappear` / `disappear` | |
| 导航的 `willshow` / `didshow` | `beforeshow` / `show` | |
| 列表的 `didselect` / `diddeselect` | `itemselect` / `itemdeselect` | 不叫 `select`：Web 的 `select` 是选中了一段文字 |
| 标签栏的 `didselect` | `tabselect` | 同上 |
| 列表的 `willdisplay` / `didenddisplaying` | `beforedisplay` / `displayend` | |
| `searchbuttonclicked` / `cancelbuttonclicked` | `search` / `cancel` | |
| `bookmarkbuttonclicked` / `resultslistbuttonclicked` | `bookmarkclick` / `resultslistclick` | |

**能力包和应用**

| 原来 | 现在 | 说明 |
| --- | --- | --- |
| 选图、拍照的 `didfinishpicking`、`didfinishpickingmedia` | `pick` | |
| 各选择器的 `didcancel` | `cancel` | |
| 通讯录的 `didselectcontact` / `didselectcontacts` / `didselectcontactproperty` | `contactselect` / `contactsselect` / `contactpropertyselect` | |
| 通知的 `didreceivenotificationresponse` | `notificationclick` | Web 上有同名同义的事件 |
| 通知的 `willpresentnotification` | `notification` | |
| `willterminate` | `beforeterminate` | |

**没动的**：已经是这种写法的（`scroll`、`dragbegin` / `dragend`、`traitchange`、`sceneconnect`、`openurl`、`locationupdate`、`screenshot`、`tick`、存储和剪贴板的 `change`）；手势的 `began` / `changed` / `ended` / `cancelled`（它们是识别器的状态，不是某一种用户操作）；窗口的 `becomekey` 等四个；应用的 `active` / `inactive` / `foreground` / `background`。

滚动视图的 `dragbegin` / `dragend` 没有改成 `dragstart` / `dragend`：Web 的那一对是拖放，含义不同。

回车那个事件（原生的 `UIControlEventEditingDidEndOnExit`）在 2026-11-17 那一轮里没有改，当时候选就是 `return`，没拿准。客户随后指出它是控件事件里唯一一个还带驼峰的名字，第二天改了。没叫 `submit`：Web 的 `submit` 是表单提交，而这里按回车之后做什么（提交、跳到下一个输入框、只收键盘）完全由监听器决定。也没叫 `enter`：键盘上那个键印的字是 `returnKeyType` 定的，属性和事件用同一个词。

### 原来为什么不一样

单行输入框是控件，事件名照的是 16 个控件事件的规矩（常量去掉前缀、首字母小写）；多行输入框和搜索框不是控件，事件是后来接的，名字另起了一套；别的类大多照委托方法的名字全小写（`tabBarController:didSelectViewController:` 写成 `didselect`）。各个类是分批接的，没有东西横向比对。

实现上只是改了名字表，机制没动。单行输入框的 `focus` / `input` / `blur` / `return` 仍然是控件事件（`NacreEnumsControl.mm` 里那张表的键换了），所以 `sendActionsForControlEvents()` 收的也是新名字。事件对象的类型名跟着改了一个：`UITextFieldBeforeInputEvent`。

## 不认识的事件名不拒绝

（2026-11-17 定，同一天。）

在原生对象上监听一个它不认识的事件名，不抛错，当自定义事件：监听器照常登记，只是不向原生订阅；自己用 `dispatchEvent()` 派发这个名字，监听器收得到。这和浏览器里的 `EventTarget` 一样。

在这之前是注册时抛 `TypeError` 并列出可用的名字。那是把「写不进去又不报错是最难查的错」这条原则用过了头：把事件名当成了枚举。事件名和枚举不一样的地方：

- **Web 的事件名本来就是开放的。** 拒绝之后，在原生对象上用自定义事件这件在 Web 里完全合法的事就做不了。这一条在项目说明里挂了很久的待办。
- **向前兼容。** 新版本加了一个事件，写了它的代码拿到旧版本的运行时上，本该是那个事件不触发、别的照常，结果变成注册时抛错，整段初始化中断。出过一次：一个事件名被拒，连带 `sceneconnect` 的回调中断，屏幕是黑的。
- **库。** 一个库想在按钮上派发自己的事件，或者给一批对象注册同一组监听器，都会被拒。

代价是事件名拼错时没有任何提示，监听器只是永远不被调用。类型定义里已知的事件名还在，写错的名字 `tsc` 会报（要用自定义名字时转一次型）。

实现：订阅的处理函数直接回答三种结果之一（`NacreSubscribed`）：这个对象不归我管、处理了、对象归我管但这个事件名不认识。回答第三种时原生什么都不做，JS 那边只登记监听器。真的出错（系统抛的异常、对象已经没有了）填报错，照常抛。

这一处改过两次。最初「不认识」是填一句报错（`addEventListener has no value …`）再返回已处理，入口匹配这句话的前缀把它清掉。外部审查（2026-11-17）指出，给人看的文字参与了流程，改措辞会改行为。先换成了「报错时置一个标记」，当天就出了事：弹窗那个域的报错是自己拼的，没置标记，在弹窗上监听不认识的名字又变回了抛错，验收里 6 条失败。它原来能工作，只是因为那句话碰巧以同样的前缀开头。所以最后改成了让「不认识」是一个返回值，不再借报错来表达；核心和能力包里说「不认识」的地方一共二十处。

内置脚本里自己校验事件名的三处（原生模块、cookie、通讯录选择器）一起去掉了。

还会抛的：

- **`@` 开头的名字**：运行时内部保留的。
- **`sendActionsForControlEvents()` 的参数**：它是让原生触发一个控件事件，名字不认识就没有东西可触发。这是枚举参数，不是监听器的事件名。

枚举参数写错照旧抛。枚举属性写错在同一天稍后也放宽了（警告，值保持不变），见[枚举](enums.md#属性位不抛2026-11-17)。

---

（下面这一段是 2026-11-17 从 `project.md` 搬过来的：那份文件不再放实现原理。）

## 事件模型：借什么、不借什么

`EventTarget` 和 `Event` **不是 ECMAScript 的一部分**（实测 `globalThis` 的 65 个内置里没有），要由运行时自己实现并注入全局——这是继 `console` 之后第二个注入的非标准全局。Node 22、Deno、Bun 都提供全局 `EventTarget`，所以它是跨运行时的通用基础设施——引入它不等于实现了 DOM。

判据见第 2 节原则 9：**从 iOS 的能力出发，问「这个能力怎么表达最自然」；W3C 的方案是重要的答案来源，但只是来源之一。** 下面是把这条原则落到事件模型上的结果。

| 借 | 不借 |
| --- | --- |
| `addEventListener` / `removeEventListener` / `dispatchEvent` 三个名字和基本语义 | `passive`（为浏览器滚动性能设计，我们没有可阻止的默认滚动） |
| `EventTarget` 作基类，统一 `application`、scene、将来的 view 的接口 | ~~`signal` / `AbortSignal`~~ ← **后来借了**：做网络请求时两个前提都变了，定时器有了，而 `NSURLSessionTask.cancel` 是实打实的能力 |
| `Event` 带 `type` 和 `target` | `composed` / `composedPath()`（shadow DOM 概念） |
| `once` 选项 | 捕获阶段（iOS 没有这个阶段） |
| 事件名全小写的惯例 | 重入保护（浏览器用来防御病态代码）。~~监听器列表快照的精确语义~~ ← **后来借了**（2026-11-16）：派发中被移除的监听器不再调用，监听器的异常进 `error` 事件，都对齐 Chrome，见[实现原理](events.md#监听器的两处语义对齐-chrome) |

**事件名的规矩（2026-11-17 定）：按用户做了什么来命名。** 事件名是给写 App 的人看的语义。四条：名字说的是用户做了什么或者发生了什么，不照系统回调的说法起（不带 will、did、Triggered、Clicked）；Web 上有含义相同的事件，就用它的名字，各个类统一；长得像但含义不同的 Web 词不借；全小写。改名时旧名字不保留。网页那一组照 Electron 的名字，不动。完整的对照表见[实现原理](events.md#事件名按用户做了什么来命名)。

**不认识的事件名不拒绝（同一天定）。** 在原生对象上监听一个它不认识的名字，不抛错，当自定义事件，和浏览器里的 `EventTarget` 一样。在这之前是注册时抛 `TypeError`，那是把事件名当成了枚举。`@` 开头的保留名字照旧拒绝。理由和实现见[实现原理](events.md#不认识的事件名不拒绝)。

**枚举要不要也放宽**：2026-11-17 定了并实现了，属性位写错是警告加保持原值，参数位继续抛，见[枚举](enums.md#属性位不抛2026-11-17)。

### `cancelable` 按派发来源定

实测标准 `EventTarget`：`preventDefault()` 本身**不自动阻止任何事**，它只是置一个标志位，让 `dispatchEvent()` 返回 `false`；**默认动作由派发方自己实现**，派发方看返回值决定做不做。整个机制依赖 `dispatchEvent` 是**同步**的。

所以有效性不取决于是不是 DOM 元素，而取决于派发方能否同步拿到答案：

| 事件来源 | `cancelable` | 原因 |
| --- | --- | --- |
| JS 执行期间 Nacre 自己派发 | 可以 `true` | 同步，派发方立刻拿到返回值，和 Web 一样 |
| 原生通知派发 | **必须 `false`** | 运行时刻意延后一轮执行，避免在 UIKit 操作中途重入 JS，所以派发方早已返回；这类通知本来也没有可取消的默认行为 |
| 原生能推迟默认动作的场合 | 可以 `true` | 原生先不做、派发事件、等 JS 回调回主线程再查 `defaultPrevented`。UIKit 多数 delegate 是同步返回 BOOL，推不了，那些走下一行的同步回调。**第一处是网页的 `will-navigate`**：系统问放不放行时给的是一个可以晚点再调的回调，见[实现原理](web-view.md#will-navigate第一个能取消的原生事件) |
| 系统当场来问、不给晚答的机会（委托方法要立刻返回布尔） | 可以 `true` | **同步回调**（M1b）：原生不排队，当场派发，监听器执行完才把答案交回系统。输入框的五个 `should…` 事件是第一处，见[实现原理](events.md#m1b同步回调系统问js-当场答) |
| 系统这一刻正在做一件 JS 要跟着做的事 | **`false`** | **当场的通知**（2026-11-19）：系统不等答案，但只有这一刻改才赶得上。第一处是屏幕上的键盘三个事件，见下面[键盘的事件为什么当场派发](#键盘的事件为什么当场派发) |

### 传播：先只做 target 阶段

`addEventListener` 注册在具体对象上，事件只派发到那一个对象，不传播。不是因为规范允许省略，而是因为 `UIControl` 的 target-action 本来就是这个语义，覆盖了按钮、开关、输入框等绝大多数需求。将来加冒泡是**扩展**，不是破坏性修改。

**view 层是否继承 `EventTarget` 待定。** 调研结论先记下，免得重查：

- iOS 有四套并存的机制：hit-testing（自上而下找目标）、responder chain（自下而上传未处理的事件）、`UIGestureRecognizer`（平行、抢占）、`UIControl` 的 target-action（直接注册，不走链）
- **hit-testing 不是捕获阶段**：`hitTest:withEvent:` 递归调 `pointInside:` 只为找出 target，全程不派发事件、不触发回调
- **responder chain 的默认语义和冒泡相反**：它是「你不处理我才给下一个」，不调 `super` 链条就断；Web 是默认continue、显式 `stopPropagation()` 才停
- **responder chain ≠ 视图树**：会经过 `UIViewController`（它不在视图树里），且 `nextResponder` 可被覆写
- **手势抢占在 Web 里没有参照**：`cancelsTouchesInView` 默认 YES（手势识别成功会给 view 发 `touchesCancelled:`）、`delaysTouchesEnded` 默认 YES（`touchesEnded` 延迟到手势失败后才发）。这是把 Web 事件模型套到 iOS 上最大的阻抗失配
- `UIControl` 的 19 种 `UIControlEvents`（`TouchUpInside`、`ValueChanged`、`EditingChanged`、`PrimaryActionTriggered` 等）最接近 `addEventListener`，第 3 步可直接映射

### 第 4 步：按事件机制的层分，一步一层

iOS 的触摸不是一套机制，是**四套并行**的（hit-testing、responder chain、手势识别器、`UIControl` 的 target-action），实测细节见[事件模型](events.md)。所以第 4 步按「碰哪一层」切开，一步只碰一层：

| | 碰哪一层 | 依赖 |
| --- | --- | --- |
| **4a** | 只碰 `UIControl` 的 target-action | M1a |
| 4b | 不碰事件，纯属性 | — |
| 4c | first responder | 和第 9 步输入框一起 |
| 第 10 步 | 手势识别器 | 抢占语义没有 Web 参照，要单独设计 |
| — | `touchesBegan` 这一层裸暴露 | M2（要能覆写原生方法） |

**为什么 4a 能先做**：target-action 是四套里唯一**不走 responder chain、不受手势抢占影响**的——它是直接注册的。所以做它不需要先想清楚传播和抢占。

**4a 只需要 M1 的一半。** 控件事件是「原生发生了什么，告诉 JS」，延后一轮没问题；同步回调（`cellForRowAtIndexPath:` 必须立刻返回一个 cell）要到第 8 步才绕不过去。所以 M1 拆成 M1a / M1b。

已定的几条（未回答的按推荐方案）：

| | 定法 |
| --- | --- |
| 订阅 | **惰性**：某类型第一次有监听器时通知原生，最后一个移走时取消。`EventTarget` 加钩子，这个钩子将来所有原生事件源都要用 |
| 原生侧怎么接 | **自己持有的 trampoline 对象，持有 handle 不持有 JS 函数**。派发时拿 handle 查包装再 `dispatchEvent` —— 生命周期就只剩「包装活不活」，而那个所有权镜像已经解决了 |
| 事件名 | ~~按已定规则去前缀首字母小写：`'touchUpInside'`、`'valueChanged'`、`'editingChanged'`。不加 `'click'` 别名~~ ← **2026-11-17 改了**：事件名按用户做了什么来命名，全小写。`touchUpInside` 现在是 `touchupinside`，`valueChanged` 是 `change`，`primaryActionTriggered` 是 `click`，`editingChanged` 是 `input`。`touchupinside` 仍然不叫 `click`，理由没变：`click` 含键盘和辅助功能触发，对应的是原来的 `primaryActionTriggered`。见[实现原理](events.md#事件名按用户做了什么来命名) |
| 派发时机 | **延后一轮**，和现有的原生通知一致。`cancelable` 为 `false` |
| `dispatchEvent` | **不触发原生 action**。它是 `EventTarget` 的语义，只派发给 JS 监听器；要真的触发原生用显式的 `sendActionsForControlEvents([...])` |
| 事件对象 | ~~第一版只有 `type` 和 `target`~~ —— **这条当时判断错了**：以为要等手势那一步，其实 `UIControl` 的 action 换成两参的 `fire:forEvent:` 就拿得到 `UIEvent`，不需要手势识别器。A8 已做 |

## 键盘的事件为什么当场派发

2026-11-19 定。屏幕上的 `keyboardshow`、`keyboardhide`、`keyboardchange` 对应 `UIKeyboardWillShow` / `WillHide` / `WillChangeFrame` 三个通知，是原生的通知，按原来的规矩该延后一轮派发。没这么做，因为延后一轮就做不到客户要的「底部栏跟着键盘一起动」。

**真机实测**（iPhone 14，iOS 27，临时探针，测完删了）：在通知的回调里当场读 `UIView.inheritedAnimationDuration`，得到 0.383 秒，和通知里键盘动画的时长 0.3833 一致；当场挪一个视图，它的图层自动挂上了 `position` 动画，时长 0.383 秒。同样的事延后一轮（`dispatch_async` 到主队列）再做：继承的时长是 0，图层上没有动画，视图直接跳到终点。也就是说，系统是在键盘的动画块里发这个通知的，只有当场改，改动才会带上和键盘一样的时长和曲线。

键盘的曲线是一个没有公开名字的值（7），`UIView.animateWithDuration` 的四种曲线里没有它，所以「延后派发、给出时长和曲线让 JS 自己做动画」这条路走不通：曲线对不上。

所以加了第三种派发：**当场的通知**。原生调 `NacreEmitEventNow`，和 `should…` 那一类一样当场进 JS，但事件 `cancelable` 是 `false`，原生不看返回值。`NacreSyncAsk` 多了一个 `cancelable` 参数，两种都走它。

当场派发的后果和 `should…` 那一类相同：JS 调 `endEditing()` 收起键盘时，监听器在 `endEditing()` 的调用当中执行（验收里有一条断言）；监听器里排的微任务要等最外层那次 JS 调用返回才执行，那时动画已经过去了。所以文档里写的是「改动要在监听器里当场做完」。

事件挂在 `UIScreen` 上：iOS 16.1 起这三个通知的发出对象就是键盘所在的屏幕。事件对象带 `frame`、`previousFrame`（屏幕坐标，转成 `CGRect`）和 `duration`。曲线不给：当场改的东西自动用键盘的曲线。

模拟器连着电脑键盘时软键盘不弹，只收得到收起那一组（时长 0）；关掉硬件键盘后，模拟器上「监听器里挪的视图挂上了 `position` 动画」也验过了。

## 系统当场要一个值：可写的事件字段（2026-11-20）

滚动视图松手时，系统问的不是「要不要」，而是「停在哪」（`scrollViewWillEndDragging:withVelocity:targetContentOffset:`，停点是一个 inout 参数）。原来的当场派发只能带回一个布尔值（`preventDefault()` 了没有），表达不了。

做法：当场派发一个**不可取消**的事件，事件对象上那一个字段是**可写的**数据属性，别的字段照旧只读；监听器都跑完，把这个字段的值编成 JSON 带回原生。

- 原生：`NacreEmitEventForAnswer(object, className, type, json, field)`（`NacreExtension.h`），返回那个字段的 JSON 文本，没有答案时是 nil。引擎是 `EmitObjectEventForAnswer`，调 JS 的对象事件入口时多给第六个参数（字段名）。
- JS：对象事件入口看到第六个参数，就把同名字段建成可写的，派发完返回 `event[field]`，不再返回「取消了没有」。
- **形状由原生核。** 监听器可能写进任何东西。滚动这一处只认带有限数 `x`、`y` 的对象，别的一律照系统原来的值；监听器抛了、没改，也照系统的。
- 和规矩的关系：它属于「系统当场来问」，但答案是一个值，所以不用 `preventDefault`；事件不可取消。写进了 project.md 「事件能不能取消」那一行。
- 第一处：`UIScrollView` 的 `beforedragend`，带 `velocity`（pt/ms）和可写的 `targetContentOffset`。名字照 `dragbegin` / `dragend` 一组，系统来问的用 `before…`；原来方案里叫 `beforedecelerate`，但松手时速度为 0、不会减速时系统也问，那个名字会误导。
- 验收：示例模块的 `simulateDragEnd` 照 UIKit 松手时的做法调委托，断言改成 80 的倍数、写普通对象、写了不是点的值、监听器抛了、摘掉监听器几种。真的手指没验。

## 手势识别器的委托：beforebegin 和同时识别（2026-11-20）

UIKit 用委托问识别器两件事，都是当场要答案：

| 系统问的 | 我们怎么答 |
| --- | --- |
| 要不要开始（`gestureRecognizerShouldBegin:`） | 当场派发可取消的 `beforebegin`，`preventDefault()` 就不开始。和输入框的 `before…` 一个做法 |
| 能不能和另一个同时识别（`…shouldRecognizeSimultaneouslyWithGestureRecognizer:`） | 不进 JS：查识别器上的 `recognizesSimultaneouslyWith` 这张表。系统默认「不能」，要 JS 答「能」，方向和 `preventDefault` 相反，所以用预先声明的状态，和方向、状态栏一样 |

- 委托只装在**委托是空的**识别器上，也就是 JS 自己 `new` 的那些。UIKit 自带的识别器（滚动视图内置的拖动）委托必须是它自己，换掉会抛异常，所以在那上面用这两样抛 `TypeError`。表里可以填系统的识别器：UIKit 两边的委托都会问，有一边答能就同时识别。
- 表用弱引用（`NSHashTable weakObjectsHashTable`）：识别器由各自的视图持有，这张表不该延长它们的命；JS 一侧因此也不记所有权边。
- 两样都不要了就把委托摘掉，识别器回到 UIKit 的默认行为。
- 验收：示例模块的 `simulateGestureAsk` 照 UIKit 的做法去问委托。真的触摸没验。

## 事件类：一种字段组合是一个类（2026-11-22）

之前运行时里真正的事件类只有五个（`Event`、`ErrorEvent`、`PromiseRejectionEvent`、`OpenURLEvent`、`PushEvent`）。原生发来的事件一律 `new Event(type)`，再用 `defineField` 把负载的字段挂在实例上；类型里有四十多个 `interface XxxEvent extends Event`，只存在于类型里。结果是：不能 `instanceof`、不能 `new` 一个出来测、`addEventListener` 的回调一律是 `Event`，读字段要强转。

照 Web 改：`MouseEvent` 有 `clientX`，`KeyboardEvent` 没有——一种字段组合是一个类。

| | 做法 |
| --- | --- |
| 类 | 带字段的事件都是真的类，挂在全局：`new XxxEvent(type, init)`，字段从 `init` 里取，没给的取默认值；`cancelable` 也从 `init` 来 |
| 字段 | 原型上的 getter，实例自己没有；只读的写了抛 `TypeError`（严格模式）。「系统当场要一个值」的那一个可写（`UIScrollViewDragEndEvent.targetContentOffset`） |
| 定义 | `ctx.defineEventClass(name, Parent, fields, { writable, check })`，在 core 的 `05-events.js`。每个字段是 `[类型, 默认值]`，平台和能力包的事件类都用它，登记进 `ctx.eventClasses` |
| 转换 | `init` 里的值照「API 层宽松接收、照 Web IDL 转换」那条规矩，按字段的类型转：数、整数、布尔、字符串、可空字符串、数组、结构体（给字段齐的普通对象也收）、原生类（不转，不是那个类抛）、任意值。原生发出来的事件也走同一个构造函数，所以负载里类型不对会抛，不会悄悄带进去。可写字段写的时候不转，交给读它的原生去核。枚举字段（`previousInterfaceOrientation`、`navigationType`、`level`）现在只按字符串转，不核是不是可选值之一：可选值的表在原生那边，JS 这边没有 |
| Web 标准 | `CustomEvent`、`MessageEvent`、`CloseEvent`、`ErrorEvent`、`PromiseRejectionEvent` 在 core。WebSocket 改用后三个（`error` 用 `ErrorEvent`：Web 上是裸的 `Event`，不带原因；Node 的 WebSocket 用 `ErrorEvent`，能把原因带上）；原生模块的事件是 `CustomEvent` |
| 合并 | 单行、多行输入框的 `beforeinput` 合成一个 `UITextBeforeInputEvent`（字段一样）；不借 Web 的 `InputEvent`，它的字段是 `data` 和 `inputType`，含义不一样 |
| 新增 | 导航控制器的 `beforeshow` / `show` 原来带了 `viewController` 却没有接口，补了 `UINavigationControllerEvent` |
| 不是事件的 | `ipc.handle` 处理函数的第一个参数 `{ sender }` 不是事件，保持普通对象 |

**哪个事件是哪个类只在原生那边写一份。** 原生发事件的出口（`NacreEmitEventWithJSON` / `WithObject` / `Sync` / `Now` / `ForAnswer`，运行时自己的 `emitEvent:…eventClass:`，WebSocket、网页的出口）多带一个 `eventClass`，一路传到引擎（`EmitObjectEvent…` 的 `event_class`），作为 sink 的第七个参数交给 JS。JS 在 `ctx.eventClasses` 里找到类，负载变成 `init`：

- 负载是字典：每一项是一个字段，`{ x, y }` 换成 `CGPoint`。
- 负载不是字典（原生对象、一个布尔、一段文字）：挂在这个类登记的那个字段上（`payloadField` 表，按类不按事件名：`stop`、`error`、`message` 这些名字太泛）。
- 字段要换类型的，按事件类登记一个换法（`ctx.eventFieldConverters`，原来按事件名登记，同名的事件会串）。

这样原来 sink 里按负载的形状猜（有 `tapCount` 的是控件触摸、有 `previousFrame` 和 `duration` 的是键盘、有 `wasClean` 的是 WebSocket 关闭）的几支都去掉了。

`check-api.sh` 第 12 节核对：原生里写到的每个事件类名，内置脚本里都要有。写错了运行时只打一条警告、派发一个普通的 `Event`，字段就丢了，所以在这里挡住。

**由 JS 自己建事件的那些**（原生发的是 `@` 开头的内部事件，处理函数再派发对外的事件：扫码的 `detect`、拍照、选联系人、选图、推送、被链接打开、原生模块）不走 sink，处理函数直接 `new` 那个类。

**分享面板的 `complete` 改了一处原生。** 原来原生把结果记在面板上、发一个不带数据的事件，构造时挂上的第一个监听器再去取、挂到事件上。字段成了只读 getter 之后挂不上了，改成原生直接把结果带在事件里。

**`AVCaptureSessionRuntimeErrorEvent` 的字段从 `message` / `code` 改成 `error`**（一个 `NSError`），照[报错](errors.md)的规矩。这个事件触发不了，没在真机上见过。

**会破坏现有写法的**：WebSocket 和原生模块的事件类改了名（类型上）；`{...e}`、`Object.keys(e)` 拿不到字段了（Web 上本来也是这样）。盘点过验收用例和文档，没有这样用的。

**没做的**：`Event` 基类的 `bubbles`、`timeStamp`、`isTrusted` 和冒泡；`Event` 自己的 `type`、`cancelable` 还是实例上的字段。
