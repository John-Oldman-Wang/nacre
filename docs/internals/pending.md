# 还没做的设计和没解的问题

← [实现原理](README.md)

这一页放两类东西：方案已经想过、但还没实现的设计；已经知道、但还没解决的问题。每一条在 [`project.md`](../project.md) 的「还要做的」里有一行，这里是它的分析。做完一条，就把它从这里删掉，把最后的做法写进对应主题的那一页。

## 屏幕方向（方案已定，未实现）

从 `ui-window-scene.md` 搬过来——它是设计方案，不是已有的 API。

方向是第一个能完整走通「读 + 写 + 变化通知」三格的能力，而且「写」那一格会把**「系统要同步返回值，就转成 JS 预先声明的状态」**这个模式第一次落地。

**iOS 26 挪过位置**：`UIWindowScene.interfaceOrientation` 已废弃，方向现在在 `effectiveGeometry` 上；旧的 `windowScene:didUpdateCoordinateSpace:interfaceOrientation:traitCollection:` 也废弃了，换成 `windowScene:didUpdateEffectiveGeometry:`。

| 格 | JS 形态 | 原生怎么实现 |
| --- | --- | --- |
| **读** | `scene.effectiveGeometry.interfaceOrientation` | 新增 `UIWindowSceneGeometry` 类，先只暴露 `interfaceOrientation` 和 `isInterfaceOrientationLocked` |
| **写** | `scene.supportedOrientations = ['portrait', 'landscapeLeft']` | 运行时存下这个值；`SceneDelegate` 实现 `supportedInterfaceOrientationsForWindowScene:`，**直接返回存的值，不回 JS**；写入时调 `setNeedsUpdateOfSupportedInterfaceOrientations` |
| **变化通知** | `scene` 上的 `geometrychange` 事件 | 实现 `windowScene:didUpdateEffectiveGeometry:` |

「写」这一格的关键是：**系统的回调是同步的，但回调的内容来自异步设置的状态**。这正是 Apple 推荐的写法——`shouldAutorotate` 的废弃说明里原话就是「更新你支持的方向，然后调 `setNeedsUpdateOfSupportedInterfaceOrientations` 表示变了」。React Native 生态的方向库也是这个模式，只是它要求 App 开发者手改 `AppDelegate`，我们做进运行时。

用**属性**而不是方法（`scene.supportedOrientations = [...]`），因为它表达的是状态而非动作——原则 2。

两个要分清的：**设备方向 ≠ 界面方向**（`UIDevice.orientation` 是物理朝向，含面朝上/朝下；`interfaceOrientation` 是界面实际显示的方向，App 锁竖屏时设备横过来界面不变）；以及实际开发中更常用的是**每个页面**的方向（`UIViewController.supportedInterfaceOrientations`），scene 这层管的是窗口整体。

## 不可变原生值对象的相等性

**已实现一半：不可变原生值对象的相等性。** 颜色这一侧的候选 A（按构造参数池化）做掉了——同一个串永远拿到同一个 `UIColor`。剩下的缺口仍在：`UIColor.redColor` 和 `'#f00'` 是两个不同的原生对象。下面是当初的分析。

**TODO：不可变原生值对象的相等性怎么给 JS。** 以颜色为起点，但这是通用问题——所有不可变的「值类对象」（将来的 `NSString`、`CGColor`、`NSNumber`）都会遇到。

现状：主要路径的 `===` 已经成立，因为常量是原生单例、`copy` 对不可变对象返回自己、包装机制保证指针到 JS 对象一对一。缺口只剩**重复构造同值颜色**，以及**常量 vs 构造的同值色**（`UIColor.redColor` 和 `colorWithRed(1,0,0,1)` 实测 `isEqual:` 为 YES 但指针不同）。

两个候选，都不急着做：

| | 做法 | 代价 |
| --- | --- | --- |
| A | `Map<构造参数, WeakRef>`，只池化我们自己构造的颜色 | O(1)、零风险，但盖不住「常量 vs 构造」 |
| B | 新建对象后用 `isEqual:` 和池子里的逐个比，相等就返回池里的、让新对象被回收 | 语义最准（实测 `isEqual:` 连动态色和图案色都处理得对），但**需要一个可遍历的弱集合** |

**B 卡在 JS 上，不是卡在 iOS 上。** `WeakSet` 只有 `add` / `has` / `delete`，不可遍历、也不能按值查；`WeakRef` / `FinalizationRegistry` 同样不可枚举。这是 ECMAScript 的有意设计——遍历弱集合会泄漏 GC 时机。所以 B 要么用强引用的池子（泄漏，且每次构造要跨桥 O(n) 次 `isEqual:`），要么退化成「按 key 查」，而那就是 A。

为了做到 B 去耦合垃圾回收，复杂度和收益不成比例。倾向先做 A，再把 `isEqual()` 作为逃生口暴露出去（从 `NSObject` 继承，一行的事），两个加起来既便宜又没有静默的坑。

实测数据见 [`UIColor` 文档的「实测：相等性和 `description`」](ui-color.md#实测相等性和-description)。真正动手要等视图层起来、看清真实代码里怎么写颜色。

## 颜色解析的性能还没实测

现在解析在 JS 侧，靠池化摊掉——同一个串只解析一次，之后是 `Map.get` + `WeakRef.deref`。而**过桥写属性那一次省不掉**，所以稳态成本里解析接近零；把解析挪到原生反而会让重复字符串每次都过桥。但**首次解析在 jitless 下到底多少微秒没量过**。先给验收用例加一条基准，有数再谈优化。WebAssembly 这条路不通——lite mode / jitless 下编译不了 wasm。

## 有一条验收断言在真机上不稳

`网页开着的时候写的：不用刷新就看得到`（`acceptance/src/steps/webview.js` 的 cookie 那一段）：App 写一条 cookie，紧接着读网页里的 `document.cookie`。真机上三次里挂两次，模拟器上没见过挂。

它是写完**立刻**读，而那条 cookie 要先过一趟网页进程。（2026-11-15 在模拟器的 Debug 下也挂了一次，不再只是真机上的事。）改法是轮询等它出现、给个超时，和验收里别处等异步结果的写法一致。不是搬目录造成的，是写这条断言时赌了时序。

## `check-api.sh` 的标量核对是按名字的并集，不分类

做输入框时咬了一次：`textAlignment` 只在 `UILabel` 分支接了原生，`UITextField` 漏了，而名字在集合里所以脚本没报，运行时才抛，连带整个 `sceneconnect` 中断、黑屏。同一家的还有「标量接了不等于对象属性也接了」——那是另一条通道。要改成按类比对，得先让脚本知道每个分支属于哪个类。

## `check-api.sh` 不核对「对象数组」那条通道

它只比标量读写和对象读写两栏，所以 `colors`、`sublayers`、`viewControllers`、`values`、`timingFunctions`、`animations` 这些**三边都没人盯着**——原生层删一个、JS 侧漏一个，脚本一声不吭。这是早就存在的缺口（`sublayers` 那会儿就有了），做 A6-2 时又宽了三条。补法和已有的两栏一样：从 `ReadXxxObjectArray` / `WriteXxxObjectArray` 里按正则收名字，和 `nativeGetObjectArray` / `nativeSetObjectArray` 的调用点以及 d.ts 对。

## `layer` 上的颜色读两次不相等

`borderColor` / `shadowColor` 在 ObjC 里是 `CGColorRef`，桥上用 `colorWithCGColor:` 包成 `UIColor`，而它**每次新建一个对象**（实测两次指针不同）。于是包装机制「同一个原生指针永远同一个 JS 对象」的保证在这里失效。

底下的 `CGColor` 指针是稳定的，所以补法是按 `CGColorRef` 缓存 `UIColor`。不急：日常不会拿边框色做 `===`，而且真要补也等 `UITraitCollection` 一起（动态色定死是同一个根因，见 [`CALayer` 文档](ca-layer.md)）。

## 订阅按事件名分流，而不是按类分流

现在 `setSubscription:` 是按对象的类挑分支的，于是两个问题：

- ~~**原生类上只能用它自己认识的事件名**，Web 里合法的「在任意 EventTarget 上挂自定义事件」做不到~~ ← **2026-11-17 解决了**：不认识的事件名不再拒绝，当自定义事件。没有改分流的方式，是在订阅的入口把「不认识」这一种报错清掉
- **被模态呈现的 `UINavigationController` 收不到关闭事件**——它的分支只认导航事件，`beforedismiss` 那三条过不去。这一条还在：现在监听不报错了，但系统关掉它时仍然不派发

两个都是同一个根因。改法是先按事件名查一张总表，再决定交给哪个 trampoline。做 5c 时撞出来的。

## 内存警告没转给 V8

`UIApplicationDidReceiveMemoryWarningNotification` 现在只转成 JS 的 `memorywarning` 事件（`NacreRuntime.mm`），而 `Isolate::MemoryPressureNotification(MemoryPressureLevel)` **全仓库零调用**。也就是说系统喊内存不够时 V8 完全不知情，不会因此收一次内存——我们现在只有 `kCFRunLoopBeforeWaiting` 那条空闲增量 GC。Chrome 在这个信号上是会通知 V8 的。改动很小（一行转发），但 `kModerate` / `kCritical` 怎么映射要定一下，所以算新增能力，要走一遍 SOP。不要紧，排在后面。

连带的一条事实：**V8 的内存我们一个字节都没限。** `Isolate::CreateParams` 只设了 `array_buffer_allocator`，`constraints` 是默认构造的（`max_old_generation_size_` 等全是 0，`stack_limit_` 是 nullptr），也没有任何地方调 `SetFlagsFromString`。传 0 的含义是让 V8 按设备物理内存自己算，**算出来多少没量过**——要知道得调 `GetHeapStatistics().heap_size_limit`，那个没暴露。

## `layer.transform`（`CATransform3D`）还没暴露

`UIView.transform`（`CGAffineTransform`）已经做了，见[结构体文档](../api/cg-affine-transform.md)。剩下 3D 的那一半：16 个字段，而且 `m34` 那种透视参数单靠结构体不好用，要和动画一起看。

> 记这条 TODO 时担心的「C 函数怎么暴露」**在仿射变换这里没出现**：`CGAffineTransformMakeScale` 那几个全是纯算术，静态工厂在 JS 里算就行，过桥的只有六个数。判据记在[实现原理](structs.md)里——**C 函数只在值类型上做算术就在 JS 侧实现，真要跨桥的是会碰系统状态的那些**。

## 视图布局变化没有通知

子图层不走 Auto Layout 是 **iOS 的事实**，不是我们的缺口——`CALayer.autoresizingMask` 和 `layoutManager` 在 iOS 上都标着 `API_UNAVAILABLE(ios)`，`CAConstraintLayoutManager.h` 整个文件也是。原生 App 在 `layoutSubviews` 里手写子图层的 frame。

（2026-11-16 讨论过，暂时不做：布局绝大多数是 JS 自己引起的，做完调一次 `layoutIfNeeded()` 就读得到；系统引起的那几种里，文字大小有 `traitchange`，键盘有 `keyboardLayoutGuide`，旋转和半屏卡片还没有。受影响的只有手动按 `frame` 摆的子图层，试用报告里没人提过。等真有人被挡住再做。）

于是 JS 侧现在只能在自己知道布局变了的时候重设一次，**系统驱动的重新布局（旋转、动态字体、键盘）跟不上**。三条路：覆写 `layoutSubviews`（M2）、`+layerClass`（M2）、**KVO 监听 `view.layer.bounds` 做成 `layoutchange` 事件（不需要 M2）**。第三条该单独走一遍 SOP——它是新发明一个事件，而且 KVO 在布局动画期间的时序没实测过。

## 还没做成包的几项系统能力

原来是一张十行的表，做完的删了，下面是没做的几行。

| 能力 | 要项目写什么 | 能不能做 |
| --- | --- | --- |
| 相机 | `NSCameraUsageDescription` | **拍照已做**：`@nacrejs/camera`，用系统界面。扫二维码要接实时取景，是另一步。实测模拟器上「相机这种来源」是可用的，只是前后摄像头都不可用，所以大部分行为只能真机验 |
| 推送 | 推送的 entitlement | **通知的收到和点击已做**（`@nacrejs/user-notifications`，连同本地通知）。向苹果注册、拿设备令牌那一步能写，验不了：要显式包名的描述文件，通配的签不了；还要启动壳转发系统的回调 |
| 通用链接 | 关联域名的 entitlement | 能写，验不了：同上，另外要一个放了关联文件的真实域名 |
| Apple 登录 | 对应的 entitlement | 能写，验不了：同上 |
| 应用内购买 | 能力开关 | 先不做。系统的新接口只有 Swift，测试要商品配置；客户自己也说金融 App 一般不用 |

## 两处慢，原因没查

| | 实测 | 状态 |
| --- | --- | --- |
| SF Symbol 首次加载慢 | 每个新名字冷加载约 11.7 ms，在主线程上；一次建很多图标时主线程阻塞 1.0–1.5 s，运行时自己打出了 `Timer callback blocked the main thread` 警告 | 要查，可能需要后台预热 |
| 空闲后第一次渲染变慢 | 空闲 30 s 后重建列表 199–418 ms，紧接着再来一次只要 36–41 ms | **原因未查**。猜测是字节码被回收或 GC，未验证 |
| 桥本身不是瓶颈 | `new UIView` 约 4 µs，写属性 2–7 µs，建约束约 10 µs，`addSubview` 约 12 µs | 好消息 |

## iOS 26 暂时不跑

能启动的 iOS 26 模拟器只有系统默认建的那台 iPhone 17，而模拟器约定只用 iPhone Air；另建的一台 iOS 26 的 iPhone Air 启动失败（Data Migration Failed）。那个 iOS 26.0 模拟器系统本身也有毛病：中文全部显示成方框，连系统桌面也是——它加载不了苹方字体，日志里是 `Requested font not available`，原因没查到。现在的验收跑 iPhone Air（iOS 27.2）加真机（iPhone 14）。编译期那一层还在：最低版本仍是 26.0，`run-sim.sh` 照常列出没加版本保护的调用。要恢复，得先有一台能用的 iOS 26 设备。

没确认的：iOS 27 是不再有这个场景，还是只是没触发到。27.2 的模拟器上启动时那个键盘弹不出来。

## 客户反馈：工程和接入（2026-11-16）

逐条在仓库里核对过，都属实。先记下，还没开工。（原来还有一条「App 图标和启动屏不能配置」，2026-11-18 做了，见[能力包](capabilities.md#app-图标约定的文件名)。）

| 客户说的 | 核对结果 | 打算怎么做 |
| --- | --- | --- |
| 预编译运行时落后于源码时没有提示 | 属实。核对的当时预编译产物是 20:43 打的，源码 22:13 又改过，没有任何地方提醒 | **不做提示**（2026-11-16 定）：改成定时构建 xcframework，让它不会落后太久。定时构建怎么设还没定 |
| 改了给能力包的接口，版本号没升 | 属实。核心和七个包全是 `0.1.0`。CLI 里有「包要的运行时版本对不上就停」的检查，但版本号从没动过，它从没起过作用 | 定一个单独的接口版本号，`NacreExtension.h` 变了就必须升；加一条机械检查，头变了而版本没升就报 |
| 真机没有一键运行的脚本 | 属实，只有 `run-sim.sh` | 加 `run-device.sh`，签名用的团队和包名从配置里读 |
| 真机上看不到 `console` 输出 | 一半属实。输出写到了标准输出和系统日志，但要用特定的命令启动、或者在「控制台」App 里按子系统过滤才看得到，文档没写 | 并进上一条：脚本启动后把输出接到终端；文档补上怎么看 |
| 报错行号没有 source map | 属实 | 打包时生成 source map，运行脚本把输出里的 `main.js:<行号>` 换回源文件和行号。运行时不用改 |
| 改一行要重新打包安装 | 属实，一次二十多秒 | 先做省事的：只改了 JS 时跳过编译，把新的 `main.js` 换进模拟器里装好的 App 再重启。真正的开发模式（真机也能用、不重装）单独讨论 |

先后：真机脚本（含看日志）和行号还原只动脚本，随时可以做。接口版本号要改 CLI，要排在「原生模块」合并之前定，合并它的时候就该按新规矩升一次。

## 图标和启动屏：剩下的

形状和实现见[能力包](capabilities.md#app-图标约定的文件名)（2026-11-18 做完）。剩下两件事。

**以后再说的**（到时照同样的约定加）：Debug 包用另一个图标（`icon-debug.*`）；运行时切换的备用图标（`icons/<名字>.*`，外加 `application.supportsAlternateIcons` / `alternateIconName` / `setAlternateIconName()`）；深色模式的启动图（`launch-dark.png`）；用户自己的 `launch.storyboard` 要不要能引用 `launchScreen` 的颜色。

**没验的**（真机上 `icon.png`、深浅两个底色、居中的图都看过了，iPhone 14）：2 倍屏的机型；Icon Composer 和 Xcode 实际存出来的文件（只验了手写的）；桌面切到深色、着色样式时图标的样子；启动屏的图超过多少像素会整屏变黑，只在一台模拟器上量过。

## 以后有空再议

不重要的讨论项：现在的做法能用、也有依据，没有人被它挡着。记在这里是为了以后有空时拿出来重新看一遍，**不排进功能清单，也不算待办**。每条写明现在怎么定的、当时的依据、重新讨论时要先补什么。

| | 现在怎么定的 | 依据 | 重新讨论前要补的 |
| --- | --- | --- | --- |
| 动图的内存预算是多少、要不要做边播边解 | 解码后超过 64 MB 的动图只显示第一帧并打一条运行时日志；所有帧常驻内存，交给图层动画播（2026-11-15） | **64 MB 这个数没有外部依据**，是实现时定的一个常量。选图层动画是因为它不受主线程影响，而 JS 就在主线程上。见[动图](animated-image.md#预算解码后超过-64-mb-的不播) | 真实 App 里的动图多大（480×270、100 帧是 52 MB）；有没有人被这条线挡住。要放开就得做逐帧解码，那条路主线程一忙就停（实测占住 1 秒回调 0 次） |
| `Intl` 剩下的成员（排序、复数、相对时间、列表），以及 V8 要不要带 ICU | 不做。`Intl` 到 `NumberFormat` 和 `DateTimeFormat` 为止，其余交给 JS 层的垫片（2026-11-15） | 排序用系统的字符串比较对不上网页（288 组只有 4 组逐条相同）。V8 带 ICU 能一次解决全部、并且让 iOS 和 Android 结果相同，但要自己编 V8、自己维护那个构建；体积（多 10 MB 左右）不是问题，是维护成本大于收益。见[实现原理](intl.md#为什么到数字和日期为止) | 有没有 App 真的被排序或复数挡住；NativeScript 上游愿不愿意出一个带 ICU 的构建变体（那样就不用自己编）；开始做 Android 时再看一次——两端结果相同那时才有实际价值 |
| 定时器要不要有最小间隔 | 不设。`setTimeout(fn, 0)` 和 `setInterval(fn, 0)` 都是每次回一趟主队列，不加长（2026-11-15） | 模拟器上量过：一条 0 延迟的链连续跑着，2 秒 120 帧（对照 124）、触摸和系统事件都到。见[定时器](timers.md#要不要加一个最小间隔) | 真机上的同一组数；空闲 GC 在链不停时还跑不跑；耗电。浏览器是 4 ms、Node 是 1 ms |
