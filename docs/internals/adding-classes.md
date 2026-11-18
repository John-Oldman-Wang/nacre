# 接入一组类

这一页是给**接类的人**照着做的：接一组原生类要写哪些文件、哪些文件不许碰、原生那一侧怎么登记。后半页记这套机制是怎么来的、量到了什么。

目标只有一条：**接一组类只加新文件，入口各加一行，别的共享文件一个都不碰。** 这样几组类可以由几个对话同时接，互不冲突。

## 先出一份初稿

不用从空白写起。`bindgen` 照头文件把一个域的全套文件写出一份初稿（原生、内置脚本、类型、验收的读写往返、成员清单）：

```bash
node ios/scripts/bindgen/bindgen.mjs extract                                     # 换过 SDK 或者第一次用时跑一次
node ios/scripts/bindgen/bindgen.mjs scaffold refresh-control UIRefreshControl   # 域的名字，后面是这个域里的类
```

写出来的就是下面讲的那套文件，写法也是下面讲的写法，**之后它们是普通的手写文件，直接改**。它只写一次：文件已经在了就拒绝。它写不出的东西（事件、认不出所有权的方法、带参数的构造、默认值的断言、文档里的效果）会逐个列出来，那是接下来人要做的。给已经接了的类补成员也是这个命令：类名写已有的那个，它只写这个类还没有的成员。它现在能写什么、不能写什么，见 [bindgen](bindgen.md)。

已经接了的类还缺什么，跑 `bindgen.mjs report` 看。

## 一组类 = 一个域

一个域是一组放在一起才说得通的类：七个控件、五种手势、弹窗和它的按钮。一个域一套文件，名字用同一个词（下面用 `switch` 举例）。

| | 文件 | |
| --- | --- | --- |
| 原生 | `ios/Runtime/Bridge/Nacre<域>.mm` | 新文件。工程按目录收，不用登记到 `project.yml` |
| JS | `ios/Runtime/Builtin/parts/50-<域>.js` | 新文件。运行时按文件名顺序自动加载 |
| 类型 | `packages/types/ios/<域>.d.ts` | 新文件。这个域自己的枚举也写在这里，不写进 `enums.d.ts` |
| 验收 | `acceptance/src/steps/<域>.js` | 新文件 |
| API 文档 | `docs/api/<类名>.md` | 新文件，按[文档写法](../writing-guide.md)写 |
| 实现原理 | `docs/internals/<域>.md` | 新文件 |

入口文件各加一行。几个对话会在同一个位置追加，合并时保留双方即可：

| 入口 | 加什么 |
| --- | --- |
| `packages/types/ios.d.ts` | `/// <reference path="./ios/<域>.d.ts" />` |
| `acceptance/src/main.js` | 一行 `import`；`later` 数组里加一行 `['stepXxx', () => stepXxx(ctx)],` |
| `docs/.vitepress/config.mjs` | 侧边栏里 API 和实现原理各一项 |
| `docs/api/README.md`、`docs/internals/README.md` | 索引各一行 |

**不许碰的文件**（碰了就会和别的对话冲突）：

- `ios/Runtime/Bridge/NacreBridge.h`、`NacreProperties.mm`、`NacreMethods.mm`、`NacreFactories.mm`、`ios/Runtime/NacreRuntime.mm`
- 别的域的 `.mm`、part、`.d.ts`、验收步骤
- `packages/types/ios/enums.d.ts`
- `ios/scripts/check-api.sh`
- `docs/project.md`（「还要做的」那一节由合并的那个对话统一改）

`NacreBridge.h` 可以 `#import` 进来**用**：取参的宏、结构体互转、别的域的枚举都在里面。不许的是往里面**加声明**。

发现非改共享文件不可（缺一个助手、分发器少一条通道、要给已有的类加成员），停下来报告，不自己动。

## 原生：登记一张表

域在自己的 `.mm` 末尾用一个 `+load` 把处理函数登记进来。核心的分发器先问登记进来的域，再走它自己原来那串 `if`。

```objc
// NacreSwitch.mm
#import "NacreBridge.h"

namespace nacre_bridge {

static id ReadSwitchProperty(id object, NSString* key) {
  if (![object isKindOfClass:UISwitch.class]) return nil;
  UISwitch* sw = (UISwitch*)object;
  if ([key isEqualToString:@"isOn"]) return @(sw.isOn);
  return nil;
}

static BOOL WriteSwitchProperty(id object, NSString* key, id value, std::string* error) {
  if (![object isKindOfClass:UISwitch.class]) return NO;
  UISwitch* sw = (UISwitch*)object;
  if ([key isEqualToString:@"isOn"]) { sw.on = NACRE_BOOL(value, key); return YES; }
  return NO;
}

static bool SwitchConstruct(const std::string& className, const NacreArgs& args,
                            nacre::NativeObjectRef* out, std::string* error) {
  if (className != "UISwitch") return false;
  *out = {NacreKeep([[UISwitch alloc] init]), className};
  return true;
}

}  // namespace nacre_bridge

@interface NacreSwitchDomain : NSObject
@end
@implementation NacreSwitchDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "switch";
  d.classes = {UISwitch.class};
  d.read = nacre_bridge::ReadSwitchProperty;
  d.write = nacre_bridge::WriteSwitchProperty;
  d.construct = nacre_bridge::SwitchConstruct;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
```

现成的例子是 `NacreGesture.mm`（属性、对象属性、对象数组、方法、构造、带负载的事件）、`NacrePasteboard.mm`（类级单例、通知来的事件）、`NacreFeedback.mm`（类方法造对象、方法）。

### 通道

`NacreDomain` 的定义和完整注释在 `ios/Runtime/NacreExtension.h`。用不到的留空。

| 成员 | JS 那一侧调的是 | 约定 |
| --- | --- | --- |
| `read` | `nativeGet(this, 'x')` | 返回 `nil` 表示不认识这个名字 |
| `write` | `nativeSet(this, 'x', v)` | 返回 `YES` 表示处理了（写成了，或者填了 `error`） |
| `readObject` | `nativeGetObject` / `nativeGetOwned` | `class_name` 为空表示不认识 |
| `writeObject` | `nativeSetObject` / `nativeSetOwned` | 返回 `true` 表示处理了 |
| `readObjectArray` | `nativeGetObjectArray` | 只往 `refs` 里追加 |
| `writeObjectArray` | `nativeSetObjectArray` | 返回 `true` 表示处理了 |
| `callVoid` | `nativeCallVoid` | 同上 |
| `call` | `nativeCall`，返回标量 | 结果写成 JSON 放进 `*out`，没有返回值写 `"null"` |
| `callObject` | `nativeCallObject`，返回原生对象 | |
| `callObjectArray` | `nativeCallObjectArray` | |
| `callAsync` | `nativeCallAsync`，返回 Promise | 做完调 `done` |
| `construct` | `constructNative(this, new.target, '类名', [...])` | 按类名认 |
| `classCall` | `nativeClassCallValue`，类方法返回标量 | 按类名认 |
| `classCallObject` | `nativeClassCall`，类方法返回原生对象 | 按类名认 |
| `classObject` | `nativeClassObject`，类级的单例属性 | 按类名认 |
| `subscribe` | `subscribeNative(this, type, on)` | 回答三种之一（`NacreSubscribed`）：对象不归我管返回 `false`；处理了返回 `true`（出错时填 `error`）；对象归我管但不认识这个事件名返回 `NacreSubscribed::UnknownEvent`，不填 `error` |

几条规矩：

- **函数写成 `static`**，名字照 `Read<域>Property` / `Write<域>Property` / `Read<域>ObjectProperty` / `Write<域>ObjectProperty` 起。`check-api.sh` 靠这几个签名从函数体里抽属性名，和 JS、类型三边核对。
- **`classes` 列这个域的实例通道管哪些类。** 对象不是其中任何一个（或它们的子类），这个域的实例通道不会被问到。处理函数里仍然自己判断类，因为一个域里通常不止一个类。
- **把对象交给引擎一律用 `NacreKeep`**：`{NacreKeep(object), "类名"}`。裸的 `(__bridge void*)` 在 Release 下会悬空，`check-api.sh` 会拦。
- **取 JS 给的值用 `NACRE_NUM` / `NACRE_INT` / `NACRE_BOOL`**，对象用 `args.object(i)` 再判类。不直接调 `doubleValue` 一类，`check-api.sh` 会拦。
- **枚举用 `NACRE_ENUM_MAP` 定义在自己文件里**，写错值时用 `EnumError` 把可选值列出来。`check-api.sh` 会自动拿它和 `.d.ts` 里**同名**的联合类型核对取值（宏的第二个参数是 ObjC 的类型名，类型定义里就用这个名字）。位掩码 `NACRE_MASK_MAP` 同理。名字不一样，或者是宏里没有类型名的字符串枚举 `NACRE_STRING_ENUM_MAP`，在宏上面标一行：`// nacre:enum-type ActivityType = UIActivityType`；不暴露给 JS 的写 `= -`。
- **多个域都认同一个对象时**，问的顺序是确定的：类的继承层数深的在前，一样深的按 `name` 排。和 `+load` 的先后无关。

### 事件

订阅和 trampoline 都留在域自己的文件里，事件从这三个函数出去，延后一轮派发：

```objc
nacre_bridge::NacreEmitEvent(object, "UIPasteboard", @"change");
nacre_bridge::NacreEmitEventWithJSON(recognizer, "UITapGestureRecognizer", @"ended", json);
nacre_bridge::NacreEmitEventWithObject(view, "UIView", @"traitchange", previous, "UITraitCollection");
```

第二个参数是「这个对象还没有包装时，用哪个 JS 类包它」。

`NacreEmitEventWithJSON` 带的 JSON 是一个对象时，**它的每个键都成为事件对象上的一个只读字段**，JS 那一侧不用写任何东西；值正好是 `{ "x": …, "y": … }` 的转成 `CGPoint`。事件要带什么的判据是「回头读不到」：事件延后一轮才派发，那时对象上的状态可能已经变了（手势的位移、动画跑没跑完）。读得到的不要带。

系统要求当场答复的场合用另外三个，**不延后**，见[同步回调](events.md#m1b同步回调系统问js-当场答)：

```objc
// 委托方法要立刻返回布尔：派发一个可取消的事件，返回「监听器取消了没有」
BOOL prevented = nacre_bridge::NacreEmitEventSync(field, "UITextField", @"beforeclear", nil);
// 系统在调用里面执行的 block：按 JS 给的号当场调回去
nacre_bridge::NacreCallBlock(blockId, @"[]");
// 系统不等答案的 block（completion 一类）：延后一轮
nacre_bridge::NacreCallBlockLater(blockId, @"[true]");
```

号是 JS 那一侧用 `ctx.registerBlock(fn, once)` 或者 `ctx.callWithBlock(fn, invoke)` 登记的，作为普通的整数参数过桥（`NACRE_INT` 取）。只有系统真的在等答案时才用这三个：它们会在 UIKit 的调用中途进 JS。

系统要的不是布尔而是一个对象（列表的 `cellProvider` 要单元格）时，没有专门的出口，做法是发一个 `@` 开头的内部同步事件，JS 在处理函数里反过来调一次原生把对象交回来：

```js
// 50-<域>.js：@ 开头的事件不派发给监听器，直接交给这里登记的函数
ctx.internalEventHandlers.set('@cell', (source, request) => { … nativeCall(source, 'nacre:provideCell', [cell]); });
```

原生那一半和「当前请求」怎么记，照 `NacreCollection.mm` 写，说明在[列表](collection-view.md#单元格是怎么带回去的)。

**对象的 `delegate` 槽位可能有别的域也要用时，不要直接写 `object.delegate = mine`**，用 `NacreAddDelegatePart(object, mine)` / `NacreRemoveDelegatePart(object, mine)`。滚动视图的 `delegate` 就是这样的槽位：核心的滚动事件占着它，`UICollectionView` 的委托和它是同一个属性。见[列表](collection-view.md#委托的槽位和滚动事件共用)。

**`UIControl` 的子类不用写订阅。** `UISwitch`、`UISlider` 这些的 `change` 等 16 个控件事件走核心里现成的控件分支，JS 那一侧继承 `UIControl` 就有。

### 所有权

把对象交给原生的方法，JS 那一侧必须记一条所有权边（`own` / `ownOne` / `ownAll` / `nativeSetOwned`），`check-api.sh` 会核对，原因见[包装机制](wrapper.md)。确实不建立持有的，在 `.mm` 里那个分支旁边就地标一行，理由必须写：

```objc
// nacre:ownership-exempt removeFoo: —— 解除持有，不是建立持有
```

## JS：一个 part

```js
// 50-switch.js
(function (ctx) {
  'use strict';

  const { constructNative, defineNativeClass, nativeGet, nativeSet, requireNative, toBoolean } = ctx;

  defineNativeClass('UISwitch', class UISwitch extends UIControl {
    constructor() {
      super();
      constructNative(this, new.target, 'UISwitch', []);
    }
    get isOn() { requireNative(this, 'isOn'); return nativeGet(this, 'isOn'); }
    set isOn(value) { requireNative(this, 'isOn'); nativeSet(this, 'isOn', toBoolean(value)); }
  });
})
```

- 文件名用 `50-` 开头：核心的 part 排在前面，父类已经定义好了。父类直接按名字用（`UIControl`），原生类都在全局上。
- 助手从 `ctx` 里解构。**不往 `ctx` 里加东西**，缺了就停下来报告。
- 转换照 [参数转换](conversion.md)：`toNumber` / `toInteger` / `toBoolean` / `toText`，options 用 `has(o, key)` 判断带没带。
- 类体里的方法保持 4 个空格的缩进，`check-api.sh` 是按缩进切方法体的。
- API 的形状照已定的规矩：方法名是 selector 第一段加 options 对象；枚举是字符串；结构体是只读的类；异步是 Promise；事件名全小写（`UIControl` 的 16 个除外）。见 [project.md 第 2 节](../project.md#2-api-设计原则)。

## 验收

```js
// acceptance/src/steps/switch.js
/** @param {import("../main.js").StepContext} ctx */
export function stepSwitch(ctx) {
  const { assert } = ctx;
  const host = ctx.section('UISwitch', 60);   // 瀑布里的一个区块，高 60 pt
  console.log('  --- UISwitch ---');
  const sw = new UISwitch();
  host.addSubview(sw);
  assert('默认是关的', sw.isOn, false);
}
```

每个成员都要有断言：默认值、读写、写错值时抛什么、明确不支持的怎样拒绝。故意写错的地方标 `@ts-expect-error`。

三条第一批接类时踩出来的：

- **量布局之前对区块自己排：`host.layoutIfNeeded()`，不要用 `ctx.vc.view.layoutIfNeeded()`。** 新步骤排在导航那一步之后，那时窗口的根页面已经换成了导航控制器，`ctx.vc.view` 不在窗口里，对它排不到刚建的区块（实测区块的 frame 是 0,0,0,0）。
- **不带界面的探针量到的数，不一定是 App 里的数。** 探针里没有窗口、没有 `UIApplication`：主动触发的控件事件发不出去；读数还和探针里先做了什么有关（滚动视图的拖动识别器「最多几根手指」，设过缩放范围是 2，没设过是 4294967295）。拿探针的读数当期望时，写明是在什么状态下量的。
- **会呈现页面的类，不跑 App 查不出问题。** 提示框的呈现控制器不许改委托，而核心对每个被呈现的页面都会去挂一个；这一条静态检查和探针都发现不了，是合并后的验收里崩出来的。这类接入在汇报里要明确写「呈现这一段没有验证」。

入口里每一步都包了一层：一步中途抛了会记一条 `✗ 步骤 … 中途抛了`，后面的步骤照常跑。

### 步骤是排着队跑的

接类加进来的步骤不在 `sceneconnect` 的回调里同步跑。入口（`acceptance/src/main.js`）分三段：

1. **最早就有的步骤**在回调里同步跑完，和以前一样。
2. 等 10 秒，让它们自己的异步部分（等焦点、等第一帧、要求主线程空闲的那几条）先做完。
3. **`later` 数组里的步骤**一步一个任务地跑，最后是收尾的几步（所有权、生命周期、三张和网页的比对）。

所以写步骤时：

- **你的步骤运行时，窗口早就上屏了**，根页面是导航控制器，`ctx.vc.view` 不在窗口里。
- **有异步的部分、并且占着同一时刻只能有一个的东西（呈现模态页、焦点）时，把「全部做完」作为 Promise 从步骤函数里返回**，下一步等它兑现再开始。不返回的话，后面的步骤会在你还没做完时开始，两边抢同一个位置。`alerts.js` 是这样做的例子。
- 步骤里同步的部分别太重。弹窗那一步同步占了 2.1 秒（建分享面板很慢），是所有步骤里最长的。

这套结构是接第二批时改的。原来所有步骤挤在一个回调里同步跑完，同步部分到了 8 秒，而前面的步骤等界面上屏、等第一帧的期限只有 6 到 8 秒：回调还没返回、界面一次都没排过，期限就耗完了，原有的断言开始时过时不过。改的过程里试了四版，每一版撞出一种独占的东西（模态页的呈现位置、焦点、主线程的空闲），所以最后是明确排队，而不是靠各步的异步部分碰巧错开。

### 合并时出过的岔子

并行的几批合下来，出过四处，都不是代码的问题：

- **工程描述文件被去重。** `ios/project.yml` 里各个 target 结尾的那几行是一样的，合并工具把它们当重复的去掉了，三个 target 缺设置、编不过。改成按各分支的原样重拼。
- **验收的配置文件要手工并。** 各个包的权限文案都写在 `acceptance/nacre.config.json` 里，要一条一条并到一起。
- **「两边都保留」会把旧写法带回来。** 入口文件用这种方式合并时，把刚改掉的一行旧写法带了回来，有一步会跑两遍。是靠和临时副本逐文件比对查出来的。
- **临时副本里留着上一批的合并规则。** 实现原理的索引里因此多出一行旧的。每一批开始前把 `.git/info/attributes` 里的规则清掉。

## 检查和验证

每个对话自己跑这两条，都不占模拟器：

```bash
bash ios/scripts/check-api.sh
```

```bash
cd acceptance && npm run check
```

**不跑模拟器。** 模拟器只有一台，验收由合并的那个对话一批跑一次：先只合各组的测试跑一遍看到失败，再合实现，Debug 和 Release 各一遍。

合并的那个对话怎么做（第一批走通的流程）：

1. 先在一个临时的副本里把各组合起来跑，不动正式的分支。入口文件各组在同一处追加，合并时保留双方（给那几个文件临时设 `merge=union`）。
2. 只合每组的第一个提交（测试）跑一遍，确认新断言是失败的。
3. 全部合进来跑。不过的断言定位到原因，发回对应的对话在它自己的分支上修，再重新合并。
4. 全过之后请用户点头，合进正式的分支，再跑 Debug 和 Release。

验收跑完的判据要留够时间：结尾的三张 Intl 比对要等前面的步骤都闲下来才开始，步骤多了之后这段空档会超过半分钟。

## 给已有的类加成员（排在后面做）

有些接入要往已有的类上加东西：下拉刷新要给 `UIScrollView` 加 `refreshControl`，富文本要给 `UILabel` 加 `attributedText`。这类接入和别的域有耦合，**排在独立的那几组之后**。

机制是现成的，三处都从新文件里做：

| | 做法 |
| --- | --- |
| 原生 | 域的 `classes` 里把那个已有的类列进来，处理函数只认领自己加的那几个名字。手势域就是这样认领 `UIView` 的 `gestureRecognizers` 和 `addGestureRecognizer:` 的 |
| JS | `Object.defineProperty(UIScrollView.prototype, 'refreshControl', { get() {…}, set(v) {…} })` |
| 类型 | 声明合并：`interface UIScrollView { refreshControl: UIRefreshControl \| null }` |

`check-api.sh` 第 10 节会核对 JS 挂的和类型声明的对不对得上。**还没解决的一处**：所有权检查是按类体里的方法切的，挂上去的方法它看不见，要到第一次做这类接入时补。

## 这套机制是怎么来的

（2026-11-15）起因是接类太慢：一个类走一遍完整流程，而每一步里一半的改动落在共享文件上，没法几个对话同时做。数过点按手势那一步的提交，20 个文件里有 9 个是每次都要改的。

JS、类型、验收、文档早就是一个域一个文件。卡住的是原生的分发：核心是写死的 `if` 链，每接一个域要去 `NacreBridge.h`、`NacreProperties.mm`、`NacreMethods.mm`、`NacreFactories.mm`、`NacreRuntime.mm` 里各加几行。

拆 Keychain 时做过注册表，但只开了三条通道，而且当时定的是「注册表只给拆出去的能力用，留在核心的继续写死」，理由是核心认识自己的域没有问题，改成注册只是多一层间接。这条理由在只有一个人顺序做的时候成立；要并行，它就成了挡路的那一个，所以改了。

### 做了什么

- `NacreDomain`：一个域在所有通道上的处理函数收成一张表，`NacreRegisterDomain` 登记。
- 核心的十四个分发入口各加一行：先问登记进来的域。原来的 `if` 链不动。
- 事件出口 `NacreEmitEvent…`：域不用再到 `NacreRuntime.mm` 里接一段派发。
- `check-api.sh`：认 `static` 的处理函数；所有权的豁免名单可以就地标在源码里。
- 手势、剪贴板、触感反馈三个域迁到了新写法，`NacreBridge.h` 里它们的声明和三个分发器里它们的分支都删了。

旧的域没有全迁。它们留在 `if` 链里没有任何问题，碰到哪个再顺手迁。

### 验证

判据是验收的断言集合和重构前一样（iPhone Air 模拟器，iOS 27.2，Debug 和 Release 各一遍）：

| | 重构前 | 重构后 |
| --- | --- | --- |
| Release | 2117 通过，3 失败 | 2118 通过，2 失败 |
| Debug | 2098 通过，3 失败 | 2113 通过，3 失败 |

按断言的名字逐条比：**重构前有的断言，重构后一条没少。** 数字上的出入都有着落：

- Release 多通过的一条是访问 httpbin 的那条网络断言，这次连上了。剩下 2 条失败是原有的图片下载。
- Debug 多出来的十几条，是重构前那一遍里自己报了未验证的几组（动画事件、帧回调），这一遍等到了。
- Debug 这一遍 `网页开着的时候写的：不用刷新就看得到` 挂了。它是 [project.md 里记着的那条不稳的断言](../project.md#7-还要做的)（写完 cookie 立刻读），以前只在真机上挂过，这是第一次在模拟器上见到。Release 那一遍它是过的。
- 运行时打的错误日志和警告的条数，两边一样。

`check-api.sh` 三边核对的四个数没变（标量读写 232 / 156，对象读写 69 / 26）。故意弄坏三处都报得出来：迁过去的手势域删一个读属性、豁免标注不写理由、标注一个不收对象的 selector。

### 耗时

每次过桥要先问登记进来的域「这个对象是不是你的」。量了一遍（模拟器，Release，每项 2 万次取 7 轮里最快的）：

| | 重构前 | 重构后 |
| --- | --- | --- |
| 读 `UIView.alpha` | 1.97 µs | 1.95 µs |
| 写 `UIView.alpha` | 1.94 µs | 1.94 µs |
| 读 `UILabel.text` | 2.01 µs | 2.04 µs |
| 读 `UIView.backgroundColor`（对象属性） | 0.55 µs | 0.55 µs |
| 读 `UIView.subviews`（对象数组） | 0.45 µs | 0.46 µs |
| 调 `view.setNeedsLayout()` | 3.12 µs | 3.06 µs |
| 调 `label.sizeThatFits()` | 11.55 µs | 11.27 µs |
| `new UIView()` | 3.84 µs | 4.17 µs |
| 读手势的 `isEnabled`（迁过去的域） | 1.66 µs | 1.27 µs |
| `new UITapGestureRecognizer()`（迁过去的域） | 4.82 µs | 5.10 µs |

差别在 0.3 µs 以内，有快有慢，分不出是重构带来的还是两次运行之间的波动。迁过去的域读属性反而快了一点：它现在是第一个被问到的，以前排在九个域后面。

这是登记了三个域时的数。每多登记一个域，不相干的对象每次过桥多一次类型判断；接到十几个域时会不会看得出来，没量。到那时看得出来的话，按对象的类缓存「该问哪几个域」就行，现在不做。

### 没验证的

- 十六条通道里有七条接了线、但迁过去的三个域用不到：`callVoid`、`callObject`、`callObjectArray`、`writeObject`、`writeObjectArray`、`classCall`、登记表里的 `callAsync`。第一个用到它们的域要留意。走通了的是另外九条：`read`、`write`、`readObject`、`readObjectArray`、`call`、`construct`、`classCallObject`、`classObject`、`subscribe`。
- 真机没跑。预编译的 xcframework 没重打（它要编真机那一个切片，这次只编了模拟器的）。
- 给已有的类加成员时，所有权检查看不见挂上去的方法（见上）。
