# 参数转换

← [实现原理](README.md)

JS 的值怎么变成原生要的类型。规则定在 [项目说明](../project.md) 的 API 设计原则第 13 条：**API 层宽松接收，照 Web IDL 转换；交给原生的值必须类型精确，原生只校验不转换。**

这一页记它是怎么来的、分几步落地、每一步量到了什么。

## 起因：`{ atIndex: undefined }` 让 App 闪退

一份试用反馈，模拟器上三处复现：

```js
view.insertSubview(child, { atIndex: undefined });
stack.insertArrangedSubview(view, { atIndex: undefined });
UIImage.imageWithData(blob, { scale: undefined });
```

都是 `-[NSNull integerValue]`（或 `doubleValue`）`: unrecognized selector`，进程直接没了，JS 的 `try / catch` 接不到。

链条有四环，每一环单看都不算错：

| | 发生了什么 |
| --- | --- |
| 1 | `nacre.js` 用 `'atIndex' in o` 判断「带没带」。`in` 只看键在不在，`{ atIndex: undefined }` 算带了 |
| 2 | 参数打包成数组过桥，`JSON.stringify([view, undefined])` 把 `undefined` 变成 `null` |
| 3 | `NSJSONSerialization` 把数组里的 `null` 解成 `NSNull` |
| 4 | 原生直接 `[arg integerValue]`。`NSNull` 不认识这个方法，抛 ObjC 异常；外面没有 `@try`，进程终止 |

第 2 环还说明了另一件事：**`NaN` 和 `Infinity` 走同一条路**——`JSON.stringify` 同样把它们变成 `null`。所以不只是 `undefined`。

排查时顺带发现属性写入那条通道的后果不一样，而且更难查：顶层的 `null` 被 `DecodeJSON` 解成 `nil`，而对 `nil` 调 `doubleValue` 得到 0。于是 `view.alpha = undefined` 不闪退，**静默把透明度写成 0**，视图直接消失。

## 方向是用户定的：接收宽松，提交严格

我最初的建议是「类型不对一律抛」，和枚举一致。用户否了：API 层要保持灵活，像 Web 那样；但交到原生手里的东西必须是严格的。

这正是 Web IDL 的做法——每个参数声明了类型，JS 的值进来时按类型转换（`button.disabled = 'false'` 得到 `true`，`el.textContent = 5` 得到 `'5'`），转不出合法值才抛。我们照搬，两处例外记在第 13 条里。

转换必须放在 JS 一侧，有一个硬原因：就是上面第 2 环。值过了 JSON，`NaN`、`Infinity`、`undefined` 全成了 `null`，原生已经分不清原来是什么。

## 第 1 步：options 里值是 `undefined` 的成员视为没带

Web IDL 对字典（也就是 options 对象）的规定：成员的值是 `undefined`，等于这个成员不存在。

落到代码上是一个助手：

```js
function has(o, key) { return o[key] !== undefined; }
```

`'key' in o` 一共 39 处（34 行），全部换成 `has(o, 'key')`。另有 4 行 `'width' in value` 没动——那是在认结构体的形状，不是在判断可选参数。

换完之后，反馈里的三处各归各位，一行原生代码都没改：

| | 结果 |
| --- | --- |
| `insertSubview(child, { atIndex: undefined })` | 三个键都算没带，走到已有的 `TypeError: insertSubview needs one of …` |
| `insertArrangedSubview(view, { atIndex: undefined })` | 必填的没带，走到已有的 `TypeError: insertArrangedSubview needs { atIndex }` |
| `imageWithData(blob, { scale: undefined })` | 等于没带 `scale`，走 `imageWithData:` 那条路 |

**运行时自己用 JS 实现的类是同一个毛病。** `Request`、`Response`、`Blob` 也是 `'method' in o ? String(o.method) : …`，于是 `new Request(url, { method: undefined })` 的方法名是 `"UNDEFINED"`。同一次替换一起改掉了。

这一步只堵了 `undefined` 从 options 进来的那一个口子。`{ atIndex: NaN }`、`{ atIndex: null }` 仍然会走到原生，要等后面两步。


## 第 2 步：API 层按类型转换

七个助手，都在 `nacre.js`：

| 助手 | 规则 | 对应 Web IDL 的 |
| --- | --- | --- |
| `toNumber(v, what)` | `Number(v)`，不是有限数就抛 | `double` |
| `toInteger(v, what)` | `toNumber` 后向零取整 | 带 `[EnforceRange]` 的整数 |
| `toBoolean(v)` | `Boolean(v)` | `boolean` |
| `toText(v)` | `null` / `undefined` 给空串，其余 `String(v)` | 带 `[LegacyNullToEmptyString]` 的 `DOMString` |
| `toTextOrNull(v)` | `null` / `undefined` 给 `null`，其余 `String(v)` | `DOMString?` |
| `toNumberOrName(v, what)` | 看着像数的字符串按数，其余字符串原样，别的走 `toNumber` | 没有对应物 |
| `toNumbersOrNull(v, what)` | 可迭代对象逐个 `toNumber`，报错点名是第几个 | `sequence<double>?` |

### 怎么知道每个属性该用哪个

取值器是手写的，一共 146 个把 `value` 原样交给原生的。逐个看太容易漏，所以用脚本对：**类型定义里这个属性声明成什么类型，就接哪个助手**——`number` 接 `toNumber`、`boolean` 接 `toBoolean`、`string | null` 接 `toTextOrNull`。整数是从原生那一侧认的（用 `integerValue` 取的那几个：`tag`、`numberOfLines`、`numberOfTapsRequired`、`numberOfTouchesRequired`、`maximumMessageSize`）。

脚本接上了 110 个；剩下 36 个全是枚举（和一个 `userInfo`），不转，继续由原生认名字。方法的参数没有可以对照的表，是逐个看的，三十来处。

### `toNumberOrName` 是我们自己加的

`spacing` 能写 `'system'`、`priority` 能写 `'required'`、`decelerationRate` 能写 `'fast'`——这些属性的类型是「数，或者一个名字」。照 `toNumber` 走会把 `'system'` 拒掉，原样放行又会让 `'12'` 被当成名字去查表（查不到，报「没有这个值」）。所以单独一条：字符串先看它是不是数。

### 不可空的字符串，`null` 给空串

Web IDL 的普通 `DOMString` 遇到 `null` 得到 `"null"`、遇到 `undefined` 得到 `"undefined"`，所以 `el.setAttribute('x', null)` 的结果是字面量 `null`。这是 Web 里公认的坑，没有人是有意这么写的。Web 自己在 `input.value`、`innerHTML` 这些地方加了 `[LegacyNullToEmptyString]` 把它改成空串。我们的不可空字符串一律走后一种。

### 结构体的构造函数

以前 `num()` 把转不出来的值**静默变成 0**——`new CGPoint('a', NaN)` 是 `(0, 0)`。现在不给的参数（`undefined`）是 0，和 `new DOMPoint()` 一致；给了就走 `toNumber`，转不出来就抛。

### 类型定义没有跟着放宽

`@nacre/types` 里 `alpha` 仍然是 `number`。`lib.dom.d.ts` 也是这么做的：`el.hidden = 'x'` 运行时合法，类型检查报错。宽松是给运行时兜底的，不是推荐的写法。

### 上层那几个对象没动

`application.storage`、`fileSystem`、`keychain` 的键和路径有各自的校验（`storageKey`、`filePath`、`keychainKey`），它们不经过上面这条路，也从来不会把没校验过的值交给原生。这一步没有碰它们；它们要不要也放宽是另一件事。

### 连带改掉的断言

前几步按「类型不对就抛」写的四条断言反过来了：点按次数给小数（现在截成整数）、长按时长给数字字符串（现在按数用）、剪贴板写数字（现在转成字符串）、虚线段给 `['4']`（现在是 `[4]`）。最后一条是跑模拟器时才发现的——它是全部一千多条旧断言里唯一受影响的。负的次数、超出 0 到 1 的强度仍然抛——那是取值范围，不归这条规则管。

## 第 3 步：原生层只校验，不转换

### 三个宏

原来的写法是 `view.alpha = [value doubleValue]`、`[UIFont systemFontOfSize:[arg(0) doubleValue]]`，一共 122 处。它们有两种坏法：对象不认识这个方法（`NSNull`、字典、数组）就闪退；认识但不是数（字符串、`nil`）就静默给一个值。

换成三个宏：

```objc
view.alpha = NACRE_NUM(value, key);
[UIFont systemFontOfSize:NACRE_NUM(arg(0), sel)];
```

`NACRE_NUM` / `NACRE_INT` / `NACRE_BOOL` 各自先问 `RequireNumber` / `RequireInteger` / `RequireBool`。类型不精确就往 `error` 里写一句话，**并且直接从所在的函数返回**——用的是 GNU 的语句表达式，里面可以写 `return`。

「直接返回」是这个设计的要点。另一种写法是让取参函数返回 0 并记下错误，但那样后面那次原生调用仍然会带着 0 执行一遍（`insertSubview:atIndex:0`），然后才报错——副作用已经发生了。宏在参数求值阶段就走了，消息根本没发出去。

返回什么由 `NacreFail` 决定：它能转成任何返回类型的空值；对返回 `bool` / `BOOL` 的函数转成真——那些函数的约定是「返回真表示我认领了」，而这里确实认领了，只是带着错误。

**这一条咬过一次。** 手势那个文件里有两个辅助函数 `CountValue` / `AmountValue`，返回真的意思是「值可用」。批量替换把宏放了进去，失败时返回真，意思正好反了。编译器不会报，是列出每处宏的外层函数逐个看才发现的。那两个函数改成了直接调 `RequireInteger` / `RequireNumber`。所以规矩是：**宏只用在「返回真表示认领」的分发函数里**。

### 严格到什么程度

| | 接受 | 拒绝 |
| --- | --- | --- |
| `RequireNumber` | `NSNumber`、不是布尔、有限 | 布尔、字符串、`NSNull`、`nil`、数组、字典 |
| `RequireInteger` | 上一条，且没有小数部分 | `3.9` |
| `RequireBool` | 只认 `true` / `false`（用 `CFBooleanGetTypeID` 认，`@1` 不算） | 数字 1、字符串 |

没有报错出口的地方（结构体解码、颜色的分量、异步的呈现）用 `SafeNumber`：不是数就给 0，绝不会崩。那些路径的值在 JS 一侧已经校验过，这里只求不崩。

### 怎么验的：一次性的探针

正常使用时走不到原生的这些报错——API 层已经把值转好了，这正是分工的目的。所以没法写成常驻的验收用例。

做法是临时让 JS 的六个转换助手原样放行（看一个全局开关），把脏值直接送到原生，记下结果，然后还原。31 种写法的结果：

| 送到原生的 | 结果 |
| --- | --- |
| `alpha` ← `'0.5'` / `undefined` / `null` / `NaN` / `{}` / `[1]` / `true` | 七种都抛 `alpha must be a finite number, got …`，`alpha` 保持 0.25 |
| `tag` ← `3.9` | `tag must be an integer, got 3.9` |
| `isHidden` ← `1` / `'false'` / `null` | `isHidden must be true or false, got …` |
| `repeatCount` ← `Infinity` | 照常通过（那个特例还在） |
| `systemFontOfSize('17')`、`(NaN)` | 抛；对照 `(17)` 正常 |
| `insertSubview(v, { atIndex: NaN / '0' / 1.5 })` | 三种都抛，**子视图个数还是 0**——调用没有执行；对照 `{ atIndex: 0 }` 插进去了 |
| `viewWithTag('9')`、`constraintEqualToConstant('40')`、`constraintEqualToAnchor(…, { constant: '8' })`、`CATransaction.setDisableActions('yes')`、`impactOccurredWithIntensity('max')` | 都抛 |
| `numberOfTapsRequired` ← `-1` | 仍然是原来那句范围错误，没有被类型检查盖住 |

`undefined` 和 `NaN` 在报错里都显示成 `got null`——这就是「转换必须在 JS 一侧」的那个原因：过了 JSON，原生看到的只有 `null`。

全程 App 没有退出。

### 探针抓到的一个漏网

`insertSublayer(layer, { atIndex: '0' })` **没抛，插进去了**。那一处写的是 `unsignedIntValue`，不在批量替换的那几个名字里（`doubleValue` / `floatValue` / `integerValue` / `boolValue`）。全仓库只有这一处，已改；`check-api.sh` 的检查把 `intValue`、`unsignedIntValue`、`longValue` 也一起盯上了。

### 机械检查

`check-api.sh` 新增一节：`Bridge/` 和 `NacreRuntime.mm` 里不许出现对 JS 给的值（`value`、`arg(N)`、`valueArg(N)`、`args.value(N)`、`args[…]`、`d[@"…"]`）直接调 `xxxValue`。在沙盒副本里把两处改回裸调用验过：两处都报。

这一节同样会说「是我自己失效了」：一个 `NACRE_*` 宏都找不到时，报的是「脚本要更新」。

### 顺带改掉的

原生层有四条报错是中文的（`imageNamed 需要一个字符串名字` 等），违反了「暴露出去的一切用英文」。探针的输出里看到的，一起改成了英文，API 文档里引用它们的四处也跟着改了。

### 探针顺带发现的

`new Blob([...])` 建出来的对象，在一次垃圾回收之后读 `size` 得到 `null`、交给 `imageWithData` 报「不是 Blob」；新建之后立刻用是好的。和参数转换无关，已经单独修掉，见[包装机制](wrapper.md#又漏过一次new-blob-只抄了句柄的数值)。

## 第 4 步：入口的异常保护

前三步管的是参数类型。还有一类异常和类型无关：参数全对，但这个调用 UIKit 不接受——`view.addSubview(view)` 就是，UIKit 抛 `NSInvalidArgumentException: Can't add self as subview`。这种以前同样是直接闪退。

### 做法

引擎调原生的口子都集中在 `NacreRuntime.mm` 里的一组 lambda。每个都包进同一个模板函数：

```objc
template <class Fn>
static auto Guarded(const char* where, std::string* error, Fn&& fn) -> decltype(fn()) {
  @try { return fn(); }
  @catch (NSException* e) { … 填 error、打日志、返回空值 … }
}
```

包了 17 个入口：属性读写、对象属性读写、对象数组读写、构造、五种方法调用、类级属性、订阅、建 Blob，以及异步调用。

三个入口原来没有报错出口（写对象属性、构造、无参方法），接住了也没法告诉 JS。给它们的宿主接口各加了一个 `std::string* error`，引擎那边照常走 `Rejected` 抛 `TypeError`。读属性那几个仍然没有报错出口——读几乎不会抛，接住之后打日志、返回空值。

**异步调用单独处理**：它的结果是 Promise，接住异常之后要把那个 Promise 拒掉，否则它会永远挂着。

### 这是保底，不是修法

异常是 UIKit 内部抛出来的时候，它的状态可能已经不一致了——Apple 对 ObjC 异常的定位一直是「程序员错误，不保证之后的状态」。所以：

- 每次走到这里都打一行运行时日志（`native exception caught, …`），不让它悄悄发生
- 值得回头把那个调用点单独处理：先查再调，或者就地接住并给一句说人话的报错。`insertSublayer`、`pushViewController`、`activateConstraints` 早就是这么做的，它们的 `@try` 留着，报错比这一层给的更具体

ARC 在 ObjC++ 里默认是异常安全的（`-fobjc-arc-exceptions` 对 `.mm` 默认开启），所以接住异常不会让沿途的对象泄漏。这一条是 clang 的文档说的，没有另外验证。

### 实测

| | 结果 |
| --- | --- |
| `view.addSubview(view)` | `TypeError: addSubview: raised NSInvalidArgumentException: Can't add self as subview`，JS 能 `catch` |
| 之后 | 子视图个数是 0；这个视图和整个运行时照常能用 |
| 整轮验收里走到这一层的次数 | **1 次**，就是上面故意触发的那次。也就是说现有的一千多条断言里，没有哪个调用是靠它才没崩的 |

## 第 5 步：对象参数不转换，类型不对就抛

Web IDL 对对象的规定最简单：不转换。`el.appendChild(5)` 是 `TypeError`，没有哪个值会被「转成」一个节点。

我们以前在这里是静默的，而且是一条记了很久的待办：

```js
view.addSubview(UIColor.redColor);                    // 什么都不发生
NSLayoutConstraint.activateConstraints([1, 2, 3]);    // 同上
label.font = 'Helvetica';                             // 字体被悄悄清掉
```

原因各不相同，改法也分三处：

| 在哪 | 以前 | 现在 |
| --- | --- | --- |
| 方法的对象参数（`NacreMethods.mm` 的 `viewArg` 一类） | 类型不对返回 nil，调用处写的是 `if (UIView* child = viewArg(0)) …`，整句被跳过 | 拿不到就填报错。**调用处一行没改**——照样跳过，引擎看到报错就抛 |
| 值是对象的属性（各域的 `Write…ObjectProperty`） | `[value isKindOfClass:X.class] ? value : nil`，类型不对当成 nil 写进去 | `NACRE_OBJECT_OR_NIL(value, X, name)`：null 可以，给了对象就得是那个类 |
| JS 一侧的 `nativeSetObject` | 不是原生对象的值（字符串、数字）被当成句柄 0 | 当场抛，报错里说收到的是什么 |

写对象属性那条通道原来整条都没有报错出口（注释里写着「类型不对就当 nil 处理，这一条是已知的 TODO」）。第 4 步给宿主接口补的那个 `error` 正好接上，这一步把它一路传到了各域。

### 可空和必填分开

不是所有对象参数都必填：

| | 例子 | null |
| --- | --- | --- |
| 必填 | `addSubview(view)`、`addLayoutGuide(guide)`、`insertSubview` 的 `belowSubview` | 抛，报错是 `addSubview needs a UIView` |
| 可空 | `convertPoint` 的 `toView`（null 表示换算到窗口坐标）、`setImage(null, …)`（清掉这个状态的图）、所有对象属性 | 照常；给错了类才抛，报错多一个 `or null` |

所以取参分了 `viewArg` 和 `optionalViewArg` 两个。`check-api.sh` 的所有权检查认识了后者。

### 咬过一次：先取值、再看属性名

批量替换之后有三处要手工改。它们的写法是先把值按某个类取出来，再看属性名：

```objc
UIColor* color = [value isKindOfClass:UIColor.class] ? value : nil;   // 先取
if (name == "borderColor") …
else if (name == "path") …     // 这个属性的值是 UIBezierPath
```

以前这没问题——取不到就是 nil，用不上。换成会报错的宏之后，给 `path` 赋一个路径会先在「取颜色」那一行被拒掉。三处（图层的颜色、`UIImageView` 的图、`UILabel` 的颜色）都改成了在各自的分支里取。验收用例里专门有一条防这个：`strokeColor` 给颜色对象不许被 `path` 的检查误伤。

### 实测

26 条断言，全部在模拟器上通过。要点：

- `addSubview` 传别的原生对象、`null`、`5`、不传，四种都是同一句 `addSubview needs a UIView`，子视图个数不变
- `label.font = 颜色对象` 抛 `font needs a UIFont or null`；`label.font = 'Helvetica'` 抛 `font needs a native object or null, got "Helvetica"`；被拒之后字体还是原来那个
- `activateConstraints([约束, 视图])` 整批都不激活——不是「激活合法的那几条、跳过其余」
- 原有的一千多条断言没有一条受影响，也就是说现有代码里没有哪一处是靠「类型不对被悄悄忽略」才跑通的

## 真机上也跑了一遍

五步和 Blob 的修复做完之后，打了真机包（iPhone 14、iOS 27.0.1）跑全部验收：

| | 模拟器 | 真机 |
| --- | --- | --- |
| 通过 / 失败 | 1221 / 0 | 1208 / 0 |
| 五组参数转换的断言 | 全过 | 全过 |
| `addSubview(自己)` | 接住，`TypeError` | 同样接住，同一句报错 |
| `new Blob()` GC 之后 `size` | 3 | 3 |
| 整轮走到异常保护的次数 | 1（故意触发的那次） | 1 |

少的那 13 行按标签归并是 12 条，来源只有两处，都不是能力上的差别：

- 8 条在剪贴板那一组。真机上按设计不自动读写剪贴板（免得冲掉用户的内容），那几条断言本来就只在模拟器上跑
- 4 条是场景进后台的生命周期日志（`inactive` / `background`）。模拟器那一轮跑完后 App 被关掉时打出来的，真机那一轮读日志时 App 还在前台

除此之外逐条比对没有差异。

