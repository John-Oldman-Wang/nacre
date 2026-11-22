# 系统弹窗和分享面板

`UIAlertController`、`UIAlertAction`、`UIActivityViewController` 三个类是一个域（`alerts`），照[接入一组类](adding-classes.md)做的：原生在 `Bridge/NacreAlerts.mm`，JS 在 `Builtin/parts/50-alerts.js`，类型在 `packages/types/ios/alerts.d.ts`，验收在 `acceptance/src/steps/alerts.js`。核心的分发器、内部头、`NacreRuntime.mm` 都没动。

用法见 [`UIAlertController`](../api/ui-alert-controller.md) 和 [`UIActivityViewController`](../api/ui-activity-view-controller.md)。

两个控制器都是 `UIViewController` 的子类。呈现和关闭走核心里现成的 `presentViewController` / `dismissViewController`（见[导航](navigation.md)），这个域不碰。

## 三个 block 各去了哪

这一组在 ObjC 里有三个 block。项目的规矩是不要回调参数（[原则 4](../project.md#原则)），一次性的请求和应答用 Promise、重复发生的通知用事件（原则 5）。三个 block 的去处各不相同：

| ObjC | JS | 归到哪一类 |
| --- | --- | --- |
| `actionWithTitle:style:handler:` 的 `handler` | 按钮上的 `click` 事件 | 通知 |
| `addTextFieldWithConfigurationHandler:` 的 block | 没有了。`addTextField()` 返回那个输入框 | 出参改成返回值 |
| `completionWithItemsHandler` | 分享面板上的 `complete` 事件 | 通知 |

### 按钮被点了：事件，在按钮上

`handler` 不是某次调用的应答。它是预先登记在按钮上、等用户操作时由系统来调的：

- **可能一次都不来。** 一个弹窗有几个按钮，用户只点其中一个，其余的 handler 不会被调；用代码关掉弹窗时一个都不调。
- **可能来不止一次。** `UIAlertAction` 的 handler 是创建时给的、一直留在按钮上。实测同一个按钮可以加到两个弹窗里，也可以在同一个弹窗里加两次，系统都不拦。

这两条正是「通知」的特征。做成 Promise 的话，没被点的那些按钮各留一个永远不结算的 Promise。

事件派发在**按钮**上，不在弹窗上。ObjC 里每个按钮有自己的 handler，这是一一对上的；监听器里也不用再判断「是哪个按钮」。弹窗上没有「某个按钮被点了」的汇总事件，没有做：它是 ObjC 没有的东西，而 JS 一侧用几行就能把几个按钮的事件收成一个 Promise（API 文档里有这个例子）。

想过的另一种形状是让 `presentViewController()` 的 Promise 带回「用户点了哪个按钮」。没有采用：那个 Promise 已经有含义了（呈现动画结束），而且它是所有页面共用的方法，不归这个域改。

### 事件名：沿用 `click`

`UIButton` 的点击是 `click`，`UIBarButtonItem` 也沿用了这个名字，理由记在那边：在按钮和导航条按钮之间切换时不该要记两个名字。弹窗上的按钮是第三种「用户点了一个按钮」，所以用同一个。

它和前两个的机制不一样（那两个是 target-action，这个是 block），但名字是给写 App 的人看的，他看到的是同一件事。

### 输入框：返回值

`addTextFieldWithConfigurationHandler:` 的 block 是同步调的，系统把新建的输入框当参数传进去。实测输入框在这一句里就建好了（`textFields` 立刻多一个，视图还没加载），所以 block 传 `nil`、事后从 `textFields` 里拿，效果完全一样。

JS 这边方法名是 `addTextField()`，把那个输入框当返回值。名字去掉了 `WithConfigurationHandler`：那一截是被拿掉的参数的标签，和 `popViewControllerAnimated:` 写成 `popViewController({ animated })` 是同一个处理。

### 分享面板结束：事件，在面板上

`completionWithItemsHandler` 和按钮的 handler 是同一种东西：登记在对象上的 block，等用户操作完由系统来调。它和 `presentViewController:animated:completion:` 的 `completion` 不是一回事，后者是**那一次调用**的应答，所以那个方法返回 Promise。

这一条比按钮的更接近「一次性的应答」：头文件写着这个 block 用过一次就被系统清掉。做成事件而不是 Promise 的理由：

- JS 一侧发起请求的那次调用是 `presentViewController()`，它的 Promise 已经用来表示「呈现完了」。面板上没有一个调用能把结果当返回值带回来。
- 做成值是 Promise 的属性的话，要回答「面板一直没弹出来怎么办」「读的时候已经结束了怎么办」，而事件没有这些问题。运行时里也还没有这种属性的先例。
- 页面上同类的通知（`dismiss`）已经是事件。

事件带三个字段，名字照 block 的参数：`activityType`、`completed`、`activityError`。第四个参数 `returnedItems`（`NSExtensionItem` 的数组）没有接。

## 实测

iPhone Air 模拟器，iOS 27.2。量法是一个不带界面的命令行程序（`simctl spawn`），所以只量得到对象上的事实，量不到屏幕上的事。

| | 结果 |
| --- | --- |
| 提示框刚建好 | `actions` 空数组，`textFields` **空数组**（不是 `nil`），`preferredAction` 是 `nil`，`severity` 是 default |
| 底部菜单的 `textFields` | 非 `nil` |
| `[[UIAlertController alloc] init]` | 得到的是底部菜单样式、没有标题。所以 `new UIAlertController()` 没有开：它给不了提示框，而样式之后改不了 |
| 按钮没有标题（`nil`） | 创建时就抛 `NSInternalInconsistencyException`，三种样式都是。空串可以 |
| 按钮默认的 `enabled` | `YES` |
| `addAction:` 之后 | `alert.actions.firstObject == action`，**没有复制**（`UIAlertAction` 遵守 `NSCopying`，`-copy` 得到的是另一个对象） |
| 同一个按钮加两次 | 不拦，`actions` 里出现两个 |
| 同一个按钮加到另一个弹窗 | 不拦 |
| 第二个取消样式的按钮 | 抛 `NSInternalInconsistencyException` |
| `preferredAction` 写一个不在 `actions` 里的按钮 | 抛 `NSInternalInconsistencyException`，值不变 |
| 底部菜单上写 `preferredAction` | 不拦 |
| 加输入框 | 配置用的 block **同步**调；`textFields` 立刻多一个；视图没有被加载；类是 `_UIAlertControllerTextField`；两次读是同一个对象 |
| 底部菜单上加输入框 | 抛 `NSInternalInconsistencyException` |
| 改提示框的呈现委托（`alert.presentationController.delegate = …`） | 抛 `NSInternalInconsistencyException`：`The presentation controller of an alert controller presenting as an alert must not have its delegate modified`。**写 `nil` 也抛** |
| 改底部菜单、分享面板的呈现委托 | 没呈现时不拦。呈现控制器的类分别是 `_UIAlertControllerActionSheetRegularPresentationController` 和 `_UIActivityViewControllerPresentationController`；真的呈现在 iPhone 上时底部菜单用的是不是同一个，没量到 |
| 分享面板刚建好 | `excludedActivityTypes` 是 `nil`，`excludedActivitySectionTypes` 是 0，`allowsProminentActivity` 是 `YES`，`completionWithItemsHandler` 是 `nil` |
| `excludedActivityTypes` 写空数组 | 读回来是空数组，不是 `nil` |
| 要分享的东西给空数组 | 不拦 |

会抛异常的那三种（第二个取消按钮、不在弹窗里的首选按钮、底部菜单加输入框）在原生这边先拦掉，各给一句说得清原因的话。不拦也不会崩：桥的入口有异常保护，会转成 `TypeError`（见[参数转换](conversion.md)），但那样报的是系统的原话。

## 按钮的 handler 一直装着

`UIAlertAction` 的 handler 只能在创建时给，之后换不了，也读不到。所以工厂方法里总是装一个 handler，派不派发看一个开关：

- 开关在一个小对象上（`NacreAlertActionState`），按钮通过关联对象持有它，handler 的 block 也捕获它。它对按钮没有引用，不成环。
- JS 那一侧第一个监听器加上时把开关打开，最后一个移走时关上。
- handler 的参数就是被点的那个按钮。因为 `addAction:` 不复制，它和 JS 手里的是同一个对象，事件派发到它上面。

## `complete` 的数据为什么绕一下

原生给事件带数据的出口是 `NacreEmitEventWithJSON`。但 JS 那一侧把负载挂到事件对象上的地方是核心的事件汇入口（`17-scene.js` 里的 `setObjectEventSink`），它**只认它知道的那几种负载形状**（有 `tapCount` 的、有 `numberOfTouches` 的、有 `wasClean` 的，以及按事件名登记过的几个），别的形状会被丢掉。那个文件不归这个域改。

所以绕了一下，全在这个域自己的文件里：

1. 原生在完成回调里把结果记在面板上（关联对象），发一个**不带数据**的 `complete`。
2. JS 的构造函数里先挂一个内部的监听器。它是第一个挂的，所以排在所有别的监听器前面。
3. 这个监听器向原生要结果（`nacre:takeCompletion`，取一次就清），挂到事件对象上。后面的监听器看到的就是带着三个字段的事件。

「取一次就清」是为了不误伤：App 自己 `dispatchEvent(new Event('complete'))` 时原生那边没有结果，监听器什么都不挂。

这是一处要记下来的缺口：**登记进来的域没有办法给事件带一种新形状的数据。** 事件汇入口加一个通用的分支（负载是字典就把每个键挂上，网页的事件已经是这么做的）之后，这里的三步可以换成一句 `NacreEmitEventWithJSON`。

2026-11-22 换掉了：事件做成类之后字段是只读的 getter，监听器挂不上字段了。现在原生直接用 `NacreEmitEventWithJSON` 把结果带在事件里，事件类是 `UIActivityViewControllerCompletionEvent`，系统的错误在 JS 那边建成 `NSError`。上面三步和 `nacre:takeCompletion` 都去掉了。见[事件类](events.md#事件类一种字段组合是一个类2026-11-22)。

完成回调在构造时就装上，不等 JS 订阅：它天生是一次性的，而且内部的那个监听器从构造起就在。

## 所有权

`check-api.sh` 核对的那一条：`addAction:` 收对象，JS 一侧记了 `ownOne(this, 'actions', action)`。

| 边 | 怎么记 |
| --- | --- |
| 弹窗 → 按钮 | `addAction()` 记一条；读 `actions` 时按原生的真相整层重建 |
| 弹窗 → 首选按钮 | `preferredAction` 的读和写都记 |
| 弹窗 → 输入框 | 读 `textFields` 时整层重建；`addTextField()` 内部读了一次 |
| 呈现它的页面 → 弹窗 | 核心的 `presentViewController()` 记的。系统自己关掉弹窗时由这个域补发 `@dismissed` 来放开，见[下面](#系统自己关掉之后谁来放开呈现者那条边) |

按钮这条边是要紧的：监听器挂在按钮的包装上，而写 App 的人常常建完按钮、加进弹窗就不再拿着它。没有这条边，包装被回收，点了按钮事件到不了任何人。

## 弹窗上的订阅全部由这个域认领

这是合并后的第一轮验收撞出来的，撞法是整个 App 崩掉。

核心对每个被呈现的页面都常驻订一个内部事件 `@dismissed`（`presentViewController()` 里那一句 `native.subscribe(…, '@dismissed', true)`），用户把模态页拖走时靠它放开「呈现者持有被呈现者」那条边。这个订阅落到核心的页面那一支，会给这一页挂一个呈现委托，并在呈现时执行 `presentationController.delegate = …`。

**系统不许动提示框的呈现委托**，一动就抛（见上面实测的那一行，连写 `nil` 都抛）。于是：

- `alert.addEventListener('dismiss', …)` 抛了一个转成 `TypeError` 的系统异常。
- `presentViewController(alert)` 的 Promise 被拒（订 `@dismissed` 那一句抛的），随后呈现的 completion 里又装了一次委托，那一处没有异常保护，进程直接终止。

最初的实现把弹窗上的订阅留给了核心（「它是页面，模态那三个事件归核心」），验收里还有一条断言写的是「提示框：模态的 dismiss 订得上」。这个假设是错的，用例和实现一起改了。

改法全在这个域里。登记进来的域比核心先被问到，所以 `AlertsSetSubscription` 把 `UIAlertController` 上的订阅**全部认领**，一个都不让落到核心：

| 订的是 | 处理 |
| --- | --- |
| `@dismissed`（运行时自己订的） | 认领，什么都不做。核心因此不会给弹窗挂委托 |
| `beforedismiss` / `dismiss` / `dismissattempt` | 抛 `TypeError`，报错里指到按钮的事件 |
| 别的名字 | 同上 |
| `traitchange` | 不经过这里：核心在问各个域之前就按名字认走了，它不碰呈现委托 |

两种样式一样处理。底部菜单没呈现时量到委托可以改，但真的呈现在 iPhone 上用的是不是同一个呈现控制器没量到；而且那三个事件说的是「用户把页面拖走」，弹窗没有这种关法。分享面板没有动：它的委托可以改，那三个事件照旧归核心。

### 系统自己关掉之后，谁来放开呈现者那条边

用户点了按钮，系统自己把弹窗关掉。JS 一侧「呈现它的页面 → 弹窗」那条边要有人放开，否则关掉的弹窗（连同它的按钮、输入框、监听器）一直不被回收，直到那个页面下次呈现别的东西。核心放开这条边靠两件事：JS 调 `dismissViewController()`，或者收到 `@dismissed`。点按钮关掉弹窗两样都不是，而弹窗又挂不了委托。

所以由这个域来报：按钮的 handler 被调时，替它所在的弹窗发一次 `@dismissed`（`NotifyDismissedBySystem`）。JS 那一侧现成的处理会去读原生的 `presentedViewController`，按真相放开那条边。分享面板在用户选了去处之后也是系统自己关的，完成回调里做同一件事。

三处细节：

- **按钮怎么找到弹窗。** 公开接口里按钮不知道自己在哪个弹窗里。`addAction:` 时把弹窗记进按钮的状态对象，弱引用（弹窗持有按钮，反过来不能持有）。同一个按钮可以加进几个弹窗，所以是一个集合。
- **先发按钮的事件，再发 `@dismissed`。** 按钮的包装靠「呈现者 → 弹窗 → 按钮」这一串持有边活着，`@dismissed` 一处理这串就断了。两次派发是主队列上相邻的两个任务，中间赶上一次 GC 的话，先断的后果是监听器跟着包装一起没了。分享面板的 `complete` 同理排在前面。
- **等关完了再发。** JS 那一侧读的是当时的 `presentedViewController`，关到一半读到的还是它。回调来的时候 `presentingViewController` 已经是 `nil` 就直接发；正在关（`isBeingDismissed`）就挂到转场的 completion 上；还好好地呈现着就不发，那说明被点的是加在别的弹窗里的同一个按钮。

`@dismissed` 是核心和页面那个 part 之间的内部约定，这个域现在也是它的一个发出方。那边改名或者改含义时，这里要跟着改；不跟着改不会报错，只是那条边又没人放了。

这一段**没有验证过**：handler 被调时弹窗是不是已经关完、那条边是不是真的放开了，都要真的点一下。验收里那三个留给人点的按钮，点完会逼一次 GC，终端里打出弹窗的包装有没有被回收。

## 枚举

四个普通的枚举照[已定的规矩](enums.md)：`UIAlertActionStyle`、`UIAlertControllerStyle`、`UIAlertControllerSeverity` 是单值，`UIActivitySectionTypes` 是位掩码（现在只有一个位）。

`UIActivityType` 是规矩里没有的一种：它的值是字符串常量（`com.apple.UIKit.activity.Mail`），而且类型是**开放的**（`NS_TYPED_EXTENSIBLE_ENUM`），第三方的分享扩展有自己的标识符，不在头文件里。现在的处理取了保守的一边：

| 方向 | 处理 |
| --- | --- |
| 写（`excludedActivityTypes`） | 只收头文件里那二十个常量的名字。别的名字不抛，打一条警告把名字列出来，整次赋值不生效。和别的枚举属性一样 |
| 读（`excludedActivityTypes`、`complete` 的 `activityType`） | 表里有的给名字；表里没有的**原样给标识符**。用户选了第三方扩展是真实会发生的事，不能丢 |

代价是排除不了第三方扩展（原生可以往 `excludedActivityTypes` 里写任意标识符）。要放开得先定「开放的枚举怎么写」这条规矩，比如带点的字符串当成标识符原样过。没有自己定。

`check-api.sh` 不核对这个域的枚举：它的枚举对照表是写死在脚本里的一张名单，新域的枚举不在里面，而脚本不归这个域改。五张表和 `.d.ts` 是人工对的。

## 没做的

| | 为什么 |
| --- | --- |
| 自定义的分享动作（`UIActivity` 的子类、`applicationActivities`） | 要子类化原生类（M2）。给了这个选项会抛，不静默忽略 |
| `initWithActivityItemsConfiguration:`、`UIActivityItemSource`、`NSItemProvider` | 要实现协议或者传任意数据，同上 |
| 完成回调的 `returnedItems` | `NSExtensionItem` 还没有暴露 |
| 分享文件 | 要的是文件地址的 `NSURL`。现在的 `URL` 过桥之后是按网址解析的，没有量过文件地址行不行 |
| iPad 上的 `popoverPresentationController` | 项目只支持 iPhone |
| `UIAlertController` 的 `SpringLoading` 分类 | iPad 的拖放用的 |
| `completionHandler`（旧的两参版本） | 头文件里已经废弃 |

## 没验证的

验收由合并的那个对话统一跑（模拟器只有一台）。合并后的第一轮（iPhone Air，iOS 27.2）：不用呈现的那一段全部通过，包括工厂、属性的读写、枚举和参数的报错、`addAction` 的校验、输入框、分享面板的构造和校验；到「在提示框上订 `dismiss`」那一句中断，呈现那一段在提示框那一步崩了（见[上面](#弹窗上的订阅全部由这个域认领)）。**修了之后的这一版没有跑过**，自己跑过的只有 `check-api.sh`、类型检查、原生编译（Debug，模拟器），以及实测表里用命令行程序量的事实。底部菜单和分享面板的呈现一次都还没跑到过。

验收自己也验不到的（没有人去点）：

- 点按钮之后事件有没有派发、派发时弹窗是不是已经关了。验收里留了三个按钮给人点，终端里会打出结果。
- 分享面板真的分享一次之后 `complete` 带的数据。用代码关掉面板之后系统调不调完成回调没有依据，验收里是「等得到就验字段，等不到就报未验证」。
- 屏幕上的样子：三种按钮样式、首选按钮加粗、`severity`。
- 分享面板在真的 App 里读出来的 `modalPresentationStyle`。提示框和底部菜单的在验收里打出来过，和命令行程序量到的一样：custom 和 popover。
- 真机。

通道上的一条：`writeObject` 是[接入点重构](adding-classes.md#没验证的)里「接了线但没有域在用」的七条之一，`preferredAction` 的写入是它的第一个用户。
