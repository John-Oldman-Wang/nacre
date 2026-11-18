# 富文本：NSAttributedString 一组

← [实现原理](README.md)

这一组是按[接入一组类](adding-classes.md)的做法接的：一个域（`attributed-string`）一套新文件，原生那一侧在 `NacreAttributedString.mm` 末尾登记一张表，核心的分发器、内部头、`01-bridge.js`、`check-api.sh` 都没动。API 文档是[富文本](../api/ns-attributed-string.md)。

六个自己的类：`NSAttributedString`、`NSMutableAttributedString`、`NSParagraphStyle`、`NSMutableParagraphStyle`、`NSShadow`、`NSTextAttachment`。另外往四个已有的类上加了成员：`UILabel.attributedText`，`UITextField.attributedText` 和 `attributedPlaceholder`，`UITextView.attributedText`，`UIButton` 的 `setAttributedTitle()` / `attributedTitleForState()` / `currentAttributedTitle`。

## 验证到哪一步

写在最前面，免得后面的话被读成比实际更确定：

| | 状态 |
| --- | --- |
| 富文本自己这一层的原生行为（副本的类、按段遍历、换文字、默认值、量尺寸） | **在 macOS 上实测过**（27.2.1，不带界面的小程序）。这几个类在 UIFoundation 里，AppKit 和 UIKit 共用；iOS 上没有另外量 |
| 四种视图上的行为（和 `text` 互相覆盖、读回来的内容） | **验收里跑过**，见下面[第一遍验收的结果](#第一遍验收的结果)。还有四处没有事实，用例里只把读到的值打出来 |
| 原生代码能不能编过 | 编过（Debug 和 Release，模拟器，核心 framework 和验收 App） |
| `check-api.sh`、类型检查、文档链接 | 通过 |
| JS 这一半的逻辑（转换、摊平、报错文案、所有权） | 用一个假的桥在 Node 里走过一遍，没有抛意料之外的错 |
| **验收用例（`acceptance/src/steps/attributed-string.js`）** | 合并的对话跑过一遍（iPhone Air 模拟器，iOS 27.2，Debug）：267 条里 264 条通过，3 条是假设错了，已按实测改。**改过之后的用例还没有再跑** |
| 屏幕上的样子 | 没有核对 |
| 所有权边在 GC 之后是否守得住 | 没验证，验收里没有这一条 |
| 真机、Release 下的验收 | 没跑 |

## 属性字典怎么过桥

这是这一组唯一的新问题。一组属性是「对象和标量混在一起」的字典：

```js
{ font: UIFont, foregroundColor: '#f00', kern: 2, underlineStyle: ['single'], paragraphStyle: NSParagraphStyle }
```

字体和段落样式是原生对象；颜色在 JS 那一侧是字符串，过桥之前已经换成 `UIColor` 对象（解析和池化在 `16-color.js`）；字距是数；下划线是名字的数组。桥上的通道没有一条收「字典」：属性通道一次一个值，方法通道的参数是一个列表。

用的办法是**摊平**。方法通道的参数包本来就是按下标对齐的两个数组，标量在 `values`（JSON）里，对象在 `ptrs`（句柄）里，`splitArgs` 逐个元素分。所以把字典写成「键、值、键、值…」接在固定参数后面，它自然就过去了：

```
addAttributes:range:   [ { location: 3, length: 7 },  "font", <UIFont>,  "kern", 2,  "underlineStyle", ["single"] ]
values（JSON）          [ { … },                       "font", null,      "kern", 2,  "underlineStyle", ["single"] ]
ptrs（句柄）            [ 0,                            0,      h(font),   0,      0,  0,                 0          ]
```

原生那一侧 `AttributesFromArgs(args, start, …)` 从 `start` 开始两个两个地取：键永远在标量位上；值在对象位上有就用对象，否则用标量位上的。构造、类方法、实例方法三条通道用的是同一个参数包，所以 `new NSAttributedString(string, attributes)`、`attributedStringWithAttachment(attachment, { attributes })`、`setAttributes()` / `addAttributes()` 是同一段代码。`addAttribute(name, { value, range })` 在 JS 里就是只有一对的 `addAttributes:range:`。

固定参数排在前面、属性排在最后，所以 `setAttributes:range:` 过桥时 range 在第 0 位，和 selector 里的顺序相反。这只是线上的排法，JS 的方法签名照 selector。

### 没有用的三条路

| | 为什么不用 |
| --- | --- |
| 在 JSON 里给对象值留一个记号，句柄另传 | 要么改 `splitArgs` 让它往嵌套的对象里看，要么自己拿 `kHandle` 取句柄再调 `native.*`。前者改共享文件，后者绕过了桥的入口。摊平之后两样都不需要 |
| 一个属性过一次桥 | 能做，但一次 `addAttributes` 变成 N 次调用，而且 `setAttributes`（整个换掉）拆不开 |
| 原生那一侧加一个「属性集」对象，JS 逐个往里放，再把它当参数 | 多出一个 ObjC 里没有的类，属性集自己的生命周期和所有权又要管一遍 |

### 读要过两次

反方向没有这么顺。一次调用的返回值要么是 JSON（`call`），要么是一组对象（`callObjectArray`），装不下混在一起的。所以读一处的属性拆成两次：

1. `nacre:attributesAtIndex:` 返回 `{ values: { kern: 2, … }, objects: ['font', 'foregroundColor'] }`：标量的值，和哪些键的值是对象。
2. `nacre:attributeObjectsAtIndex:` 返回那几个对象，顺序和 `objects` 一样。

两次都按同一张表（`AttributeKeyPairs`）的顺序排，JS 按下标对上。两次调用之间 JS 没有让出主线程，内容不会变。`objects` 是空的时候第二次省掉，所以只有数和下划线的富文本读一次只过一次桥。

`enumerateAttributesInRange()` 同理：`nacre:runsInRange:` 一次拿回所有段的前一半，`nacre:runObjectsInRange:` 一次拿回所有段的对象（按段的顺序首尾相接），JS 按每段 `objects` 的个数切。回调是 JS 自己在循环里调的，不需要同步回调那套机制；代价是遍历的是一份快照，也没有 `stop`。

读的耗时没量过。一次过桥是一到几微秒（见[桥](bridge.md)），读属性不在界面的热路径上，按[能用就先用着](../project.md#性能能用就先用着)先这样。

## 值的语义：三种对象三种处理

| 属性值 | 存进去的 | 读出来的 | 为什么 |
| --- | --- | --- | --- |
| 字体、颜色 | 原样 | 同一个对象 | 本来就不可变 |
| 附件 | 原样 | 同一个对象 | 它的身份有意义：改它的 `image` / `bounds` 就是改富文本里的那个附件 |
| 段落样式、阴影 | **副本** | **副本** | 可改的对象。见下 |

macOS 上量到的：Foundation **不复制**属性值。把一个 `NSMutableParagraphStyle` 放进属性字典，读回来是同一个指针。照搬的话，JS 里先建富文本、之后再改那个样式对象，富文本会跟着变，而且变不变还取决于系统有没有缓存过排版结果。这种行为写不成断言，也讲不清楚。

所以存和读两头都 `copy`：

- 存：富文本里的是当时的值，和外面那个对象没有关系。
- 读：`NSMutableParagraphStyle` 的 `copy` 是一个不可改的 `NSParagraphStyle`（量到的），而不可改的再 `copy` 返回它自己（量到的），所以同一处连读两次是同一个对象，包装也是同一个。`NSShadow` 没有不可改的版本，`copy` 每次都是新对象，所以阴影每读一次是一个新的包装。

代价是「改读回来的样式对象来改富文本」这条路没有了。要改就建一个新的、重新 `addAttribute`。

## 交给 JS 的富文本都是不可改的快照

三处都过一道 `copy`（`SnapshotRef`）：

- **视图上读回来的**（`label.attributedText`、`attributedTitleForState()` 等）。`UITextView` 底下是一个可改的文字存储，如果系统把它直接交出来而我们原样包给 JS，JS 改它就是在绕过视图改内容。四种视图各自交出来的到底是什么没有量，统一 `copy` 之后不用关心。
- **`attributedSubstringFromRange()`**。macOS 上量到的：在可改的富文本上取子串，得到的是**可改的**（`NSConcreteMutableAttributedString`）。头文件里的返回类型是 `NSAttributedString`，类型定义也是这么写的，所以给不可改的。
- **`copy()`**。

不可改的富文本 `copy` 返回它自己（量到的），所以 JS 里建的不可改的富文本交给视图再读回来，**如果**视图原样存着它，读回来就是同一个包装。这一条不保证：视图可能往里补默认的属性再存。文档里写的是「每次读可能是不同的对象，比较内容用 `isEqualToAttributedString()`」。

## 所有权边

规矩见[包装机制](wrapper.md)：原生对象 A 持有 B，A 的包装就要拿着 B 的包装。这一组的边：

| 谁拿着谁 | 边 | 什么时候记 |
| --- | --- | --- |
| 富文本 → 字体、颜色、附件 | `attributes`（多值，只增不减） | 构造、`addAttribute(s)`、`setAttributes`，以及**读的时候** |
| 富文本 → 被抄进来的另一个富文本 | `sources`（多值，只增不减） | 照别的富文本构造、`append` / `insert` / `replace…withAttributedString` / `setAttributedString`、`copy` / `mutableCopy` / 取子串 |
| 视图 → 写进去的富文本 | `attributedText` / `attributedPlaceholder` | 写的时候 |
| 按钮 → 写进去的富文本 | `attributedTitle:<状态>` | `setAttributedTitle()` |
| 附件 → 图片 | `image` | 读写 `image`、`textAttachmentWithImage()` |
| 阴影 → 颜色 | `shadowColor` | 读写 |

几处要解释的：

**为什么颜色也要拿着。** 颜色读出来是字符串，「写的串原样读回」记在颜色的**包装**上（`colorDecls`）。包装被回收之后再读，普通的 RGB 颜色能按值找回原来的写法，`light-dark()` 这类就只能给 `native(1)` 了。

**段落样式和阴影不拿。** 富文本里存的是副本，外面那个对象和它没有关系。读出来的阴影每次是新对象，记进只增不减的边里会越读越多。

**被抄进来的富文本为什么要拿着。** `appendAttributedString(other)` 之后，`other` 的字体和颜色现在也在这个富文本里，而拿着它们的包装的是 `other` 的包装。不去把 `other` 的边抄一遍，直接拿着 `other`，效果一样。

**只增不减。** 删掉一段、把属性换掉，边不清理。多留一份引用不会给错答案，要清理就得在 JS 里把原生的内容重算一遍。

**视图上读的时候不记边。** 读回来的快照是个新包装，它手里没有 `attributes` 那些边。如果读的时候 `own(label, 'attributedText', 读回来的)`，就把写进去的那个富文本（它手里有边）换掉了，该留的反而放走了。所以读走 `nativeGetObject`，写走 `nativeSetOwned`。

**已知留着不该留的。** 写过 `attributedText` 之后再写 `text`，核心里 `text` 的 setter 不知道这条边，富文本的包装会一直被标签拿着，直到下一次写 `attributedText` 或者标签自己被回收。同样只是多留一份引用。

**检查盯不到的地方。** `check-api.sh` 的所有权检查按类体里的方法切，`UIButton.prototype` 上挂的 `setAttributedTitle` 它看不见（[接入一组类](adding-classes.md#给已有的类加成员排在后面做)里记着的那个缺口）。这一处是人工写对的。另外原生那一侧取属性里的对象是在助手函数 `AttributesFromArgs` 里，不在 selector 的分支体里，检查也认不出 `addAttributes:range:` 收对象；JS 里同样是人工记的边。

## 给已有的类加成员

照[接入一组类](adding-classes.md#给已有的类加成员排在后面做)里的三处做：

- 原生：域的 `classes` 里列了 `UILabel`、`UITextField`、`UITextView`、`UIButton`，处理函数只认 `attributedText`、`attributedPlaceholder`、`currentAttributedTitle`、`setAttributedTitle:forState:`、`attributedTitleForState:`，别的名字说「不认领」。
- JS：属性用 `Object.defineProperty(UILabel.prototype, 'attributedText', …)`；方法用 `define(UIButton.prototype, 'setAttributedTitle', …)`。
- 类型：声明合并。

`check-api.sh` 第 10 节核对的是属性（`defineProperty` 的那四处加按钮的 `currentAttributedTitle`），挂上去的**方法**两边它都看不见，没有东西盯着 `setAttributedTitle` 和 `attributedTitleForState` 的 JS 和类型对不对得上。

**part 的文件名是 `51-`，不是规矩里的 `50-`。** part 按文件名的顺序执行，`50-attributed-string.js` 排在 `50-text-view.js` 前面，那时 `UITextView` 还没有定义，原型上挂不了东西。`NSRange` 也定义在 `50-text-view.js` 里。

**取值器里的属性名都写成字面量。** `attributedText` 在三个类上是同一对函数，本来可以写一个循环；但 `check-api.sh` 靠 `nativeGetObject(this, '…'` 和 `defineProperty(X.prototype, '…'` 的字面量抽名字，循环里的变量它看不见。注释里也不能出现这两种写法的样子：Python 的 `\w` 认汉字，注释里的示意会被当成一个真的属性名抽出来。

## 下划线不是位掩码

头文件里 `NSUnderlineStyle` 是 `NS_OPTIONS`，但它不是一位一个名字：

| | 值 |
| --- | --- |
| `single` / `thick` / `double` | `0x01` / `0x02` / `0x09` |
| `patternDot` / `patternDash` / `patternDashDot` / `patternDashDotDot` | `0x0100` / `0x0200` / `0x0300` / `0x0400` |
| `byWord` | `0x8000` |

`double` 和 `single` 的位重叠，`patternDashDot` 等于 `patternDot | patternDash`。所以：

- 名字 → 数值用位掩码的宏（`NACRE_MASK_MAP`，或起来），这样 `check-api.sh` 也能自动拿它和类型定义核对取值。
- 数值 → 名字**不能**用宏生成的那个函数：它按位拆，9 会变成 `['single', 'double']`，`0x0300` 会变成三个名字。这一半是手写的 `UnderlineNames`，按「线型 / 虚线 / byWord」三段解，读出来的顺序固定。
- 写的时候线型和虚线各至多一个。两个线型或起来（`single | thick` = 3）是头文件里没有的值，拒掉。

`0` 的两个名字（`none`、`patternSolid`）没有给：空数组就是不画线，不写虚线就是实线。

## 下划线在屏幕上的样子：探针量到的

（2026-11-17。真机上看验收界面，「双线」像一条线，「虚线」像实线，怀疑是桥给错了值。不是。）

做了一个不带运行时的原生探针：同一组下划线样式（八种），分别交给 `UILabel`、`UITextView`（TextKit 2 和 TextKit 1）、`drawInRect:` 直接画。再把验收界面上那一行原样用原生代码写一遍。iPhone Air 模拟器，iOS 27.2。

| 量到的 | |
| --- | --- |
| 四种渲染路径画出来的线型都对 | 双线是两条，虚线是断开的，粗线是粗的。数值 `0x09`、`0x0201` 系统都认 |
| 标签只有固有高度时，双线的第二条被切掉 | 17 pt 的字，`sizeToFit` 之后标签高 20.33 pt（字体行高 20.29 pt）。同一个富文本放进 30 pt 高的标签是两条线，放进 20.33 pt 高的只剩靠上的一条，粗线的底边也少一截。标签不画自己范围外面的东西，而它算固有高度时没有把双线算进去 |
| 双线靠上的一条贴着字的底边 | 汉字的笔画会盖住它一部分，所以只剩这一条时看着像一条普通的下划线 |
| 虚线的一划大约一个汉字宽 | 17 pt 时两个汉字下面是两划，中间一个小缺口 |

把验收 App 在同一台模拟器上的截图和探针里那一行放大了逐像素比，一样。所以这是 UIKit 的行为，运行时没有要改的。

改了两处别的：验收界面上那一行给标签加了 28 pt 的高度约束，虚线那一段写成六个字；API 文档的下划线那一节加了两条注意。

**没验证的**：真机上同样的对比（真机是 iOS 27.0.1，探针只在模拟器上跑了）；除了「给标签更高的高度」之外有没有别的办法（段落样式的行高、基线偏移）没试。

## 其他几个定法

**不认识的属性名抛。** 属性名是一张固定的表（`NSAttributedStringKey` 的十七个），照枚举的规矩：写错抛 `TypeError`，把表列出来。JS 一侧先拦一道（报错更早，也不用过桥），原生再校验一遍。ObjC 里任何字符串都可以当键，放自定义属性；这个能力没有给，读的时候遇到不认识的键（系统自己加的，或者将来别的原生代码放的）跳过。

**颜色写错不抛。** 照[颜色的规矩](ui-color.md)：警告，「保持原值」在字典里就是这个键不生效，别的键照常。颜色的值是 `null` 时抛：属性里没有「空的颜色」，而 `colorArg(null)` 会返回 `null` 表示「清掉」，在这里没有可清的东西。

**越界抛的是 `TypeError`，不是 `RangeError`。** 原生的报错出口只会抛 `TypeError`（`Engine.cpp` 里写死的）。越界检查放在原生做，因为它知道字符串多长；要抛 `RangeError` 就得在 JS 里先过一次桥问长度。和 `NSRange` 给负数、`UISegmentedControl` 的下标越界一致。不检查的话 Foundation 自己抛 `NSRangeException`，入口的异常保护接得住，但那一层是保底，报错里也没有长度。

**`link` 存什么。** 头文件：`NSURL (preferred) or NSString`。JS 给的是字符串（`URL` 对象按它的地址）。原生用 `+URLWithString:encodingInvalidCharacters:NO` 按严格的规矩解析，解析得出来存 `NSURL`，解析不出来原样存字符串。两种读回来都是写进去的那个串。不用宽松的解析：它会把不合法的字符转义掉，读回来的串就和写进去的不一样了（macOS 上量到的：严格解析时 `你好 世界` 得到 nil）。

**自己拼自己。** `text.appendAttributedString(text)` 这类调用，原生先 `[other copy]` 再交给系统，不让它边读边改同一个对象。

**`new NSParagraphStyle()` 是允许的。** 得到的是默认样式的一个新对象（macOS 上量到的：两次 `init` 是两个指针，都不等于 `defaultParagraphStyle`）。空的 `NSAttributedString` 也一样，两次 `init` 是两个指针，所以这一组没有「两个包装指着同一个原生单例」的情况。

**构造函数里参数只算一次。** `NSMutableAttributedString` 的构造函数先调 `super()`，会走进 `NSAttributedString` 的构造函数。那里先看 `new.target` 是不是自己，不是就直接返回，免得属性转两遍、颜色写错时警告两次。

**段落样式的取值范围。** 头文件对 `lineSpacing`、`paragraphSpacing`、两个缩进、行高的上下限、`lineHeightMultiple` 都写着不能是负数，`hyphenationFactor` 是 0 到 1。照「取值范围由各 API 自己拒」的规矩在原生拒掉，不交给系统去猜。`tailIndent` 的负数有意义（从右边量），不拦。`shadowBlurRadius` 的负数同样拦。

## 量到的事实

macOS 27.2.1，一个链 AppKit 的命令行小程序，不带界面。探针的源码留在这批对话的共享笔记目录里（`attributed-string-probe/probe.m`）。

| | 结果 |
| --- | --- |
| `[NSMutableParagraphStyle copy]` | 类是 `NSParagraphStyle`，不是可改的，新指针 |
| 不可改的 `NSParagraphStyle` 再 `copy` | 返回自己 |
| `[[NSParagraphStyle alloc] init]` 两次 | 两个指针，都不等于 `defaultParagraphStyle`；`defaultParagraphStyle` 读两次是同一个 |
| `NSParagraphStyle` 的默认值 | `alignment` 是 natural，`lineBreakMode` 是 byWordWrapping，`baseWritingDirection` 是 natural，其余的数全是 0 |
| `allowsDefaultTighteningForTruncation` 的默认值 | **macOS 上是 YES**，而 iOS 的头文件写的是 false。iOS 上没量，验收里只断言它是布尔 |
| `[[NSAttributedString alloc] init]` 两次 | 两个指针 |
| 属性字典里放可改的段落样式，读回来 | **同一个指针**，Foundation 不复制 |
| 不可改的富文本 `copy` | 返回自己 |
| 可改的富文本 `copy` | `NSConcreteAttributedString`，不是可改的 |
| 可改的富文本上 `attributedSubstringFromRange:` | **可改的**（`NSConcreteMutableAttributedString`） |
| 没给属性的富文本，`attributesAtIndex:` | 空字典 |
| `NSShadow` 的默认值 | 偏移 0,0，模糊 0，颜色是黑色、不透明度 0.333333 |
| `[NSShadow copy]` | 新指针 |
| 在 [3,10) 上有属性的 10 个字符，遍历 (2,3) | 两段：2+1、3+2，范围不超出给的那一段 |
| 遍历长度为 0 的范围 | 回调不调 |
| `'abc'` 把 (1,1) 换成 `XYZ` | `aXYZc`，换进来的字沿用原来的属性 |
| `URLWithString:encodingInvalidCharacters:NO` | `https://example.com/a?b=1` 的 `absoluteString` 原样；`你好 世界` 是 nil；空串不是 nil |
| 空的富文本的 `size` | 宽 0，高不是 0（14） |
| 一段长文字限宽 200，`options` 给 0 | 200 × 20：按一行算，宽被限住 |
| 同上，带 `UsesLineFragmentOrigin` | 194 × 540：折成多行 |
| 再加 `UsesFontLeading` | 和上一条相同（系统字体） |
| `[[NSTextAttachment alloc] init]` | `image` 是 nil，`bounds` 全是 0 |
| `attributedStringWithAttachment:` | 长度 1，字符是 U+FFFC，`NSAttachment` 属性就是给的那个附件，没有别的键 |
| `attributedStringWithAttachment:attributes:` 给空字典 | 不出错，结果同上 |
| 两个富文本各带一份值相同的段落样式副本，`isEqualToAttributedString:` | YES |

## 第一遍验收的结果

接这一组的对话不跑模拟器，四种视图上的行为当时只有头文件和文档可依，在用例里标成了「要验证的假设」。合并之后跑了第一遍（iPhone Air 模拟器，iOS 27.2，Debug），267 条断言里 3 条不过，三条都是假设错了，实现没有动。

### 和假设不一样的

| 假设 | 实测 |
| --- | --- |
| `UILabel` 上写过 `attributedText` 再写 `text`，富文本的样式被换掉 | **样式留着。** 文字换成了新的，读回来的 `attributedText` 上原来的下划线还在。`UITextView` 的同一条断言（再写 `text` 之后底色没了）是通过的，所以这是标签自己的行为，不是三种视图共有的 |
| 按钮上没有单独设过的状态，`attributedTitleForState()` 是 `null` | **返回 `normal` 的那个**，和 `titleForState()` 一样。`normal` 也没设过时才是 `null` |
| 给某个状态写 `null` 之后，这个状态读出来是 `null` | 读出来是回到 `normal` 的那个，原因同上 |

标签那一条改了文档的说法：标签显示过富文本之后要改内容，继续写 `attributedText`。「先写 `attributedText = null` 再写 `text`，样式是不是就没了」没有量过，文档里没有把它写成做法。

### 成立的

- 上面[量到的事实](#量到的事实)里验收断言到的那些，在 iOS 上也成立：副本的类、按段遍历的范围、换文字时沿用的属性、段落样式的默认值、量尺寸的选项、附件的占位字符。
- 没有内容的 `UILabel`，`attributedText` 是 `null`；写 `null` 之后 `text` 也是 `null`。
- 三种视图上写了 `attributedText`，`text` 读出来是其中的文字；再写 `text`，`attributedText` 的文字跟着变。
- 标签和文本视图读回来的富文本里，写进去的颜色、下划线、底色还在，底色只在给的范围里。
- 没设过的 `attributedPlaceholder` 是 `null`；它和 `placeholder` 的文字互相跟着变。
- 按钮上 `normal` 和 `highlighted` 各自读回来的富文本标题和写进去的内容相同；只设了富文本标题时 `titleForState('normal')` 还是 `null`。
- `textAttachmentWithImage(image)` 得到的附件，`image` 是给的那一张。
- 字体读回来是同一个包装；颜色字符串原样读回（`'#ff3b30'`、`'rgba(0, 0, 255, 0.5)'`、`'systemYellow'`）。

### 还没有事实的

用例里这几处不断言，只把读到的值打出来，日志里搜 `[attributed-string probe]`：

| | 为什么不断言 |
| --- | --- |
| 空的 `UITextField` / `UITextView`，`attributedText` 是 `null` 还是长度 0 的富文本 | 不知道是哪一种。断言写的是两种都收 |
| `allowsDefaultTighteningForTruncation` 的默认值 | 头文件说 false，macOS 上量到的是 true |
| `NSShadow` 的默认颜色读出来写成什么样 | macOS 上量到的是 0.333333 的黑色，合成成字符串之后的写法没看过 |
| 标签先写 `attributedText = null` 再写 `text`，原来的下划线还在不在 | 第一遍之后加的 |
| 输入框上写过 `attributedText` 再写 `text`，原来的字距还在不在 | 第一遍之后加的。标签留着、文本视图不留，输入框是哪一种不知道 |

另外三样用例里没有的：真实点按钮（富文本标题在按住时换成 `highlighted` 的那一份）、输入框里打字之后 `attributedText` 的内容、所有权边在 GC 之后守不守得住。

## 没有做的

HTML 和 Markdown 转富文本、TextKit 的布局管理器、`UITextView` 里点链接的委托，这三样是开工时就定了不做的。其余的见 API 文档的[还不能做的](../api/ns-attributed-string.md#还不能做的)。挑属性键时的取舍：

| 没给的键 | 为什么 |
| --- | --- |
| `obliqueness`、`expansion`、`verticalGlyphForm` | 头文件里标着将废弃（TextKit 2 不支持） |
| `textEffect` | 只有凸版一种取值 |
| `writingDirection` | 值是一组数的数组，表示嵌套的方向覆盖，日常用不到 |
| `textHighlightStyle`、`textHighlightColorScheme`、`adaptiveImageGlyph`、`writingToolsExclusion` | iOS 18 新加的，各自带着新的类型 |

段落样式没给的：`tabStops`（要先有 `NSTextTab`）、`textLists`、`textBlocks`、`usesDefaultHyphenation`、`lineBreakStrategy`。最后一个和下划线是同一种情况：`standard` 是 `0xFFFF`，把另外两个的位都盖住了，要手写一份解码，留到有人用的时候。
