# bindgen：从头文件出绑定的初稿

← [实现原理](README.md)

bindgen 是我们开发时跑的脚本（`ios/scripts/bindgen/`），不进构建，也不进运行时。它读 SDK 的头文件，照已定的写法，把接一个类时本来要从空白写起的那几份文件写出一份初稿。这一页记它现在怎么用、为什么是这样，以及一路量到的数。

## 现在的做法：生成一次，之后归手写

（2026-11-18 定。这一天里做法改过一次，原来的和为什么改见下面「做法是怎么改的」。）

```bash
node ios/scripts/bindgen/bindgen.mjs extract                              # 头文件 → ios/build/bindgen/<框架>.json
node ios/scripts/bindgen/bindgen.mjs report                               # 每个已接的类还缺哪些成员 → ios/build/bindgen/report.md
node ios/scripts/bindgen/bindgen.mjs scaffold refresh-control UIRefreshControl   # 写出一个域的初稿
node --test ios/scripts/bindgen/test/*.test.mjs                           # bindgen 自己的用例
```

`scaffold <域> <类…>` 照手写的格式写出一个域的全套文件：

| 文件 | 是什么 |
| --- | --- |
| `ios/Runtime/Bridge/Nacre<域>.mm` | 原生：一个域，`+load` 里登记 |
| `ios/Runtime/Builtin/parts/50-<域>.js` | 内置脚本：一个 part。这个域用到的手写的类如果是在 50 这一档定义的，序号自动往后排 |
| `packages/types/ios/<域>.d.ts` | 类型定义 |
| `acceptance/src/steps/<域>.js` | 验收：每个属性读写往返一遍 |
| `docs/api/<域>.md` | 成员清单：名字、类型、对应的 selector |

**写完之后这些就是普通的手写文件。** 直接改，bindgen 不会再碰它们：文件已经在了它就拒绝，不覆盖。它写完会列出接下来人要做的事：

1. 入口各加一行（类型的引用、验收的登记、文档的侧边栏和索引）。
2. 它没写的成员里要用的，手写进去：事件、认不出所有权的方法、带参数的构造。它会逐个列出没写的成员和原因。
3. 验收里它只给了读写往返。默认值和实际用法的断言要量过再写。
4. 文档它只给了一张清单。例子和效果要在模拟器上看过再写。

域里的类有两种：没接过的，整个类写出来；已经手写过的，只写它还没有的成员（往原型上挂，类型用声明合并，写法见[接入一组类](adding-classes.md#给已有的类加成员排在后面做)）。

已接的类还缺什么，看 `report`：它逐个类列出头文件里有、手写的没有的属性和方法。按待办的需要补，不一次补完。

`overrides.json` 是出初稿和出报告时要知道的手写约定，四种：手写的那一侧已经有转换的类型（`types`）、哪个类实现了哪个协议（`protocols`）、定了不接的成员（`exclude`）、动词认不出所有权的方法该怎么记（`methods`）。它是长期留着的：不然下次给同一个类补成员，定了不接的那几个又会冒出来。

### 定下来的

- **生成一次，之后归手写。** 不是「生成的文件永远不手改」，也不是「把手写的全部换成生成的」。
- **不一次把没接的类全生成。** 接哪些类按需要定，见下面量到的数。
- **产物按框架分开。** 提取是一个框架一份文件；能力包里的类以后要各进各的目录。
- **写出来的是和手写一样的原生代码，不做动态调用。** 理由见「为什么不做动态调用」。

### 做法是怎么改的

这一天早些时候定的是另一种：生成的文件永远不手改，每次改了清单或规则就重新生成、整个覆盖；手写的东西另起文件。照这个做了两个没接过的类和四个已接的类的补成员，产物叫 `NacreGenUIKit.mm`、`60-gen-uikit.js`、`gen-uikit.d.ts`，外加一张清单 `classes.json`。下面从「第二步」到「往已接的类上补成员」各节是按那种做法记的过程：**规则、量到的数、踩到的坑都还作数，文件名和 `generate` 这个命令已经没有了。**

改的原因有三个：

1. **「先生成、再覆写」在那种做法下走不通。** 对整个由生成器定义的类，手写的补充没地方放：生成的类在 `60-` 的文件里才定义，手写的脚本叫 `50-`，排在它前面执行，那一刻类还不存在。生成器也看不见这份手写（它只认加到手写的类上的声明合并），照样再生成一份。原生那边两个域都认领同一个名字时，先后是按域的名字排的。要补这三个洞，得再加一档文件序号、一条识别规则、一条先后的规则，外加一道「产物是不是最新」的检查。
2. **每个类真正花时间的本来就要人改。** 机械规则算得出手写成员的九成多，剩下的是事件、所有权、哪些该收紧、默认值和效果。生成的文件不让改，这些就都得绕到别处去写。
3. **一次全生成拿不到多少。** 试算过把 UIKit 里没接的类全交给生成器，见下表。

| UIKit（iOS 27.2 的 SDK） | 个数 |
| --- | --- |
| 类一共 | 548 |
| 没接的 | 465，其中 162 个已废弃或在 iOS 上不可用 |
| 剩下的 303 个里，生成器接得了的 | 222 |
| 接不了：不能直接 `new` 的 | 47 |
| 接不了：父类没接的 | 34 |
| 接得了的里面，一个成员都写不出的 | 59 |
| 一共写得出 | 585 个属性、111 个方法 |
| 这些类里带委托或数据源、要手写事件才有用的 | 29 |

也就是 163 个有内容的类，平均每个不到 4 个属性、不到 1 个方法；内置脚本会从 568 KB 涨到 760 KB 左右。而每个类一旦暴露出去就是一份要维护的承诺。

改完之后，那天生成的六个类用 `scaffold` 重写成了两个普通的手写的域：`system-controls`（`UIColorWell`、`UIPasteControlConfiguration`）和 `view-additions`（`UIView`、`UIScrollView`、`UITextField`、`UITextView` 上补的 76 个属性、23 个方法）。成员和原来一样，三边核对的数字一字不差（标量读写 410/300，对象读写 121/60）。原来手写的那一步验收断言拆进了两个域各自的文件。

`UIPasteControlConfiguration` 随后删掉了：它是给 `UIPasteControl` 用的，那个类没接，单独拿着它什么都做不了，而转成手写之后它是一份要长期维护的代码。`system-controls` 这个域现在只有 `UIColorWell`。往下各节里提到它的地方是当时的记录。

这种做法的代价：手写的三份代码还是三份，`check-api.sh` 继续要；以后改了某条规矩，已经出过初稿的类不会自动跟着变；SDK 更新了要自己跑 `report` 看多了什么。

试算时还撞出生成器的两处，一处修了：用到提取结果里找不到定义的枚举时原来直接崩，现在当成认不出的类型跳过；`scaffold` 会把各个框架的枚举、结构体、别名都并进来认（UIKit 的属性会用到 Foundation 的 `NSTextAlignment`）。另一处没修：有 7 个枚举类型在四个核心框架的提取结果里找不到定义，其中有 `UIRectEdge`，原因没查。

## 要解决的问题

接一个类时，属性、方法、枚举、类型定义这些代码是照着头文件一行一行填模板：换一个属性，变的只有名字和类型。量下来（见下面）手写的 1061 个成员里，照规则能算出同名同形状的有 983 个。人写既慢又容易错：三份里漏一份、名字拼错、类型写反，所以才需要 `check-api.sh` 一直盯着。另外手写是用到哪个接哪个，已接的类上因此缺了一千七百多个成员，以前回答不了「这个类还差什么」。

bindgen 做两件事：把模板的部分写成初稿，人从初稿接着做；把每个已接的类还缺什么列出来。

## 别人怎么做的

| | React Native | NativeScript | Nacre |
| --- | --- | --- | --- |
| JS 里有没有原生类 | 没有，只有一套精选的跨平台组件 | 有，全部 | 有，手接的 129 个 |
| 绑定从哪来 | 手写原生模块；Codegen 从一份 TypeScript 的接口说明生成两端的胶水 | 构建时用 clang 扫头文件，生成二进制的元数据和类型定义 | 手写三份 |
| 原生怎么被调到 | 每个模块自己的代码 | 运行时查元数据，用 libffi 动态调用 | 每个成员一段手写的分发代码 |
| API 的形状 | 自己设计的 | 机械映射（`insertSubviewAtIndex(view, 0)`，枚举是数值） | 按我们定的写法，手调过 |

我们的原生模块走的是 React Native 那条路，bindgen 走的是 NativeScript 那条路。不能照搬 NativeScript 的有两处：我们的 API 形状有自己的规矩（options 对象、字符串枚举、颜色字符串、Promise、事件、不做继承）；我们现在没有动态调用的机制。

## 第一步：提取和对照

代码在 `ios/scripts/bindgen/`，四个文件：

| 文件 | 做什么 |
| --- | --- |
| `extract.mjs` | 头文件 → 一份中立的 API 描述。只管头文件里写了什么 |
| `rules.mjs` | 机械规则：一个声明照已定的写法套出来在 JS 里是什么 |
| `handwritten.mjs` | 读手写的类型定义，得到现在 JS 里有什么 |
| `compare.mjs` | 两边对照，算出差在哪 |

命令见上面「现在的做法」。`extract` 和 `report` 的产物在 `ios/build/` 下面，不进版本库。十三个框架提取一遍 21 秒。

`generate.mjs` 是出初稿的那一段，`bindgen.mjs` 是命令行入口。

### 提取用的是 clang 导出的语法树

`clang -Xclang -ast-dump=json` 把头文件解析完的结果导成 JSON。宏（`NS_ENUM`、`API_AVAILABLE`）、可空标注、属性的 `strong` / `copy` / `weak`、getter 的别名、枚举的每个值，clang 都解析好了，不用自己扫头文件。用的是 Xcode 自带的 clang，不用装任何东西。

几处要绕的：

- **导出很大**（UIKit 是 273 MB），不能整份读进内存。它的缩进是固定的，每个顶层声明从单独一行的「四个空格加 `{`」开始，按这个切开，一个声明解析一次。一条都没切出来时报「格式可能变了」，不安静地给一份空结果。
- **文件名只在变化时才写。** 位置上的 `file` 只在和上一个写出来的位置不同时出现，所以要按文档顺序把所有节点走一遍，才知道每个声明在哪个文件。归哪个框架就是看它在不在那个框架的 `Headers/` 下面。
- **偏移是字节数。** 头文件里有非 ASCII 字符时，字节数和字符数不一样，源码要按字节切。用例的头文件里特意放了中文注释，这个错就是它抓出来的。
- **废弃标注的内容不在导出里。** JSON 里只有「这里有一个 availability 标注」，没有平台和版本。所以回头读源码里那一段，只认 iOS 上的废弃（`API_DEPRECATED("…", macos(10.0, 10.5))` 不算）。
- **协议里哪些方法可选也不在导出里。** 同样回头看源码：方法前面最近的那个是 `@optional` 还是 `@required`。
- **前向声明要跳过。** `@class Foo;` 在导出里也带着父类。认法是它的范围到名字就结束了，定义的范围到 `@end`。

提取出来的描述里有：类（给自己的类写的分类并进去）、给别的框架的类写的分类、协议、枚举（带数值）、结构体、C 函数、当枚举用的字符串常量、起了别名的类型本来是什么。

### 机械规则

照[已定的写法](../project.md#已定的写法)写的，只放不需要人判断的：

| | 规则 |
| --- | --- |
| 方法名 | selector 的第一段是方法名，其余段是 options 的键 |
| 属性名 | getter 是 `is` 开头的别名时用它（`hidden` → `isHidden`） |
| 枚举值 | 去掉类型前缀，首字母小写，分三层，见下 |
| 首字母小写 | 开头是一段缩写时整段小写：`URL` → `url`，`ASCIICapable` → `asciiCapable` |
| 构造方法 | 只有 `init…` 是；造对象的类方法（`+buttonWithType:`）是普通的静态方法 |

枚举的前缀是照着手写的结果一条一条对出来的，第一版只写了「去掉类型名」，对不上的有一百六十多个值：

1. 值以类型名开头，去掉类型名。类型名是复数时按单数算：`UNAuthorizationOptions` 的 `UNAuthorizationOptionBadge` → `badge`。
2. 不以类型名开头，去掉它和类型名共有的那一段：`NSLineBreakMode` 的 `NSLineBreakByWordWrapping` → `byWordWrapping`。每个值各算各的，因为同一个枚举里会混着旧名字（`LABiometryType` 里有 `LABiometryNone`）。
3. 和类型名只共有框架前缀，或者什么都不共有，这些值之间共有的前缀和后缀都去掉：`kCALayerMinXMinYCorner` → `minXMinY`。

位掩码里数值是 0 的那个不算一个名字（JS 里是空数组）；一个数值两个名字时先声明的是主名。

### 量到的（iOS 27.2 的 SDK，2026-11-18）

规模：

| 框架 | 类 | 已接的类 | 属性 | 方法 | 废弃或不可用 | 枚举 | 协议 | C 函数 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| UIKit | 548 | 84 | 2844 | 2153 | 561 | 380 | 212 | 103 |
| Foundation | 204 | 6 | 1308 | 1894 | 153 | 142 | 39 | 141 |
| QuartzCore | 31 | 12 | 217 | 108 | 12 | 4 | 7 | 16 |
| CoreGraphics | 0 | 0 | 0 | 0 | 0 | 30 | 0 | 564 |
| 九个能力包用到的框架 | 158 | 27 | 601 | 363 | 148 | 77 | 20 | 0 |
| 合计 | 941 | 129 | 4970 | 4518 | 874 | 633 | 278 | 824 |

已接的 129 个类，手写的成员一共 1061 个：

| | 个数 | |
| --- | --- | --- |
| 机械规则算得出同名、形状也一样 | 983 | 92.6% |
| 名字一样，形状不一样 | 7 | 都是头文件里可写、手写的收成了只读：`UIViewController.view`、`CALayer.sublayers`、`UIView.gestureRecognizers`、`UICollectionView` 的 `collectionViewLayout` 和 `dataSource`、`UILayoutGuide.owningView`、`NSItemProvider.suggestedName` |
| 只在手写里有 | 71 | 37 个是事件（`addEventListener` / `removeEventListener`），21 个像是改了名，13 个是我们自己加的 |

这 129 个类在头文件里还有 1859 个成员没接（不含 187 个构造方法、197 个废弃或不可用的）。

改了名的 21 个里能看出三种手写的习惯，机械规则都没有照做，要不要定成规则没定：

- 带完成回调的方法去掉了 `WithCompletionHandler`：`requestTrackingAuthorization`、`getNotificationSettings`、`prepareForDisplay`（5 个）。
- 第一段里的 `Animated`、`With…`、`Of…` 被切掉了：`popViewController`、`dismissViewController`、`resizableImage`、`prepareThumbnail`、`addTextField`（6 个）。但 `animationWithKeyPath`、`bezierPathWithRect`、`buttonWithType` 又是整段留着的，手写的自己不一致。
- `copy` / `mutableCopy` 对的是 `copyWithZone:`（4 个）。

剩下 6 个各有各的原因（`NSUserDefaults` 的 `set` / `remove` 是我们自己设计的，对照时被猜成了改名）。

另有一个不一致：`CAAnimation.removedOnCompletion` 的 getter 是 `isRemovedOnCompletion`，手写的没有用 `is` 开头的名字。

枚举：对得上名字的 105 个，值一样的 564 个。只在手写里有的 21 个，其中 17 个是 `NSAttributedStringKey`（它的值在两个框架里，后缀不统一，第 3 层规则去不干净），3 个是 `NSRunLoopMode`（三个值的名字没有规律），都要进补充表。只在头文件里有的 84 个是还没接的值。

类型：成员里出现的类型，机械规则认得出归哪一种的，UIKit 是 92.6%，Foundation 是 84.9%，QuartzCore 是 94.1%。认不出的里最多的是 `id`（没有类型的对象）、`SEL`（目标和动作，要变成事件）、泛型的类型参数（`ObjectType`）、带类型的字典。

### 头文件给不出的

| | 为什么 |
| --- | --- |
| 方法参数的所有权 | `addSubview:` 持不持有参数，头文件里没有。属性的有（`strong` / `copy` / `weak`） |
| 事件 | 委托、通知、目标和动作要变成按用户操作命名的事件，名字要人定 |
| 手写时收紧的地方 | 把可写的收成只读、把几个 selector 并成一个方法 |
| 文档里的「效果」、验收用例 | 要运行过才知道 |

所以兜底生成的那一层之外，始终要有一份手写的补充表。

## 第二步：拿两个没接过的类试生成（2026-11-18）

> **注意**：从这一节到「往已接的类上补成员」是按原来的做法（生成的文件不手改，每次重新生成）记的过程。规则、数字、坑都还作数；`generate` 这个命令、`classes.json`、`NacreGenUIKit.mm` 这些文件名已经没有了，见上面「做法是怎么改的」。

`generate.mjs` 照清单（`ios/scripts/bindgen/classes.json`）生成和手写一样的三样东西，一个框架一组，文件头写明是生成的：

| 生成的文件 | 是什么 |
| --- | --- |
| `ios/Runtime/Bridge/NacreGenUIKit.mm` | 原生：一个域，`+load` 里登记 |
| `ios/Runtime/Builtin/parts/60-gen-uikit.js` | 内置脚本：一个 part，排在手写的 `50-` 之后 |
| `packages/types/ios/gen-uikit.d.ts` | 类型定义 |

生成的文件提交进仓库：每次生成改了什么看得见，也不用改构建流程。

范围是一步一步放开的，现在是：**清单里的类没接过的整个生成，已经手写过的只补它没有的成员**（见「往已接的类上补成员」）**；属性生成简单类型的**（布尔、数、字符串、枚举、位掩码、结构体、颜色）**和值是另一个原生对象的**（见下面「生成对象属性」）；**方法生成实例方法，参数和返回值是简单类型的**（布尔、数、字符串、枚举、位掩码、结构体，见下面「生成方法」「生成位掩码」「生成结构体」）**或者另一个原生对象**（见「生成带对象的方法」）。别的不生成，在命令的输出里逐个列出原因。

清单是 `classes.json`（要生成哪些类），补充表是 `overrides.json`（机械规则给不出的）。补充表现在有四种内容：

| 键 | 写什么 | 见 |
| --- | --- | --- |
| `types` | 手写的那一侧已经有自己的转换的类型 | 生成位掩码 |
| `methods` | 带对象的方法里，动词认不出该怎么记所有权的 | 生成带对象的方法 |
| `exclude` | 不要生成的成员 | 往已接的类上补成员 |
| `protocols` | 这个类实现了哪个协议上的成员 | 往已接的类上补成员 |

除了运行时的三样，`generate` 还写两个文件：验收的断言 `acceptance/src/steps/gen-uikit.js`，成员清单 `docs/api/generated-uikit.md`。

试的两个类：

| 类 | 生成了 | 没生成 |
| --- | --- | --- |
| `UIColorWell`（取色的控件） | 5 个属性，头文件里的全部 | — |
| `UIPasteControlConfiguration`（粘贴按钮的配置） | 5 个属性；会生成位掩码之后是 6 个，头文件里的全部 | 当时没生成 `imagePlacement`（位掩码） |

结果：

- **`check-api.sh` 不用改就认出了生成的域。** 类从 125 个变成 127 个，标量读写 353/251 → 358/256，对象读写 106/50 → 109/53，三边一致。因为生成的照的是手写的命名规矩（`Read<域>Property` 这几个签名、类体里成员缩进 4 个空格），脚本分不出它是不是手写的。
- **验收 54 条断言，Debug 和 Release 都通过**（`acceptance/src/steps/bindgen.js`）。其中 41 条是生成之前先写的，生成之前 10 组全部中断，生成之后第一遍就过。核对的是用起来和手写的一样：读写、`'4'` 转成 4、不是数的抛 `TypeError`、枚举写错是一条警告加值不变、颜色原样读回、父类手写的成员在生成的子类上照常能用。
- **后补了两组和「写进去能读回来」互相独立的断言。** 只核对读写往返有个漏洞：读和写一起接错了属性，照样能过。所以补了默认值 10 条（先在模拟器上量，再写成断言：新建的颜色井 `supportsAlpha` 是 `true`、`title` 是 `null`、`maximumLinearExposure` 是 0；粘贴配置的 `displayMode` 是 `iconAndLabel`、`cornerStyle` 是 `medium`）和事件 3 条（生成的类没有一行订阅的代码，主动触发一次 `change`，生成的子类收到了，`target` 是它自己；程序改 `selectedColor` 不派发）。
- **完整的一遍**：Debug、Release 各 5781 条通过、0 条失败。
- 重新生成一遍，三个文件一个字节不变。

几条生成时的规矩，都是照手写的域定的：

- `float` 的属性读的时候转成 `double` 再给，和 `UISlider.value` 一样。
- 可空的字符串读到没有时返回 `NSNull`，不返回 `nil`：`nil` 在分发里的意思是「不认识这个名字」。
- 枚举表里不放废弃的值；一个数值两个名字的只放主名（表是无序的字典，两个名字指向同一个数值时读回来是哪个说不准，`keyboardAppearance` 栽过）。
- 手写的类型定义里已经声明过的枚举类型不再声明，表里的名字照它的来；机械规则算出来对不上就停下报错，不生成一张和类型定义不一致的表。
- 头文件里标了更高系统版本才有的成员不生成（和部署目标比）。以后要生成的话得加 `#if` 和 `@available` 两层。

试出来的限制：

- **父类不能直接构造的，子类生成不了。** 原来想试 `UICollectionViewFlowLayout`，它的父类 `UICollectionViewLayout` 在手写的那一侧构造方法是直接抛的（`noPublicInit`），子类的 `super()` 过不去。要生成它，得先改手写的那个父类。
- 只有属性的类用处有限。`UIViewPropertyAnimator` 九个属性里八个能生成，但没有方法它什么都做不了。
- 默认值生成器给不出。期望值要量过才知道，这两个类的是手量手写的；批量生成时每个属性都这么做不现实。

没做的：基线没更新（新加的 54 条没进去）。模拟器上通知的授权点过之前，完整的一遍过不了基线，见 `docs/project.md` 的「欠的验证」。`UIColorWell` 在屏幕上点开看过（2026-11-18，模拟器）：系统的取色面板弹出来，标题是写进去的 `title`，当前颜色是写进去的 `selectedColor`（橙色），有不透明度的滑杆（`supportsAlpha` 是 `true`）和取色器的按钮（`supportsEyedropper` 是 `true`）。在面板里选一个颜色之后 `selectedColor` 变没变、`change` 来没来，没验。

## 试验：把一个手写的域整个换成生成的（2026-11-18）

问题是「纯生成能替代多少手写」。做法：开一个不合并的分支（`bindgen-trial-value-controls`，结论记在这一节，分支后来删了），把数值控件这个域手写的三份代码（`NacreValueControls.mm`、`50-value-controls.js`、`value-controls.d.ts`，近两千行）删掉，把六个类加进清单重新生成，再跑它原来的验收步骤，一条断言不改。

| | 手写的 | 生成的 |
| --- | --- | --- |
| 属性 | 48 个 | 同名的 38 个；另外多出 5 个手写时没接的 |
| 方法 | 32 个 | 0 个 |
| 验收那一步（主分支上 363 条通过） | | 跑了 10 条就中断：`sw2.setOn is not a function` |

`check-api.sh` 在试验分支上三边一致，六个类 43 个属性都能读写。

缺的 10 个属性和 32 个方法，按原因分：

| 原因 | 属性 | 方法 | 例子 |
| --- | --- | --- | --- |
| 方法，参数都是简单类型 | — | 11 | `setOn:animated:`、`removeSegmentAtIndex:animated:`、`setWidth:forSegmentAtIndex:` |
| 图片（对象） | 7 | 13 | `minimumValueImage`、`setThumbImage:forState:` |
| 结构体 | — | 7 | `trackRectForBounds:`、`setContentOffset:forSegmentAtIndex:`、`sizeForNumberOfPages:` |
| 日期 | 3 | 1 | `date`、`minimumDate`、`setDate:animated:` |

这个试验说明了三件事：

- **现在的生成器离「替代一个域」还很远。** 属性能到八成，方法是零；而验收的断言大部分要先调一个方法才能往下走，所以第一个方法缺了，整步就断了。
- **下一段该写的模板有了排序。** 先是简单参数的方法（11 个，不牵扯所有权），再是结构体（7 个，手写的域里有现成的转换），再是图片这类对象。日期是一条新的类型规则：`NSDate` 对 JS 的 `Date`。
- **断言数不出来的那部分损失还没量。** 手写的域里有一批先拦住越界值的判断（滑块的范围、日期选择器的模式和样式的组合），生成的没有。这一步因为中断得太早，这些断言根本没轮到跑。

试验不改变「手写的不动、生成的兜底」这个决定。分支留着，生成器每多会一样，回去重跑一遍就能看到数怎么变。

| 生成器会什么 | 属性 | 方法 | 验收那一步 |
| --- | --- | --- | --- |
| 五种简单类型的属性 | 38/48 | 0/32 | 通过 10 条，在 `setOn` 处中断 |
| 加上简单参数的方法 | 38/48 | 11/32 | 通过 32 条、失败 6 条，在 `thumbImageForState`（要图片对象）处中断 |
| 加上对象属性 | 45/48 | 11/32 | 同上，中断的位置没变。属性只差三个日期 |
| 加上位掩码 | 45/48 | 11/32 | 没变。还卡着的方法既要位掩码也要对象参数，位掩码只是其中一样 |

加上位掩码之后，六个类上没生成的方法按原因数：带对象的 28 个，结构体 9 个，认不出的类型 3 个（日期），另有废弃的和字符串常量各 1 个。

| 生成器会什么 | 属性 | 方法 | 验收那一步 |
| --- | --- | --- | --- |
| 加上带对象的方法 | 45/48 | 24/32 | 通过 79 条、失败 6 条，在 `trackRectForBounds`（结构体）处中断。Debug、Release 一样 |

缺的方法只剩结构体 7 个和日期 1 个。这一次有两处要说明：

- **改了验收步骤里的 9 处调用。** 手写的 `thumbImageForState` 收的是单个状态名（`'normal'`），而它配对的 `setThumbImage` 收的是数组（`{ forState: ['normal'] }`）；生成的照头文件，两边都是数组。不改的话整步在第一处就断了。这是手写和机械规则的一处分歧，而且是手写的自己前后不一致。
- **补充表里写了一个方法**：`insertSegmentWithImage:atIndex:animated:`。它往段里放一张图，删段的方法不带对象，所以没法和谁自动配对。

生成的比手写的多出 19 个成员，其中 `UIStepper` 的 8 个按状态设图的方法（`setBackgroundImage:forState:` 等）手写时没接。

| 生成器会什么 | 属性 | 方法 | 验收那一步 |
| --- | --- | --- | --- |
| 加上结构体 | 45/48 | 31/32 | 通过 124 条、失败 15 条，在分段控件处中断。Debug、Release 一样 |

成员上只差日期了（3 个属性、1 个方法）。15 条失败里 13 条是那一步里写着「某某还没接」的断言（生成的把它们接上了），1 条是中断本身，剩下 1 条是这一次真正卡住的地方：**构造。** 手写的 `new UISegmentedControl(['a', 'b', 'c', 'd'])` 收一组标题或图（对的是 `initWithItems:`），生成的构造不带参数，建出来段数是 0，后面按下标取段的断言就全不成立。

顺带看到一件事：对着空的分段控件调 `titleForSegmentAtIndex(0)`，UIKit 抛 `NSRangeException`，桥接住了它，JS 这边是一个带着原生异常名字的错误，App 没有崩。手写的域是自己先拦住越界的下标、给一句更清楚的话；生成的没有这一层，但也不是崩。

加上方法之后的 6 条失败里，3 条不是真的错：那一步里有三条断言写的是「`UISwitch.title` 还没接」，而生成的把它接上了。另外 2 条是图片的属性没有，1 条是中断本身。

## 生成方法（2026-11-18）

试验指出来的第一个缺口。生成的是**实例方法，参数和返回值都是布尔、数、字符串、枚举**。写法照[已定的写法](../project.md#已定的写法)：selector 的第一段是方法名，第一个参数是位置参数，其余段是 options 的键。

```objc
- (void)setOn:(BOOL)on animated:(BOOL)animated;
- (void)setWidth:(CGFloat)width forSegmentAtIndex:(NSUInteger)segment;
```

生成出来的类型定义：

```ts
setOn(on: boolean, options?: { animated?: boolean }): void;
setWidth(width: number, options: { forSegmentAtIndex: number }): void;
```

和手写的那两个一字不差。数值控件六个类上生成了 11 个方法，正好是试验里归到「参数都是简单类型」的那 11 个。

几条规矩：

- **`animated` 这个键可以不带，不带是 `false`；别的键必填**，没带抛 `TypeError`（`setWidth needs { forSegmentAtIndex }`，和手写的同一句话）。这是从手写的类型定义里统计出来的：`animated` 出现 25 次，全部是可省的；`atIndex`、`forSegmentAtIndex`、`forState` 这些全部是必填的。也有对不上的：约束的 `multiplier` 和 `constant` 手写的是可省的（各有默认值），那是人判断的，机械规则给不出，生成的会要求必填。
- **同一个方法名有几个 selector 的不生成。** `insertTitle:atIndex:` 和 `insertTitle:aboveIndex:` 要按带了哪些键来分派，手写的各有各的做法，没有一条机械的规则。
- **和属性同名的方法不生成**；类方法、`init…`、废弃的、要更高系统版本的也不生成。
- **颜色的参数还不生成。** 颜色在属性上走的是对象那条通道，方法这条通道现在只走值。
- 枚举参数写错，原生报错里列出可选值；在方法的位置上这是抛 `TypeError`，不是警告，和手写的一样。
- 整数参数照头文件里的类型转（`(NSUInteger)`）。**没有做范围的检查**：手写的域会先拦住越界的下标，生成的直接交给 UIKit。

主分支清单里的两个类（`UIColorWell`、`UIPasteControlConfiguration`）自己没有方法，所以加了这一段之后主分支上生成的三个文件一个字节没变。生成出来的方法在模拟器上跑过的只有试验分支上那 11 个。

## 生成对象属性（2026-11-18）

值是另一个原生对象的属性（`slider.minimumValueImage` 是一个 `UIImage`）。和简单类型不一样的地方是所有权：原生对象 A 持有 B 时，A 的 JS 包装也要拖住 B 的包装，不然 B 的包装被回收之后再读回来是一个新的 JS 对象，挂在上面的数据和监听器都丢了，见[包装](wrapper.md#所有权镜像js-侧有自己的引用图)。

先纠正一个说法：漏记一条所有权边的后果通常**不是崩**，是包装的身份丢了、监听器静默失效（运行时会打一条警告）；实测到会崩的只有布局锚点那一种。反过来多记一条只是多留一份引用，不会给错答案。所以拿不准时宁可多记，但不能无限地多记。

对象成员的规则定了三条，这一步做的是第一条：

1. **属性：照头文件，全自动。** `strong`、`copy` 和没写的只读属性记一条（`nativeGetOwned` / `nativeSetOwned`）；`weak` 和 `assign` 的不记（`nativeGetObject` / `nativeSetObject`），那是回边，另一端已经被上游的边兜住了。和手写的做法一样。
2. **方法：按方法名的动词归类。** `set…` 记一条、同一个位置再设顶掉旧的；`add…` / `insert…` 往一组里加；`remove…` 去掉；`is…` / `can…` / `convert…` 这类查询不记；只返回对象的默认不记，有对应的 `set…` 时和它记在同一个位置。见下面「生成带对象的方法」。
3. **认不出的不生成。** 方法名不属于上面任何一种的，脚本不猜，跳过并列出来；要生成它得在补充表里写明属于哪一种。

属性还有一个前提：**它的类得是 JS 里有的**（手写的，或者也在清单里），不然读出来没有类可以包它。不满足的跳过，原因写的是「它的类 X 还没接」。

量了一下已接的类上缺的对象成员，卡得最多的正是这个前提，不是所有权：

| | 个数 | |
| --- | --- | --- |
| 对象属性，它的类已经接了 | 85 | 规则 1 能生成 |
| 对象属性，它的类还没接 | 168 | 不能。`UIToolbar.standardAppearance` 是一个 `UIToolbarAppearance`，JS 里没有这个类。靠往清单里加类解决 |
| 传对象的方法，按动词认得出 | 62 | 规则 2 |
| 传对象的方法，认不出 | 183 | 要写补充表；里面很多用不上（`encodeWithCoder` 这类） |
| 只返回对象的方法 | 36 | 规则 2 |

验证：生成器的用例 53 条全过（新加的 3 条先写、先看到失败）。主分支清单里的两个类没有对象属性，生成的三个文件一个字节没变。生成出来的对象属性是在试验分支上验的：数值控件六个类多生成了 9 个图片属性，另加一组 8 条断言实际读写（写进去的图读回来是同一个对象、写不是原生对象的和别的类的对象都抛 `TypeError`、抛了之后值没变、写 `null`），Debug 和 Release 都通过。Release 单独跑是因为对象交接这一段出过只在开了优化之后才有的悬空指针，见[包装](wrapper.md#交接的那一段没人持有只在-release-下崩的悬空指针)。没验的：包装被垃圾回收之后身份还在不在（生成的用的是和手写同一个 `nativeSetOwned`，但没有单独做回收的探针）。

## 生成位掩码（2026-11-18）

位掩码在 JS 里是名字的数组（`layer.maskedCorners = ['minXMinY', 'maxXMinY']`）。属性、方法的参数和返回值都生成。

- **表里只放数值是单独一位的值。** 数值是 0 的是空数组，不是一个名字；几位合起来的（`NSDirectionalRectEdgeAll` 是 15）也不是一个名字。废弃的和别名同样不放。这条规则对「纯粹的开关」是对的；有的位掩码里混着占几位的字段（`UIViewAnimationOptions` 里动画曲线占四位，`3 << 16` 是一个取值而不是两个开关），照这条规则会生成出错的表。现在没有去认这种情况，要生成这类类型之前得先处理。
- **写错分两种报**，和手写的一样：名字不认识的列出可选值（在属性的位置上是一条警告加值不变，在方法的位置上抛 `TypeError`）；给的根本不是数组的是另一句话（`imagePlacement needs an array of names; expected any of: …`），两个位置上都抛。
- 读出来的名字按数值从小到大排。

**补充表的第一种内容：手写的那一侧已经有自己的转换的类型。** `UIControlState` 是这样的：`normal` 的数值是 0，照上面的规矩它该是空数组，但 `forState: ['normal']` 是最常用的写法，手写的那一侧单独认了它（`ControlStateArgFromNames`），类型的名字也不是 `UIControlState` 而是 `UIControlStateName`。生成的如果自己再建一张表，`['normal']` 就会被拒。所以 `overrides.json` 里写明这个类型用哪两个函数、类型定义里怎么写，生成的照着用：

```json
{ "types": { "UIControlState": {
    "ts": "readonly UIControlStateName[]",
    "fromNames": "ControlStateArgFromNames",
    "names": "NamesForControlStateArg" } } }
```

补充表里没写「怎么读」的类型，只能当参数，不能当属性和返回值；遇到了跳过，原因写的是「补充表里没写这个类型怎么读」。

验证：生成器的用例 57 条全过（新加的 4 条先写、先看到失败）。主分支上 `UIPasteControlConfiguration` 多生成了 `imagePlacement`，验收步骤里原来那条「位掩码的属性不在」换成了 7 条断言（先改的，生成之前类型检查报 12 处错）：读出来是数组、写一个、写两个读出来按数值排、写空数组、写了不认识的名字是一条警告加值不变、写的不是数组抛 `TypeError`、抛了之后值没变。Debug 和 Release 各 93 条通过。三边核对一致（标量读写 358/256 → 359/257）。位掩码作方法的参数和返回值、补充表里的类型，都只有生成器的用例，没有在模拟器上跑过：主分支和试验分支上现在都没有恰好只带位掩码和简单类型的方法。

## 生成带对象的方法（2026-11-18）

参数或者返回值是另一个原生对象的实例方法。头文件里不写方法会不会留住参数，所以所有权按方法名的动词归类，只认说得很清楚的几种：

| 方法名 | JS 一侧记什么 | 生成出来的 |
| --- | --- | --- |
| `set…` | 一条边，位置是「名字加其余的参数」，同一个位置再设顶掉旧的 | `own(this, 'thumbImage:' + keyPart(o.forState), image)` |
| `set…` 配对的取值方法 | 和它记在同一个位置 | `return own(this, 'thumbImage:' + keyPart(state), nativeCallObject(…))` |
| `add…` / `insert…`，类里有带对象的 `remove…` 与它配对 | 往一组里加一个 | `ownOne(this, 'child', child)` |
| `remove…`，有配对的 `add…` | 从那一组里去掉 | `disown(this, 'child', child)` |
| `remove…`，没有配对 | 不记（解除持有） | 原生文件里标一行 `nacre:ownership-exempt` |
| `is…` / `can…` / `contains…` / `index…` / `convert…` 这类 | 不记（只读） | 同上 |
| 别的 | 认不出，不生成 | 输出里写「带对象，认不出该怎么记所有权（要写进补充表）」 |

几处判断：

- **配对是算出来的。** `setIcon:forState:` 的取值方法是名字加上其余的键：`icon` + `ForState` = `iconForState:`，参数个数对得上、返回的是对象，就算配上。配上的两边用同一个位置，取回来的包装和设进去的是同一条边。
- **位置里的数组先排序。** `['highlighted', 'selected']` 和 `['selected', 'highlighted']` 是同一个状态。手写的 `stateKey` 没排，这是比手写的多做的一点。
- **`add…` / `insert…` 没有配对的 `remove…` 就不认。** 多记一条不会出错，但加进去的永远去不掉就是一直涨。`insertSegmentWithImage:atIndex:animated:` 就是这种：删段的方法只带下标。这类要在补充表里写明。
- **只返回对象、没有配对的方法不记。** 它返回的对象原生那边是谁留着的不知道；不记的后果是 JS 这边不再拿着之后，下次取回来是一个新的包装。
- 对象参数在原生那一侧直接写 `args.object(i)`，再核对类。写成这样是为了让 `check-api.sh` 现有的所有权检查认得出这个分支收对象：它看到收对象的 selector，就要求 JS 的方法体里有 `own` 这一类调用，或者原生文件里有那行 `nacre:ownership-exempt`。生成的代码两种都满足，试验分支上这道检查是通过的。
- 颜色的参数还不生成。

补充表里方法的写法：

```json
{ "methods": { "UISegmentedControl": {
    "insertSegmentWithImage:atIndex:animated:": {
      "owns": "add", "group": "segmentImages",
      "why": "这一段一直留着这张图，直到这一段被删掉。删段的方法不带对象，所以没法自动配对" } } } }
```

`owns` 是 `set`（`key` 是位置）、`add` / `remove`（`group` 是那一组的名字）、`none`（不记，必须写 `why`）。写了别的值，或者 `none` 没写理由，生成时报错。

验证：生成器的用例 63 条全过（新加的 6 条先写、先看到失败）。主分支清单里的两个类没有方法，生成的三个文件一个字节没变。生成出来的方法是在试验分支上验的，见上面试验那张表：验收那一步里「`setThumbImage` 之后按状态取回来是同一个对象」「没设过的状态回退到 normal」这些断言通过，Debug 和 Release 都跑了。补充表里的 `UIControlState` 也是这一次第一回在模拟器上跑到（报错里列的是手写那张表的名字：`normal / highlighted / …`）。没验的：`add…` / `remove…` 配对的那一种只有生成器的用例，数值控件里没有这样的方法；包装被垃圾回收之后身份还在不在，没有做回收的探针。

## 生成结构体（2026-11-18）

`CGRect` 这类在 JS 里是类，字段只读；读出来永远是那个类的实例，写的时候实例或者带同样字段的普通对象都收，见[结构体](structs.md)。生成的照手写的 `view.frame` 那样写：

```js
get origin() { requireNative(this, 'origin'); return toPoint(nativeGet(this, 'origin')); }
set origin(value) { requireNative(this, 'origin'); nativeSet(this, 'origin', structArg(value, POINT_FIELDS, 'origin')); }
```

类型定义里读给类本身、写收 `Like`（`get origin(): CGPoint; set origin(value: CGPointLike);`）。属性、方法的参数和返回值都生成。

**能生成的只有 JS 里已经有类的那七个结构体**：`CGRect`、`CGPoint`、`CGSize`、`UIEdgeInsets`、`NSDirectionalEdgeInsets`、`CGAffineTransform`、`CAFrameRateRange`。每一个在生成器里登记四样现成的东西：JS 一侧核对字段用的字段表、把读出来的普通对象包成类的函数、原生一侧的两个互转函数。别的结构体（`UIOffset`、`NSRange`、`CGVector`）跳过，原因写的是「结构体 X 在 JS 里没有对应的类」；要生成它们得先手写那个类。

验证：生成器的用例 65 条全过（新加的 2 条先写、先看到失败）。主分支清单里的两个类没有结构体的成员，生成的三个文件一个字节没变。生成出来的是在试验分支上验的：`trackRectForBounds` 给的是 `CGRect`、`thumbRectForBounds` 缺 `trackRect` 或 `value` 时抛、给的不是矩形时抛，这些原来就有的断言一条没改，Debug 和 Release 都通过。

## 往已接的类上补成员（2026-11-18）

这一步是把 bindgen 用到主分支已有的类上。第一批是四个：`UIView`、`UIScrollView`、`UITextField`、`UITextView`，对的是待办里的缩放、`tintColor`、其余的键盘设置。补出来 76 个属性、23 个方法。

**手写的一个字不动。** 写法是富文本那一组已经在用的（它就是这么给 `UILabel` 加 `attributedText` 的）：

| | 做法 |
| --- | --- |
| 原生 | 生成的那个域多认领这几个类，只认补的那些名字。别的名字它不认，照旧落到手写的代码里 |
| JS | 不重新定义类。属性一个一句 `Object.defineProperty(UIScrollView.prototype, 'zoomScale', { … })`，方法用一个本地的 `define` 助手挂 |
| 类型 | 声明合并：`interface UIScrollView { zoomScale: number; … }` |

**手写的有了就跳过，而且不算「没生成」。** 一个名字手写的那一侧已经有，生成器就不碰它。「已经有」算三处：这个类自己声明的；别的文件用声明合并加到它上面的（`handwritten.mjs` 原来不认这种，这一步补上了）；它的父类上的，手写的和这一次生成的都算。最后一条是因为头文件里子类重复声明父类的成员是常事（`UIImageView` 又写了一遍 `userInteractionEnabled`）。所以清单里的类是按继承关系从上往下算的。

**四条为这一步加的规则：**

- **协议上的成员不写进补充表就不生成。** 键盘的设置（`smartQuotesType` 这些）声明在 `UITextInputTraits` 这个协议上，而且全是可选的，头文件看不出一个类到底实现了哪些。补充表的 `protocols` 里写明「`UITextField` 和 `UITextView` 实现了它」，生成的才把它的成员算进来。
- **给子类覆盖的通知不生成。** 名字是 `did…` / `will…` / `…DidChange`、不带参数也没有返回值的方法（`didMoveToSuperview`、`tintColorDidChange`）是系统来调的。原生类在 JS 里不做继承，覆盖不了，自己去调也什么都不会发生。`draw…` 的要在绘图的上下文里调，同样不生成。
- **名字上看不出来的在补充表里排除。** `layoutSubviews`、`updateConstraints`、`updateProperties` 也是给子类覆盖的，Apple 的文档写明不要直接调；`UITextView.borderStyle` 在 iOS 上只有一个值。
- **带对象参数的方法先不往已接的类上补。** `check-api.sh` 的所有权检查是按类体里的方法切的，挂到原型上的方法它看不见。没有这道检查兜着，这一类先跳过（这一批里有 8 个）。带对象的属性照常补：它走的是 `nativeGetOwned` / `nativeSetOwned`，那一节检查认得。

这一步还顺带修了生成器的一处：**枚举里这个平台上不可用的值不能进表。** `UITextViewBorderStyleRoundedRect` 在头文件里标着 iOS 上不可用，引用它连编译都过不了。这是模拟器那一遍编译报出来的，生成器的用例原来没盖到。

**验收的断言也是生成的。** 每个生成出来的属性两条：读出来的类型对；可写的写回读到的值，再读还是它。它证明的是这条通道接通了、两边的类型对得上。默认值、设了之后界面上的效果、方法，它证明不了。160 条，第一遍全过。

待办里点名的那几样另外手写了 39 条实际用法的断言（在 `acceptance/src/steps/bindgen.js`）：缩放的默认值和读写、`setZoomScale` 的 `animated` 可以不带、`tintColor` 原样读回而且子类上也能用、`maskView` 和 `leftView` 写进去读回来是同一个对象、`smartQuotesType` 三个值逐个写、手写的 `keyboardType` 和 `placeholder` 照常。这 39 条是生成之后才写的，没有先看到它们失败。

**成员清单的文档也是生成的**（现在是 [`view-additions.md`](../api/view-additions.md) 和 [`system-controls.md`](../api/system-controls.md)），只列名字、类型、对应的 selector。四篇手写的文档（视图、滚动视图、两种输入框）的「还不能做的」里去掉了已经有的几行，开头加了一句指到那一页。

没生成的按原因数（这一批六个类合计）：认不出的类型 16 个，废弃的 16 个，类方法 9 个，要 iOS 27 的 8 个，带对象的方法 8 个，给子类覆盖的通知 6 个，委托 6 个，要绘图上下文的 5 个，补充表排除的 4 个，类属性 4 个，它的类还没接的 9 个，字符串常量 3 个。

验证：生成器的用例 75 条全过。三边核对一致：标量读写 359/257 → 410/300，对象读写 109/53 → 121/60。`check-api.sh` 第 10 节改了一处：声明合并里读写类型不一样的属性写成 `get x(): T; set x(v: U);`，原来的正则不认这种写法。类型检查通过。

没验的：23 个补上去的方法里，在模拟器上调过的只有 `setZoomScale` 和 `zoomToRect`；补上去的成员设了之后屏幕上的效果一个都没看；双指捏合缩放还不能用（系统要当场问「缩放的是哪个子视图」，那一问是委托方法，生成不了，要手写）。

## 为什么不做动态调用

另一条路是 NativeScript 那样：只生成一份描述数据，运行时按它动态调用，原生那边没有逐个成员的代码。考虑它的理由原来是「给每个成员生成一段代码，包体会明显变大」。量了之后这个理由不成立：

| | 大小 |
| --- | --- |
| 整个运行时的二进制（真机切片，含 V8） | 12.9 MB |
| 其中我们自己写的全部原生代码（2026-11-16 的 Release 构建，一千来个成员） | 约 0.9 MB（代码 603 KB，字符串和数据 272 KB） |

每个成员最多不到 1 KB，而且这 0.9 MB 里还有事件、网络这些和成员数无关的代码。把已接的 129 个类上缺的 1859 个成员全补上，最多多 1.7 MB；十三个框架九千多个成员全生成，上限 8 MB 左右。范围又是按清单来的，到不了这个数。

动态调用剩下的好处是不重新编译就能调任何类，这我们用不上：第三方 SDK 走的是[原生模块](../guides/native-modules.md)。它的代价是一套全新的调用机制，带回调的参数、结构体、所有权都要重新设计。

## 还没做的

- **`scaffold` 还写不出的**：数组、日期（`NSDate` 对 JS 的 `Date`）、类方法和类属性、带参数的构造、同名有几个 selector 的方法、带完成回调的方法（该是 Promise）、带颜色参数的方法、字符串常量的类型、JS 里还没有类的结构体（`UIOffset`、`NSRange`、`CGVector`）、要更高系统版本的成员。这些它会列在「没写」里，现在靠手写。
- **已经手写过的类上，带对象参数的方法它不写**：`check-api.sh` 的所有权检查是按类体里的方法切的，挂到原型上的方法它看不见。
- **能力包里的类**：输出路径只支持核心。
- **事件、委托、要 JS 当场回答的回调**它写不出，始终是手写。
- **有一种位掩码会写错**：里面混着占几位的字段的（`UIViewAnimationOptions` 里的动画曲线）。没有去认。
- **撞名检查**：名字要和 ECMAScript 内置比对，冲突时报错，见[运行时](runtime.md#原生-api-为什么裸暴露在全局)。没做。
- **两页清单还不是正经的文档**：[补上的成员](../api/view-additions.md)和[取色控件](../api/system-controls.md)只有名字和类型，没有例子和效果。
- **手写的几处不一致**，对照时看出来的，要不要改齐没定：`thumbImageForState` 这类取值方法收单个状态名，而它配对的 `setThumbImage` 收数组；`popViewController` 把 `Animated` 切掉了，`animationWithKeyPath` 又是整段留着的；`CAAnimation.removedOnCompletion` 没有用 `is` 开头的名字。
- **C 函数**：CoreGraphics 全是 C 函数（564 个）。已定的判据是只做值类型算术的在 JS 里实现，要碰系统状态的才过桥，见[结构体](structs.md)。
