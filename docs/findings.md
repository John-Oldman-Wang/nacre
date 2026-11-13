# 文档改写中发现的问题（2026-11-14）

把 `docs/api/` 下 43 篇文档按[文档写法](writing-guide.md)的四条原则全部改了一遍，改的同时逐条去代码、验收用例和 `internals/` 里求证。这份清单记录求证时发现的两类东西：

- **实现有问题**：文档该怎么写很清楚，但运行时、类型定义或验收用例的现状对不上。
- **待验证**：文档里需要的说法，在代码、验收断言和实测记录里找不到依据。文档里这些地方都标了「未在模拟器验证」。

这次只改了文档，没有改运行时、类型定义和验收用例。

**关于依据**：除特别注明「有实测」的以外，实现问题都是**读代码确认、没有运行过**。行号是 2026-11-14 时的位置。

这份文件是工作记录，不发布到文档站。

## 一、实现有问题

### 高

| # | 问题 | 位置 | 应该是什么 |
| --- | --- | --- | --- |
| H1 | **读剪贴板会停住整个 App。** 内容来自别的 App 时系统弹提示，用户回应之前这一行不返回，期间定时器、事件、动画回调都不执行，时长没有上限。**有实测**：真机一次 6613 毫秒（`internals/system.md`） | `ios/Runtime/Bridge/NacrePasteboard.mm:50`（同步取 `pasteboard.string`）、`ios/Runtime/Builtin/nacre.js:1965` | 提供不阻塞的读法，或不触发提示的路径。现在只能靠文档约束「只在用户点粘贴时读」 |

### 中：运行时

| # | 问题 | 位置 | 应该是什么 |
| --- | --- | --- | --- |
| M1 | 事件监听器里抛的异常不派发 `error`，只在控制台输出 `Event listener threw:`。所以 `sceneconnect` 回调、点击回调里的异常进不了统一的错误处理 | `nacre.js:126-137` | 也派发 `error`，和浏览器一致。文档现在只能教人自己包一层 |
| M2 | 原生对象上监听它不认识的事件名会抛 `TypeError`，自定义事件用不了。`dispatchEvent(new Event('任意名'))` 不抛，但监听器注册不上 | `ios/Runtime/NacreRuntime.mm:1827、1834`、`Bridge/NacreGesture.mm` 的 `GestureSetSubscription`、`nacre.js:89` | 和 Web 一样：任何对象可以监听任意名字并自己派发，运行时不认识的名字只是不向原生订阅。已有待办「订阅按事件名分流」。文档都写成了「已知的限制」 |
| M3 | 被模态呈现的 `UINavigationController` 上监听 `willdismiss` / `diddismiss` / `dismissattempted` 会抛 | `NacreRuntime.mm:1728-1737` | 和 `UITabBarController` 一样认这三个名字。与 M2 同一个根因 |
| M4 | `asset(不存在的名字)` 抛 `TypeError: cannot build a color from this specification`，和「颜色写错不抛、只警告」不一致 | `Bridge/NacreFactories.mm:42-47`；JS 侧 `colorFromString`（`nacre.js` 约 4597 行）没有接住 | 警告并保持原来的颜色 |
| M5 | `setInterval(fn, 0)` 只执行一次就不再重复 | `ios/Runtime/Engine/Engine.cpp:1483、1563`（`interval_ms > 0` 才重新入堆） | 按 0 间隔持续重复 |
| M6 | 没有主机部分的地址（`mailto:a@b.com`、`tel:`、`data:`）的 `href` 被拼成 `mailto://a@b.com` | `nacre.js:5805-5813`（`serializeURL` 无条件加 `//`） | 原样还回 |
| M7 | `Response.text()` 遇到不是 UTF-8 的内容静默返回空串，也不看响应头声明的编码 | `NacreRuntime.mm:716` | 用替换字符解码，或者拒绝 |
| M8 | 取消请求时抛的异常前后不一致：调用前已取消的以 `signal.reason` 拒绝；进行中取消的一律是新的 `AbortError`，丢掉了 `abort(reason)` 的原因，`AbortSignal.timeout()` 也得不到 `TimeoutError` | `nacre.js` 约 6385-6396、`NacreRuntime.mm` 的 `rejectCall:` | 两种情况都以 `signal.reason` 拒绝 |
| M9 | 读取响应内容时对数据做了一次复制，原件还留在请求记录里直到 `Response` 被回收。类型定义和 `internals/network.md` 都写「零拷贝」。是否真的复制了字节没有测量 | `NacreRuntime.mm` `deliverBody:` 里的 `[entry.body copy]` | 先测量。文档已不再写「内存只占一份」 |
| M10 | 钥匙串对已存在的键再 `set` 时，`accessible` 选项被静默忽略 | `Bridge/NacreKeychain.mm` 的 `WriteItem`（`SecItemUpdate` 那一支不带 `kSecAttrAccessible`） | 报错，或者真的改掉访问级别 |
| M11 | 文件读写在并发队列上执行，对同一路径不等待地连发两次写入，先后不保证。钥匙串用的是串行队列 | `Bridge/NacreFileSystem.mm` 的 `FileQueue()` | 同一路径的操作按调用顺序完成 |
| M12 | `presentViewController()` 传非页面时原生只把 Promise 兑现为 `false`，JS 侧却已经无条件记了保管关系并订了内部事件。传 `null` 抛的是引擎自己的 `TypeError`（无效的 WeakMap 键） | `nacre.js:4726-4737`、`NacreRuntime.mm:1105-1110` | 和 `addChildViewController` 一样抛 `TypeError`，不留副作用 |
| M13 | 几处构造函数传错类型时静默接受，而对应的方法或属性会抛：`new UINavigationController(不是页面)` 建出空栈；`new UIStackView([…])` 跳过不是视图的元素；`new UIBarButtonItem({ customView: 不是视图 })` 建出普通按钮 | `NacreFactories.mm:339-351、357-361、326-334` | 抛 `TypeError`，和「对象参数类型不对就抛」一致 |
| M14 | `nav.setViewControllers([...])` 里的 `null` 和无句柄的值被静默跳过，而属性赋值 `nav.viewControllers = [...]` 对同样的输入会抛 | `Bridge/NacreMethodsNav.mm:191-199` 对比 `NacrePropsScene.mm:402-413` | 两条路一致 |
| M15 | `WebSocket` 的 `headers` 里值不是字符串的项被静默丢弃；传 `Headers` 对象整个无效，也不报错 | `Bridge/NacreWebSocket.mm:144-150`、`nacre.js:1396` | 按原则 13 转成字符串，或接受 `Headers`，至少报错 |
| M16 | `addAnimation` 记的持有关系只增不减：动画播完或 `removeAnimationForKey` 都不释放，只有 `removeAllAnimations` 清。长期存在的图层反复加新动画时，动画对象一直回收不了 | `nacre.js:1040` 及其下方注释 | 动画结束或被移除时释放 |
| M17 | 同一个值两套写法：`application.contentSizeCategory` 给的是 iOS 原始字符串（`'UICTContentSizeCategoryL'`），`traitCollection.preferredContentSizeCategory` 给的是 `'large'` | `Bridge/NacreConvert.mm:117` | 统一成后一种 |

### 中：真实的卡顿（有实测，来自试用报告）

| # | 问题 | 实测 | 状态 |
| --- | --- | --- | --- |
| P1 | 系统图标首次加载慢 | 每个新名字约 11.7 毫秒；一次建很多图标时界面停 1.0–1.5 秒 | `project.md` 性能表，「要查」 |
| P2 | 空闲后第一次渲染慢 | 空闲 30 秒后重建列表 199–418 毫秒，紧接着再来一次只要 36–41 毫秒 | `project.md` 性能表，「原因未查」 |

这两条和 H1 是文档求证过程中找到的全部有数据的卡顿。操作界面本身不慢：创建视图约 4 微秒，写属性 2–7 微秒。

### 中：缺能力

| # | 缺什么 | 影响 |
| --- | --- | --- |
| C1 | 命令行工具生成的工程无法加入自己的颜色集和图片集：每次生成都删掉 `ios/App` 并从模板重铺，模板里只有 App 图标（`packages/ios/bin/nacre-ios.js:156-158`） | `asset()` 写法和图片的深色变体对命令行工具的用户不可用。文档因此没有推荐 Asset Catalog |
| C2 | 标签自动跟随系统字号的属性 `adjustsFontForContentSizeCategory` 没有暴露 | `project.md` 写「标签跟随文字大小靠这个属性」，与现状不符。JS 只能在事件里手动重设字体 |
| C3 | 随 App 打包的字体文件没有办法用：运行时没有注册接口，命令行工具也没有对应配置 | 文档写成「目前不能用」 |
| C4 | 子图层的大小跟不上系统引起的布局变化：没有任何事件能得知视图大小变了 | 文档给了三种现在可行的做法，写明这一种做不到 |
| C5 | 页面的出现和消失没有通知（已知，等 M2 机制） | 文档给的替代做法是在导航控制器的 `didshow`、标签控制器的 `didselect` 里统一处理 |
| C6 | 单个动画不能用 `beginTime` 延迟（读不到图层当前时间）；旋转和缩放不能做动画（`keyPath` 表里没有 `transform`） | 已写进「还不能做的」 |

### 低：运行时

| # | 问题 | 位置 |
| --- | --- | --- |
| L1 | 对外的报错里还有中文：`"URL 不合法"`、`"这个请求已经没了"` | `NacreRuntime.mm:487、678` |
| L2 | 对外的报错里有全角括号，内置脚本里有中文标识符 | `nacre.js:5826-5827`（`'（base '…'）'`）、`5835`（`再解析`）、`6069`（`条目`） |
| L3 | 同一件事的报错文案不统一：`setViewControllers: only accepts UIViewController`（带冒号）、`viewControllers only accepts …`、标签控制器的不带冒号 | `NacreMethodsNav.mm:165、195`、`NacrePropsScene.mm:394、408` |
| L4 | `view.addSubview(view)` 的报错是原生异常的原文（`addSubview: raised NSInvalidArgumentException: Can't add self as subview`） | 走的是保底。应先查再给明确的报错，并覆盖「加到自己的后代上」 |
| L5 | `queueMicrotask` 回调抛的异常走 `unhandledrejection` 而不是 `error` | `nacre.js:6453` |
| L6 | `url.search = 'a b'`、`url.hash = …` 原样写入，不编码 | `nacre.js:5873-5889` |
| L7 | `ws:`、`wss:`、`ftp:` 地址的 `origin` 是 `'null'` | `Bridge/NacreURL.mm:62-67` |
| L8 | `ws.send(123)` 以 `InvalidStateError` 拒绝；`ping()` 不检查 `readyState`；`close(code, reason)` 不校验关闭码范围和 `reason` 长度 | `NacreWebSocket.mm:264-266、243-245、201-210` |
| L9 | `signal` 已取消时请求仍然先发起再取消 | `nacre.js` 约 6380-6390 |
| L10 | `Request` 的 `url` / `method` / `headers`、`cookies.get()` 返回的对象，运行时可写，类型定义标的是只读 | `nacre.js` 约 6336-6340、`tidyCookie` |
| L11 | `fetch()` 得到的 `Response` 的 `statusText` 永远是空串，`blob()` 的 `type` 永远是空串 | `NacreRuntime.mm` `deliverBody:` |
| L12 | `keychain.get` 读到不是 UTF-8 的字节时返回 `null`，和「没有这个键」分不开 | `NacreKeychain.mm` 的 `get` 分支 |
| L13 | `keychain` 的 `accessible` 写错是 Promise 拒绝（`TypeMismatchError`），别处枚举写错是同步抛 `TypeError` | `nacre.js:5640`、`KeychainCallAsync` |
| L14 | 一次写剪贴板派发两次 `change`（**有实测**） | `NacrePasteboard.mm:20-24`。可以按 `changeCount` 去重 |
| L15 | 真实触摸落在控件的可交互子视图上时，`location` 可能是 `null`。是否真的发生取决于系统，未能从代码确认 | `NacreRuntime.mm:1447` |
| L16 | `addEventListener(type, null)` 在校验事件名之前就返回，和传函数时不一致 | `nacre.js:76` |
| L17 | `presentViewController` / `dismissViewController` 没有「是不是原生对象」的检查 | `nacre.js:4726、4742` |
| L18 | `bezierPathWithArcCenter` 不转换参数，`{ radius: undefined }` 能通过；同类的 `addArcWithCenter` 是转换的 | `nacre.js:850-861` |
| L19 | 动画值是字符串时一律当颜色：`fade.toValue = '0.5'`（`opacity`）得到颜色警告并被忽略 | `nacre.js:1822` |
| L20 | `systemLayoutSizeFittingSize` 的两个优先级只传一个时，另一个以 `undefined` 原样送到原生 | `nacre.js:2673-2677` |
| L21 | `rgb()` 的分量不检查范围；`view.backgroundColor = undefined` 静默清掉颜色、没有警告 | `nacre.js` 约 4498-4516、4652-4653 |
| L22 | 内存警告没有转给 JS 引擎（已有待办） | `NacreRuntime.mm:1290` |

### 低：需要定一个规则的

| # | 问题 |
| --- | --- |
| D1 | `storage`、`fileSystem`、`keychain` 的键和路径参数不按原则 13 转换：`storage.get(1)` 抛 `key must be a string`（`nacre.js:5473、5556、5634`）。要么按原则转，要么在原则里写明例外 |
| D2 | `fileSystem.remove` 删不存在的路径会拒绝，`storage.remove` 和 `keychain.remove` 都算成功，三者不一致 |
| D3 | 几处属性的写入类型比运行时窄（`pasteboard.string`、`UIScrollView` 的结构体成员、`additionalSafeAreaInsets`、`CGAffineTransform.concat()`）。如果全站约定是「类型从严、运行时从宽」，就不算问题，但要写下来 |

### 类型定义

| # | 问题 | 位置（`packages/types/`） |
| --- | --- | --- |
| T1 | `willshow` / `didshow` 的事件对象没有类型，示例只能自己写标注 | `ios/view.d.ts:320-376` |
| T2 | `UIGestureRecognizer` 的类型是公开构造函数，运行时会抛 `Illegal constructor`。实测 `tsc` 不报错 | `ios/gesture.d.ts` |
| T3 | 控件和手势的 `addEventListener` 只接受已知事件名，注释还把它写成保护措施（「写错了不该静默不响应」）。跟着 M2 走 | `ios/control.d.ts:98`、`ios/gesture.d.ts` |
| T4 | 回调参数没按事件名收窄：读 `location`、读 `traitchange` 的字段每次都要手写转型 | `ios/control.d.ts`、`ios/gesture.d.ts`、`ios/trait.d.ts:36` |
| T5 | 预加载脚本里的 `ipcRenderer`、`contextBridge` 没有类型定义 | `ios/web.d.ts` |
| T6 | `UIControl` 的类注释挂错了位置，悬停看不到说明；`UIColor` 的说明同理 | `ios/control.d.ts`、`ios/resources.d.ts` |
| T7 | 脚本顶层给数组型位掩码属性赋值，类型检查误报（`Type 'string[]' is not assignable to type 'CACornerMask[]'`）。写在函数里正常。**实测** | — |

**注释和实测不符的，共十处：**

| 注释里的说法 | 实际 | 位置 |
| --- | --- | --- |
| `displayScale` 还没暴露，只能把 3 写死 | 已经暴露 | `ios/layer.d.ts:75-79` |
| `'automatic'` 在 iPhone 上落到 `'pageSheet'` | 断言读回是 `'formSheet'` | `ios/view.d.ts:436`、`ios/enums.d.ts:163` |
| SF Symbols 默认是 `alwaysTemplate` | 断言是 `'automatic'` | `ios/enums.d.ts:52` |
| `cornerCurve` 默认 `'circular'` | 断言是 `'continuous'` | `ios/layer.d.ts:92` |
| 约束的 `identifier` 在冲突时会被打出来 | 实测冲突没有任何输出 | `ios/layout.d.ts` |
| `UINavigationItem.title` 和页面的 `title` 是同一个东西 | 实测是单向同步 | `ios/view.d.ts:304` |
| 已在栈上的页面不会被重复压入 | 没有任何断言支撑 | `ios/view.d.ts:349` |
| 存储的 `change` 只在本进程改时发 | 实测系统的写入也会触发 | `ios/storage.d.ts` |
| 进后台定时器会停 | 没有验证过 | `nacre.d.ts:288` |
| 弹簧动画的 `duration` 不起作用；构造通道传不了标量 | 前者无依据，后者已过时 | `ios/animation.d.ts:207-210` |

另有两处：图片的例子路径写的是 `'assets/logo'`，实际要写 `'JS/assets/logo'`（`ios/resources.d.ts:135`）；`ColorValue` 的注释还是「常量去掉 `Color` 后缀」的说法，违反原则 12。

### 验收用例

| # | 问题 | 位置（`acceptance/src/steps/`） |
| --- | --- | --- |
| A1 | **`UIView`、`UIWindow`、`UILabel`、`UIFont` 的基础行为大多只有 `console.log`，没有 `assert`。** 层级、移除、坐标换算、窗口事件、固有尺寸、行数限制、字体名都是。这些「已在模拟器验证」实际靠人读日志 | `window.js` 全文 |
| A2 | 导航里「压非页面被拒」「不认识的事件名被拒」「窗口根页面塞进导航被拒」等只打日志不断言，报错文案没被核对 | `navigation.js:84-105、135-148、219-224` |
| A3 | 输入框最核心的两个事件 `editingChanged`、`editingDidEndOnExit` 只挂了监听器，没有断言 | `textfield.js` |
| A4 | 系统从来没有销毁过场景，`scenedisconnect` 和场景重建这条路径完全没有覆盖 | `main.js:135` |
| A5 | `fileSystem` 的「不卡界面」断言是单边的，`keychain` 的同类断言是硬断言，可能偶发失败 | `keychain.js` |
| A6 | 颜色的 `asset()` 没有任何用例，验收工程里也没有配颜色集 | `color.js` |

## 二、待验证

每一条在对应的文档里都标了「未在模拟器验证」。按「需要什么才能验证」分组。

### 需要测量的数据

| 说法 | 现状 |
| --- | --- |
| **界面保持 60 帧** | 仓库里没有任何帧率测量记录，三组文档都没有写这句话。需要测：真机和 iPhone Air 模拟器上，几百行的列表连续滚动（带和不带 `scroll` 监听器）、页面切换、一次建 500 个视图时的最长单帧耗时 |
| 五个单次耗时（建视图约 4 微秒等） | `project.md` 记了数值，没记测量设备和测法 |
| 一次建出几百行以上的列表，总耗时和内存 | 只有单次操作的数据 |
| 解码一张大图要多久，不提前解码是否影响界面 | 没有数据。文档写的是「没有实测数据」 |
| 读取响应内容到底占几份内存（见 M9） | 没有测量 |
| 真机上的文件写入耗时 | 只有模拟器的数据 |

### App 进入后台之后

这一组全部需要真机或真人切后台，现在没有任何依据：

- 定时器是否停止；回前台后过期的定时器是立刻补一次还是重新计时
- 没完成的 `fetch` 会怎样
- `WebSocket` 连接是否保持，期间的消息是否丢
- `performance.now()` 是否继续增加
- 在 `background` 回调里写存储，App 随后被系统结束，数据是否还在
- `willterminate` 在后台被结束时是否派发
- 网页视图里的 `visibilitychange`

### 场景被系统销毁

验收里系统从没销毁过场景，下面全部是从代码推出来的：

- `scenedisconnect` 是否派发
- 销毁后旧场景、窗口、页面、视图是否真的被回收
- 销毁后读旧场景的 `activationState` 是否是 `'unattached'`
- 在旧场景上新建窗口：不报错但不显示
- 用户回来时是否再派发 `sceneconnect`，新场景是不是新对象
- `session.userInfo` 跨场景重建、跨 App 重启是否保留
- 把旧页面放进新窗口、把旧窗口挪到新场景，能否正常显示

### 键盘

模拟器（iOS 27.2）上软键盘不弹，相关断言跑不到，需要真机：

- 键盘弹出后，约束到 `keyboardLayoutGuide` 的内容上移
- 滚动视图的可视区缩小，`scrollRectToVisible` 把输入框滚进可视区
- 点输入框以外的地方键盘不会自己收起
- 按回车不调 `resignFirstResponder()`，键盘是否自己收起
- 中文拼音输入到一半时是否派发 `editingChanged`，未选字的拼音是否算进 `text`
- 用代码改 `text` 不派发 `editingChanged`（限制输入长度的写法依赖它）

### 需要真人操作

- **触摸**：按下后滑到按钮外松手不算点击；连点两下派发两次；禁用后不派发任何事件；`touchUpOutside`、`touchCancel`、`touchDragEnter`、`touchDownRepeat` 的派发；透明度很低、隐藏、禁用交互的视图不接收触摸
- **导航**：设了左侧按钮或隐藏返回按钮后左滑返回失效；左滑到一半又滑回去是否派发事件；代码调用 `popViewController` 时是否派发 `willshow` / `didshow`
- **模态**：用户拖到一半放回去时 `willdismiss` 是否派发；已弹出一个模态页时再弹一个
- **手势**：同一视图上点按加长按；父视图有单击手势、子视图是直接创建的控件时谁生效；双击；长按手势在滚动视图里的表现
- **滚动**：松手时内容已停住则不派发减速事件；`CADisplayLink` 三种模式在滚动时的差别
- **剪贴板**：读自己写进去的内容在真机上是否弹提示；用户选「不允许」时读到什么；读 `hasStrings` 和 `changeCount` 是否弹提示
- **触感反馈**：所有震感的描述；用户关掉触感后的表现；`prepare()` 调与不调的差别
- **网页**：`alert()` 一类对话框、文件选择、相机、麦克风、定位在网页里能不能用；用户真实点击新窗口链接

### 需要看屏幕

验收断言只核对了读回来的值，屏幕上的样子没有人看过：

- **颜色**：各种写法实际显示的颜色，切换深浅色时是否自动换色
- **文字**：各种截断方式、两端对齐、自动缩小字号、禁用时变淡、文字阴影、表情符号能否显示
- **图片**：各种 `contentMode`、九宫格拉伸、模板图上色、只准备一个倍率时在其他屏幕上的显示
- **排列容器**：`distribution` 除 `'fillEqually'` 外四个取值、`alignment` 除 `'fill'` 外各取值、`'system'` 间距的实际大小
- **图层**：圆角裁剪、边框、阴影、渐变的各种类型、形状的线头和拐角、`contentsScale` 为 1 时是否模糊
- **动画**：动画结束后画面停在哪里、两种「停在终点」写法、`fillMode` 四种取值、五条时间曲线、弹簧的 `duration` 和 `settlingDuration` 不一致时的表现
- **导航条和标签栏**：返回按钮文字、副标题、自定义标题视图、26 个系统按钮各自的样子、角标、颜色
- **按钮**：`custom` 按钮文字默认白色、禁用时变灰、图标在文字左边、各种按钮类型的样子
- **窗口**：不设根页面或根页面不设底色时屏幕是黑的

### 需要真机或特殊条件

- **钥匙串**：各访问级别在锁屏时能不能读；设备重启、系统升级、卸载重装、换新手机后数据是否还在；没设密码的设备上 `whenPasscodeSetThisDeviceOnly` 写入失败
- **存储和文件**：卸载、系统升级、换机后数据是否还在；四个目录会不会被系统清掉、是否进备份；容量上限
- **设备标识**：跨重启相同、卸载重装后变化、重启后首次解锁前是 `null`
- **外观特征**：无障碍的几档字号、对比度、从右往左的语言
- **网络**：明文 `http://` 地址是否被系统拦截（工程配置没有放开，只有网页视图的 `-1022` 有实测）；默认超时；是否自动带 cookie；重定向；缓存；同时连接数上限

### 只需要补一条断言

这些从代码能推出结论，但没有断言。补上断言就能从清单里划掉：

- 视图：移除后能否加回去；加到另一个父视图是否自动从原父视图移走；加到自己的后代上会怎样；对没有父视图的视图调 `removeFromSuperview()`
- 约束：激活后不调 `layoutIfNeeded()` 读到旧的 `frame`；`hasAmbiguousLayout` 为 `true` 的情况；没调 `begin()` 就 `commit()` 是否抛
- 导航：同一页面推入两次；`popToViewController` 的页面不在栈里
- 存储：各个 `…ForKey` 方法在没有键、类型对不上时的返回值；对象属性超过两个时的读回顺序
- 文件：各种错误的 `name`；`move` / `copy` 目标已存在；传相对路径
- 钥匙串：连续两次 `set` 同一个键；`keys()` 的顺序
- 路径：含曲线的路径 `bounds` 是否包含控制点；空路径上直接 `addLineToPoint`
- 动画：同一个 `forKey` 再加会替换前一个；`duration` 为 0 时用事务的时长
- 定时器回调里的异常会派发 `error`；可以往 `application` 上加自己的属性；没列出的 iOS 类读它的名字抛 `ReferenceError`
- `URL`：路径里的中文怎么编码；`project.md` 说和浏览器「有五处已知差异」，只找到四处

## 三、文档自己的遗留

- **`docs/api/README.md` 后半的「当前 JS 全局环境」一节**还有实现用语（V8、jitless、lite mode），「65 个自有属性」和 `project.md` 的 86 对不上。「参考」表里几行说明文字还带着类比（「形状照 Electron」「调度参考 Chromium」）。
- **`native-classes.md` 有一个标题里用了口语词「话术」**，为了保住别处引用它的锚点没有改。要改需要同步 `ui-stack-view.md` 和 `ui-view.md` 里的两处链接。
- **各篇之间的链接现在大多只链到文件、不带小节锚点。** 改的时候 12 组同时进行，为了避免互相指向正在变的标题。可以再过一遍把锚点补回去。
- **文档里保留的几个「实测」数值来自日志而不是断言**（比如标签的固有尺寸 188.33 × 40.67），见 A1。
- **`ui-device.md` 原来写「存进钥匙串卸载重装也不变」**，和 `keychain.md` 的「别依赖卸载后数据还在」矛盾，已按后者改。
- **`docs/guides/your-own-app.md` 有一处链接指向文档目录之外**（`packages/ios/README.md`），会让站点构建报死链。站点配置里已经放行，但这条链接在站点上点不开。
