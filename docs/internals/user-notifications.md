# 通知怎么搭的

通知是一个能力包（`@nacrejs/user-notifications`），源码在 `ios/Capabilities/UserNotifications/`：原生一个 `.mm`，JS 一个 part。能力包这个形状本身见[能力包](capabilities.md)，这一页只记通知自己的取舍。

怎么用见 [API 文档](../api/un-user-notification-center.md)。

**这一页里的结论哪些量过、哪些没有，先说在前面。** 做这个包的对话不跑模拟器（只有一台，由合并的对话统一跑），所以：

| 来源 | 有哪些 |
| --- | --- |
| Mac 上的探针（macOS 27，同一个框架，不是 iOS） | 见下面「[在 Mac 上量到的](#在-mac-上量到的)」：系统对象的行为，以及把这个包的原生代码原样编成 Mac 程序、逐条通道执行的结果 |
| 头文件和 Apple 的文档 | 委托必须在启动完成之前装、启动完成的通知在那之后才发、完成的 block 可能在后台线程、撤销是系统另起线程做的、申请授权只弹一次 |
| 用假的桥在 Node 里跑 | JS 那一半和验收用例：三种授权状态各一遍，229 / 251 / 230 条断言全过 |
| 只编译没运行 | iOS 的产物（模拟器的切片，Debug 和 Release）。**验收用例还没有在 App 里跑过，一条都没有** |

## 它为什么是一个包

[项目说明 3.8 节](../project.md#38-核心和能力包)的判据是「用户要不要因此在自己的工程里写点什么」。本地通知不要权限文案，也不要 entitlement，按这一条它可以留在核心。

做成包是因为另一件事：**它一被加载就把自己装成通知中心的委托**（原因见[委托在加载时就装](#委托在加载时就装)）。这是一个进程级的、别的 SDK 也会来抢的槽位。不发通知的 App 不该因为用了 Nacre 就占着它。这个理由不在 3.8 节的判据里，是这个包第一次遇到的，记在这里等 review。

清单的 `requires` 是空的。远程推送要的 `aps-environment` 不归这个包，归以后的 `@nacrejs/push`。

## 属于哪一层

底层：按 ObjC 的类名暴露 `UNUserNotificationCenter` 和它周围的类，成员照已有的规矩映射。没有另外设计上层的对象。

| ObjC | JS | 依据 |
| --- | --- | --- |
| `+currentNotificationCenter` | `currentNotificationCenter()`，带括号 | 头文件里是类方法，不是类属性。先例是 `ASIdentifierManager.sharedManager()` |
| `requestAuthorizationWithOptions:completionHandler:` | `requestAuthorizationWithOptions(options)`，`Promise<boolean>` | 第一段做名字；回调换成 Promise |
| `getNotificationSettingsWithCompletionHandler:` 等三个 `get…` | 去掉 `WithCompletionHandler` | 那一段说的是回调，而回调换成了 Promise。先例是 `requestTrackingAuthorization()` |
| `addNotificationRequest:withCompletionHandler:`、`setBadgeCount:withCompletionHandler:` | `addNotificationRequest(request)`、`setBadgeCount(count)`，`Promise<void>` | 同上 |
| `triggerWithTimeInterval:repeats:` | `triggerWithTimeInterval(seconds, { repeats })` | 第一段加 options |
| `requestWithIdentifier:content:trigger:` | `requestWithIdentifier(id, { content, trigger })` | 同上 |
| `@property(class) defaultSound` | `UNNotificationSound.defaultSound`，取值器 | 类属性做成静态取值器 |
| `UNAuthorizationOptions`、`UNNotificationPresentationOptions` | 字符串数组 | 位掩码的规矩 |
| 委托的两个方法 | 两个事件 | 重复发生的通知用事件 |
| 委托里「前台时怎么显示」的那个回答 | `foregroundPresentationOptions` 属性 | 见[前台显示是预先设的](#前台显示是预先设的) |

`repeats` 可以不带，不带是 `false`。ObjC 里它是必填的，这里照 `setOn(value, { animated })` 的先例放宽：不带的含义没有歧义。

## 哪些是包装，哪些是值

只有 `UNUserNotificationCenter` 是原生对象的包装。其余的都是 JS 这一侧的值，过桥的是 JSON：

| 类 | 是什么 | 为什么不包装 |
| --- | --- | --- |
| `UNNotificationSettings` | 值 | 头文件里全是 `readonly`，它是一份快照 |
| `UNNotification`、`UNNotificationResponse` | 值 | 不可变；它们从事件里来，而事件延后一轮才派发，内容在交出来的那一刻就定了 |
| `UNNotificationRequest` | 值 | 不可变。而且系统不保身份：`getPendingNotificationRequests` 给的不是当初交进去的那个对象 |
| `UNNotificationContent` | 值 | 不可变 |
| `UNMutableNotificationContent` | 值，字段可写 | 唯一可变的一个。但它一交给 `requestWithIdentifier:` 就被复制（属性标的是 `copy`；Mac 上量过：建好请求再改内容，请求里的不变，请求里的内容也不是原来那个对象） |
| 三种触发器 | 值 | 不可变 |
| `UNNotificationSound` | 值 | 不可变。系统的 `defaultSound` 每次读还是一个新对象（Mac 上量的：指针不同，`isEqual:` 是 YES） |

理由和定位包的 `CLLocation` 是同一套（见[定位](core-location.md#位置是值不是原生对象的包装)）：包装机制要解决的事是「同一个原生对象在 JS 里是同一个包装、谁拿着谁」，这些在不可变的、系统自己都不保身份的值上没有意义。做成包装的话，一个事件带一条通知就要建五个包装（回应、通知、请求、内容、触发器），读每个字段各过一次桥。

代价是身份：从系统读回来的请求和交出去的那个不 `===`。原生那边同样不是同一个对象。

连带的好处：建触发器、建请求、写内容都不过桥，写错的报错全在 JS 里同步抛，报在写的那一行。整条通知只在 `addNotificationRequest()` 时过一次桥。

### 值怎么建、怎么认

- 值的类用 `define(globalThis, …)` 挂到全局，不是 `defineNativeClass`：它们没有原生对象。
- 只能由系统给的类（设置、通知、回应、只读的内容、推送的触发器），构造函数认一个只有这个 part 拿得到的记号，外面 `new` 得到 `Illegal constructor`。
- 认一个值是不是真的，用一个 `WeakSet`，不用 `instanceof`：`Object.create(UNNotificationRequest.prototype)` 骗得过 `instanceof`，它的字段全是 `undefined`，交给原生会在很远的地方出错。
- `UNMutableNotificationContent` 不能继承，和原生类一样报 `Illegal constructor`：子类加的东西过不了桥，从请求里读回来的也只是普通的内容。

### 内容的字段

| 字段 | 定法 |
| --- | --- |
| 四个字符串 | 不可空，`null` 给空串。新建的内容在系统那边读出来是 `nil`（Mac 上量的，头文件标的却是不可空），过桥时给空串 |
| `badge` | 整数或 `null`。系统的类型是可空的 `NSNumber`，`nil` 是不改角标。负数不收：没有意义，而且系统有一个专门的错误码（1600）说角标的数无效 |
| `sound` | `UNNotificationSound.defaultSound` 或 `null`。做成类而不是字符串 `'default'`，是给以后的 `soundNamed()` 留位置 |
| `userInfo` | 存一份深拷贝并冻结，见下 |

**读回来的声音有三种**：没有、默认的、别的（远程推送指定了声音文件）。系统没有公开声音的名字，所以「别的」读出来是一个不等于 `defaultSound` 的 `UNNotificationSound`，看得出有声音、不是默认的，读不出是哪个。带着它的内容不能再用来建请求（这边造不出那个声音），`requestWithIdentifier()` 当场抛。

**`userInfo` 不收 `null`。** Apple 的文档要求它里面是属性列表的类型，而属性列表没有「空」。Mac 上量过，赋值那一刻系统不检查（`NSNull` 和数字的键都收下了），交给系统时会怎样没有量。`UILocalNotification` 时代同样的情况是同步抛异常。没法验证，所以按保守的定：JS 里赋值时逐层检查，报错里写出是哪一个键。**这一条等实测之后可以放开**，放开是 part 里的一处判断。

反方向不限制：系统给的 `userInfo`（远程推送的负载）里可以有 `null`，原样交给 JS。过桥之前原生把它洗一遍，因为它可以来自别的原生代码：字符串、数、布尔、数组、字典原样；`NSDate` 给 ISO 8601 的字符串；`NSData` 一类写不成 JSON 的丢掉；不是字符串的键写成字符串。Mac 上执行过，结果和这里写的一样。

## 日期的分量

`NSDateComponents` 没有做成类。它在 JS 这一侧是一个普通对象，键是 `NSDateComponents` 的属性名，只带指定了的分量：

```js
UNCalendarNotificationTrigger.triggerWithDateMatchingComponents({ hour: 8, minute: 30 }, { repeats: true })
```

- **为什么不做成全局的 `NSDateComponents` 类。** 它是 Foundation 的类，该归核心。一个能力包往全局上挂 `NSDateComponents`，下一个要用它的包（日历、提醒事项）就没法再挂。类型的名字因此叫 `UNDateComponents`，带这个包的前缀，不占 `NSDateComponents`。
- **「没指定」是没有这个键，不是 `null`。** 系统那边是一个特殊的数（`NSDateComponentUndefined`）。已有的规矩是这类值给 `null`；这里十五个分量通常只用两三个，全列出来再标十二个 `null` 没法读。写的时候 `null` 和 `undefined` 都当成没写，所以读出来的对象可以原样再写回去。
- **认十五个整数的分量**：`era`、`year`、`month`、`day`、`hour`、`minute`、`second`、`nanosecond`、`weekday`、`weekdayOrdinal`、`quarter`、`weekOfMonth`、`weekOfYear`、`yearForWeekOfYear`、`dayOfYear`。`calendar` 和 `timeZone` 没做，触发器用的是用户手机上现在的日历和时区（Mac 上量过：从触发器读回来的分量，这两项是空的）。`leapMonth`、`repeatedDay` 没做。
- **不检查凑不凑得出一个时刻。** Mac 上量过：空的分量、`hour = 99` 都建得出触发器，不抛，只是 `nextTriggerDate` 是 `nil`。系统在 `addNotificationRequest` 时怎么答没有量；头文件里有一个对得上的错误码（1400，`NotificationInvalidNoDate`）。

这张名字表有三份：part 里（报错时列出来）、原生里（按名字取值）、类型里。`check-api.sh` 不盯它。

## 委托在加载时就装

通知中心的委托整个进程一个，在这个 framework 的 `+load` 里装上。别的域的委托都是惰性的；这里不行，依据：

| 来源 | 原话 |
| --- | --- |
| 头文件，`didReceiveNotificationResponse` 的注释 | The delegate must be set before the application returns from application:didFinishLaunchingWithOptions: |
| Apple 的文档，委托协议那一页 | Assigning a delegate after the system calls these methods might cause you to miss incoming notifications |
| Apple 的文档，`application(_:didFinishLaunchingWithOptions:)` | The system sends that notification shortly after this method returns（说的是 `UIApplicationDidFinishLaunchingNotification`） |

用户点一条通知把 App 启动起来时，系统把这次点击交给那一刻已经装好的委托。晚了就收不到。

一个嵌进 App 的 framework 改不了宿主的启动壳，能用的时机只有两个：

| 时机 | 在 `didFinishLaunching` 返回之前吗 |
| --- | --- |
| `+load` | 是。`main()` 还没开始 |
| 监听 `UIApplicationDidFinishLaunchingNotification` | 不是。文档说它在那个方法返回之后才发 |

查了四个开源的 SDK 是怎么做的（2026-11-16 读的各自主分支的源码）：Expo 和 OneSignal 在 `+load` 里就碰通知中心；React Native Firebase 和 Notifee 在 `+load` 里只登记观察者，到启动完成的通知里才装。两种做法都有人用，第二种和头文件的字面要求不符。这里选了符合字面要求的那一种。

`+load` 里做事的顾虑有两条：

- **那时 `main()` 还没开始，能不能调 `currentNotificationCenter`。** 这个 framework 链接了 UserNotifications 和 Foundation，它们的初始化在这个 `+load` 之前。Mac 上量过：`+load` 里取通知中心、装委托都成，在主线程上，之后 `main()` 里取到的是同一个对象。iOS 上没有量；合并后的验收里 App 起得来就是答案。取的那一下包在 `@try` 里，装不上不让 App 起不来，JS 第一次取通知中心时再装一次。
- **拖慢启动。** 没有量。它做的事是取一个单例、赋一个属性、登记一个观察者。

**没有做的另一条路**：采用场景生命周期的 App，冷启动的那一次点击还会出现在场景接入的选项里（`UISceneConnectionOptions.notificationResponse`）。那要启动壳或者核心转发，能力包够不着。

## 宿主已经有自己的委托

通知中心只有一个 `delegate`。核心的 `NacreAddDelegatePart` 不适用：它解决的是 Nacre 内部几方共用一个槽位，放进去的是一个只认登记进来的几方的转发对象，每次增减都把 `delegate` 重设一遍，槽位里原来有别人的会被它换掉。这里要共处的是 Nacre 不认识的一方。

所以自己做，规则三条：

| 情况 | 做法 |
| --- | --- |
| 装的时候槽位里已经有别人 | 把它记成 `next`（弱引用，和通知中心一样），自己装上去。系统调过来的每一次都原样转给它，打一行日志说明 |
| 装好之后被别人换掉 | **不抢回来**，打一行日志，只打一次。检查的时机：启动完成的通知、JS 取通知中心、JS 订阅事件 |
| 没有别人 | 自己是委托 |

转给 `next` 时谁回答系统：

| 委托方法 | `next` 实现了它 | `next` 没实现 |
| --- | --- | --- |
| `willPresentNotification` | 转给它，由它回答。`foregroundPresentationOptions` 这时不起作用 | 按 `foregroundPresentationOptions` 回答 |
| `didReceiveNotificationResponse` | 转给它，由它告诉系统处理完了 | 自己告诉系统 |
| 别的（现在是 `openSettingsForNotification`，以后系统加的也算） | 整个转给它（`respondsToSelector:` 和 `forwardingTargetForSelector:`） | 没有人实现 |

两种情况下事件都照常发给 JS。

**为什么被换掉之后不抢回来。** 上面查的四个 SDK 装自己时都把原来的委托记下来往回转。假设其中一个在我们之后装：它记下的「原来的委托」是我们，收到回调会转给我们。这时我们要是再把自己装回去、把它记成 `next`，系统调我们，我们转给它，它又转给我们，没有尽头。不抢的话，它转不转给我们决定事件到不到得了 JS：这四个都转，所以到得了；一个不转的（宿主自己在启动代码里写 `center.delegate = self`）就到不了，日志里说了。

这两行日志只在原生的日志里，JS 看不到。给能力包的头里没有往 JS 的控制台打警告的口子。

Mac 上执行过：先装一个别人的委托再加载这个包，三个方法都转到了它那里，「处理完了」只被调一次；装好之后把委托换掉，没有被装回来，日志打了。

## 启动时的那一次点击

事件是惰性订阅的：没有监听器时原生不发。而用户点通知启动 App 时，系统交出这次点击的时刻，JS 多半还没执行到 `addEventListener`（内置脚本和 `main.js` 是 `didFinishLaunching` 里排进主队列的任务）。

规则：

- 没有人听 `notificationclick` 时到的点击，原生留着，一条是一段 JSON 文本。
- **最多 8 条**，超出时丢最早的。**没有时限。**
- 这个事件从没人听变成有人听的那一刻，按先后全部发出去，然后清空。事件出口本来就延后一轮，而订阅发生在监听器登记之前，所以补发的事件到的时候监听器已经在表里了。
- 之后监听器全摘掉再加回来，不会重发已经发过的；这中间新到的照样留着。

8 这个数没有外部依据。通常只有一条；留几条是为了连着点了几条时不丢。Expo 的做法是同一个思路，它不设上限。

`notification` 不留。它说的是「App 开着的时候到了一条」，过后再告诉 JS 没有用处；通知要是进了通知中心，`getDeliveredNotifications()` 查得到。

Mac 上执行过：没人听时连交 10 条，订阅的那一刻发出后 8 条；退订再订，不重发。

**「处理完了」什么时候告诉系统。** 系统给 `didReceiveNotificationResponse` 一个完成时要调的 block。这里在事件派发之后的下一轮才调它：监听器是在派发的那一轮里同步执行的，所以系统收到「处理完了」时，监听器里同步做的事已经做完。监听器里异步做的事（发一个请求）不等。

## 前台显示是预先设的

系统在通知到的那一刻调 `willPresentNotification:withCompletionHandler:`，等委托回答怎么显示。JS 的事件是延后一轮派发的，当场答不了。

这里用的是项目里已经定过的那个办法（[屏幕方向](page-overrides.md)是同一个模式）：把系统当场要的答案，换成 JS 预先声明的状态。`foregroundPresentationOptions` 存在原生那一侧，系统来问时直接拿它回答，不进 JS；事件照常延后一轮发。

- **默认是空的。** 值只在内存里，每次启动都是空的。
- **它是这个包自己加的属性，ObjC 里没有。** 名字里的 `foreground` 是为了说清它只管 App 在前台的时候。
- **`alert` 这个名字不收。** 系统把它拆成了 `list` 和 `banner`，旧的标了废弃。
- **读出来的顺序是位的数值从小到大**，和写进去的先后无关。

代价是不能按通知的内容逐条决定。同步回调的机制（`NacreEmitEventSync`）是给「系统在等一个布尔」用的，这里要的是一组选项，而且这个回调在哪个线程上来文档没说（见下），所以没有用它。要逐条决定，等有人真的被挡住再做。

**一处和 Apple 的文档对不上的地方，没有验证**：做这个包之前的理解是「App 在前台时系统默认不展示通知」。Apple 的文档写的是：委托没有实现这个方法时，按「什么都不显示」处理；**根本没有委托时，系统按通知原来的选项展示**。这个包一加载就装了委托，所以装了它之后默认是不展示，这一点不受影响。受影响的是 API 文档里的措辞：那里只说「默认值是 `[]`」，没有说「和系统的默认一致」。

## 回调在哪个线程上

| 回调 | 依据 | 这里怎么做 |
| --- | --- | --- |
| 五个方法的完成 block | Apple 的文档：may execute on a background thread。Mac 上量到的都是后台线程 | 在哪个线程上来就在哪个线程上调 `done`。回主线程兑现是核心的事 |
| 委托的两个方法 | 文档和头文件都没说 | 不假设。碰状态、发事件之前先回主线程 |

Mac 上执行过从后台线程调委托方法的情况：事件发出去了，「处理完了」在主线程上调的。

## 返回 Promise 的方法

走 `callAsync` 那条登记通道。**每一条路都要结算，而且只结算一次**：

- 参数不对：当场拒绝。JS 那一侧已经校验过并且同步抛了，原生这一遍是防两边不一致。
- 调系统的那一下包在 `@try` 里。系统对两种触发器的参数是抛 ObjC 异常的（Mac 上量的：间隔不大于 0、重复的间隔不到 60 秒），这两种 JS 和原生各拦了一遍，`@try` 是最后一道。
- 系统的完成 block 带着 `NSError` 就拒绝，否则兑现。

**没有自己加超时。** 系统不调完成 block 的话，这里就是一个不结算的 Promise。没有量到过。

申请授权时参数写错要同步抛，而选项的名字只有原生认得。照 `LAContext.evaluatePolicy()` 的做法：先走一次同步的通道把名字验掉（`nacre:checkAuthorizationOptions:`），再走异步的通道。这一步不到系统，不弹提示框。

错误的 `name` 只分了两种：`NotAllowedError`（`UNErrorDomain` 的 1）和 `UNError`（别的，看 `code`）。Mac 上量到没授权时 `addNotificationRequest` 给的就是前一种，文案是 `Notifications are not allowed for this application`。

## 通知中心这个对象的寿命

它是进程级的单例，监听器挂在它的包装上。包装被回收重建的话监听器就没了，而通知的事件随时会来。

- **JS 这一侧**：第一次取到的包装记在 part 的闭包里，之后一直还它。记在闭包里而不是类上，是因为方法被摘下来单独调用时 `this` 不是类（`ASIdentifierManager` 那一次的教训）。
- **原生那一侧**：只认第一次取到的那个通知中心，事件都发在它身上。所以身份不依赖系统每次给同一个指针。Mac 上量到的是每次给同一个。

这是所有权镜像之外的一条持有边：原生那边通知中心是系统拿着的，JS 这边由 part 拿着。它不会被回收，这正是要的。

## 用户做的动作

`actionIdentifier` 在系统那边是字符串。两个系统的常量换成了短名字，别的原样给：

| 系统的值 | JS |
| --- | --- |
| `UNNotificationDefaultActionIdentifier`（`com.apple.UNNotificationDefaultActionIdentifier`） | `'default'` |
| `UNNotificationDismissActionIdentifier`（`com.apple.UNNotificationDismissActionIdentifier`） | `'dismiss'` |
| 自定义按钮的标识 | 原样 |

照的是分享面板的 `activityType` 的先例：开放的字符串类型，表里有的给短名字，没有的原样给。以后接了分类，App 自己起的按钮标识要是正好叫 `default` 就分不清了。那时要么不许起这两个名字，要么改回原样给常量；现在分类没做，先按好读的来。

`'dismiss'` 现在收不到：系统只对登记了分类、并且分类带着「报告划掉」选项的通知报它（头文件：`UNNotificationCategoryOptionCustomDismissAction`），而分类没做。

## 事件的名字

`notification` 和 `notificationclick`：委托方法里自己的那一段，全小写。

名字长。短的写法（`willpresent`、`notificationresponse`）没有用，原因是核心的事件落点里那张字段转换的表（`eventFieldConverters`）是按事件名登记的，不分类：核心以后有一个也叫 `willpresent` 的事件（呈现页面的那一类）带着 JSON，就会走进这个包登记的转换。带着 `notification` 的全名不会撞，而且和 Apple 的文档里的方法名对得上，搜得到。**这是这个包自己定的，等 review。**

带什么的判据是「回头读不到才带」：两个事件都带。通知和回应过后都没有别的地方能读到（前台显示是空的时候，那条通知哪儿都不留）。

## 在 Mac 上量到的

两类探针，都是一次性的，没有进仓库。都没有申请授权（那会在这台 Mac 上弹提示框），也没有真的发出通知。

**系统对象的行为**（一个只链了 UserNotifications 的小程序）：

| 量什么 | 结果 |
| --- | --- |
| `+load` 里取通知中心、装委托 | 成，在主线程；之后取到的是同一个对象，委托还在 |
| 连取两次通知中心 | 同一个指针 |
| `UNNotificationSound.defaultSound` 连读两次 | 指针不同，`isEqual:` 是 YES；和 `soundNamed:` 的比是 NO |
| `triggerWithTimeInterval:` 给 0、给 -3 | 抛 `NSInternalInconsistencyException`：time interval must be greater than 0 |
| 重复的触发器给 30、给 59.9 | 抛：time interval must be at least 60 if repeating。给 60 可以 |
| 间隔 0.5 秒、不重复 | 可以 |
| 日期分量是空的、`hour = 99` | 都不抛，`nextTriggerDate` 是 `nil` |
| 从日期的触发器读回分量 | 是一份副本；没指定的分量是 `NSDateComponentUndefined`；`calendar` 和 `timeZone` 是空的 |
| 新建的 `UNMutableNotificationContent` | `title`、`subtitle`、`body` 是 `nil`，`threadIdentifier` 是空串，`badge` 和 `sound` 是 `nil`，`userInfo` 是空字典 |
| `userInfo` 里放 `NSNull`、放数字的键 | 赋值时都收下了 |
| `badge` 赋 -1 | 收下了 |
| 标识是空串的请求 | 建得出来 |
| 建好请求再改内容 | 请求里的不变；请求里的内容是 `UNNotificationContent`，不是原来那个对象 |
| 三个 `get…` 的完成 block | 都在后台线程 |
| 没申请过授权时的设置 | `authorizationStatus` 是 `notDetermined`，各项是 `notSupported`，`alertStyle` 是 `none`，`showPreviewsSetting` 是 `always` |

**这个包的原生代码**：把 `NacreUserNotifications.mm` 原样编成 Mac 程序，核心的六个函数用桩代替，UIKit 用一个只有通知名的头代替。源码改了三处只有 iOS 才有的符号（`UNAuthorizationStatusEphemeral`、`carPlaySetting`、`announcementSetting`），别的一个字没动。执行到的：

- 登记、`+load` 里装委托、类级的取通知中心；
- 属性的读写：四个名字、重复的、顺序、五种写错的；
- 同步的五个方法和验选项的那一个，各种写错的；
- 订阅：两个名字，和认不出的名字；
- 六个异步方法：读设置、两张列表到了系统；`addNotificationRequest` 的八种参数不对都当场拒绝；一条完整的请求到了系统，被拒绝成 `NotAllowedError`（code 1，`UNErrorDomain`）；
- 委托的两个方法：用系统没有公开的两个构造方法造出 `UNNotification` 和 `UNNotificationResponse`（只在探针里用），直接调委托。预设的回答、三种声音、三种触发器、`userInfo` 的清洗、留 8 条、订阅时补发、退订再订不重发、后台线程上来的回调、有别人的委托时的转发，都和这一页写的一样。

没有执行到的：申请授权、设角标成功的那一支、已经授权时排上再读回来。

## 验证

| 做了的 | 结果 |
| --- | --- |
| 先写验收用例，没有实现时 | 运行时全局上没有这些类，每一组都报「这一组中断了」；类型检查报找不到名字 |
| 用假的桥在 Node 里跑 part 和验收用例 | 未授权 229 条、已授权 251 条、已拒绝 230 条，全过。假的桥按上面量到的行为写：没授权时 `add` 被拒绝，读回来的 `userInfo` 键的顺序打乱 |
| 只编译（模拟器的切片，Debug 和 Release），连核心一起 | 编过，这个文件没有警告 |
| 产物 | `Builtin/parts/user-notifications.js` 在包里；登记用的类还在；从核心拿的符号是 1 个类、6 个函数；链的系统框架是 UserNotifications、UIKit、Foundation |
| 只编译整个验收 App（CLI 生成的工程，Debug 和 Release，不装、不运行） | 编过。App 里嵌着 `NacreUserNotifications.framework`，它的 part 在里面；这个包没有「用了更新的接口却没加版本保护」的警告 |
| `check-api.sh` | 一致。类从 117 个到 118 个；两个位掩码和四个枚举的取值和类型定义对上了 |
| 验收工程的类型检查、打包 | 通过 |
| 文档里的示例代码 | 16 段抽出来过了一遍严格的类型检查；24 条照抄的报错原文和实际抛出的逐条对过 |
| CLI 给验收工程生成 | 认出了这个包 |
| CLI 的用例 | 38 条都过 |

用假的桥跑的时候撞了一次，和定位包撞的是同一处：「写冻结的对象要抛」那几条不过，原因是测试脚本自己不是严格模式。运行时给每个脚本都开了严格模式。

**断言的条数随授权状态变**：已经授权时多出「排上、读回来、撤掉」那一段的二十来条。基线要按这个处理。

**没有验证的**：

- 验收用例没有在 App 里跑过，一条都没有。
- 系统的行为：提示框、通知到没到、横幅、两个事件、冷启动的那一次点击、远程推送。
- iOS 上 `+load` 里装委托。
- 没授权时 iOS 上 `addNotificationRequest` 和 `setBadgeCount` 怎么答（Mac 上前一个是拒绝）。
- `userInfo` 里有 `null` 时系统收不收。
- 算不出下一次时刻的触发器，系统在 `add` 时怎么答。
- 委托的方法在 iOS 上来自哪个线程。
- 真机；预编译的 xcframework 没有打。

## 类型检查的一处：最外层赋数组

写文档的例子时量到的（TypeScript 5.9.3，开着 `checkJs`）：JS 文件的最外层写

```js
center.foregroundPresentationOptions = ['banner', 'sound'];
```

报 `Type 'string[]' is not assignable to type 'UNNotificationPresentationOptions[]'`。同一行写在函数里面就不报。

这不是这个包的类型写得不对。拿核心的 `layer.maskedCorners = ['minXMinY']` 和一个三行的最小声明试，结果一样：在 JS 文件的最外层，`变量.属性 = [字符串字面量…]` 右边的数组得不到左边的类型，被推成 `string[]`；函数里、块里的 `if` 里各试了一遍，只有函数里能过。把属性声明成读写不同型的一对存取器也试了，没有区别，所以类型里就写成普通的属性。

验收用例碰不到它（步骤都是函数）。会碰到它的是照文档在 `main.js` 最外层写这一行的人，所以 API 文档里这个属性的例子都写在 `sceneconnect` 的回调里，并且加了一条注意。核心里字符串数组类型的属性都有这个问题，不归这个包改，记在这里。

## 给能力包的头里缺的

只用 `NacreExtension.h` 写下来，缺的和前几个包记的是同一批，这里又各写了一份：

| 缺什么 | 这里怎么办的 |
| --- | --- |
| 取参的宏（`NACRE_NUM` 一类） | 自己写了两个小函数：是数才取数，是布尔才取布尔 |
| 位掩码的宏 `NACRE_MASK_MAP` | 照核心的样子在自己的文件里定义了一份，名字相同，外面包着 `#ifndef`。名字相同所以 `check-api.sh` 的自动核对认得它 |
| `EncodeJSON` | 自己用 `NSJSONSerialization` 编 |
| 往 JS 的控制台打警告 | 没有，只打了原生的日志 |
| 启动时的钩子、场景接入时的选项 | 没有。前一个用 `+load` 代替了；后一个（冷启动的点击的另一条路）够不着 |

## 还没做的

| | 为什么先不做 |
| --- | --- |
| 远程推送的注册和设备令牌 | 要推送的 entitlement 和显式包名的描述文件，还要启动壳转发 `UIApplicationDelegate` 的回调。归 `@nacrejs/push` |
| 分类和自定义按钮 | 另一组类。接的时候 `'default'` / `'dismiss'` 这两个短名字要一起重看 |
| 附件 | 要先能把文件交给系统（它会把文件搬进自己的目录） |
| 自定义声音 | `soundNamed:`。读回来的「别的声音」现在读不出名字 |
| 按位置触发 | 依赖定位包的类，两个包之间的依赖还没有考虑过 |
| `nextTriggerDate` | 触发器是值。过桥重建一个再问的话，按秒的触发器起点就丢了 |
| 逐条决定前台显不显示 | 见[前台显示是预先设的](#前台显示是预先设的) |
| `openSettingsForNotification` | 一个事件的事。没有人要 |
| 通知的扩展 | 是另一个可执行文件，不在这个运行时里 |

---

← 返回[实现原理](README.md) ・ [能力包](capabilities.md) ・ [项目说明](../project.md)
