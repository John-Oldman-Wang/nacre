# 多行输入

`UITextView`、它的 `NSTextContainer`，和表示选区的结构体 `NSRange`。用法见 [API 文档](../api/ui-text-view.md)，这里记它是怎么接的、量到了什么、哪些没验证。

（2026-11-15，第二批并行接类里的一组。）

## 文件

一个登记进来的域，名字是 `text-view`，照[接入一组类](adding-classes.md)做的：

| | 文件 |
| --- | --- |
| 原生 | `ios/Runtime/Bridge/NacreTextView.mm` |
| JS | `ios/Runtime/Builtin/parts/50-text-view.js` |
| 类型 | `packages/types/ios/text-view.d.ts` |
| 验收 | `acceptance/src/steps/text-view.js` |

核心的文件一个都没动。`UITextView` 是 `UIScrollView` 的子类：这个域只认自己加的那些名字，别的名字（`contentOffset`、`frame`、`becomeFirstResponder`…）说「不认领」，分发器接着问核心。域的 `classes` 里列的是 `UITextView` 和 `NSTextContainer`，继承层数比手势域（列了 `UIView`）深，所以先被问到。

## 三个文字事件走通知，不占委托

`UITextViewDelegate` 继承 `UIScrollViewDelegate`，文本视图只有一个 `delegate` 属性，两套方法都从它走。核心的滚动事件要往这个属性上放一个 `NacreScrollDelegate`（见[滚动](scrolling.md)）。

接这一组类的时候（2026-11-15）委托的位置还不能共用：文字事件要是也用委托，后订的把先订的挤掉，先退的把还在用的摘掉。所以三个文字事件走的是通知。

UIKit 给文本视图的三件事各发了一条通知，正好够用：

| 事件 | 通知 |
| --- | --- |
| `focus` | `UITextViewTextDidBeginEditingNotification` |
| `blur` | `UITextViewTextDidEndEditingNotification` |
| `input` | `UITextViewTextDidChangeNotification` |

观察者是一个 `NacreTextViewObserver`，用关联对象挂在文本视图上，按发送者过滤。它不持有文本视图，也不持有任何 JS 函数；一个事件名都不订的时候不存在。事件从 `NacreEmitEvent` 出去，延后一轮派发。

事件名和通知名的对应用的是 `NACRE_STRING_ENUM_MAP`：订阅时正查，派发时按通知名反查，`check-api.sh` 也按这张表核对类型定义里的 `UITextViewEventType`。

实测（不带窗口的探针）：`delegate` 设成一个只实现了滚动方法的对象之后，`insertText:` 照样发「文字变了」的通知；写 `contentOffset` 照样调委托的 `scrollViewDidScroll:`。两边互不相干。验收里有一组断言是这件事：同一个文本视图上同时订 `input` 和 `scroll`，两种都到；各退掉一种，另一种还在。

当时的代价是 `selectionchange` 做不了：选区变了只有委托方法（`textViewDidChangeSelection:`），没有通知。后来委托的位置能共用了，它补上了，见下一节。

## `selectionchange`：委托槽位里的一方

（2026-11-17 补的，和单行输入框的选区一起，那一边见[输入框怎么搭的](text-input.md#选区selectedrange-和-selectionchange)。）

做列表那一步时核心多了一个机制：`NacreAddDelegatePart(object, part)`。`delegate` 属性上实际放的是一个转发对象，系统问到哪个委托方法，它转给第一个实现了这个方法的那一方（见[列表](collection-view.md#委托的槽位和滚动事件共用)）。核心的滚动委托早就是这样加进去的，所以文本视图再加一方不用动核心。

`selectionchange` 的那一方是 `NacreTextViewSelectionDelegate`，只实现 `textViewDidChangeSelection:` 一个方法，里面调 `NacreEmitEvent`，延后一轮派发。它用关联对象挂在文本视图上：第一个 `selectionchange` 监听器来的时候建、加进槽位，最后一个走的时候拿出来、放掉。它实现的方法和滚动委托的不重叠，两边谁先订、谁先退都不影响另一边。

几条取舍：

- **事件上不带选区。** 判据还是「回头读不读得到」：`selectedRange` 一直读得到。事件延后一轮才到 JS，带上的也只是系统通知那一刻的值，回调里拿它和现在的选区对不上时反而要解释。浏览器的 `selectionchange` 也不带。
- **不合并。** 连着变几次就派发几次，每次回调读到的都是最新的选区。浏览器是合并的（同一轮里只排一个）。这里没有做：合并要一个「已经排了」的标记，还要保证它在回调执行之前清掉，是一条要自己维护和验证的机制；现在没有数据说明几次回调是问题。
- **三个文字事件没有挪到委托上。** 它们走通知走得好好的，挪过去只是换一条路。
- **事件名放进了 `TextViewEvent` 那张表**（`NACRE_STRING_ENUM_MAP`），虽然它不是通知。那张表是 `check-api.sh` 拿来和类型定义里的 `UITextViewEventType` 核对的，放进去四个名字才一起有人盯着。表里它右边那个串只是占位，订阅时在查表之前就按名字认走了，不会真去订一个不存在的通知。

每增减一方，转发对象会把 `delegate` 先清空再设回去（UIKit 在设委托的那一刻记下它实现了哪些方法）。文本视图正在编辑时这样重设有没有副作用，**没有量过**：验收里选区的委托都是在聚焦之前加、失焦之后拿走的。

## 订阅只认领四个名字

`TextViewSetSubscription` 认得出是自己的四个名字之一就处理，别的名字一律返回 false。于是：

- 滚动的八个名字落到核心的滚动分支，照常工作。
- `traitchange` 在分到各个类之前就被认走了，不经过这里。
- 哪边都不认识的名字，最后落到核心的滚动分支。

第三条当时有一个量得到的缺口：**报错里列的名字不全。**（2026-11-17 起不认识的事件名不再报错，当自定义事件，这个缺口也就看不到了；下面是当时的记录。）原文是

```
addEventListener has no value "selectionchange"; expected one of: scroll / dragbegin / dragend / deceleratebegin / decelerateend / scrollanimationend / scrolltotop / adjustedcontentinsetchange / traitchange
```

没有 `focus` / `blur` / `input`。列的是核心那张滚动事件名的表，它不知道这个域。

在这个域里补不了。能补的办法是自己认领所有不认识的名字、自己报一份全的，但那样排在后面的域（比如将来给 `UIView` 加事件的域）就再也没机会认领文本视图上的事件名了。要正经解决是核心的事：报错的那一步向登记进来的域要名单，或者做 [project.md 里记着的那条](../project.md#7-还要做的)「订阅按事件名分流」。API 文档里把这一条写成了已知的问题。

## `NSRange`

照已有结构体的规矩：JS 类，字段只读，写入即抛；写入时也收带同样字段的普通对象；过桥的是 `{ location, length }`。

**结构体的基础设施没有导出。** `02-struct.js` 里定义只读字段的 `defineStructFields` 是那个 part 的局部函数，`ctx` 上只有 `structArg` 和几个 `toXxx`。第一批里数值控件那一组想加 `UIOffset` 时因此没做。这里的做法是在自己的 part 里照着写了一份（十二行），类用 `ctx.define` 挂到全局——没有改共享文件。类型声明在自己的 `.d.ts` 里，`check-api.sh` 按 `define(globalThis, 'NSRange'` 认出它并核对了声明在不在。将来有第三个域要加结构体，这个助手该进 `ctx`。

**单位不用换算。** `NSRange` 在 `NSString` 上数的是 UTF-16 码元，JS 字符串的下标也是。所以 `text.slice(location, location + length)` 直接成立。实测 `'a😀b'` 上 `(1, 2)` 正好盖住那个表情。

原生那一侧取 `{ location, length }` 的函数（`TextInputRangeFromJSON`）是这个文件里定义的，单行输入框的 `selectedRange` 用的是同一个，所以两边的校验和报错是同一份。它不是 `static`，那边自己声明了一行；该进内部头，那次不许动。

选区放在表情的两个码元中间（`(2, 0)`）UIKit 不纠正，在那里 `insertText:` 会把代理对拆开，文字里留下落单的代理项（探针里那段文字转不成 UTF-8）。运行时没有拦，API 文档里写了。

**两个字段是非负整数。** 三层：

| 在哪 | 做什么 |
| --- | --- |
| `new NSRange(…)` | 不给是 0；按整数转（向零取整）；负数抛 |
| 写 `selectedRange`、调 `scrollRangeToVisible` | `structArg` 查字段在不在、是不是有限数，然后向零取整 |
| 原生 `TextViewCount` | 只校验：必须是整数、不能是负数。负数的报错带着是哪个属性的哪个字段 |

**上限收到 2^53 − 1。** 这一条是探针里崩出来的：`selectedRange = (8, NSUIntegerMax)`，位置加长度溢出，UIKit 抛 `NSInvalidArgumentException`（`-[__NSPlaceholderArray initWithObjects:count:]: attempt to insert nil object`）。入口有异常保护，不至于崩，但报出来的是一句和用法无关的话。另外 JS 给得出 `1e300`，直接转成无符号整数是未定义行为。所以原生把两个数各自收到 2^53 − 1 以内，加起来到不了 2^64，然后照常交给 UIKit。

**越界照 UIKit 的。** 实测（不带窗口，内容 10 个字符）它不抛：`(100, 5)` 读回 `(10, 0)`，`(2, 100)` 读回 `(2, 0)`——长度超了不是截到末尾，是变成 0。`scrollRangeToVisible` 越界也不抛、不动。运行时没有另外定义截断的规则。

## `keyboardDismissMode` 在 `UIScrollView` 上

它是 `UIScrollView` 的属性。接多行输入的那一步只把它开在了 `UITextView` 上：多行输入里回车是换行，没有它键盘收不起来；而给 `UIScrollView` 加成员是「给已有的类加成员」，当时排在独立的各组之后。客户后来指出这一条（2026-11-17）：同一个属性，原生在所有滚动视图上都有，这里只有一个子类有。

2026-11-18 挪到了滚动域：原生的两个分支在 `NacrePropsScroll.mm`，枚举表 `KeyboardDismissMode` 在 `NacreEnumsScroll.mm`，JS 的取值器在 `13-scroll.js` 里 `UIScrollView` 的类体里，类型 `UIScrollViewKeyboardDismissMode` 在 `view.d.ts`。`UITextView` 这边的那一份删掉了，它和 `UICollectionView` 靠继承得到。

两处要知道的：

- **多行输入的域不认这个名字。** 分发器先问登记进来的域（多行输入那个），它说不认领，再走核心的滚动分支。`UITextView` 是 `UIScrollView`，所以落在那里。
- **枚举表的声明没进内部头。** 挪的时候内部头不许动，`NacrePropsScroll.mm` 自己写了一行 `NACRE_ENUM_DECL`。别的滚动枚举的声明都在内部头里，这一个该跟过去。

验收里普通滚动视图的读写在 `scroll.js`，文本视图上原有的断言留着；「普通的滚动视图上没有这个属性」那一条反过来了。默认值只在不带窗口的 `UITextView` 上用探针量过（none），普通的 `UIScrollView` 是照头文件写的。

## 键盘那九个属性又写了一份

`UITextField` 和 `UITextView` 都遵循 `UITextInputTraits`，但没有共同的父类可以挂这九个属性。核心里 `UITextField` 的实现是按类写死的（`NacrePropsControl.mm` 开头那段），这里照样为 `UITextView` 再写一份。枚举的互转函数用的是内部头里已经声明的那些，没有新增枚举表。

没有用宏铺开，理由和那边一样：`check-api.sh` 按 `isEqualToString:@"…"` 后面的字面量抽属性名。

### `keyboardAppearance` 的别名

头文件里 `UIKeyboardAppearanceAlert = UIKeyboardAppearanceDark`，一个数值两个名字。两个都写得进去，读出来给主名 `'dark'`。

核心那张表（`NacreEnumsInput.mm` 的 `KeyboardAppearancePairs`）是有序的，主名在前、别名在最后，反查时先碰到的是主名。做法和 `StackAlignment` 一样，见[枚举](enums.md)。

它原来用的是 `NACRE_ENUM_MAP`，反查走无序字典，实测写 `'dark'` 读回来是 `'alert'`。这是验收用例跑出来的：最初的用例只验 `'dark'` 的往返，实现后那一条挂了。当时 `UITextView` 和 `UISearchBar` 各在自己的读分支里先把这个数值认走，`UITextField` 没动，同一个值在三个类上读到的名字不一样。2026-11-18 把表改成有序的，那两处特例删了。验收在三个类上各有「写 `'alert'` 读回 `'dark'`」一条。

## 所有权

| 边 | 怎么记的 |
| --- | --- |
| 文本视图 → `textContainer` | `nativeGetOwned`。实测每次读都是同一个原生对象 |
| 文本视图 → `font` | `nativeGetOwned` / `nativeSetOwned` |
| 文本视图 → `textColor` | 同上（过桥的是 `UIColor`，JS 这边看到的是字符串） |

三个方法（`insertText:`、`deleteBackward`、`scrollRangeToVisible:`）都不收原生对象，没有所有权边要记。

`NSTextContainer` 不能 `new`。现在唯一拿得到它的地方是 `textView.textContainer`，自己建一个也没有地方可以交（要先有 `initWithFrame:textContainer:` 和排版管理器那一组）。

## 量到的事实

iPhone Air 模拟器，iOS 27.2，`simctl spawn` 跑的原生小程序。两种状态：

- **不带窗口**：只建一个 `UITextView`，不放进任何窗口。
- **带窗口**：放进一个 `UIWindow`。小程序里没有 `UIApplication`，也没有键盘。

| | 状态 | 结果 |
| --- | --- | --- |
| 默认值 | 不带窗口 | `text` 是空串；`font` 是 nil，设了文字之后还是 nil；`textColor` 是 labelColor；底色 systemBackground；`isEditable` / `isSelectable` / `isScrollEnabled` 都是真；`textAlignment` 是 natural；`textContainerInset` 是 {8, 0, 8, 0}；`selectedRange` 是 (0, 0)；`delegate` 是 nil |
| 文字容器的默认值 | 不带窗口 | `lineFragmentPadding` 5，`maximumNumberOfLines` 0，`lineBreakMode` 按词折行；每次读 `textContainer` 是同一个指针 |
| 键盘属性的默认值 | 不带窗口 | 都是各自枚举的第一个值，除了 `autocapitalizationType` 是 sentences；`textContentType` 是 nil；`keyboardDismissMode` 是 none |
| 写 `text` | 两种 | 不发「文字变了」的通知。写完选区在末尾。写 nil 读回空串 |
| `insertText:` | 不带窗口 | 插在选区处，有选区就换掉；发通知。插空串什么都不改，**也发通知** |
| `deleteBackward` | 不带窗口 | 有选区删选区，没有删前一个；发通知。选区在开头时什么都不做，不发 |
| `isEditable = NO` | 不带窗口 | `insertText:` 和 `deleteBackward` 照样改得动，照样发通知 |
| `isSelectable = NO` | 不带窗口 | **`isEditable` 跟着变成 NO**。再写 `isSelectable = YES`，`isEditable` 不回来。写 `isEditable = YES` 会让 `isSelectable` 变成 YES |
| `font` / `textColor` | 不带窗口 | 写进去的对象原样读回来（同一个指针）；写 nil 读回 nil |
| 没设字体时 | 不带窗口 | 文字的属性里没有字体。关掉滚动后一行字的固有高度是 30（17 pt 的字是 36.33） |
| 固有大小 | 不带窗口 | 能滚动时是 (-1, -1)。关掉滚动之后有：17 pt 的字三行高 77，五行 117.67，六行 138 |
| 行数上限 | 不带窗口 | 六行字限成两行，`sizeThatFits` 的高从 138 变成 56.67 |
| 约束定位、不给高度 | **不带窗口** | 排出来高 77。改了文字再排，**高度不变** |
| 同上 | **带窗口** | 写 `text` 和 `insertText:` 之后高度都跟：五行 117.67，六行 138，清空 36.33 |
| `scrollRangeToVisible:` | 不带窗口 | 200 × 60、40 行字，滚到末尾 `contentOffset.y` 从 0 变成 788。再滚 (0, 0) 不往回走。越界不抛、不动 |
| 聚焦 | 带窗口 | `becomeFirstResponder` 返回 YES，发「开始编辑」一次；已经是 first responder 时再调返回 YES、不再发。`resignFirstResponder` 和 `endEditing:` 各发「结束编辑」一次 |
| `isEditable = NO` 时聚焦 | 带窗口 | `becomeFirstResponder` 返回 YES、`isFirstResponder` 为真，但**不发**「开始编辑」，失焦也不发「结束编辑」 |
| 选区溢出 | 带窗口 | `(NSNotFound, 0)` 读回 (10, 0)。`(8, NSUIntegerMax)` 抛异常，进程没了 |

「高度跟不跟文字」和窗口有关，这是[接入一组类](adding-classes.md#验收)里说的「探针量到的数不一定是 App 里的数」的又一个例子。验收里这一组等区块进了窗口再量。

## 验证

测试驱动：先写用例并单独提交，在没有实现的运行时上跑，十六组各报一条「这一组中断了」；再写实现。

**验收没有在 App 里跑过**（模拟器由合并的那个对话统一跑）。跑过的是这个：一个命令行小程序链接编好的 `Nacre.framework`，把这一步验收单独打包出来执行，用 `simctl spawn` 起在模拟器里。办法是第一批数值控件那一组留下的，这里多加了一个带窗口的变体——小程序自己建一个 `UIWindow`，把验收的区块放进去——于是「高度跟着文字」和「聚焦、失焦各派发一次」两组也跑到了。

| | 结果 |
| --- | --- |
| Debug | 188 条通过，0 条失败 |
| Release | 188 条通过，0 条失败，断言的名字和 Debug 逐条相同 |

两处要知道的：

- 小程序里没有 `UIApplication`，没有键盘，区块不在真正的界面里。它验的是这个域自己的代码和 UIKit 在这种状态下的行为。
- 小程序退出时析构运行时会段错误（`~Engine` 里放定时器回调的句柄，那时还挂着没到期的定时器）。App 不会析构运行时，所以平时走不到；小程序改成直接 `_exit`。和这个域无关，记在这里免得下一个用这个办法的人再查一遍。

`check-api.sh`：类 88 个，标量读写 286 / 205，对象读写 92 / 44。

## 没验证的

- ~~整套验收在 App 里的结果~~：合并之后跑过了，模拟器和真机都通过。聚焦那一组后来改过一次：它原来等「底部输入框空闲」，而那个输入框在最早那批步骤之后又成了 first responder，以前是靠后面搜索框那一步抢走焦点才过的；现在直接拿焦点。
- **真实键盘和真实触摸。** 用户打字时 `input` 派发几次、`keyboardDismissMode` 各个取值的手感、`isEditable` 为假时点它弹不弹键盘、选区在屏幕上的样子、占位文字的显隐。
- **屏幕上的样子。** 底色、圆角、内边距、行数上限的省略号。
- **真机。** 预编译的 xcframework 没重打。
- `interactive` 那两种收键盘的方式和 `keyboardLayoutGuide` 的 `keyboardDismissPadding` 怎么配合，没量。
- **`selectionchange`**：用例是按判断写的（写的时候只许编译），合并后的验收在 iPhone Air 模拟器（iOS 27.2，Debug）上跑过一遍，下面四条都验到了：
  - 代码写 `selectedRange` 时系统会调 `textViewDidChangeSelection:`，文本视图不在窗口里、不是 first responder 时也调。
  - `insertText:` 挪了光标，也调。
  - 委托槽位里同时有滚动委托和选区委托时，`scroll`、`input`、`selectionchange` 都照常；退掉任何一方，另一方不受影响。
  - 订着 `selectionchange` 时聚焦和失焦各派发一次 `focus` 和 `blur`。

  没验到的：写 `text` 派不派发（没有断言，文档里写的是不要依赖）；用户真实地移动光标和拖动选区；Release 配置和真机。

## 没做的

| | 原因 |
| --- | --- |
| 在字符显示前拦截、阻止开始或结束输入 | 委托方法要同步返回布尔（M1b） |
| `attributedText`、`typingAttributes`、`linkTextAttributes` | 还没有 `NSAttributedString` |
| 占位文字 | UIKit 的 `UITextView` 本身没有。API 文档里给了叠 `UILabel` 的写法 |
| `inputView` | 没接。`inputAccessoryView` 后来接了，两种输入框一起，见[输入框](text-input.md#键盘上方的工具条inputaccessoryview) |
| `dataDetectorTypes`、`selectedRanges` | 没接 |
| `borderStyle` | 头文件里它在 iOS 上只有 none 一个取值（圆角的那个只有 visionOS 有），暴露出来没有用处 |
| 编辑菜单、Writing Tools、查找 | 没接 |
| `NSTextContainer` 的构造、`size`、`exclusionPaths`，以及 `NSLayoutManager` / `NSTextStorage` | 没接。先开了三个属性 |
| `clearsOnInsertion`、`allowsEditingTextAttributes`、`usesStandardTextScaling` 等零散属性 | 没接 |
