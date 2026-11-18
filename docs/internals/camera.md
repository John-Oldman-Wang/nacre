# 拍照

`UIImagePickerController` 是一个能力包（`@nacrejs/camera`），照[能力包](capabilities.md)的形状做的：原生在 `ios/Capabilities/Camera/NacreCamera.mm`，JS 在同目录的 `Builtin/parts/camera.js`，target 是 `NacreCamera`，交付出去的包在 `packages/camera/`，验收在 `acceptance/src/steps/camera.js`。核心的文件一个都没动。

用法见 [`UIImagePickerController`](../api/ui-image-picker-controller.md)。

只做了一件事：用系统的界面拍一张照片。从相册选图是另一个包；录视频、扫码、自己画取景界面要接实时取景，是以后单独的一步。

## 为什么是包，不在核心里

判据是[项目说明 3.8 节](../project.md#38-核心和能力包)的那一条：用户要不要因此在他自己的工程里写点什么。用相机的 App 必须在 Info.plist 里有 `NSCameraUsageDescription`，这是一句给最终用户看的话，不是每个 App 都该被要求写。

`UIImagePickerController` 本身在 UIKit 里，这个包不多链任何系统框架，所以「拆它省下什么」只有上面那一条。

包的清单里声明了 `requires.infoPlist: ["NSCameraUsageDescription"]`。这是工程配置那一步做的口子第一次被真的包用到（那一步的用例是拿假包测的），实测：

| 验收项目的 `nacre.config.json` | 生成时 |
| --- | --- |
| 没有 `ios.infoPlist` | 停下：`nacre: @nacrejs/camera needs NSCameraUsageDescription in Info.plist: a sentence shown to the user explaining why the app needs this permission. Put it in ios.infoPlist in nacre.config.json` |
| 写了 | 通过，`能力包：@nacrejs/camera、@nacrejs/keychain`；生成的工程描述里有这个键，App 的依赖里有 `NacreRuntime/NacreCamera` |

## 能力包用域登记

钥匙串登记的是两个处理函数（`NacreRegisterAsyncMethodHandler`、`NacreRegisterClassObjectHandler`），那是域登记之前的写法。这个包用的是 `NacreRegisterDomain`，一张表里七条通道：`read`、`write`、`call`、`callObject`、`construct`、`classCall`、`subscribe`，外加 `NacreRegisterBuiltinParts`。

能力包只能用 `NacreExtension.h`，而核心里登记的域用的是内部头 `NacreBridge.h`。照着核心的域写的时候，有三样东西在给能力包的头里没有，各自在这个文件里解决了：

| 缺的 | 核心的域怎么写 | 这里怎么写 |
| --- | --- | --- |
| 取参的宏（`NACRE_BOOL` 一类） | `sw.on = NACRE_BOOL(value, key)` | 自己写了一个 `BoolFromJS`：过桥是 JSON，`true` / `false` 解出来就是 `kCFBooleanTrue` / `kCFBooleanFalse` 两个单例，按身份比较，别的值报 `must be a boolean`。只校验，不转换 |
| `EncodeJSON` | 事件的负载、`call` 的返回值 | 负载用 `NSJSONSerialization` 自己编；`call` 的返回值只有 `"null"` |
| 别的域的事件名表（`IsPresentationEventName` 一类） | 直接调 | 页面出现和消失的四个名字在这里写了一份字面量。那边加了名字，这里要跟着加，否则新名字在拍照界面上订不上（报错，不是静默） |

这三样是「给能力包的头还不够用」的记录。`NACRE_ENUM_MAP` 和 `EnumError` 是有的，三个枚举直接用。

实测能力包的二进制从核心拿的符号是 6 个函数、0 个类：`NacreRegisterDomain`、`NacreRegisterBuiltinParts`、`NacreEmitEvent`、`NacreEmitEventWithJSON`、`EnumError`、`JoinEnumNames`。

## JS 里它继承 `UIViewController`，不是 `UINavigationController`

ObjC 里 `UIImagePickerController : UINavigationController`。JS 这边没有照搬，三个原因，第一个是硬的：

1. **照搬的话构造不出来。** JS 的 `UINavigationController` 的构造函数在 `constructNative` 之后立刻读一次栈（`this[kSyncStack]()`）、订一个内部事件 `@stack`。`constructNative` 只在「正在被 `new` 的那个类」那一层真的建原生对象，所以子类的 `super()` 走到这两句时句柄还没有，当场抛。这是核心那个类的写法决定的，从包里改不了。
2. **`@stack` 订上了也不行。** 核心接导航事件的做法是 `nav.delegate = 它自己的对象`。拍照界面的 `delegate` 和导航的是同一个槽位（属性的类型就是两个协议合起来），那一写会把这个包装的委托挤掉，之后拍到的照片和取消都到不了 JS。
3. **那个导航栈本来就不该给。** 它里面的页面是系统私有的，`pushViewController` 这类成员在拍照界面上没有合理的用法。

所以 `picker instanceof UINavigationController` 是 `false`，导航那一组成员都没有。这是「能力对齐，不是形状一致」允许的偏离，API 文档的对照表里写明了。

留下的一处不一致：**核心按原生的类认它。** 包装被回收之后再从原生读回来（`page.presentedViewController`），核心给的类名是 `UINavigationController`，得到的是一个导航控制器的包装。平时碰不到：拍照界面呈现期间，呈现它的页面持有它的包装；没呈现的拍照界面没有别的路能从原生读回来。真碰到时，那个包装上的导航事件也订不上（下一节），不会把委托挤掉。

## 订阅全部由这个包认领

登记进来的域比核心先被问到，而且按类的继承深度排，所以拍照界面上的 `addEventListener` 先到这里。`CameraSetSubscription` 的处理：

| 订的是 | 处理 | 为什么 |
| --- | --- | --- |
| `pick`、`cancel` | 认领，什么都不做 | 委托构造时就装好了，一直在发 |
| `@dismissed`（运行时自己给每个被呈现的页面订的） | 认领，什么都不做 | 见下 |
| `beforeappear` 等四个 | 不认领，落到核心的 appearance 域 | 它不碰委托，替换的是页面基类的方法 |
| `traitchange` | 到不了这里 | 核心在问各个域之前就按名字认走了 |
| 别的名字，包括 `beforeshow` / `show`、`beforedismiss` / `dismiss` / `dismissattempt` | 抛 `TypeError`，列出这个包的两个事件名 | 见下 |

**导航的两个名字必须拒。** 不拒的话它们落到核心的导航那一支，那一支认的是原生的类，会执行 `nav.delegate = …`，就是上一节第 2 条说的后果。

**模态的三个名字和 `@dismissed` 不让落到核心**，因为核心的接法是给这一页的 `presentationController` 挂委托。[弹窗那一步](alerts.md#弹窗上的订阅全部由这个域认领)撞过：系统不许动提示框的呈现委托，一动就抛。拍照界面许不许没有量到，所以取了不碰的那一边。核心现在给那一处加了保护，落过去也不会崩；不让落过去是因为没有必要，理由在下一节。

## 谁来关，谁来放开那条边

头文件在委托协议上写着：

> The picker does not dismiss itself; the client dismisses it in these callbacks.

所以委托的两个方法都实现，并且**原生不替 JS 关**。关不关是「App 做什么」，归 JS 的监听器。代价写在 API 文档里：只监听了 `pick` 的话，用户点「取消」之后界面留在屏幕上。

想过的另一种做法是「没有人监听 `cancel` 时原生自己关掉」，理由是 ObjC 里委托没实现那个方法时系统据说会自己关。没有做：那条系统行为没有量到，而且关掉之后「呈现者持有它」那条边得另找人放开。

这样定了之后，所有权这一侧就简单了：

| 边 | 怎么记、怎么放 |
| --- | --- |
| 呈现它的页面 → 拍照界面 | 核心的 `presentViewController()` 记。拍照界面只会被 JS 的 `dismissViewController()` 关掉，核心在那个 Promise 结算时按原生的真相放开 |
| 拍照界面 → 委托对象 | 关联对象（`delegate` 属性是 weak） |
| 委托对象 → 还没取走的照片 | `pending` 字典，JS 取完就删 |

`@dismissed` 是核心给「用户把页面拖走」准备的；弹窗和分享面板会被系统自己关掉，所以那个域要替它们补发。拍照界面没有这两种关法，所以认领下来不发。**这一条依赖「拍照界面拖不走」，没有验证。** 它如果能被拖走，后果是那条边多留到这个页面下一次呈现别的东西为止，包装晚一点回收，不会给错答案。

## 照片怎么带到事件上

事件的负载过桥是 JSON，带不了图片；核心的事件汇入口能带一个原生对象，但那是按事件名登记字段的（`beforeshow` 带 `viewController`），登记表在核心的文件里，而这里要带的是两张图加一个矩形。

所以分两步，都在这个包自己的文件里：

1. 委托收到 `imagePickerController:didFinishPickingMediaWithInfo:`，把系统给的 `info` 字典存进 `pending`（号 → 字典），发一个内部事件 `@imagepicked`，负载是 `{ token, cropRect }`。
2. JS 那一侧用 `ctx.internalEventHandlers` 登记了 `@imagepicked` 的处理函数。它按号取两次图（`nacre:takeImage:`，走返回对象的通道），再调 `nacre:dropResult:` 把那一条删掉，然后建一个 `pick` 事件、挂上三个字段、派发。

分享面板的完成结果是另一种绕法（构造时先挂一个内部的监听器去取）。那个做法有一处要小心：App 自己 `dispatchEvent` 一个同名事件时监听器也会跑。这里用内部事件，对外的事件只有一个来源，App 自己派发的 `pick` 上没有那三个字段，也不会去原生取东西。

`internalEventHandlers` 在核心里是给「系统当场来要东西」准备的（列表的 `cellProvider`），这里是延后一轮的通知，用的是同一张表。汇入口对两种时机不区分。

事件名照委托方法取，全小写，和导航的 `show`、列表的 `itemselect` 是同一个取法；字段名照 `info` 字典的键（`UIImagePickerControllerOriginalImage` → `originalImage`）。

`info` 里没有接的键：`MediaType`（只拍照片，永远是图片）、`MediaMetadata`（一个字典，里面不保证都是能过 JSON 的值）、`LivePhoto`、`MediaURL`、`ImageURL`。

## `sourceType`：读三个值，写一个值

枚举表里三个值都有，因为读是事实：`[[UIImagePickerController alloc] init]` 之后系统给的来源就是 `photoLibrary`（头文件：default value is UIImagePickerControllerSourceTypePhotoLibrary），`isSourceTypeAvailable` 问的也是事实。写只收 `camera`：

| 写的值 | 结果 |
| --- | --- |
| `photoLibrary`、`savedPhotosAlbum` | 抛，报错里指到 `@nacrejs/photos`。头文件把这两个值标成了 `API_TO_BE_DEPRECATED`（Will be removed in a future release, use PHPicker） |
| `camera`，这种来源在设备上不可用 | 抛。Apple 的文档说 ObjC 在这一句抛异常；这里先用 `isSourceTypeAvailable:` 查，给一句说得清原因的话。**这一支没有跑到过**：模拟器上这种来源是可用的，见[下一节](#模拟器上来源可用却没有摄像头) |
| `camera`，来源可用 | 写进去。查过了系统还是抛异常的话就地接住，变成带着系统原话的 `TypeError` |
| 表里没有的值 | 抛，可选值只列 `camera` |

**留着的一个口子**：新建之后不写 `sourceType` 就呈现，按系统的默认值出来的应该是选照片的界面（没有验证），而且委托照常会把选到的图发出来。这不是这个包支持的用法，但运行时没有拦。想过两种堵法：

- 构造时就把来源设成相机。那样来源不可用的设备上 `new` 就得抛；而且 `new` 出来的对象和 ObjC 的不一样。
- 呈现时检查。呈现走的是核心的 `presentViewController()`，问的是呈现者那个对象，这个包拦不到。

两种都没做。它是看得见的错（弹出来的界面不对），不是静默的错。

`cameraDevice` 和 `cameraFlashMode` 只在来源是相机时读写。头文件的说法是 camera additions available only if sourceType is UIImagePickerControllerSourceTypeCamera；系统在别的来源下读写它们会怎样没有量。这里两个方向都拒：写在原生拦；读的通道没有报错的出口，原生给 `null`，JS 的取值器据此抛。`cameraDevice` 写之前另外查一次 `isCameraDeviceAvailable:`。

## 模拟器上来源可用，却没有摄像头

动手时的前提是「模拟器没有相机，`isSourceTypeAvailable('camera')` 是 `false`」。这个前提是错的，合并后的验收（iPhone Air 模拟器，iOS 27.2，Debug）量到的是：

| | 模拟器上 |
| --- | --- |
| `isSourceTypeAvailable('camera')` | `true` |
| `isCameraDeviceAvailable('rear')`、`('front')` | 都是 `false` |
| `isFlashAvailableForCameraDevice('rear')`、`('front')` | 都是 `false` |
| `picker.sourceType = 'camera'` | 写得进去，不抛，读回来是 `camera` |
| 来源是相机时读 `cameraDevice`、`cameraFlashMode` | `rear`、`auto`，和头文件写的默认值一样 |
| `cameraFlashMode` 写 `off` / `on` / `auto` | 都读得回来 |

「相机这种来源可用」和「有摄像头」是两件事。第一版的验收里有一条断言把它们写成相等（`有相机这种来源 ＝ 至少有一个摄像头`），那一条失败了，其余的都过了。

回头看设计和用例，改了这几处：

- **那条断言删了**，改成只把四个值打出来。两者之间有没有别的固定关系（比如有摄像头时来源一定可用）也没有依据，不断言。
- **用例的两支改了名字和判据的说法。** 分支看的一直是 `isSourceTypeAvailable('camera')`，原来叫「没有相机 / 有相机」，现在叫「来源不可用 / 来源可用」。模拟器上走的是「来源可用」那一支，所以切到相机之后的默认值和读写是在模拟器上验到的；「来源不可用时写 `camera` 抛」那一支在模拟器上走不到，用例里会打一行未验证。任务要的那条「没有相机时是能 `catch` 的 `TypeError`」因此**至今没有被任何一次运行验到**，要一台来源不可用的设备。
- **摄像头的用例补全了。** 原来只在「有前置」时写 `front`、没有时断言被拒；现在前后两个各看一次，有就写进去读回来，没有就断言被拒、值不变。模拟器上两个都走被拒那一支，拒它们的是这个包自己的检查（`isCameraDeviceAvailable:`），不是系统。
- **报错的文案改了。** 来源不可用那一句原来写着 it has no camera (the iOS Simulator never has one)，这句话不对，去掉了。
- **属性的读写就地接 ObjC 异常。** `sourceType`、`cameraDevice`、`cameraFlashMode` 的写入，和后两个的读取，都包了一层：系统抛了就变成 `TypeError`，报错里带系统给的原因。核心的入口本来有保底，但读属性那条通道保底之后给 JS 的是空值；而「来源可用、没有摄像头」这种状态下系统还会在哪里抛，没有量全。
- **API 文档里「拍照之前先问」改成问两件事**：来源可用，并且至少有一个摄像头。只问第一件的话，模拟器上会去弹一个没有摄像头的拍照界面。

**没有改的**：`sourceType = 'camera'` 的判据还是只看 `isSourceTypeAvailable:`，没有加上「还得有摄像头」。系统在模拟器上接受这个写入，运行时照实反映，要不要弹由 JS 判断。

**来源可用、没有摄像头时把它弹出来会怎样，没有验证。** 能说的只有保护到哪一层：呈现走核心的 `presentViewController()`，那个入口接得住系统当场抛的异常，Promise 会被拒；呈现开始之后系统在别的时机抛的，谁也接不住。验收面板里的「拍照」按钮在这种状态下照样去弹，并且先打一行说明，有人点一下就知道了。

## 验证

这个对话里做过的（不占模拟器）：

| | 结果 |
| --- | --- |
| `check-api.sh` | 一致。三张枚举表自动和类型里同名的联合类型对上；故意把类型里的 `savedPhotosAlbum` 去掉、把 `allowsEditing` 标成只读，两处都报 |
| 类型检查 | 通过。验收里故意写错的 18 处 `@ts-expect-error` 都用上了；API 文档里的示例代码抽出来也过了 |
| 原生编译 | `xcodebuild` 编 `NacreCamera` 这个 target（Debug，模拟器），通过，`NacreCamera.mm` 没有警告；产物里有 `Builtin/parts/camera.js`。按模拟器的实测改过之后重新编过，同样通过 |
| CLI | 见上面「为什么是包」那张表 |

合并后的验收（iPhone Air 模拟器，iOS 27.2，Debug，由合并的那个对话跑）：第一版的断言除上一节说的那一条之外都通过。验到的是三个类方法返回布尔和写错参数时的报错、默认值、`allowsEditing` 的读写和转换、`sourceType` 的三种拒绝、来源不是相机时那两个属性的读写、来源切到相机之后的默认值和闪光灯的读写、没有前置摄像头时 `cameraDevice = 'front'` 被拒、事件名的认领和拒绝。

**没有验证的：**

- **按实测改过之后的用例和实现还没有重新跑。** 新加的几条（两个摄像头各看一次、被拒之后值不变）一次都没跑过。
- 来源不可用时 `sourceType = 'camera'` 抛 `TypeError`。模拟器上走不到这一支。
- 拍照界面的呈现，包括模拟器上「来源可用、没有摄像头」时弹出来是什么。会呈现页面的类不跑 App 查不出问题，[弹窗那一步](alerts.md)就是合并后才崩出来的。
- 真机上的一切：两个事件来不来、照片取不取得到、裁剪框的数值和单位、关掉之后包装回不回收、权限提示框、拒绝权限之后的样子、拍照界面是不是全屏、拖不拖得走、不写 `sourceType` 就呈现会出来什么、写一个存在的摄像头之后读回来。
- Release 配置没编。

## 没做的

| | 为什么 |
| --- | --- |
| 把照片编码成 JPEG / PNG 的字节 | 这是 `UIImage` 上的能力，在核心里，还没有。没有它，拍到的照片只能显示和分享，不能上传也不能存成文件。这是这个包现在最大的缺口，但不归这个包做 |
| 从相册选图、存进相册 | 另一个包。相册要的是另一句权限文案 |
| 录视频（`mediaTypes`、`cameraCaptureMode`、`videoQuality` 一组） | 没有视频的类型可以交给 JS |
| `showsCameraControls`、`cameraOverlayView`、`cameraViewTransform`、`takePicture` | 自己画取景界面。和扫码一样要接实时取景，以后单独的一步 |
| `availableMediaTypesForSourceType:`、`availableCaptureModesForCameraDevice:` | 只拍照片，问出来的东西用不上 |
| 查询和申请相机权限（`AVCaptureDevice`） | 要链 AVFoundation。系统会在第一次打开拍照界面时自己问 |
| `info` 里的拍摄参数、实况照片 | 见上面「照片怎么带到事件上」 |
