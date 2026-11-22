# 实现原理和细节

面向**改运行时的人**。这里写「怎么实现的」「为什么这么实现」「实测出来什么」。

和另外两处的分工：

| 目录 | 写什么 | 面向谁 |
| --- | --- | --- |
| [`docs/api/`](../api/README.md) | 怎么用、参数、默认值、效果、坑、ObjC ↔ JS 对照表 | 用 Nacre 写 App 的人 |
| **`docs/internals/`** | **桥怎么搭的、为什么这么选、实测数据、被否掉的方案** | **改运行时的人** |
| [`docs/project.md`](../project.md) | 项目定义、已定的规矩和选型、目录约定、SOP、还要做的 | 这个项目本身 |

判据：

- 「`shadowOpacity` 默认 0，不设就看不见」→ **api**，不知道这条就不会用
- 「`CGColorRef` 转 `UIColor` 为什么会丢动态色」→ **internals**，不知道也会用
- 「颜色的上层写法定成字符串」→ **project.md**，这是一个决策

## 参考

| | |
| --- | --- |
| [拆出 core](core.md) | 两端共用的引擎和 Web 标准内置脚本怎么从 ios/ 拆出来、开了哪几个口子、怎么证明对 iOS 没影响 |
| [包装机制](wrapper.md) | 句柄表、身份一致、所有权镜像、GC；只在 Release 下崩的悬空指针 |
| [事件模型](events.md) | iOS 四套并行的事件机制、实测的派发顺序 |
| [结构体](structs.md) | 为什么只读、为什么不用 Object.freeze |
| [桥的通道](bridge.md) | 通道是怎么一条条长出来的、JSON 编码、错误出口 |
| [枚举和位掩码](enums.md) | 名字 ↔ 数值的映射为什么只能在原生层 |
| [颜色](ui-color.md) | 相等性实测、动态色、上层写法的推导 |
| [图层](ca-layer.md) | CGColor 的代价、和 UIView 重叠的属性、路径身份靠镜像、shadowPath |
| [动画](ca-animation.md) | keyPath 定类型、拷贝语义、Infinity 过不了 JSON |
| [Auto Layout](auto-layout.md) | 约束的所有权、NSException 的接法 |
| [滚动](scrolling.md) | delegate trampoline、scroll 事件的合并、实测 |
| [导航](navigation.md) | 页面栈的持有边、事件带数据的判据、父类挡子类的闸 |
| [系统弹窗和分享面板](alerts.md) | 三个 block 各去了哪：按钮的 handler 和完成回调为什么是事件不是 Promise；事件的数据为什么绕一下；系统自己关掉弹窗之后留着的那条边 |
| [外观特征](traits.md) | 变化通知为什么不卡在同步回调上、事件名先按名字认走、三条实测 |
| [毛玻璃](effects.md) | 玻璃效果为什么每次读回来都是新对象、直接加子视图为什么在原生一侧拦、量到的默认值；验收还没跑 |
| [本地存储](storage.md) | 为什么叫 get/set、验值为什么在 JS 侧、落盘怎么验 |
| [文件读写](filesystem.md) | 为什么有上层对象、名字为什么不叫 files、错误的两层分工 |
| [页面的覆写点](page-overrides.md) | 方向和状态栏为什么用原生预置子类、替换基类为什么对状态栏不行、转屏时哪个时机在动画里、`ios.orientations` |
| [App 包](bundle.md) | `fileSystem.assets` 为什么指向 `assets/` 而不是整个包、`NSBundle` 接了哪些、字体的名字为什么放在这里、实测 |
| [输入框](text-input.md) | 为什么不卡 M1b、撤掉了哪个属性、三个坑；多行输入框的拦截事件和 linkclick |
| [多行输入](text-view.md) | 事件为什么走通知不占委托、`NSRange` 怎么在登记的域里定义、量到的默认值和连带行为；验收还没在 App 里跑 |
| [列表](collection-view.md) | 数据为什么用快照不用下标、单元格是怎么从 JS 带回系统的、委托的槽位怎么和滚动事件共用、单元格的持有边；点选没有验证 |
| [富文本](attributed-string.md) | 属性字典（对象和标量混着）怎么摊平了过桥、读为什么要过两次、段落样式和阴影为什么存副本、下划线为什么不能当位掩码解；验收还没跑 |
| [页面的出现和消失](appearance.md) | 为什么是事件不是继承、为什么替换基类的方法而不是编译子类、各种切换下量到的派发顺序 |
| [被链接打开](open-url.md) | `openurl` 为什么靠运行期给场景委托补方法、冷启动的地址怎么拿到并排在 `sceneconnect` 后面、`ios.urlSchemes` 怎么写进工程、还没实测的系统行为清单 |
| [转圈和进度条](indicators.md) | 新建的转圈为什么是隐藏的、进度条的高度为什么写不进去、着色和图片二选一；量到的默认值 |
| [工具条和搜索框](bars.md) | 搜索框的委托回调是里面几个控件转出来的、`placeholder` 的 null 和空串、对象数组的写通道第一次有域用；工具条的高度探针里 44、App 里 48；量到的默认值 |
| [Keychain](keychain.md) | 默认访问级别为什么比两家主流保守、枚举为什么绕一道序号 |
| [跟踪授权和广告标识](app-tracking-transparency.md) | 类方法的申请怎么变成 Promise、全零的标识为什么不换成 `null`、缺权限文案时拦两道；验收还没在 App 里跑 |
| [面容 ID 认证](local-authentication.md) | 为什么是一个包、`canEvaluatePolicy:error:` 为什么拆成两个方法、参数错误为什么先过一次桥同步抛、Mac 上量到的默认值；还没在 App 里跑 |
| [定位](core-location.md) | 位置为什么是值不是包装、两个 Promise 怎么保证结算、委托为什么建对象时就装、出错的事件为什么不叫 `error`、谁拿着 manager；验收还没在 App 里跑 |
| [通知](user-notifications.md) | 为什么只有通知中心是包装、委托为什么在加载时就装、已经有别人的委托时怎么共处、启动时的那一次点击怎么留着、前台显示为什么是预先设的；在 Mac 上执行过原生那一半，验收还没在 App 里跑 |
| [图片](ui-image.md) | Asset Catalog 实测、解码线程 |
| [动图](animated-image.md) | GIF / APNG / WebP：帧挂在哪、为什么用图层动画播、预算、实测 |
| [`Intl`](intl.md) | 为什么结果和 Safari 逐条相同、为什么运行时里有了 Swift、哪些选项不支持 |
| [地区](locale.md) | 为什么不做 `navigator`、地区变了的事件为什么挂在 `application` 上、没接的成员、实测 |
| [定时器](timers.md) | 调度、时间预算、未处理拒绝的结算、`performance.now()` 的时钟 |
| [系统能力](system.md) | `UIDevice` 为什么只做静态信息；剪贴板为什么是同步属性、一次写入为什么收到两次 `change`；触感反馈为什么不给 `new` |
| [数值控件](value-controls.md) | 开关、滑块、步进器、分段、页码、日期：UIKit 对越界的值有三种反应、哪些先拦、日期怎么过桥 |
| [参数转换](conversion.md) | `{ atIndex: undefined }` 为什么会闪退、为什么照 Web IDL、转换为什么必须在 JS 一侧 |
| [随机数](crypto.md) | 随机源归宿主、填的是视图不是 buffer、为什么照搬 65536 的上限 |
| [Web 标准的五个全局](web-globals.md) | `TextEncoder` / `TextDecoder` / `atob` / `btoa` / `structuredClone`：为什么写在引擎的 C++ 里、解码为什么没用 V8 的、原生对象为什么不能克隆、在开发机上和 Node 对过什么；还没在 App 里跑 |
| [网络](network.md) | fetch 的线程分工、边下边读和背压、URL 和 WHATWG 的差异 |
| [扫码](av-capture.md) | 为什么接 AVFoundation 不接系统的扫码页面、包怎么分、`detect` 的值怎么换算回原生、和头文件对不上的地方 |
| [远程推送](push.md) | 为什么单独成包、怎么给 App 的委托补方法、同时等着的只注册一次、`push` 事件和 `waitUntil`、两种签名下怎么验 |
| [无障碍](accessibility.md) | 为什么只挂在 UIView 上、特征的私有位、系统控件的默认值是读屏开着时现算的 |
| [后台任务](background-task.md) | 为什么是传一个函数、过期时当场进 JS、走类方法的通道 |
| [WebView](web-view.md) | 为什么照 Electron、为什么套一层壳、`backgroundThrottling` 为什么做了又拿掉、进程数和存储分区的实测 |
| [能力包](capabilities.md) | 一个能力拆成单独的 framework 之后怎么接进核心、核心给它的面有多大、怎么往核心对象上挂属性 |
| [拍照](camera.md) | 能力包第一次用域登记、给能力包的头里缺的三样；JS 里为什么不继承导航控制器；订阅为什么全部认领；照片怎么带到事件上；模拟器上来源可用却没有摄像头；呈现和真机都没有验证 |
| [相册](photos.md) | 只用「添加」那条路怎么拦死；PhotosUI 的参数错误为什么接不住；原生对象过不了异步结果和事件时怎么暂存再取；`performChanges` 为什么收一个对象 |
| [通讯录选择器](contacts.md) | 「不需要通讯录权限」确认到了哪一层、委托实现了哪些方法怎么对应成监听了哪些事件、对象怎么随事件带到 JS；整个包还没在模拟器上跑过 |
| [bindgen](bindgen.md) | 从 SDK 的头文件生成绑定：要解决什么、定了什么、提取和对照怎么做的、机械规则离手写的结果有多远 |
| [接入一组类](adding-classes.md) | 接一组原生类要写哪些文件、哪些不许碰、原生怎么登记一张表；为什么从写死的 if 链改成登记 |
| [原生模块](native-modules.md) | 给 App 团队和第三方的那一层接口：为什么和 `NacreDomain` 分两层、登记和报错为什么这么定、二进制怎么过桥、验证到了哪里 |
| [隐私清单](privacy-manifest.md) | 三类是 `nm` 扫出来的不是读源码读出来的、理由码怎么选、为什么要扫 selector |
| [验收怎么判通过](acceptance.md) | 一条命令一个退出码、结束标记、断言为什么改成严格相等、断言名单的基线和「可以缺」、故障注入的结果 |
| [交付物、工程和类型检查](delivery.md) | 交付给谁、`@nacrejs/ios` 里有什么、工程为什么分成运行时和宿主两个 target、类型定义和运行时怎么核对一致 |
| [还没做的设计和没解的问题](pending.md) | 方案想过但还没实现的设计（屏幕方向、图标和启动屏），和已经知道但还没解决的问题的分析。`project.md` 的「还要做的」里每条一行，分析在这里 |
| [运行时](runtime.md) | V8 启动、主线程、严格模式、空闲 GC |

> 还没写的条目会随着对应能力的整理陆续补上——**新增或改动一块能力时，`api/` 和 `internals/` 两份一起写**，规则见[项目说明](../project.md#文档怎么分)。

---

← 返回[项目说明](../project.md)
