# 包装机制

原生对象和 JS 对象怎么对应、谁持有谁、GC 怎么收场。

## 包装机制的实现说明

从 `ui-window-scene.md` 搬过来。

- **句柄不用 V8 的 internal field**，而是挂在内置脚本闭包里的一个 Symbol 上。用 internal field 就得绕过 JS 构造函数来建对象，`EventTarget` 的监听器表就初始化不了
- **C++ 侧维护两张表**：`原生指针 → 句柄 id` 和 `句柄 id → 弱 Global<Object>`。要把原生对象交给 JS 时先查表，命中就复用——这就是身份一致的来源
- **所有权统一用强引用**：包装建立时 `CFRetain`，被 GC 回收时 `CFRelease`。不用弱引用是因为那要处理原生对象先死的悬空问题
- **属性读写走一张分发表**，值用 JSON 编码，加一个属性只要加一行，不用动 C++。这是手写方案，到 `UIView` 那一层就必须换成 M3

## 所有权镜像：JS 侧有自己的引用图

原生对象的 JS 包装是**弱**的（`Engine.cpp` 里 `SetWeak`）。包装被回收之后再从原生读回来，拿到的是 `wrapper_factory(class_name, handle)` **按原生类名新建**的包装——挂在旧包装上的 JS 状态全丢。`EmitObjectEvent` 走的是同一条路，所以**窗口的事件监听器也会静默失效**。

根因是把原生的**边强度**照抄进了 JS。原生用引用计数，`weak` 回边是为了断环；V8 是追踪式 GC，环不要钱。所以边的强度要按 V8 的需求重新定：

> **原生对象 A 持有 B，A 的包装就也持有 B 的包装。**

| 原生边 | 原生强度 | JS 侧 | 不补的后果 |
| --- | --- | --- | --- |
| `container` → `child` | strong | ✅ 镜像 | 包装身份丢、监听器失效 |
| `scene` → `windows` | strong | ✅ 镜像 | 窗口整棵树丢 |
| `view` → `backgroundColor` / `image` / `font`… | strong | ✅ 镜像 | 同上 |
| `vc` → `view`、`window` → `rootViewController`、`scene` → `session` | strong | ✅ 镜像 | 同上 |
| `child` → `superview`、`view` → `window`、`window` → `windowScene` | **weak** | ❌ 不镜像 | 没有——另一端已被上游的所有权边兜住 |
| `anchor` → `item`（第 3c 步） | **weak** | ✅ 镜像 | **SIGSEGV**，实测 |

实现在 `nacre.js`：一张模块级 `WeakMap`（owner 包装 → 边名 → 包装）。用 `WeakMap` 不用包装上的属性，是因为 JS 侧完全看不见它（`getOwnPropertySymbols` 也列不出来），而且 owner 一死整条记录跟着死。所有权边上的对象属性走 `nativeGetOwned` / `nativeSetOwned`，回边仍走 `nativeGetObject` / `nativeSetObject`——`check-api.sh` 两个都算。

**这张表只给 GC 当根，不参与任何查询**，所有的读都走原生。所以 UIKit 自己改树时（pop 一个控制器之类）镜像会漂，但它**只会多留一份引用，永远不会给错答案**。读 `subviews` / `scenes` 时按原生的真相整层重建，碰到哪层修哪层。

连带的结果：**`UIWindow` 不用再手动保持引用了**。`main.js` 里的 `mainWindow` 变量已删除——屏幕上还有东西，就是这条链接上了的证据。

验证方式（`main.js` 里的三条断言）：运行时没有强制 GC 的手段，所以制造垃圾逼 V8 回收，再拿一个**没有所有者**的包装（`UIColor.systemBrownColor`）当对照组。只有对照组的身份也丢了，才说明 GC 真跑过，这一轮的结论才算数；对照组没丢就报「未验证」，不假装通过。实测三条全过。

还没覆盖的：**UIKit 自己建的边镜像不到**（`pushViewController:` 把 `vc.view` 塞进自己的层级，JS 从没调过 `addSubview`）。要全局正确只有两条路，都等 bindgen：按 `CFGetRetainCount` 在空闲期扫一遍（引用计数有自动释放池干扰，不稳），或者接 V8 的 embedder 根、像 Blink 管 DOM 那样在 GC 时问宿主（引擎级改造）。Apple 自己的 JSC 桥走的是和我们一样的路——`JSVirtualMachine` 的 `addManagedReference:withOwner:` 就是让你**把原生侧的所有权边显式报告给 GC**。

## 判据：从 GC 根到它有没有路

「原生的每条强边都在 JS 侧镜像一遍」这个说法**过宽**。真正的判据是：

> **JS 侧只要存在一条从 GC 根（`application`）到那个包装的路径就够了。**

审计过一遍，返回原生对象的取值器分三类：

| | 个数 | 例子 |
| --- | --- | --- |
| 记边（`nativeGetOwned`） | 26 | `view`、`layer`、`rootViewController`、`session`、`font`、`titleLabel`、`contentLayoutGuide`、`owningView`、`navigationController` |
| 锚点（`anchorOf`，自己记 `item` 回边） | 12 | `leadingAnchor` 等 |
| **不记边**（`nativeGetObject`） | **3** | `superview`、`window`、`windowScene` |

那 3 个不记边是对的，因为从根到它们**已经有路**：

```
application  →  scenes              （sceneconnect 时 ownOne）
   scene     →  windows             （windowScene 赋值时 ownOne）
   window    →  rootViewController   （nativeSetOwned）
     vc      →  view                 （nativeGetOwned）
     view    →  subviews             （addSubview 时 ownOne）
```

祖先在 JS 侧一定是活的，所以 `child.superview` 读回来就是那个还活着的包装。

### 所以漏边只有三种形状

| | 什么时候 | 今天 |
| --- | --- | --- |
| **JS 调 API 建了持有，但忘了记边** | `addSubview` / `pushViewController` 忘了 `ownOne` / `ownAll` | 每次加这类方法都要想到。**实际发生过一次**，见下 |
| **原生自建的对象，取值器用了普通版而链路又不通** | 加新的对象取值器时没问「根到它有路吗」 | 三处普通取值器都在链路里，安全 |
| **派生对象天生不在任何链路里** | 锚点、`UILayoutGuide`、约束——它们不在谁的 `subviews` 里 | 已靠 `anchorOf` / `owningView` 补上。[第 3c 步那次 SIGSEGV](auto-layout.md) 就是这一类 |

> **加一个新的返回原生对象的取值器时，先问：从 `application` 到它有没有路？** 有就用 `nativeGetObject`，没有就用 `nativeGetOwned`。

`check-api.sh` **分不出**该用哪个——它只核对符号齐不齐，两种取值器算在一起。编译器更不知道。唯一的网是那条 GC 回归 + 对照组。

## 原生类为什么定成 final

### 先说实测：改之前有一半其实是能继承的

写了一段探针在模拟器上跑，结论和读代码推出来的一致：

| 继承谁 | 构造 | 读属性 | 自定义方法 | 进视图树 |
| --- | --- | --- | --- | --- |
| `UILabel` / `UIStackView` | ✅ | ✅ | ✅ | ✅ |
| `UIView` / `UIControl` / `UIButton` / `UIViewController` | ⚠️ **静默成功** | ❌ 抛「还没连接到场景」 | — | ❌ 抛 |

差别只在实现里：这四个类的构造函数带一道 `new.target !== 自己` 的闸。而加闸的理由和「要不要支持子类」毫无关系——`UILabel extends UIView` 的 `super()` 会先建一个 `UIView`，`UILabel` 再建一次，第二次定义 `kHandle` 直接抛 `Cannot redefine property`。**闸是为了防重复构造，挡住用户的 ES 子类只是副作用。**

那条隐规则是「一个类被另一个运行时类继承，就得加闸」，它**没有任何东西检查**，而且已经漏过一次（5a 做 `UINavigationController` 时当场抛）、抄错过一次（`UIButton` 那道闸没有任何类继承它）。

### 三件事叠起来才是真问题

| | |
| --- | --- |
| **类型检查全绿** | 实测 `class MyPage extends UIViewController { … }` 的 `tsc --noEmit` **零报错** |
| **构造静默成功** | 返回一个对象，`instanceof` 为真，什么都没说 |
| **第一次碰属性才炸，指向错误的方向** | 「还没连接到场景」，而原因在几十行之外的 `extends` 那一行 |

### 定成 final，理由不是「继承危险」

技术上继承不比今天的 expando 更危险——**子类字段和 `view.myData` 是同一个机制**，包装被回收重建时一起丢，而所有权镜像对两者同样有效。

真实的理由是**现在做它没有价值**：

| 继承能干的 | 组合能不能干 |
| --- | --- |
| 加字段、加方法、`instanceof` 分派 | ✅ `acceptance/src/pages.js` 的 `makePage()` 正在这么做 |
| 覆写 `layoutSubviews` / `drawRect:` / `sizeThatFits:` | ❌ 这是 M2 |

支持继承但不支持覆写，用户拿到的是组合已经能给的东西。而**响亮地拒绝**拿到的是：静默失败没了、不一致没了、错误信息准了。

所以这一步只做后者，继承推到 M2 —— 那时候**必须**连包装生命周期一起解决：覆写了 `layoutSubviews` 的包装如果被重建成基类，覆写直接失效，比丢个字段严重得多。

### 做法：闸吃进 `constructNative`，一行

```js
constructor() {
  super();
  constructNative(this, new.target, 'UILabel', []);   // 每个可构造的类都是这一行
}
```

```js
function constructNative(wrapper, builtAs, className, args) {
  if (nativeClasses[className] !== builtAs) return;   // 我不是正在被 new 的那个
  …
}
```

比「每个类自己写 `if`」好在三点：没有要判断的东西（新加类照抄）、类名只出现一次（`UIButton` 那道多余的闸正是重复抄出来的）、抄错类名会在原生侧 `ConstructNative` 找不到分支，当场抛而不是静默。

「不许继承」只拦一处——**所有原生类的构造链都经过 `NSObject`**：

```js
function finalCheck(newTarget) {
  if (nativeClassNames.has(newTarget)) return;   // 是运行时自己的类
  …顺原型链找到最近的原生基类，把两个类名都写进错误信息…
}
```

**拦不到 `class X extends UIView {}` 那一行本身**：JS 没有「拒绝被继承」的钩子，`extends` 只是读 `prototype` 再 `setPrototypeOf`，没有可以挂的陷阱；`prototype` 在 class 上是 non-configurable，也换不成会抛的取值器。最早只能在 `new` 的时候。

### 顺手删掉的那个全局开关

包装工厂原来是这么建对象的：

```js
allowNativeConstruct = true;
try { wrapper = new Cls(); } finally { allowNativeConstruct = false; }
```

`finally` 挡住了「抛异常卡住」，但**布尔量不可重入**：如果 `new Cls()` 期间又触发一次工厂，内层的 `finally` 会把它设成 `false`，外层还没跑完。今天构不成重入（构造函数在这条路上全是立刻 `return`），但那是**巧合**，没有任何东西保证。

而卡住的后果没有上限：标志停在 `true` 之后**没有任何东西会复位**，之后每一个 `new` 都静默返回空壳——全局、永久、无声。

查了一遍，工厂调 `new Cls()` 的**唯一作用**是让 `EventTarget` 的构造函数把 `kListeners` 挂上去。那就不用走构造函数：

```js
const wrapper = initWrapper(Object.create(Cls.prototype));
Object.defineProperty(wrapper, kHandle, { value: handle });
```

`initWrapper` 是从 `EventTarget` 构造函数里抽出来的同一段，两条路共用，免得漂。这也正是 Web 的 upgrade 做法——已有对象不跑构造函数。`allowNativeConstruct` 的 19 处引用随之全删。

### 三种病的判据是 `kListeners`

它由 `EventTarget` 的构造函数和包装工厂装上，`Object.create(X.prototype)` 出来的对象上没有。所以：

```js
function requireNative(obj, what) {
  if (obj[kHandle] !== undefined) return;
  if (obj[kListeners] === undefined) throw new TypeError(what + ': Illegal invocation');
  throw new TypeError(what + ': this object is not connected to a scene yet, …');
}
```

`EventTarget` 的三个方法也补了同一句——以前 `Object.create(X.prototype).addEventListener(…)` 抛的是 V8 的内部错 `Cannot read properties of undefined (reading 'get')`。

这套分法是照 Web 来的。Web IDL 的判据是 **internal slot**，不是原型链（www-dom 2015，Boris Zbarsky 原话：「the prototype chain has absolutely nothing to do with internal slots」）。我们闭包里的 `kHandle` / `kListeners` 就是 internal slot 的等价物——外面拿不到那个 Symbol，所以伪造不出来。实测 Chrome：`Object.create(HTMLButtonElement.prototype).disabled` 报 `TypeError: Illegal invocation`，`new HTMLButtonElement()` 报 `Illegal constructor`，两种分得很清楚。

### 我们站在 Chrome 56 的位置

「包装被回收重建、挂在上面的东西全丢」这件事 Chrome 遇到过，而且是同一个形状。V8 博客讲 Chrome 56 及以前的 object grouping（原文）：

> led to various bugs where JavaScript wrapper objects would prematurely get collected, which resulted in them being replaced by empty JS wrappers that would lose all their properties.

而 object grouping 的机制——「按文档包含关系分组，组里有一个活着整组就活着」——**就是我们的所有权镜像**。Chrome 2017 年 3 月（Chrome 57）把它换成 cross-component tracing：让 C++ 对象持有 wrapper 并参与 V8 的追踪，从此 wrapper 不再重建。他们的硬指标写在 `V8BindingDesign.md`（原文）：

> For compatibility reasons, we need to make sure that the same DOM wrapper is returned to JavaScript as long as the underlying C++ DOM object is alive.

我们还没有这一层。所以 expando 的保证只能说到「从 `application` 走得到就在」，这正是上面那张所有权镜像的表。真要做到 Chrome 57 那样，要么接 V8 的 embedder 根，要么像 Apple 的 JSC 桥那样用 `addManagedReference:withOwner:` 把原生边显式报告给 GC——和 M2 一起。

> 两份讲 wrapper 强弱语义的 Chromium 文档（`TraceWrapperReference.md`、`V8GCController.md`）已经 404，所以「C++ 侧那个引用具体是强是弱」没能逐字核实。
## 实际漏过一次：按状态存的东西

`UIButton` 的 `setTitleColor:forState:` / `setImage:forState:` / `setBackgroundImage:forState:` 把一个 `UIColor` / `UIImage` 交给原生，原生 retain 它，但 JS 侧**没记所有权边**；读回来的 `imageForState` 也是普通的 `nativeCallObject`，不是 owned 版本。

**它从两张网中间漏了下去**：按状态存的东西既不是父子边（躲过 `ownOne`），也不是属性（躲过 `nativeSetOwned`）。

实测坐实（探针在 `ownership.js` 里留成了回归）：

```
✓ 基线：setImage 之后读回来就是同一个包装 = true
✓ 对照组（无所有者）GC 后身份丢失 = true        ← GC 真跑过
✓ 属性边 backgroundColor GC 后还在 = bg-note    ← 阳性对照，探针没坏
  imageForState GC 后 note = undefined          ← 丢了
  titleColorForState GC 后 note = undefined     ← 丢了
```

### 探针写两遍才对

第一版的结论是「两个都没丢」，和读代码推的相反。**错在探针**：被测对象存在 `const` 里，对照组是个没存变量的表达式。`waitForRealGC` 第一次是在同一个函数里**同步**调的，那一轮栈帧还活着，被测的在寄存器里被标成可达，对照组从来不在。对照组一旦在第一轮就被回收，循环当场结束，而被测的还被钉着。

> **只有在断言「应该死」的时候，位置对等才是必要条件。** `ownership.js` 原有的几条断言的是「应该活」，所以不受这个影响。

改法是四个对象全部 `let` 存、显式置空。对照组丢掉就同时证明了两件事：GC 真跑过，**而且被测的也有资格被回收**——第二件是第一版缺的。

### Chrome 在同样的位置不丢

实测 Chrome（造垃圾 + `WeakRef` 判存活，对照组被回收才算数）：

| 形状 | 包装还在 | expando 还在 |
| --- | --- | --- |
| 树边 `appendChild` | ✅ | ✅ |
| **按键存** `setAttributeNode` → `getAttributeNode` | ✅ | ✅ |
| 数组属性 `adoptedStyleSheets` | ✅ | ✅ |
| **平台持有、之后取回** `el.animate()` → `getAnimations()` | ✅ | ✅ |
| 对照：游离的 `div`，谁都不持有 | ❌ 被回收 | — |

中间两行正是我们漏的那个形状。所以这不是「Web 也这样」，是我们缺了一条边。

> 测 Chrome 时踩到一个 ECMAScript 语义：**`WeakRef.deref()` 会让目标在当前任务内保持强可达**。把 `refs.ctrl.deref() !== undefined` 写进循环条件，等于每轮都把对照组钉住一次，对照组永远回收不掉。要在循环外只 deref 一次。

### 修法：按状态做所有权边的键

```js
setImage(image, options) {
  const state = stateOption(options, 'setImage');
  nativeCall(this, 'setImage:forState:', [image, state]);
  own(this, stateKey('image', state), image);        // 重设同一状态会顶掉旧的
}
imageForState(state) {
  return own(this, stateKey('image', state),          // 读回来也记一条
             nativeCallObject(this, 'imageForState:', [[state]]));
}
```

**读那一侧也要记**：`UIButton.buttonWithType('system')` 的默认图和颜色是 UIKit 自己放进去的，JS 从没调过 setter，只有读的时候才第一次见到它们。这和 `nativeGetOwned` 是同一个道理——取值器读到的对象就地记边。

### 这条已经变成机械检查

三处是**人工逐条过所有「把对象交给原生」的方法**才找出来的。同样的形状以后还会有，所以判据固化进了 `check-api.sh`：

> **原生层说哪些 selector 收对象参数，JS 侧对应的方法就必须出现 `own` / `ownOne` / `ownAll` / `nativeSetOwned` 之一，否则登记进 `OWNERSHIP_EXEMPT`。**

**真相取自原生层**：一个 selector 的分支里用了取对象参数的助手（`objectArg` / `viewArg` / `guideArg` / `colorArg` / `imageArg` / `vcArg`），它就收对象。不靠猜 JS 那边的参数长什么样。

两个实现上的坑：

- **分支体不能按「到下一个分支为止」切**。那些 `...Arg` 的 lambda 就定义在分支之间，而它们的函数体里本来就有 `objectArg(`——`vcArg` 的定义会把它前面那个分支误判成收对象。改成从 selector 判断处找到 `{` 再按括号配对取分支体
- **`kSyncStack` 要算作记边的写法**。`pushViewController` 自己不调 `ownAll`，它调 `this[kSyncStack]()`，而那个方法按原生真相整层 `ownAll` 一遍

白名单今天 8 条，分三类：只读不持有（`convertPoint:toView:` 一组、`isDescendantOfView:`、`customSpacingAfterView:`）、参数本来就已经被别的边持有（`bringSubviewToFront:`、`sendSubviewToBack:`、`setCustomSpacing:afterView:`）、解除持有（`removeArrangedSubview:`）。白名单里混进一条已经不收对象的，也会被报出来。

**四类弄坏法都验过**，一条噪音都没有：

| 弄坏什么 | 报什么 |
| --- | --- |
| 拿掉 `setImage` 的 `own` | `所有权: ['setImage:forState:'] 把对象交给原生，但方法体里没有 own…` |
| 原生侧取参助手改名 | `脚本: 收对象参数的 selector 抽出来是空的，check-api.sh 要更新` |
| 分发表的 `isEqualToString:` 改名 | `脚本: 分发表里的 selector 分支定位不到，check-api.sh 要更新` |
| nacre.js 的 `nativeCall(this, ` 改名 | `脚本: nacre.js 里一个收对象的 selector 都没对上，check-api.sh 要更新` |

最后一条是补上去的——**第一版这里是静默通过的**：JS 侧正则一旦失配，`hit` 永远是空集，这一节就永远「一致」。正是 `extract()` 当初要防的那种失效，所以加了「一个都没对上就报」的守卫。

**后来又堵了三个盲区**（2026-11-12）。它们不是「判据错了」，是抽取的正则各漏了一种写法，漏掉的部分一直没人盯：

| 漏的写法 | 例子 | 漏掉了什么 |
| --- | --- | --- |
| 不经助手、直接 `args.object(` 取对象 | `addAnimation:forKey:`、`addToRunLoop:forMode:`、`appendPath:` | 这几个 selector 不算「收对象」 |
| 分支写成 `name == "…"` 而不是 `[sel isEqualToString:@"…"]` | 返回对象数组那条通道：`popToViewController:animated:`、`setViewControllers:animated:` | 同上 |
| JS 侧写在一行里的方法，以及实参换行的调用 | `appendPath(path) { nativeCall(…); }` | 这些方法体根本没被切出来 |

堵上之后只报出一处真的：`removeFromRunLoop:forMode:` 收了 run loop 却没有动持有边。那条边当时还记反了（见下一节）。`appendPath:` 进了白名单——头文件说它接过来的是内容的副本。

盲区是做「删掉订阅保活集合」之前查出来的。那个集合一直在替所有权镜像遮着漏边，要拿掉它，这张网得先是完整的。


## 没有父对象的三类：边挂在谁身上

视图、手势、页面都在某个父对象下面，从 `application` 一路走得到。下面三类没有父对象，系统却会一直让它们活着、给它们发事件。判据还是那一条——**原生谁持有它，JS 侧就由谁的包装持有它**：

| 对象 | 原生由谁持有 | JS 侧的边 | 什么时候放开 |
| --- | --- | --- | --- |
| `CADisplayLink` | 加进去的那个 run loop | `runLoop` → `displayLinks` | 最后一个模式被 `removeFromRunLoop` 摘掉，或者 `invalidate()` |
| `WebSocket` | 系统的网络会话（不暴露） | `application` → `webSockets` | 关闭事件派发之后 |
| `NSRunLoop.mainRunLoop`、`UIPasteboard.generalPasteboard` | 系统单例 | 类自己 → 那个包装 | 不放开 |

三个细节：

- **display link 那条边原来记反了**，是 link 持有 run loop。那个方向什么都保不住：run loop 是单例，本来就不会没；而 link 加进去之后 JS 丢掉引用，包装就被回收了，原生那个 link 还在 run loop 上每帧空转。
- **系统不告诉我们一个 link 在哪几个模式上**，所以 JS 侧自己记（`linkRunLoops`）。加进 `default` 和 `tracking` 两个模式、只摘掉一个，它还在另一个上，不能放。
- **`WebSocket` 的出口在事件汇入口**，不在 `close()` 方法里。`close()` 只是开始关，对端先关、连接失败也都要放开，而这三种情况原生最后都会发一个 `close` 事件（失败时是 `error` 之后补一个 1006）。这个事件不受「有没有人监听」影响，原生总是发。

这一组**原来靠的是订阅保活集合**：加了监听器的对象被一个全局强引用的 `Set` 拿着。所以不加监听器的时候它们其实一直是漏的，只是不加监听器的 display link 和 WebSocket 没什么用，没人撞上。

验收在 `acceptance/src/steps/lifetime.js`，**故意都不加监听器**，这样结果不受那个集合干扰。改之前 4 条失败（在 run loop 上的 link 被回收了、打开着的 socket 被回收了），改之后 10 条全过，包括「放开之后要能被回收」的那一半。

## 加监听器不改变对象的寿命

2026-11-12 之前不是这样。`nacre.js` 里有一个模块级的强引用 `Set`（`subscribed`）：某个事件类型的第一个监听器注册时，对象把自己放进去；**只有监听器全部移走才出来**。

当初这么做的理由是对的：包装是弱引用的，监听器存在包装上，包装一被回收重建，监听器就丢了。用一个强集合把它拿住是最直接的办法。

问题是只设计了进，没设计够出。从界面上摘掉、页面被弹出导航栈、`WebSocket` 关了、`CADisplayLink` 失效了、JS 里一个引用都不剩——都不出来。而写 App 的人不会在离开页面时逐个调 `removeEventListener`，Web 上也不需要。所以实际效果是**加过监听器的对象基本都出不来**，连同回调捕获的东西。一份外部审查指出了这一点。

### 判断：这个集合在做镜像已经做了的事

事件到达时要保证的只有一件事：那个包装还活着。逐类核对「谁让它活着」：

| 类 | 原生由谁持有 | JS 侧从 `application` 走得到吗 |
| --- | --- | --- |
| `UIControl`、`UIScrollView` | 父视图 | 走得到：`addSubview` 记边，`removeFromSuperview` 解除 |
| `UIGestureRecognizer` | 所在的视图 | 走得到 |
| `UIViewController`、`UINavigationController` | 窗口、导航栈、呈现它的页面 | 走得到 |
| `UIBarButtonItem` | 导航项 | 走得到 |
| `CAAnimation` | 图层持有拷贝，原件原生不持有 | 走得到：`addAnimation` 记了图层到动画的边 |
| `CADisplayLink`、`WebSocket`、两个单例 | run loop、网络会话、系统 | **原来走不到**，见上一节，已经补上 |

前五行里，按钮在界面上时所有权镜像本来就拿着它；从树上摘下来、JS 里也没人拿着时，原生对象跟着包装一起释放，系统不可能再给它发事件，这时候回收是对的。集合对它们多出来的唯一效果就是「摘下来之后还不放」。

所以顺序是：**先把镜像补全，再删集合**。删掉之后 11 个类的订阅钩子都只剩一行 `subscribeNative(this, type, on)`，只通知原生，不碰寿命。

### Web 为什么没有这个问题

查过 Chromium 的源码和 V8 的博客，它靠三件事：

| Chrome 的做法 | 出处 | 我们能学吗 |
| --- | --- | --- |
| 监听器存在 C++ 对象上，不在 JS 包装上 | `event_target.h`：`EventTargetData` 里的 `EventListenerMap` | **学了也没用。** 回调通常捕获着对象自己，监听器表 → 回调 → 包装 → 原生对象是一个环。Chrome 能回收这个环靠的是下一条 |
| GC 同时追踪 JS 和 C++ 两边的引用 | V8 博客 *Tracing from JS to the DOM and back again*：「determines liveness by tracing from JavaScript to the C++ implementation of the DOM and back」 | **学不了。** UIKit 是不透明的，没法让它告诉 GC 它持有谁。Apple 自己的 JavaScriptCore 桥也是让开发者手工上报（`addManagedReference:withOwner:`） |
| 没人引用但还在活动的对象单独保活 | `active_script_wrappable_base.h`：「will be kept alive as long as they have a pending activity」 | **能学**，就是上一节那三类 |

Chrome 走的是 DOM 自己用的那些指针，没有第二份手工抄的引用图，也就不存在「抄漏了一条」。我们的镜像是手工抄的，会漏。所以下面两样不是附带的，是这套做法的安全性所在。

### 安全网一：`check-api.sh` 的所有权检查

见[上面那一节](#这条已经变成机械检查)。删集合之前先堵了三个盲区。

### 安全网二：包装被重建时打警告

集合原来在替镜像的漏边遮着。删掉之后，漏一条边的后果从「挂在包装上的状态丢了」升级成「监听器静默失效」。静默不行，所以：

引擎在派发原生事件前先看这个原生对象有没有活着的包装（`HasWrapper`），把结果作为第四个参数交给事件汇入口。包装是为这次派发现建的，就打一条：

```
[Nacre] CADisplayLink fired "tick" after its JS wrapper was collected; its listeners
are gone and this event was dropped. Keep a reference to the object, or report this
if it is still on screen.
```

验证方法是一次性的探针：故意去掉 run loop 到 display link 那条边，一个带 `tick` 监听器的 link 被回收之后，每次完整 GC 之后的第一个 tick 都报出了这一条。探针没有留在代码里。

`UIWindow` 和 `WebSocket` 不报。它们的事件原生总是发，不看有没有人订；系统自己的窗口（键盘那一类）JS 从没碰过，第一次发事件时包装当然是新建的——第一版没排除，实测每次启动误报两条 `UIWindow fired "becomevisible"`。

### 系统自己动了持有关系：两个内部事件

镜像原来只在 JS 主动调方法时更新。两种情况它不知道：

| 用户的操作 | 原来的后果 |
| --- | --- |
| 点导航条的返回，或者左滑返回 | 被弹出的页面仍被「导航栈」那条边持有，直到下一次 JS 调 push / pop 或者读 `viewControllers` |
| 把模态页向下拖走 | 被关掉的页面仍被呈现者持有，直到下一次读 `presentedViewController` 或再弹一个 |

`acceptance/src/router.js` 那种写法碰巧不受影响：它监听 `didshow` 时会读 `nav.viewControllers`，那一读就把边修好了。没有这种监听器的 App 就一直留着。

集合删掉之后这会变成最主要的泄漏，所以一起做了。难点是**原生的订阅是惰性的**，没人监听 `didshow` 原生就不发。办法是运行时自己常驻订两个内部事件，名字以 `@` 开头：

| 内部事件 | 什么时候订 | 原生什么时候发 | JS 收到后做什么 |
| --- | --- | --- | --- |
| `@stack` | `UINavigationController` 构造时 | `navigationController:didShowViewController:animated:` | `kSyncStack()`：按原生的栈整层重建那条边 |
| `@dismissed` | `presentViewController` 时，订在被呈现的那一页上 | `presentationControllerDidDismiss:`（只有用户拖走才触发） | 找到呈现者（`presenterOf`），按原生的真相重建它的 `presentedViewController` 那条边 |

- 它们在事件汇入口被截住，**不派发给监听器**。
- 用户订不了：`subscribeNative` 拒绝 `@` 开头的名字。
- 原生层没有新增任何调度：它只是多报两个事实，镜像怎么改由 JS 决定。
- `@dismissed` 在原生的订阅入口里要**跳过导航控制器那一支**，落到模态那一支——被呈现的常常就是一个 `UINavigationController`。对外的事件名没有动，「被模态呈现的导航控制器收不到 `diddismiss`」那条 TODO 还在。

程序调 `dismissViewController()` 那条路也改了：原来是调完立刻在**被调用的那个对象**上清边，而它可以在呈现者上调，也可以在被呈现的页面自己身上调（UIKit 会转给呈现者），后一种情况清错了对象。现在等动画结束，两头都按原生的真相同步一次。

### 验证

`acceptance/src/steps/lifetime.js`，都用 `FinalizationRegistry` 观察，带对照组：

| | 改之前 | 改之后 |
| --- | --- | --- |
| 8 种游离的、加了监听器的对象 | 都不回收 | 都回收 |
| 回调捕获着自己的 `UIControl` | 不回收 | 回收 |
| 加进去又摘下来的 `UIControl` | 不回收 | 回收 |
| 失效之后的 display link（监听器没移） | 不回收 | 回收 |
| 在树上的 `UIControl`，JS 引用丢掉 | 活着，事件照常到 | 活着，事件照常到 |

最后一行是配对的那一半：从父视图把它取回来，`sendActionsForControlEvents` 走一次真的原生派发，监听器被调到了。

系统返回和拖走那两条**要真实触摸**，JS 触发不了。验收里有一个探针：一个放在卡片里的导航控制器，两页，上面一个监听器都没有（有监听器的话，读栈那一下就把边修好了，测不出运行时自己有没有跟上），定时逼 GC 看三个对象什么时候被回收。

模拟器上实测（2026-11-12，日志里每条带「弹出后第几秒」）：

| 操作 | 结果 |
| --- | --- |
| 点卡片左上角的返回 | 第二页在第 3 秒被回收，这时卡片还在 |
| 再把卡片向下拖走 | 导航控制器和第一页在第 11 秒被回收 |
| 用 router 进一页、再返回，两次 | 离开栈的页面和它上面带监听器的按钮全部被回收（共登记 8 个） |

第一行要成立，得先排除另一种解释：第二页还在屏幕上时包装就被错误地回收了。所以另有一组**自动**断言垫底——同样的结构、不碰它，三个对象经过 GC 都还活着；程序 `dismiss` 之后三个都被回收。两组合起来才说明「点返回那一下自己就放开了第二页」。

被拖走的那个正好是一个 `UINavigationController`，所以 `@dismissed` 在原生订阅入口里绕过导航那一支的路也验到了。

### 写用例时又踩了一次 `deref()`

`collectGarbage()`（`acceptance/src/support.js`）第一版在调用方的那一轮任务里就开始制造压力。调用方刚对一个 `WeakRef` 调过 `deref()`，目标在那一轮里是被保住的；第一拍逼出的 GC 收走了对照组、留下了被测对象，对照组一被回收助手就停手，之后再没有第二次 GC——被测对象「没被回收」，是假的失败。改成第一拍也排到下一轮任务。这和[上面测 Chrome 时](#chrome-在同样的位置不丢)踩的是同一条语义。

### 没做的

图层到动画那条边在动画结束后不解除。长寿的图层反复 `addAnimation` 新的动画对象，那个列表会一直长。要及时解除得给每个动画常驻一个结束通知，不管有没有人监听，那会改变每个动画的原生行为，成本没量过。

## 又漏过一次：`new Blob()` 只抄了句柄的数值

所有权镜像管的是「JS 包装之间谁拖住谁」。这一次漏的地方更靠下：**一个原生对象有了两个 JS 对象，引擎只认其中一个**。

### 现象

```js
const blob = new Blob([bytes]);
blob.size;            // 3
// …… 一次 GC 之后 ……
blob.size;            // null
UIImage.imageWithData(blob);   // TypeError: imageWithData needs a Blob
```

`blob` 这个变量一直被拿着，对象自己活得好好的，数据没了。新建之后立刻用是好的，所以平时很难撞上——它是做参数转换时一次性探针跑到一半、恰好经历了一次 GC 才露出来的。

### 根因

```js
const handle = native.createBlob(prepared, type, '');
if (handle) Object.defineProperty(this, kHandle, { value: handle[kHandle] });
```

引擎那边 `createBlob` 用 `WrapNative` 建了一个包装对象交回来，JS 只从它身上**抄走句柄的数值**，放到正在构造的 `this` 上。于是：

| | 是谁 | 引擎认不认它 |
| --- | --- | --- |
| 交回来的那个包装 | 工厂按 `Blob.prototype` 建的 | 认。弱引用挂在它身上，它被回收时 `ReleaseHandle` |
| 用户手里的 `this` | `new Blob()` 的结果 | 不认。只是恰好存着同一个数字 |

第一个对象出了构造函数就没人拿着，成了垃圾。GC 回收它的那一刻，句柄从表里删掉、原生数据 release——用户手里那个 `this` 上的数字从此指向空。

这和 `constructNative` 是同一个问题的两种答案。别的可构造的类走的是 `native.construct(className, args, handles, wrapper)`，把 `this` **本身**交给引擎去绑（`BindWrapper`）；`Blob` 因为要单独传字节缓冲，有自己的通道，写那条通道的时候没有照这个做法。全仓库只有这一处。

### 改法

`createBlob` 的第三个参数原来是个没人用的空串，现在传 `this`。引擎那边从 `WrapNative` 换成 `BindWrapper`，返回句柄——和 `construct` 完全一致。建不出来就抛，不留一个没有句柄的空壳。

### 先让断言失败，再修

回归断言放在 GC 那一组（`ownership.js`）：建一个 Blob 并一直拿着，等对照组确认 GC 真的跑过之后读 `size`。

| | 结果 |
| --- | --- |
| 不改代码，只加断言 | `✗ new Blob()：GC 之后数据还在 = null（期望 3）` |
| 改完 | `✓ … = 3`，全部 1221 条断言通过 |

先跑出失败这一步不能省：这个问题的特点就是「不 GC 就看不出来」，一条从来没失败过的断言证明不了它盯的是对的地方。

## 交接的那一段没人持有：只在 Release 下崩的悬空指针

2026-11-14 第一次用 Release 配置跑验收时撞上的。**它在交付出去的 `Nacre.xcframework` 里躺了很久**——那份是 Release，而验收只跑 Debug。

### 现象

```js
const box = new UIView();
box.backgroundColor = '#f00';
box.backgroundColor;          // Release 下，读到这里 App 就没了
```

真机和模拟器一样。崩溃栈：

```
libobjc.A.dylib  objc_retain                      ← KERN_INVALID_ADDRESS
Nacre            Engine::Impl::WrapNative         (Engine.cpp:418)
Nacre            Engine::Impl::NativeGetObjectProperty
```

崩溃报告里那句 `0xe9f1424a198 is not in any region` 说的就是：这个地址上已经没有对象了。

### 根因

`NativeObjectRef` 只是「指针 + 类名」，不持有对象。真正持有的是引擎的 `WrapNative`，它拿到指针之后才 `CFRetain`。**从宿主造出 ref 到引擎 retain 它，中间这一段没人管**：

```objc
// NacrePropsView.mm，改之前
if (name == "backgroundColor") return {(__bridge void*)view.backgroundColor, "UIColor"};
```

`__bridge` 不转移所有权。`view.backgroundColor` 返回的是一个临时对象，这条语句一结束 ARC 就可以把它释放掉——如果 UIKit 这次返回的是一个现造的 `UIColor`（没有别人持有），它当场就销毁了，交出去的是悬空指针。

### 为什么 Debug 下从来不崩

不是 Debug 下没问题，是**碰巧**。ARC 对「方法返回的对象」有一套返回值握手（被调用方 `objc_autoreleaseReturnValue`，调用方 `objc_retainAutoreleasedReturnValue`）：握手成了，对象不进自动释放池，调用方用完立刻释放；握手不成，对象留在池里，活到这一轮 run loop 结束。没开优化时握手通常不成，所以那个临时对象碰巧还活着，`WrapNative` 来得及 retain。

所以这是一个**在 Debug 下没有任何信号**的错：不崩、不警告、断言全过。

### 不是新引入的，也不是一处

发现它的时候正在做能力注册那一步，第一反应是「我改坏了」。分清楚用的是一个四行的探针，跑在**那两步之前**建的 xcframework 上（里面还是 `nacre.js` 的旧加载方式）：

```
[JS][log] 探针：写完了，现在读
（没有下一行，App 崩了）
```

同样崩。所以是老问题。「大概率是老问题」不算证据，要拿一份没被新改动碰过的产物真跑一次。

影响面是一类：`ios/Runtime` 里造 `NativeObjectRef` 的地方有 **137 处**，全部是 `{(__bridge void*)表达式, "类名"}` 这一个形态。其中哪些会崩，取决于那个属性返回的是「别人持有着的对象」还是「现造的对象」——而这是 UIKit 的实现细节，换个系统版本就可能变。`view.superview` 安全，`view.backgroundColor` 不安全，光看代码分不出来。

### 修法：交成裸指针的那一刻保活

```objc
static inline void* NacreKeep(id _Nullable object) {
  return object != nil ? (void*)CFAutorelease(CFBridgingRetain(object)) : nullptr;
}
```

显式放进自动释放池：对象至少活到当前池排空。JS 调宿主是同步的，从造出 ref 到 `WrapNative` 持有它，都在同一个池的生命周期里。137 处全部换成 `{NacreKeep(表达式), "类名"}`，**不逐个判断哪些属性安全**。

替换是脚本做的，按括号深度找表达式的结尾（表达式里有方括号、嵌套括号、逗号，正则配不住）。数量必须正好 137，换完文件里不许再剩裸的写法。

**它不管跨轮的事。** 对象要等下一轮主队列才用（延后派发、异步兑现）时，自动释放池早就排空了。那种情况要让 block 捕获对象本身，在 block 里面再造 ref——这一半**原本就是对的**，`NacreRuntime.mm` 里早有注释：「捕获 object 本身而不是裸指针：block 要等下一轮主队列才跑，这中间必须有人持有它」。漏掉的只是同步返回这条路。

### 为什么一直没发现，以及补上的两张网

**验收从来只跑 Debug。** `run-sim.sh` 是 Debug，以前打真机包也是 Debug；`examples/hello` 用的倒是 Release 的 xcframework，但它只写颜色不读。我们声称交付的那个配置，验收一次都没跑过——和「支持 iOS 26+ 这句话从来没被验证过」是同一种缺口。

| | |
| --- | --- |
| `run-sim.sh --release` | 验收用 Release 配置跑。SOP 第 6 步改成：动了原生代码，Debug 和 Release 各跑一遍 |
| `check-api.sh` 第 9 节 | `.mm` 里再出现裸的 `(__bridge void*)` 就报错，给出文件和行号。靠人记是记不住的——Debug 下一切正常，没有任何东西提醒你写错了 |

### 验证

| | 修之前 | 修之后 |
| --- | --- | --- |
| 模拟器 Release | 跑到第 89 条断言就崩 | 1749 条通过 |
| 模拟器 Debug | 1749 条通过 | 1749 条通过，**和 Release 的断言集合一字不差** |
| 真机（iPhone 14）Release | 跑到第 89 条断言就崩 | 1735 条通过 |
| 四行探针 + 预编译的 xcframework（用户拿到的就是这个形态） | 崩在读那一行 | `探针：读回来了 = #f00` |

三处验收都只剩那 2 条原有的图片下载网络失败。

真机那一遍顺带补上了能力注册没验到的一半：Keychain 的 `get` / `set` 走异步通道、经注册表，`✓ Keychain 记到的启动次数 = 27（上一次存的还在）`。它之前验不到，就是因为 App 先崩在这个问题上。

---

← 返回[实现原理](README.md) ・ [项目说明](../project.md)
