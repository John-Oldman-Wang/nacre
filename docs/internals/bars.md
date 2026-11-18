# 工具条和搜索框

← [实现原理](README.md)

`UIToolbar` 和 `UISearchBar`。两个条状的视图，都是 `UIView` 的子类，不是控件。一个域（`bars`），照[接入一组类](adding-classes.md)做的：`NacreBars.mm`、`50-bars.js`、`bars.d.ts`、验收的 `bars.js`，共享文件一个没碰。

使用说明在 [`UIToolbar`](../api/ui-toolbar.md) 和 [`UISearchBar`](../api/ui-search-bar.md)。

## 量到的事实

动手前写了四个不带界面的原生小程序，在 iPhone Air 模拟器（iOS 27.2）上用 `simctl spawn` 跑的。**没有 `UIApplication`，视图不在窗口里**（`[[UIApplication alloc] init]` 试过，抛「There can only be one UIApplication instance」，而 `sharedApplication` 仍然是 nil）。验收用例里的期望值都来自这里，所以默认值和大小的断言都对着没放进窗口的条做，和量的时候是同一个状态。

### 工具条

| 量什么 | 结果 |
| --- | --- |
| `init` 之后 | `frame` 0 × 0，`barStyle` 0，`translucent` YES，**`items` 是 nil**，`barTintColor` nil，`barPosition` 是 bottom |
| `intrinsicContentSize` | 探针里 (-1, 44)，**App 里 (-1, 48)** |
| `sizeThatFits:` | 探针里给 (0, 0) 得 (0, 44)，给 (390, 0) 得 (390, 44)；**App 里给 (390, 0) 得 (390, 48)** |
| 写 `frame` 390 × 20 再 `sizeToFit` | 探针里 390 × 44，**App 里 390 × 48** |
| `items = @[a, b, c]` 再读 | 三个，指针是原来那三个 |
| `items = @[]` / `items = nil` | 读回 `@[]` / nil |
| `setItems:animated:YES` | `items` 当场就是新的 |
| 同一个项放两次 | 两个都在 |
| 同一个项放进第二个工具条 | 两个工具条的 `items` 里都有它 |
| `barStyle = UIBarStyleBlack` | `translucent` 不变 |
| `barStyle = 2`（废弃的 BlackTranslucent） | 写得进去，读回 2 |
| `tintColor = nil` | 读回 `systemBlueColor`（`null_resettable`） |

`items` 的 nil 和空数组，JS 这边都读成 `[]`：两者在行为上没有差别，区分它们只会让每个使用者多写一次判空。

### 工具条的高度：探针里 44，App 里 48

上表里高度那三行有两个数。44 是不带界面的命令行程序里量到的，用例最初照它写；合并后的验收在 App 里跑出来是 48，三条断言不过（`intrinsicContentSize`、`sizeThatFits:`、`sizeToFit`）。两边都是 iPhone Air 模拟器（iOS 27.2），都是没放进窗口的工具条，差别只在进程里有没有 `UIApplication`。链接了 `Nacre.framework` 的那个命令行程序里也是 44，所以和运行时无关。

为什么差 4 pt 没查。用例和文档都改成了 App 里的数：验收是在 App 里跑的，使用者写的代码也是。搜索框的三个高度（64 / 98 / 111）两种状态下一样，那几条断言在 App 里是过的。

这是[接入一组类](adding-classes.md)里「不带界面的探针量到的数，不一定是 App 里的数」的又一个例子，而且这次连「在什么状态下量的」都对得上（都不在窗口里），仍然不一样。能留下的做法是：**凡是系统按界面风格给的尺寸，用例里对着探针的数写时就要预期它在 App 里可能不同**；API 文档里不让使用者把这类数写进代码。


### 搜索框

| 量什么 | 结果 |
| --- | --- |
| `init` 之后 | `frame` 0 × 0；**`text` 是空串不是 nil**；`placeholder`、`prompt`、`scopeButtonTitles`、`barTintColor`、`inputAccessoryView` 是 nil；`searchBarStyle` 0；`translucent` YES；四个按钮开关都是 NO；`selectedScopeButtonIndex` 0；`enabled` YES；`barPosition` 是 top |
| `intrinsicContentSize` | (-1, 64)；有 `prompt` 时 (-1, 98)；显示范围条并且有三个标题时 (-1, 111) |
| `text = nil` | 读回空串 |
| `prompt = @""` | 读回空串，高度回到 64；`prompt = nil` 读回 nil |
| `searchTextField` 的类 | `UISearchBarTextField`（`UISearchTextField` 的私有子类）；两次读是同一个指针；它的 `delegate` 是 nil |
| `searchTextField` 的默认值 | `returnKeyType` 是 search，`enablesReturnKeyAutomatically` YES，`clearButtonMode` 是 always，`autocorrectionType` 是 no |
| `bar.text` 和 `searchTextField.text` | 同一份，两边写、另一边都读得到；`placeholder` 同理 |
| `searchTextField.keyboardType = …` | `bar.keyboardType` 读到同一个值，反过来也是 |
| `selectedScopeButtonIndex = 7`（三个标题） | **读回 7**。头文件写的是「ignored if out of range」 |
| `selectedScopeButtonIndex = -1` | 读回 -1 |
| 下标是 1 时换成另外两个标题 | 还是 1 |
| 换成只有一个标题 | 变成 0 |
| `scopeButtonTitles = @[]` | 读回 `@[]`，**下标变成 -1** |
| 没有标题时 `showsScopeBar = YES` | 写得进去，高度还是 64 |
| 开结果列表按钮 | 书签按钮的开关不变（两个可以同时是 YES） |
| 关结果列表按钮 | `searchResultsButtonSelected` 留着 |
| `enabled = NO` | `userInteractionEnabled` 变 NO，`searchTextField.enabled` 变 NO；写回 YES 都恢复 |
| `tintColor = …` | `searchTextField.tintColor` 跟着变 |
| `inputAccessoryView = v` | 读回同一个指针，`searchTextField.inputAccessoryView` 也是它 |
| 不在窗口里 `becomeFirstResponder` | 返回 NO |
| 放进一个 `makeKeyWindow` 过的 `UIWindow` 再 `becomeFirstResponder` | 返回 YES，**搜索框和输入框的 `isFirstResponder` 都是 YES**；`resignFirstResponder` 返回 YES |

### `placeholder` 的 nil 和空串

第一遍量的时候读错了一次，用例的期望跟着写错（「写空串读回 nil」），实现出来之后对不上才回头重新量：

| 顺序 | 读回 |
| --- | --- |
| 新建的，写 `@""` | nil |
| 写 `@"Search"` 再写 `@""` | `@""` |
| 接着写 nil | 还是 `@""` |
| 写 `@"Search"` 再写 nil | nil |
| 接着写 `@""` | 还是 nil |

规律是：nil 和空串被当成同一个值。当前已经是「没有」的时候，再写另一种不会变；从有到没有的那一次，写的是哪种读回来就是哪种。普通的 `UITextField` 量出来一样，所以这是输入框的行为，不是搜索框的。

没有在桥上把它规范成一种：这是底层，照原生的事实给；而 `searchTextField.placeholder` 读的是同一份，只规范搜索框这一侧，两边就对不上了。文档里给的判断办法是 `!search.placeholder`。

## 搜索框的委托回调是哪里来的

用代码改 `text`、改 `selectedScopeButtonIndex`，委托都不被调。在探针里对输入框发控件事件，委托也不被调——没有 `UIApplication`，target-action 发不出去。把登记在各个控件上的 action 手动调一遍，才看清楚这八个回调全是搜索框里面那几个控件的 target-action 转出来的：

| 控件 | 控件事件 | 搜索框自己的方法 | 委托回调 |
| --- | --- | --- | --- |
| `searchTextField` | focus | `_searchFieldBeginEditing` | `searchBarTextDidBeginEditing:` |
| `searchTextField` | input | `_searchFieldEditingChanged` | `searchBar:textDidChange:` |
| `searchTextField` | blur | `_searchFieldEndEditing` | `searchBarTextDidEndEditing:` |
| `searchTextField` | `return`（原生的 `UIControlEventEditingDidEndOnExit`） | `_searchFieldReturnPressed` | `searchBarSearchButtonClicked:` |
| 范围条的 `UISegmentedControl` | change | `_scopeChanged:` | `searchBar:selectedScopeButtonIndexDidChange:` |
| 输入框里的 `UIButton` | touchupinside | `_bookmarkButtonPressed` / `_resultsListButtonPressed` | 书签、结果列表 |
| 右边的 `UIButton` | touchupinside | `_performCancelAction` | `searchBarCancelButtonClicked:` |

这张表决定了验收怎么写：`searchTextField` 在 JS 里是一个 `UITextField`，对它 `sendActionsForControlEvents(['input'])` 就能触发 `input`，不用弹键盘、不用真实触摸。前四个事件是这样验的。后三行的控件在私有的子视图上，JS 读 `subviews` 拿到的包装是 `UIView`（没有 `sendActionsForControlEvents`），够不着，只能真实触摸。

`input` 的 action 不看文字变没变：文字没动时发一次，`textDidChange` 照样来一次。

## 键盘设置：九个都直接设在搜索框上

`keyboardType`、`returnKeyType`、`keyboardAppearance`、`enablesReturnKeyAutomatically`、`isSecureTextEntry`、`autocapitalizationType`、`autocorrectionType`、`spellCheckingType`、`textContentType`，和 `UITextView` 上的是同一组，枚举表也是同一套（`NacreEnumsInput.mm`）。

### 为什么又开了这个入口

第一版没做，理由写在「没做的」里：通过 `searchTextField` 设，两处都开等于同一个设置有两个入口。2026-11-17 客户指出三个输入控件的接口不一致：`UITextField` 和 `UITextView` 上 `input.keyboardType = …` 能写，到了搜索框要多绕一层。原来那条理由看的是「入口有没有重复」，没看「三个控件写法是不是一样」；而原生的 `UISearchBar` 本来就公开遵循 `UITextInputTraits`，这个入口不是我们多造的，是原来没接。`searchTextField` 上的那一份照旧在，两边是同一份设置。

### 哪些是直接设的，哪些经过 `searchTextField`

**九个都是对搜索框直接读写的**（`bar.keyboardType = …`），桥上没有一个绕 `searchTextField`。

系统那一侧是这样的（Mac Catalyst 的小程序里用 ObjC 运行时查的，macOS 27.2）：

| 查什么 | 结果 |
| --- | --- |
| `UISearchBar` 自己实现了十八个读写方法里的哪些 | 只有 `setKeyboardAppearance:` 一个 |
| 其余十七个 | `UISearchBar` 实现了 `forwardingTargetForSelector:` 和 `methodSignatureForSelector:`，把它们转给一个私有的 `UITextInputTraits` 对象；`respondsToSelector:` 对十八个都是 YES |
| 转到的是不是 `searchTextField` | 不是它本身，是它用的那份设置对象。两边读写的是同一份：对搜索框写九个，`searchTextField` 上九个都读到新值；对 `searchTextField` 写，搜索框也读到 |
| `isSecureTextEntry` | 搜索框收，写 YES 读回 YES，两边一致。所以照样暴露了 |
| `textContentType = nil` | 两边都读回 nil |

`UITextView` 也是同一个结构（它自己只实现了 `setSecureTextEntry:`），所以两个类在桥上的写法一样：照协议里的属性直接读写。

没有绕 `searchTextField` 的原因有两个。搜索框自己实现了 `setKeyboardAppearance:`，说明这一项它除了转发还做了别的事，绕过去就漏了；其余的转发是系统自己的公开行为，再包一层没有好处。

### 默认值

| 属性 | 搜索框上的默认值 | 在哪里量的 |
| --- | --- | --- |
| `returnKeyType` | search | 模拟器（从 `searchTextField` 读的），Mac Catalyst |
| `enablesReturnKeyAutomatically` | YES | 模拟器（同上），Mac Catalyst |
| `autocorrectionType` | no | 模拟器（同上），Mac Catalyst |
| `keyboardType` | default | Mac Catalyst；合并验收时在模拟器和真机上读到的也是这个值 |
| `keyboardAppearance` | default | Mac Catalyst；合并验收时在模拟器和真机上读到的也是这个值 |
| `isSecureTextEntry` | NO | Mac Catalyst；合并验收时在模拟器和真机上读到的也是这个值 |
| `autocapitalizationType` | sentences | Mac Catalyst；合并验收时在模拟器和真机上读到的也是这个值 |
| `spellCheckingType` | default | Mac Catalyst；合并验收时在模拟器和真机上读到的也是这个值 |
| `textContentType` | nil | Mac Catalyst；合并验收时在模拟器和真机上读到的也是这个值 |

只在 Mac Catalyst 上量过的那六个，最初在验收里只打印不断言。合并验收时在模拟器（iPhone Air，iOS 27.2）和真机（iPhone 14）上读到的都和假设一样，已经改成断言。「九个属性在 iOS 上对搜索框直接读写不崩」这条当时最担心的假设也成立。头文件的注释不能当依据：`UITextInputTraits.h` 写的默认值是 `returnKeyType` default、`enablesReturnKeyAutomatically` NO、`autocorrectionType` default，搜索框上量到的三个都不是。

### `keyboardAppearance` 的 dark 和 alert

头文件里 `UIKeyboardAppearanceAlert = UIKeyboardAppearanceDark`，一个数值两个名字。两个都写得进去，读出来给主名 `dark`。这是核心那张表保证的（有序的一张表，主名在前，见[多行输入](text-view.md#keyboardappearance-的别名)），搜索框、`searchTextField`、两种输入框读到的是同一个名字。

### 写错

七个枚举属性的写入都是「先查名字，查不到就填报错返回」，这时还没碰过搜索框，所以值不变；属性位的报错由入口统一改成警告（见[枚举](enums.md#属性位不抛2026-11-17)）。`textContentType` 可空，`null` 是清掉；另外六个不可空，`null` 查不到名字，按写错处理。两个布尔在 JS 那一侧照 Web IDL 转。

## 事件

八个事件一个对一个委托方法，名字全小写：`focus`、`blur`、`input`、`search`、`cancel`、`bookmarkclick`、`resultslistclick`、`scopechange`。前三个和同一批的多行输入用的是同一套名字。

- **委托由这个域自己装。** `UISearchBar.delegate` 是它自己的槽位，不和别人共用。trampoline 是一个只记「订了哪几个事件名」的对象，通过关联对象挂在搜索框上（`delegate` 是 weak），它对搜索框没有引用。
- **惰性。** 第一个事件名有监听器时才装委托，最后一个移走时卸掉。
- **不带数据。** 判据是「回头读不到才带」：文字和选中的下标在事件派发时从搜索框上读得到。`searchBar:textDidChange:` 带的那个字符串和当时的 `bar.text` 是同一个值。
- **所有事件名都交给原生去认**，不认识的抛，和滚动视图、控件一致。`traitchange` 在分到各个域之前就按名字认走了，所以照常订得上；核心会把它补到报错的名单末尾。
- **委托里要返回 BOOL 的三个没接**（能不能开始输入、能不能结束输入、让不让改文字）。它们要同步回调。trampoline 不实现这几个方法，所以系统按「都允许」处理，和没有委托时一样。
- **工具条不认领订阅。** 它只有继承来的 `traitchange`。`UIToolbarDelegate` 只有一个 `positionForBar:`，要同步返回值，没接。

## 对象数组的读和写

`items` 走的是 `readObjectArray` / `writeObjectArray`。登记机制下这两条通道接了线，但此前没有域用过写的那一条（读的那一条手势域和弹窗域用过）。

- 读：只往 `refs` 里追加。`items` 是 nil 时遍历 nil，什么都不加，JS 得到空数组。
- 写：每个元素一个句柄。句柄是空的（JS 给的 `null`、数、字符串）或者不是 `UIBarButtonItem`，填报错并返回 `true`，不当成 nil 吞掉。
- JS 这边写完按原生的真相重读一遍、整层重建持有边（`ownAll`），和导航条的 `leftBarButtonItems` 同一个写法。

`setItems:animated:` 是带一个标量的对象数组。它没有返回值，走的是普通的方法通道：参数排成 `[animated, 项, 项, …]`，原生从下标 1 起用 `args.object(i)` 挨个取。这样 `check-api.sh` 的所有权检查认得出它收对象参数。

「一组东西」的参数在 JS 这边先过一道 `listArg`：`null` 和 `undefined` 是空数组；数和字符串抛（照 Web IDL 的 sequence，字符串不是一组东西，`'All'` 不会被拆成三个字母）；其余可遍历的对象都收。类型定义里写的是数组，比运行时收的窄。

## 没做的

| | 为什么 |
| --- | --- |
| 外观对象（`standardAppearance` 等四个，`UIToolbarAppearance`） | 要先接 `UIBarAppearance` 一组类 |
| 所有换图的方法（两个条的背景图、阴影图、搜索框的图标、范围按钮的图） | 长尾的外观定制，而且按位置、按状态存的图各要一套带键的持有边。这一步只做功能上用得到的 |
| `searchFieldBackgroundPositionAdjustment`、`searchTextPositionAdjustment`、`setPositionAdjustment:forSearchBarIcon:` | 要 `UIOffset`，JS 那边还没有这个结构体，而结构体的机制在核心的 part 里，从登记的域加不了 |
| 范围按钮的文字属性 | 要 `NSAttributedString` 的那套键 |
| `barPosition`、`positionForBar:` | 属性单独给出来只是一个常数（工具条 bottom，搜索框 top）；要改它得靠委托同步返回值 |
| `UITextInputTraits` 里九个之外的（`smartQuotesType` 一组、`inlinePredictionType`、`passwordRules`、`writingToolsBehavior` 等） | 单行和多行输入框上也没有，三处一起做 |
| `UISearchTextField` 自己的成员（`tokens`、`searchSuggestions`） | `searchTextField` 按 `UITextField` 包装，这一组是另一步 |
| `inputAssistantItem`、`lookToDictateEnabled` | 前者是 iPad 的，后者是 visionOS 的 |
| `UISearchController` | 另一个类，而且和导航条绑在一起 |

## 验证

模拟器只有一台，App 里的验收由合并的那个对话统一跑。交出去之前自己能做的做了这些。

**检查**：`check-api.sh` 一致（类 88 个，标量读写 289 / 209，对象读写 94 / 46）；类型检查通过；运行时的模拟器切片 Debug 和 Release 都编过，`NacreBars.mm` 没有告警。

**不装 App 跑验收步骤**：一个链接了 `Nacre.framework` 的命令行程序，把这一步验收单独打包出来跑（做法是第一批的数值控件那一组留下的）。它没有 `UIApplication`，所以另外把 `-[UIControl sendAction:to:forEvent:]` 换成了直接调 target——那正是 `UIApplication` 本来要做的事，只在这个探针里换。这样「对输入框发控件事件 → 搜索框调委托 → trampoline → 事件出口 → JS 监听器」这条路能走一遍。

| | 通过 | 失败 |
| --- | --- | --- |
| Debug | 197 | 0 |
| Release | 197 | 0 |

两边的断言逐条相同（这是按探针里的 44 写期望时的数；期望改成 App 里的 48 之后，同一个探针里工具条高度那三条会不过，那是预期的）。197 条里包括持有边那一组（它不自己逼 GC，这两遍里对照组都被回收了）；没走到的只有「真的聚焦」那一段，探针里没有窗口，它按约定报了未验证。

探针有两处要注意，都和这一组的代码无关：run loop 里没有源时 `CFRunLoopRunInMode` 会提前返回，所以要循环着跑满时间；跑完直接 `_exit`，不析构运行时——带着没到期的定时器析构 `NacreRuntime` 会崩在引擎的析构里（`TimerEntry` 里的函数句柄在 isolate 之后才释放）。App 里运行时从不被析构，所以平时碰不到，头几遍探针的结尾崩的就是这个。

**合并后的验收**（合并的那个对话跑的，iPhone Air 模拟器，iOS 27.2，Debug）：这一组除了工具条高度那三条都过了，包括 `items` 的读写（对象数组的两条通道走通了）、搜索框的属性、用代码触发的四个事件、聚焦和交还。高度那三条按 App 里的实测改了期望，见[上面](#工具条的高度探针里-44app-里-48)；改完之后的那一遍在 App 里还没跑。

**键盘设置那一步（2026-11-18）**：没跑模拟器，也没用链接了 `Nacre.framework` 的探针跑验收步骤。做了的是：`check-api.sh` 一致（类 125 个，标量读写 353 / 251，对象读写 106 / 50），类型检查通过，运行时和验收 App 的模拟器切片 Debug 和 Release 都编过。系统那一侧的事实是在本机的 Mac Catalyst 小程序里量的，不是 iOS。合并后要验的：

- 九个属性在 iOS 上对搜索框直接读写不崩（靠的是系统的消息转发，Mac Catalyst 上十八个方法 `respondsToSelector:` 都是 YES，iOS 上没查）。
- 六个只打印的默认值。
- 搜索框和 `searchTextField` 两边是同一份（验收里九个都断言了）。
- 枚举写错时值不变、正好一条警告（验收里十二条，加枚举属性那张表里的七条）。
- 键盘在屏幕上的样子：各个 `keyboardType`、`isSecureTextEntry` 在搜索框里是不是显示成圆点、`returnKeyType` 换掉之后点回车是不是还派发 `search`。

**没验证的**：

- 四个事件要真实触摸：`scopechange`、`cancel`、`bookmarkclick`、`resultslistclick`。验收的区块里留了监听器，点了会打日志。
- 另外四个事件是靠对输入框发控件事件触发的，没有经过真实的键盘。
- Release 配置下在 App 里的验收，和改完高度期望之后的那一遍。
- 屏幕上的样子：两个条长什么样、`barStyle` / `isTranslucent` / `barTintColor` / `searchBarStyle` 在 iOS 26 的界面风格下还改不改变画面、带动画的增减是不是真的有过渡。
- 点键盘上的「搜索」、点取消之后，系统自己收不收键盘。
- 真机。
