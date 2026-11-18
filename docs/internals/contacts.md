# 通讯录选择器

`@nacrejs/contacts` 是一个[能力包](capabilities.md)：系统的选联系人界面 `CNContactPickerViewController`，它交回来的四个只读的值 `CNContact`、`CNLabeledValue`、`CNPhoneNumber`、`CNContactProperty`，和把姓名拼成一行的 `CNContactFormatter`。用法见 [API 文档](../api/contacts.md)。

| | 文件 |
| --- | --- |
| 原生 | `ios/Capabilities/Contacts/NacreContacts.mm` |
| JS | `ios/Capabilities/Contacts/Builtin/parts/contacts.js` |
| 工程 | `ios/project.yml` 里的 target `NacreContacts`，链 ContactsUI、Contacts、UIKit |
| 包 | `packages/contacts/`：清单、类型 |
| 验收 | `acceptance/src/steps/contacts.js` |

它是第一个用 `NacreRegisterDomain` 登记的能力包（钥匙串用的是更早的那两个单通道的登记函数）。原生那一半只 `#import <Nacre/NacreExtension.h>`，核心的文件一个都没改。

**这一页里凡是没写「量过」的，都没有在模拟器上跑过**：接这个包的对话不占模拟器，自己跑的只有 `check-api.sh`、类型检查、编译，和下面写明量法的那几样。

## 不需要通讯录权限：怎么确认的

这个包存在的理由是「用户选联系人不需要权限」。所以清单里 `requires.infoPlist` 是空数组，装它的项目不用写 `NSContactsUsageDescription`。这句话的依据分三层，确认到哪一层如实记下来。

### 确认了的

**1. 系统头文件的原话。** `ContactsUI.framework/Headers/CNContactPickerViewController.h`（Xcode 自带的 iPhoneSimulator27.2.sdk）：

> The app does not need access to the user's contacts and the user will not be prompted for access. It will only have access to the final selection of the user.

**2. Apple 的文档说法一致。** `CNContactPickerViewController` 的文档页写的是同一句（"does not need access to the user's contacts and the user will not be prompted"），整页没有提到 `NSContactsUsageDescription`。`NSContactsUsageDescription` 的文档页对它什么时候必须有，只有一句："This key is required if your app uses APIs that access the user's contacts."

**3. 编出来的二进制里没有读通讯录的接口。** 量法：Release 配置、模拟器的 SDK 编出 `NacreContacts.framework`，对里面的可执行文件：

| 量什么 | 命令 | 结果 |
| --- | --- | --- |
| 引用的系统类 | `nm -u` | 6 个：`CNContactPickerViewController`、`CNContact`、`CNContactFormatter`、`CNContactProperty`、`CNLabeledValue`、`CNPhoneNumber` |
| 引用的常量 | `nm -u` | 30 个 `CNContact…Key`，没有别的 |
| `CNContactStore` | `nm -u` 和 `strings -a` | 0 处 |
| 申请权限、读通讯录的方法名 | `otool -v -s __TEXT __objc_methname` 里找 `requestAccess`、`authorizationStatus`、`unifiedContact`、`enumerateContacts`、`executeSaveRequest` | 0 处 |
| 链接的系统框架 | `otool -L` | ContactsUI、Contacts、UIKit、Foundation、CoreFoundation |

`CNContactStore` 是读整个通讯录、申请权限、保存联系人的唯一入口。二进制里没有它，这个包就没有办法碰到用户没选中的联系人。

### 没确认的

| | 为什么没确认 | 现在的判断 |
| --- | --- | --- |
| 运行时真的不弹权限询问 | 没在模拟器上弹过选择器 | 头文件和文档都这么说。验收里那排按钮点一下就知道 |
| 上传 App Store 时的自动检查（ITMS-90683）放不放行 | 那个检查扫的是二进制里的符号，具体扫哪些符号 Apple 没有公布；只有真的上传一次才知道。这个包链接了 Contacts.framework，引用了 `CNContact` 这几个类 | 文档对那个键的要求是「用了访问通讯录的接口」，而这个包没有。但这是按文档推的，不是试出来的 |
| 一条相反的说法 | Apple 开发者论坛 2015 年的[一个帖子](https://developer.apple.com/forums/thread/12275)里，发帖的用户说在 iOS 9 测试版上要先申请权限、还要写那个键，选择器才正常 | 那是一个用户在测试版上的绕法，同一个帖子后面的回复说正式版里好了；没有 Apple 的人这么说过 |
| 用户选过之后，系统设置里会多一项 | Apple 的工程师在[另一个帖子](https://developer.apple.com/forums/thread/780309)（2025 年，iOS 18）里确认：App 从没申请过通讯录权限、而用户在选择器里选过联系人之后，「设置 → App → 通讯录」里会显示「Private Access」 | 这不是权限询问，也不要求那个键（发帖的人就没写）。但它是用户看得见的一处痕迹，没有在我们支持的系统上看过 |

第二条是最要紧的一条，也是确认不了的一条。它出问题的方式是上传被拒，报错里会点名缺 `NSContactsUsageDescription`；到那时的补法是在这个包的清单里把那个键加进 `requires.infoPlist`，项目照[工程配置](capabilities.md#工程配置包提要求项目写内容)写一句文案。

### 这条线没有机械检查

「这个包不能用 `CNContactStore`」现在只写在源码文件开头的注释和清单的注释里。`check-api.sh` 第 8 节只扫核心的二进制，不扫能力包的。合并或者以后改这个包时，编出来之后跑一遍上面表里的第三行。

## 委托的方法做成了事件

ObjC 里结果是调委托（`CNContactPickerDelegate`）的方法。它们是「用户做了一件事，告诉 App」，照[已定的规矩](../project.md#原则)做成选择器上的事件：

| ObjC | JS |
| --- | --- |
| `contactPickerDidCancel:` | `cancel` |
| `contactPicker:didSelectContact:` | `contactselect`，带 `contact` |
| `contactPicker:didSelectContacts:` | `contactsselect`，带 `contacts` |
| `contactPicker:didSelectContactProperty:` | `contactpropertyselect`，带 `contactProperty` |
| `contactPicker:didSelectContactProperties:` | 没接 |

事件名是方法名里说事的那一段的小写，字段名是那个参数的名字。没有做成 Promise：一个选择器上「选中了」有三种形状，加上取消一共四种结果，而且发起的那次调用 `presentViewController()` 的 Promise 已经用来表示「呈现完了」。分享面板的 `complete` 是同一个处理，理由记在[那边](alerts.md#分享面板结束事件在面板上)。

### 监听哪个事件，决定选择器的模式

选择器没有「单选还是多选」这种属性。头文件的原话：

> Plural delegate methods. … Implementing one of these methods will configure the picker for multi-selection.

也就是系统看委托**实现了哪几个方法**来定模式。JS 这边没有委托，对应成：监听了哪个事件，就是哪种模式。

做法是每个选择器一个委托对象（`NacreContactPickerDelegate`），三个「选中了」的方法它都写了，但 `respondsToSelector:` 被改成按「JS 现在监听着哪些事件」来答。JS 那一侧某个事件第一次有监听器时原生收到一次订阅，记进委托的集合里。

- **订阅变了就把委托重新设一遍**（先写 `nil` 再写回去）。选择器什么时候去问委托实现了哪些方法，头文件没说；设委托的那一刻和呈现的那一刻两种都盖得住。呈现之后再加监听器有没有用，没量。
- **取消那个方法总是答「实现了」**，委托也在构造时就装上，不等 JS 订阅。理由在[下面](#系统关掉选择器之后谁来放开呈现者那条边)：不管有没有人监听，选择器被系统关掉都要报一声。`cancel` 派不派发，另看 JS 有没有监听它。
- 委托是 `weak` 的属性，所以用关联对象挂在选择器上。

想过的另一种形状是给一个 ObjC 没有的属性（`picker.mode = 'multiple'`）。没有采用：底层这一层照 Apple 的面，不发明属性；而且那样「设了多选、却监听了单选的事件」这种对不上的状态就存在了，现在的形状里它不存在。

代价是三个事件只该监听一个，这一条只能写在文档里。同时监听单选和「选某一项」时系统怎么选，头文件没写，网上的说法互相矛盾，没有量。

### 第一步做了哪几种，没做哪几种

| | 做了没有 | 理由 |
| --- | --- | --- |
| 单选联系人 | 做了 | 最基本的用法 |
| 多选联系人 | 做了 | 同一套机制，多一个事件 |
| 选某一项（一个电话、一个邮箱） | 做了，连同 `displayedPropertyKeys` | 「选一个手机号」是最常见的需求，而一个联系人常有几个号码。只做单选的话，App 拿到联系人之后还得自己再问一次用哪个 |
| 多选某一项 | 没做 | 少见。监听这个名字会抛，不静默 |
| 三个 `NSPredicate` 属性（哪些联系人能点、哪些直接选中） | 没做 | 要先暴露 `NSPredicate`，那是另一组类 |

## 事件怎么把对象带到 JS

选中的联系人是原生对象。原生给事件带一个对象的出口是 `NacreEmitEventWithObject`，但 JS 那一侧把它挂到事件对象上时，字段叫什么是从核心的一张表里查的（`17-scene.js` 的 `objectEventField`，按事件名写死：`beforeshow` → `viewController`、`traitchange` → `previousTraitCollection`…）。新的事件名不在表里，对象负载会被丢掉，而那个文件不归能力包改。

所以走的是核心给域留的另一个口子，[域的内部事件](adding-classes.md#事件)：

1. 原生发一个 `@` 开头的内部事件，带上那个对象：`@contactpicker:contact`、`@contactpicker:property`。
2. `contacts.js` 里用 `ctx.internalEventHandlers` 登记了处理函数。它收到选择器和那个对象，自己建 `Event`、挂上字段、调选择器的 `dispatchEvent()`。

多选的一组联系人过不了这条路：事件出口一次只能带一个对象。做法是原生先把那个数组记在委托上，发一个不带数据的 `@contactpicker:contacts`；处理函数再调一次原生（`nacre:takeSelectedContacts`，走返回对象数组的那条通道）把它取走。取一次就没了；万一有两次选择排着，先到的先取。

这是一处可以记下来的缺口：**登记进来的域用 `NacreEmitEventWithObject` 发一个新名字的事件，对象到不了监听器。** JSON 负载已经有通用的落点（负载是字典就逐键挂上），对象负载还没有。有了之后这里的三个处理函数里有两个可以删掉。

内部事件名 `@` 开头，写 App 的人订不上：`subscribeNative` 在过桥之前就拦了。

## 系统关掉选择器之后，谁来放开呈现者那条边

和[弹窗那个域](alerts.md#系统自己关掉之后谁来放开呈现者那条边)是同一个问题：用户选中或者取消之后，选择器是系统自己关掉的。JS 一侧「呈现它的页面 → 选择器」那条持有边要有人放开，否则关掉的选择器连同它的监听器一直不被回收。核心放开这条边靠 JS 调 `dismissViewController()`，或者收到内部事件 `@dismissed`；后者靠的是呈现委托，只在用户把页面拖走时才有。

所以委托的四个方法被调时，都替选择器发一次 `@dismissed`，排在那个事件后面（先发的话，两次派发之间赶上一次 GC，监听器就跟着包装一起没了）。

时机是照弹窗那边写的，多了一种情况：

| 回调来的时候 | 做什么 |
| --- | --- |
| 已经关完了（`presentingViewController` 是 `nil`） | 直接发 |
| 正在关（`isBeingDismissed`） | 挂到转场的 completion 上 |
| 还没开始关 | 隔 0.1 秒再看，最多看 30 次 |

第三种是弹窗那边没有的。头文件只说 "The picker will be dismissed automatically after a contact or property is picked"，没说回调和关闭谁先；回调先来的话，当场发 `@dismissed` 没有用（JS 那一侧读到的 `presentedViewController` 还是它）。

**这一段没有验证过。** 验收里那排按钮，每次选完或取消之后会逼一次 GC，终端里打出选择器的包装有没有被回收，就是为了看这一段。

用户把选择器向下拖走时，系统调不调 `contactPickerDidCancel:`，没量。调的话走上面这条路；不调的话还有核心给每个被呈现的页面挂的呈现委托。两条路都通到同一个 `@dismissed`，重复发一次没有害处。

## 订阅：四个事件归这个包，别的归页面

选择器是页面，页面上已经有三拨事件：模态的三个（核心）、出现和消失的四个（[页面的出现和消失](appearance.md)那个域）、`traitchange`（核心）。这个包的订阅函数只认领自己的四个名字，别的返回「不认领」，落到后面。

- 登记进来的域里，类的继承层数深的先被问到，所以这个包排在出现和消失那个域前面。两边认的名字不重叠。
- 运行时自己给每个被呈现的页面订的 `@dismissed` 也落到核心：它会给选择器的呈现控制器挂一个委托。**系统许不许改选择器的呈现委托，没量。** 提示框是不许的（见[弹窗](alerts.md#弹窗上的订阅全部由这个域认领)）；核心在那之后给装委托的地方加了保护，不许的话只是记一行日志，不会崩。
- 哪边都不认识的名字由核心报错，报错里列的是页面的那几个名字。JS 那一侧覆写了订阅钩子，把选择器的四个名字补到报错末尾（核心对 `traitchange` 做的是同一件事）。四个名字因此在原生和 JS 各有一份，两处的注释互相指着。

## 只读的值

### 包装和身份

`CNContact` 这四个类都是原生对象的包装，不是过桥时转成的普通对象。这样联系人可以原样交回原生（`CNContactFormatter` 要的就是它），以后接 `CNContactViewController` 也用得上。

系统这边它们都是不可变的。实测同一个联系人上两次读 `phoneNumbers`，数组里是同一批对象，同一项上两次读 `value` 也是同一个对象；JS 一侧给这几条边记了持有（联系人 → 每一项 → 电话号码），所以联系人还在时两次读到的包装也是同一个。

四个类都不能 `new`。`CNContactFormatter` 在 ObjC 里可以建实例（实例上有一个 `style` 属性），这里只开了类方法 `stringFromContact:style:`：它盖住了实例能做的事，少一个要管的对象。

### `value`：字符串还是对象

`CNLabeledValue.value` 在 ObjC 里是泛型：邮箱是 `NSString`，电话是 `CNPhoneNumber`。过桥的通道按「标量还是对象」分成两条，所以 JS 的取值器两条都问：先问标量那条，是字符串就用；不是，再问对象那条。`CNContactProperty.value` 同理，它还可能是地址、日期这些没暴露的类型，那时两条通道都给 `null`。

想过把 `CNPhoneNumber` 压平成字符串（它只有一个 `stringValue`）。没有压：底层这一层和 Apple 的文档对得上更要紧，`contact.phoneNumbers[0].value.stringValue` 在两边写出来一样。

### 没取到的字段

`CNContact` 可以是「只取了一部分字段」的，读一个没取到的字段，系统抛 `CNContactPropertyNotFetchedException`。读属性的入口没有报错出口（那里的异常保护只会记日志、返回空值），所以不能让它抛到那里：

- 原生读之前先问 `isKeyAvailable:`，没取到的不读。
- JS 的取值器在读之前也问一次，没取到就抛一个说得清的 `TypeError`。
- `isKeyAvailable()` 同时作为成员开出来，照 ObjC 的名字。
- `stringFromContact` 用 `areKeysAvailable:` 加上格式化器自己给的那组必需字段来问。

每读一个字段因此多过一次桥。选择器交回来的联系人是不是总带着全部字段，没量；这套保护是为了不管答案是什么都不会崩、不会静默给错值。

### 字段名和标签

**字段名**（`displayedPropertyKeys`、`isKeyAvailable()`、`CNContactProperty.key`）是头文件里的三十个 `CNContact…Key` 常量。量到这些常量的值就是属性名本身（`CNContactPhoneNumbersKey` 是 `"phoneNumbers"`，`CNContactTypeKey` 是 `"contactType"`），但原生还是按一张「名字 → 常量」的表查，不把 JS 给的字符串直接交给系统；不认识的名字抛，把表列出来。读出来时表里没有的原样给：系统以后加了字段，用户选中它时不能丢。

这张表是手写的有序数组，不是 `NACRE_ENUM_MAP`（那个宏的值必须是数字）。所以 `check-api.sh` 不会拿它和类型里的 `CNContactKey` 核对，两边是人工对的。

**标签**给的是原文，没有翻成名字。系统自带的标签是记号（`_$!<Mobile>!$_`），用户自己起的是他输入的文字；这是一个开放的集合，翻成 `'mobile'` 这样的名字会和用户自己起的同名标签分不开。显示用 `localizedStringForLabel()`。代价是「这个号码是不是手机」现在只能和记号的原文比较，头文件里那十几个 `CNLabel…` 常量没有暴露：全局的字符串常量怎么暴露，规矩里还没有答案。

## 量到的事实

不用界面的那一部分，在 Mac 上用一个命令行程序量过（macOS 27.2，Contacts 是同一个框架；联系人是用 `CNMutableContact` 在内存里建的，不碰通讯录）。**iOS 上的结果没有另外量。**

| | 结果 |
| --- | --- |
| 三十个 `CNContact…Key` 常量的值 | 都是属性名本身 |
| `CNLabelPhoneNumberMobile` / `CNLabelHome` / `CNLabelWork` / `CNLabelPhoneNumberMain` / `CNLabelOther` | `_$!<Mobile>!$_` / `_$!<Home>!$_` / `_$!<Work>!$_` / `_$!<Main>!$_` / `_$!<Other>!$_` |
| `CNLabelPhoneNumberiPhone` | `iPhone`（不是记号） |
| `localizedStringForLabel:` | 系统自带的换成当前语言的写法（英文系统上 `mobile`、`home`）；别的字符串原样返回；空串返回空串 |
| `stringFromContact:style:`，名 Alex、姓 Chen | `Alex Chen` |
| 同上，名「小明」、姓「陈」 | `陈小明` |
| 同上，只填了公司 | 公司名 |
| 同上，什么都没填 | `nil` |
| 同上，注音那一种，没填注音 | `nil` |
| 两次读 `phoneNumbers`，同一项 | 同一个对象 |
| 同一项上两次读 `value` | 同一个对象，类是 `CNPhoneNumber` |
| 没有标签的电话 | `label` 是 `nil` |
| `isKeyAvailable:` 给不认识的名字 | `NO`，不抛 |

最后一行和 JS 这边不一样：这里不认识的名字是抛的，照枚举的规矩。

## 验证

| | 结果 |
| --- | --- |
| `check-api.sh` | 一致。类 106 个（多了这 6 个）。故意弄坏两处都报得出来：类型里删一个属性、原生的枚举表改一个值 |
| 类型检查 | 通过，验收里故意写错的地方都标了 `@ts-expect-error` |
| 编译 | Release，模拟器的 SDK，`NacreContacts` 和它依赖的 `Nacre` 一次编过。这个包从核心拿的符号是 6 个函数，都在 `NacreExtension.h` 里 |
| 登记类没被裁掉 | Release 的二进制里有 `+[NacreContactsDomain load]`，`__objc_nlclslist` 里有一项 |
| CLI | 给验收工程生成 `ios/` 时打出 `能力包：@nacrejs/contacts、@nacrejs/keychain`，工程里多了 `NacreContacts` 这个 target |
| JS 的 part | 用一份假的桥在 Node 里跑过：六个类定义得出来、不能 `new` 的报错、`displayedPropertyKeys` 给字符串时的报错、订阅报错里补上的四个名字、三个内部事件派发出去的事件带着对的字段 |

验收的自动部分（建选择器、`displayedPropertyKeys` 的读写、四个事件的订阅和退订、写错参数时抛什么、`localizedStringForLabel`）**还没有在模拟器上跑过**。测试是先写的，但「先看到它失败」这一步也只能由合并的那个对话来做。

## 没验证的

- 整个包在模拟器和真机上都没有运行过。
- 选择器真的弹出来：三种选法各自的样子、事件带的数据、`CNContact` 这一组的每个成员。验收里留了一排按钮（选联系人 / 选电话 / 多选），点了之后终端里打出逐条的断言和选中的内容。
- 选择器被系统关掉之后，它的包装有没有被回收（同一排按钮，选完会逼一次 GC）。
- `displayedPropertyKeys` 默认是不是 `null`、写空数组读回来是什么（验收里前一条是断言，后一条只打出来）。
- 在没呈现的选择器上订 `dismiss`，核心去取它的呈现控制器时会不会出问题（验收的自动部分里有这一条）。
- 构造一个选择器要多久。分享面板的构造很慢（弹窗那一步同步占 2.1 秒）；验收的自动部分建了两个选择器。
- 委托的方法在哪个线程上来。代码里不在主线程就转到主线程，没有假设。
- 上面「不需要通讯录权限」一节里没确认的那四条。

---

← 返回[实现原理](README.md) ・ [项目说明](../project.md)
