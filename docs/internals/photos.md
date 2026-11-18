# 相册

`@nacrejs/photos` 是一个[能力包](capabilities.md)：从相册选图、把图片存进相册。原生在 `ios/Capabilities/Photos/NacrePhotos.mm`，JS 在同一个目录的 `Builtin/parts/photos.js`，类型和清单在 `packages/photos/`，验收在 `acceptance/src/steps/photos.js`。核心一个文件都没动。

用法见 [API 文档](../api/photos.md)。

六个类：`PHPickerFilter`、`PHPickerConfiguration`、`PHPickerViewController`、`PHPickerResult`、`NSItemProvider`（PhotosUI 和 Foundation），`PHPhotoLibrary`（Photos）。

## 为什么是一个包

判据是 [project.md 3.8 节](../project.md#38-核心和能力包)那一条：用户要不要因此在他自己的工程里写点什么。存图要 `NSPhotoLibraryAddUsageDescription`，包的清单里声明了这个要求（`requires.infoPlist`），项目没写时 CLI 在生成工程时就报错。

选图本身不需要任何权限，但它和存图在同一个包里，所以只用选图的 App 也要写那一句。这不是多余的要求：上传时的检查（ITMS-90683）扫的是二进制里的符号，这个 framework 链接了 Photos，装了它就得写。要让只选图的 App 不写，得把选图和存图拆成两个包（选图只链 PhotosUI）。没有这样做：只链 PhotosUI 的二进制过不过得了那项检查没有依据，等有人真的被这一句挡住再量。

## 只用「添加」那条路

相册有两级权限：

| 级别 | 能做什么 | 要项目写的键 |
| --- | --- | --- |
| 添加（`PHAccessLevelAddOnly`） | 往相册里存，读不到已有的 | `NSPhotoLibraryAddUsageDescription` |
| 读写（`PHAccessLevelReadWrite`） | 读整个相册 | `NSPhotoLibraryUsageDescription` |

这个包只声明了第一句，所以所有会走到第二级的入口都没有接，而且在原生这一侧拦死：

- 枚举表里只有 `addOnly`。`'readWrite'` 不是「写错了」，是「不支持」，报错单独写了一句，指到选图界面。
- 没接旧的 `+authorizationStatus` / `+requestAuthorization:`（不带级别的那一对申请的是读写）。
- `PHPickerConfiguration` 只有 `init`，没有 `initWithPhotoLibrary:`。后者让结果带上相册里的标识符，而标识符要读写权限才用得上。
- `performChanges` 只做创建。存之前原生自己再查一次「添加」的授权状态，不是已授权就直接拒掉，不往下调。

最后一条的原因：系统的 `performChanges:` 在没问过用户时自己会弹提示框，但它按哪个级别申请不由调用方指定。没有对应的那句文案就去申请，系统不是报错，是直接终止 App。所以顺序固定成：part 里先按「添加」显式申请一次（`requestAuthorizationForAccessLevel:`），拿到已授权再调 `performChanges:`。`performChanges:` 自己隐式申请时到底按哪个级别，没有量。

同一个理由，申请权限之前原生先看一眼 Info.plist 里有没有那一句，没有就拒掉 Promise（`InvalidStateError`）。用 CLI 生成的工程走不到这里；它接的是绕过 CLI 的情况。

## PhotosUI 的参数错误接不住

桥的入口有一层异常保护：UIKit 抛的 ObjC 异常会被接住，转成 JS 能 `catch` 的 `TypeError`（见[参数转换](conversion.md)）。这一层对 PhotosUI 的选图这一组**不起作用**：它是用 Swift 写的，参数不对时是断言失败，进程直接终止，没有异常可接。

量到两处（量法见[下面](#实测)）：

| 写法 | 结果 |
| --- | --- |
| `[PHPickerFilter anyFilterMatchingSubfilters:@[]]` | 进程终止（SIGABRT），`@try` 接不住 |
| `selectionLimit = -1` 之后 `initWithConfiguration:` | 配置存得进去；建选择器时进程终止 |

所以这两处在到达系统之前拦掉，JS 和原生各拦一次：

- 组合筛选条件时空数组抛 `TypeError`（`allFilterMatchingSubfilters:` 没单独量，按同样处理）。
- `selectionLimit` 写负数抛 `TypeError`；建选择器之前原生再看一眼配置里的值。

枚举没有这个问题：值只能从名字表里来。实测往 `selection` 里写一个不存在的数值系统不拦，但 JS 这一侧写不出这种值。

这一类问题静态检查发现不了，只能一个一个量。**没接的那些成员（`preselectedAssetIdentifiers` 等）接之前都要先量参数不对时会怎样。**

## 三个回调各去了哪

| ObjC | JS | 归到哪一类 |
| --- | --- | --- |
| 委托的 `picker:didFinishPicking:` | 选择器上的 `pick` 事件，带 `results` | 通知 |
| `loadObjectOfClass:completionHandler:` | 返回 Promise | 一次调用的应答 |
| `requestAuthorizationForAccessLevel:handler:`、`performChanges:completionHandler:` | 返回 Promise | 一次调用的应答 |

### 选完了：事件

`picker:didFinishPicking:` 不是某次调用的应答：它登记在选择器上，等用户操作时由系统来调；`selection` 是连续的那两种时它每次选中的项变了都来一次；用户把界面拖走时它可能一次都不来。照[原则 5](../project.md#原则)，重复发生的通知是事件。

事件名照已有的写法取委托方法里说事的那一段、全小写：`pick`，和 `tabBarController:didSelectViewController:` 写成 `tabselect` 是同一个处理。

委托从构造起就装着（选择器对它是弱引用，所以用关联对象让选择器自己拿着），每次都发，不看 JS 订没订。

### 选择器上别的订阅不认领

弹窗那个域把 `UIAlertController` 上的订阅全部认领了，因为系统不许改提示框的呈现委托（见[系统弹窗和分享面板](alerts.md#弹窗上的订阅全部由这个域认领)）。选择器没有照做：订阅函数只认领 `pick`，别的名字（页面的三个关闭事件、出现和消失的四个、运行时自己订的 `@dismissed`）都落到核心和别的域，和普通页面一样。

这意味着核心会在呈现时给选择器挂一个呈现委托。依据只有两条，都不是实测：`PHPickerViewController` 是公开的 `UIViewController` 子类，头文件里没有禁止；核心装委托的那一处现在有异常保护（接弹窗时加的），最坏的情况是装不上、打一行日志，选择器被拖走时 `dismiss` 收不到、「呈现者持有它」那条边留到下次呈现。**这一段没有验证**，要真的弹一次、拖走一次。

如果选择器内部自己也用呈现委托来发现「被拖走了」，核心换掉它之后，拖走时系统就不再调 `didFinishPicking:`。API 文档里把「拖走时派不派发 `pick`」标成了未验证，原因在这里。

### 取图和存图：Promise

三个 completion 都是那一次调用的应答，所以方法返回 Promise，名字去掉 `completionHandler:` / `handler:` 那一段。

`requestAuthorizationForAccessLevel:` 在 ObjC 里是类方法，而桥上的异步通道只有实例的（`callAsync` 要一个对象）。JS 的静态方法里用 `sharedPhotoLibrary` 当那个对象，原生按对象的类认领。这是通道的形状带来的，JS 开发者看到的仍然是类方法。

级别写错时**同步抛**，不是拒绝 Promise：静态方法先调一次同步的 `authorizationStatusForAccessLevel()`，名字认不认由原生的那张表说，认不出当场抛。和 Keychain 的参数校验是同一个约定（参数的错在 JS 一侧同步抛，过程里的错拒绝 Promise）。

## 带不过桥的两样东西：暂存再取

登记进来的域有两处带不了原生对象：

| 要带的 | 现成的通道 |
| --- | --- |
| 取图的结果，一个 `UIImage` | 异步结果 `NacreAsyncResult` 只有布尔、JSON、字节三种。核心自己的 `prepareForDisplay` 能兑现成对象，用的是 `NacreRuntime` 的内部方法，不在给能力包的头里 |
| 选图的结果，一组 `PHPickerResult` | 事件出口 `NacreEmitEventWithObject` 只带一个对象 |

两处用同一个做法，全在这个包自己的文件里：原生把对象存进一张表（号 → 对象），把**号**交给 JS；JS 紧接着用一次同步调用按号取走，取一次就清。

```
取图：  loadObjectOfClass 的完成回调 → 回主线程 → 存图、拿到号 → Promise 兑现成号
        part 里 .then((token) => nativeCallObject(provider, 'nacre:takeLoadedObject', [token]))

选图：  picker:didFinishPicking: → 存结果、拿到号 → 发内部事件 @photos-picked，带 { token }
        part 里登记的处理函数按号取走那一组，建出 pick 事件，挂上 results，派发
```

几条细节：

- **表只在主线程上用。** 取图的完成回调在系统自己的队列上来，先回主线程再存。
- **用号，不按对象存。** 同一个提供者可以同时取两次，按对象存分不清哪次是哪次。
- **内部事件用的是核心给域留的口子**：`@` 开头的事件不派发给监听器，交给 `ctx.internalEventHandlers` 里登记的函数（列表的 `cellProvider` 也是这么接的）。和弹窗那个域「构造时先挂一个监听器、在里面取数据」的做法比，这样不占监听器列表，App 自己 `dispatchEvent(new Event('pick'))` 时也不会去取一次空的。
- **没人订也照样取走。** 处理函数不看有没有监听器，所以表里不会留下没人要的结果。引擎已经不在了的时候会留下，那时进程也快结束了。

这是两处要记下来的缺口：**异步结果不能是原生对象，事件不能带一组对象。** 通讯录和相机那两个包多半也会撞上（选联系人、拍照的结果都是对象）。核心补上之后，这里的两段可以各换成一句。

## `performChanges` 为什么收一个对象

ObjC 的写法是：

```objc
[library performChanges:^{
  [PHAssetChangeRequest creationRequestForAssetFromImage:image];
} completionHandler:^(BOOL success, NSError* error) { … }];
```

第一个参数是一段代码，要做的修改通过在里面调类方法来表达。照[同步回调](events.md#m1b同步回调系统问js-当场答)的做法，这种「当场执行的一段代码」可以把 JS 函数登记成号、让原生在 block 里调回来。这里做不了：系统是在它**自己的队列**上执行这段代码的，不在主线程，而 JS 只能在主线程跑。

所以 JS 这一侧不传代码，传「要做哪种修改」：

```js
library.performChanges({ creationRequestForAssetFromImage: image })
```

方法名照规矩取 selector 的第一段。参数是一个对象，键用的是 ObjC 里表达那种修改的方法名原文，这样照着 Apple 的文档能对上。那段代码由原生来写，里面只有一句。

这个形状是这次自己定的，已定的规矩里没有现成的答案（规矩说的是「其余段进 options」，而这里换掉的是第一个参数本身）。想过的另外两种：

| | 为什么没用 |
| --- | --- |
| `PHAssetChangeRequest.creationRequestForAssetFromImage(image)` 直接返回 Promise | 名字说的是「建一个请求」，实际做的是「存进去」；ObjC 里它也不能单独调，只能写在修改的代码块里 |
| 另起一个名字（`saveImage()`） | ObjC 里没有这个名字，照着 Apple 的文档查不到 |

对象里有不认识的键会抛，不静默忽略：以后接别的修改（存视频、删除）时加键，现在写了就该知道它没生效。

## `NSItemProvider` 为什么是一个类

系统给的结果是 `PHPickerResult`，图片要从 `result.itemProvider` 上取，而 `NSItemProvider` 是 Foundation 的类，不是相册独有的（拖放、分享扩展也用它）。两种做法：

| | |
| --- | --- |
| 照 ObjC 暴露 `NSItemProvider` 这个类 | 和 Apple 的文档一一对上。代价是一个 Foundation 的类由一个能力包来定义 |
| 把取图的方法直接放到 `PHPickerResult` 上 | 少一个类，但那是 ObjC 没有的形状 |

选了第一种，按底层那一层的规矩（Apple 定义、我们映射）。代价要记下来：**核心或者别的包以后也要用 `NSItemProvider` 时，定义得搬到核心里**，两处都 `defineNativeClass('NSItemProvider', …)` 的话后来的会盖掉先来的。搬的时候 JS 开发者看到的 API 不变。

`loadObjectOfClass(UIImage)` 的参数是类本身，和列表的 `registerClass(UICollectionViewListCell, …)` 是同一种写法。现在只认 `UIImage`：过桥的是类名，原生那一侧写死了 `UIImage.class`。传别的类同步抛，不拒绝 Promise。

`new NSItemProvider(image)`（`initWithObject:`）也接了。选图用不到它，接它是因为它让取图这条路**不用界面就能验**：验收里用一张打包的图建一个提供者，再取回来，暂存再取的那一段在自动跑的部分里就走得到。

## 筛选条件的相等

实测 `PHPickerFilter.imagesFilter` 每次读给的是一个新对象（`isEqual:` 为真，指针不同）；`config.filter` 是 `copy` 属性，读回来的也不是写进去的那个。照搬的话：

```js
PHPickerFilter.imagesFilter === PHPickerFilter.imagesFilter   // false
```

包装机制保证的是「同一个原生指针永远是同一个 JS 对象」，这里指针本身就不同。处理分两半：

- **现成的十二个**在 part 里按名字留住（一个 `Map`），读几次都是同一个包装。它们是不可变的常量，留住没有副作用。
- **组合出来的、读回来的**不池化，给了 `isEqual()`。这是 [project.md 里那条 TODO](../project.md#7-还要做的)（不可变值对象的相等性）在这个包里的做法，和那边倾向的方案一致：能按名字池化的池化，其余给 `isEqual()`。

`isEqual()` 现在只定义在 `PHPickerFilter` 上。`NSObject` 上哪天统一加了，这里的可以删。

## 所有权

`check-api.sh` 核对的那一条：原生收对象参数的 selector，JS 一侧要么记一条所有权边，要么就地标豁免。这个包里：

| | 处理 |
| --- | --- |
| `config.filter` | 读写都走 `nativeGetOwned` / `nativeSetOwned` |
| `picker.configuration`、`result.itemProvider` | 读走 `nativeGetOwned` |
| `new NSItemProvider(image)` | `own(this, 'object', image)`：提供者拿着那张图 |
| `PHPhotoLibrary.sharedPhotoLibrary` | 由类自己拿着，和 `UIPasteboard.generalPasteboard` 一样 |
| `isEqual:`、三个组合筛选条件的类方法 | 标了豁免：只比较，或者返回的是新对象 |
| `new PHPickerViewController(config)` | 不记：选择器把配置复制了一份 |
| 呈现它的页面 → 选择器 | 核心的 `presentViewController()` 记的 |

选中的结果（`PHPickerResult`）没有谁持有：它们只在事件对象上。监听器返回之后 JS 不再拿着就被回收，原生对象跟着释放。

## 实测

没有跑模拟器（只有一台，验收由合并的对话统一跑）。下面的事实是在 **macOS 27 上用命令行程序**量的：PhotosUI 的这几个类 macOS 上也有，是同一份实现。它量不到 iOS 上界面的事，`PHPickerViewController` 在 macOS 上的父类也不一样（`NSViewController`）。

| | 结果 |
| --- | --- |
| `PHPickerFilter.imagesFilter` 读两次 | 指针不同，`isEqual:` 为真 |
| 图片和视频两个筛选条件 `isEqual:` | 假 |
| 同样的组合建两次 | 指针不同，`isEqual:` 为真 |
| `[filter copy]` | 得到另一个对象 |
| `anyFilterMatchingSubfilters:@[]` | 进程终止，`@try` 接不住 |
| 配置的默认值 | `selectionLimit` 1，`filter` nil，另外三个枚举都是 0，`preselectedAssetIdentifiers` 空数组 |
| `config.filter` 写进去再读 | 指针不同，`isEqual:` 为真 |
| `selectionLimit = -1` | 配置不拦，读回来是 -1 |
| `selection` 写一个不存在的数值 | 不拦 |
| 拿 `selectionLimit` 是 -1 的配置建选择器 | 进程终止 |
| `picker.configuration` | 不是传进去的那个对象；两次读是同一个指针；之后改原来的配置，它不变 |
| 刚建好的选择器的 `delegate` | nil |
| `authorizationStatusForAccessLevel:` | 命令行程序里是 0（没问过），不弹任何东西 |
| 空的 `NSItemProvider` | `registeredTypeIdentifiers` 空数组，`suggestedName` nil |

## 验证

| | 结果 |
| --- | --- |
| 验收用例先写 | 没有实现时这一步在第二条断言处抛出（全局上没有 `PHPickerFilter`），入口记一条「步骤中途抛了」。这是照代码推的，测试的那个提交没有单独跑过 |
| `check-api.sh` | 一致。故意弄坏三处（类型里删一个属性、枚举多一个值、只读改成读写）各报一条 |
| 类型检查 | 通过。验收里 35 处故意写错的地方都标了 `@ts-expect-error`，没有一条是多余的 |
| 原生编译 | `NacrePhotos` 这个 target 在模拟器的 SDK 上 Debug 和 Release 各编过一遍，这个文件没有警告 |
| 从核心拿的符号 | 1 个类、6 个函数，都在 `NacreExtension.h` 里 |
| Release 下登记的类 | 还在：符号表里有，带 `+load` 的类登记的那个段里有一条 |
| part 的纯 JS 分支 | 在 Node 里用一个不带原生的假环境跑过：校验、报错文案、内部事件的处理函数、Promise 的串接 |

## 没验证的

**这个包一行都还没有在 iOS 上跑过。** 上面的验证都不经过运行时。

自动验收能验到、但还没跑的：六个类的创建和报错、属性的读写、枚举、筛选条件的组合和相等、选择器的构造和配置的复制、订阅和退订、用自己建的提供者取图（暂存再取那一段）。其中有几条期望来自 macOS 的探针或者头文件，iOS 上不一定一样：一张图的提供者 `hasItemConformingToTypeIdentifier('public.image')` 是真、`canLoadObjectOfClass(UIImage)` 是真、取出来的图有尺寸。

要人点了才知道的（验收界面「相册」区块里的四个按钮，结果打在日志里）：

- 选图界面弹不弹得出来、有没有弹权限提示框。
- `pick` 来不来、`results` 对不对、取消时是不是空数组。
- 核心给选择器挂的呈现委托装不装得上；拖走时 `dismiss` 和 `pick` 各来不来。
- 从真的选中项上取图：要等多久、HEIC 取不取得出来、iCloud 上的照片。
- 对已经被拖走的选择器调 `dismissViewController()` 会怎样。
- 存图：提示框上是不是那句文案、同意和拒绝两条路、存进去的图在不在。
- `performChanges` 被拒时的 `code` 和 `domain`。

通道上的一条：登记表里的 `callAsync`、`callObject`、`callObjectArray`、`classCall` 在[接入点重构](adding-classes.md#没验证的)时是「接了线但没有域在用」的；这个包四条都用了，是不是第一个用户没有逐条去查。

真机没有跑。预编译的 xcframework 没有打。

---

← 返回[实现原理](README.md) ・ [项目说明](../project.md)
