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
| 加字段、加方法、`instanceof` 分派 | ✅ `app/src/pages.js` 的 `makePage()` 正在这么做 |
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

---

← 返回[实现原理](README.md) ・ [项目说明](../project.md)
