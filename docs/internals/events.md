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

## 两种事件源

现在运行时里有两种，不要混：

| | 怎么注册 | 例子 |
| --- | --- | --- |
| **全局观察者** | 启动时向 `NSNotificationCenter` 注册一次，收到后按对象派发 | `UIWindow` 的 `becomekey` 四个、场景和生命周期事件 |
| **按对象订阅** | 某个对象第一次有监听器时才向原生注册 | 4a 的控件事件 |

第一种适合「通知本来就是全局广播」的；第二种适合「每个对象各自注册」的。控件事件必须走第二种——`touchDragInside` 在手指移动时每帧都发，没人听还过桥是白费。

---

← 返回[实现原理](README.md) ・ [项目说明](../project.md)
