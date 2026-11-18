# 数值控件

`UISwitch`、`UISlider`、`UIStepper`、`UISegmentedControl`、`UIPageControl`、`UIDatePicker`。六个都是 `UIControl` 的子类，共同点是「拿着一个值，用户改了就发 `change`」。

这是照[接入一组类](adding-classes.md)做的第一批域之一：一个 `.mm`（`NacreValueControls.mm`）、一个 part（`50-value-controls.js`）、一个 `.d.ts`、一个验收步骤，核心的文件一个没碰。API 的形状全是照已定的规矩套的，这一页记的是套的过程中量到的事实，和几处要拿主意的地方。

## 没有写事件的代码

`change`、`click` 这 16 个控件事件的订阅在核心的 `UIControl` 分支里，按「对象是不是 `UIControl`」认。六个类的 JS 类继承 `UIControl`，原生对象本来就是 `UIControl`，所以这个域里一行订阅的代码都没有，登记表里的 `subscribe` 是空的。

## 实测：UIKit 对越界的值有三种反应

接这一组之前，用一个不带界面的原生小程序（`simctl spawn` 起的命令行程序，iPhone Air 模拟器，iOS 27.2）把每个成员的默认值和边界行为量了一遍。头文件的注释在好几处和实际不符。

UIKit 对「类型对、但值不合适」的写入有三种反应：

| 反应 | 例子 | JS 那一侧会看到什么 |
| --- | --- | --- |
| 抛 ObjC 异常 | 步进器的 `stepValue = 0`；分段控件按段读写时下标越界；页码的 `setIndicatorImage:forPage:` 页码越界；倒计时模式配 `compact` 样式 | 不拦的话落到运行时入口的保底上（见[参数转换](conversion.md)），JS 拿到的是 UIKit 内部的话，比如 `-[__NSArrayM objectAtIndexedSubscript:]: index 99 beyond bounds`。这一条是按保底的做法推的，没有单独跑 |
| 什么都不做 | 分段控件的 `selectedSegmentIndex = 5`（只有 3 段）；`removeSegmentAtIndex:` 下标越界；日期选择器的 `minuteInterval = 7` | 写不进去又不报错 |
| 悄悄改成别的值 | 滑块和步进器的 `value` 超出范围；`currentPage` 超出范围；`countDownDuration = 90000` 变成 60；页码的 `numberOfPages = -3` 变成 0 | 读回来不是写进去的 |

处理的原则：

- **第一种，先拦。** 在调 UIKit 之前自己查范围，报错里写清是哪个方法、给的是多少、合法的范围是什么。
- **第二种，先拦。** 「写不进去又不报错」是这个项目一路在消灭的那类错。
- **第三种，看头文件有没有把它写成这个 API 的行为。** `value` 被钉在 `minimumValue` 和 `maximumValue` 之间、`currentPage` 被钉在 0 和最后一页之间、`insertSegmentWithTitle:atIndex:` 的下标超过段数就插在最后，头文件都写明了（`this value will be pinned to min/max`），那就是它的语义，原样留着。没写明的（负的页数、超出范围的倒计时时长）按「取值范围由各 API 自己拒」处理，拦掉。

逐条的数据：

### UISwitch

| | 实测 |
| --- | --- |
| 默认 | `isOn` 是 `NO`；`onTintColor`、`thumbTintColor` 是 `nil` |
| 大小 | 63 × 28 pt。写 `frame` 成 200 × 100，读回来还是 63 × 28 |
| `preferredStyle = checkbox` | `preferredStyle` 读回来是 checkbox，`style` 仍然是 sliding |

最后一条是不接 `style` / `preferredStyle` / `title` 的依据：头文件说复选框样式只在 Mac 上支持，量出来 iPhone 上确实不生效，暴露出去就是三个写了没用的成员。`onImage` / `offImage` 不接的依据是 Apple 的文档（iOS 7 起无效），这一条没法量：效果在屏幕上，小程序看不到。

### UISlider

| | 实测 |
| --- | --- |
| 默认 | `value` 0，`minimumValue` 0，`maximumValue` 1，`continuous` 是 `YES`，颜色和图全是 `nil`，`sliderStyle` 是 default |
| 大小 | `frame` 是 100 × 34，`intrinsicContentSize` 是 (-1, 34)：没有固有宽度 |
| `value = 0.3` | 读回来 0.30000001192092896 |
| `value = 5`（范围 0 到 1） | 1 |
| `minimumValue = 2`（上限是 1） | 不报错。上限变成 2，`value` 变成 2 |
| `setThumbImage:forState:` 之后 | `thumbImageForState:` 返回同一个对象；没设过的状态返回 normal 那张 |
| `currentThumbImage` | 不稳定：同样是设了 normal 的图，一次读到 `nil`，一次读到设进去的那张 |
| 300 × 34 的滑块 | 轨道 `(0, 14, 300, 6)`；圆钮在最小值时 `(0, 5, 37, 24)`，最大值时 `(263, 5, 37, 24)` |

三个值在 ObjC 里是 `float`。桥上转成 `double` 再编码，所以 0.3 读回来是 0.30000001192092896，和 `UIView.alpha` 一样把「原生是单精度」这个事实原样交出去，不替它取整。写入时 JS 的数超出 `float` 范围的，钉在 `±FLT_MAX`，不让它变成无穷大。

`currentThumbImage` 那一条没查清原因，API 文档里标了未验证，验收里只打印不断言。

`trackRectForBounds:` 那四个方法在 ObjC 里是给子类覆写用的。覆写要等 M2，但**调用**它们本身有用（问圆钮画在哪，好把一个气泡对上去），而且只是算术，所以先开了调用这一半。

### UIStepper

| | 实测 |
| --- | --- |
| 默认 | `value` 0，范围 0 到 100，`stepValue` 1，`continuous` 和 `autorepeat` 是 `YES`，`wraps` 是 `NO` |
| 大小 | 94 × 32 pt |
| `minimumValue = 200`（上限是 100） | 不报错。上限变成 200，`value` 变成 200 |
| `stepValue = 0`、`-1` | 抛 `NSInvalidArgumentException`：`stepValue must be greater than 0` |
| `wraps = YES` 之后 `value = 500` | 100。回绕只对用户点按钮生效 |
| `value = 0.3`（`stepValue` 是 0.5） | 0.3。不按步长取整 |
| 四组图（`setIncrementImage:forState:` 等） | 设进去之后对应的取值方法返回 `nil`，符号图和位图都一样 |

头文件写着「`minimumValue` must be less than `maximumValue`」，实际不检查，和滑块一样是把另一头拉过来。

四组图读不回来，所以这八个方法没接。它们在屏幕上有没有效果量不了；读都读不回来的东西先不暴露。

### UISegmentedControl

| | 实测 |
| --- | --- |
| 默认 | 0 段，`selectedSegmentIndex` 是 -1，`momentary` 和 `apportionsSegmentWidthsByContent` 是 `NO` |
| `initWithItems:` 混着给字符串和图 | 可以。图片段的标题是 `nil`，标题段的图是 `nil`。构造完没有选中的 |
| `initWithItems:@[@1]` | 抛：对 `NSNumber` 发了 `length` |
| 按段读写的十个方法，下标越界 | 抛 `NSRangeException`。头文件写的是「must be 0..#segments - 1 (or ignored)」 |
| `removeSegmentAtIndex:99` | 什么都不做 |
| `selectedSegmentIndex = 5`（3 段） | 什么都不做，还是原来的值 |
| `selectedSegmentIndex = -2`、`-5` | 原样存下来，读回来是 -2、-5 |
| 删掉选中的那一段 | `selectedSegmentIndex` 读出来是 **-2**，不是 -1 |
| 在选中的段前面插入 / 删除 | 下标跟着加一 / 减一 |
| `insertSegmentWithTitle:atIndex:99` | 插在最后 |
| 带 `animated:YES` 的插入和删除 | `numberOfSegments` 当场就变 |
| 给图片段 `setTitle:` | 图变成 `nil`；反过来也一样 |

`selectedSegmentIndex` 的「没有选中的」在头文件里是常量 `UISegmentedControlNoSegment`，值是 -1。平台的哨兵常量原来的规矩是用字符串（`spacing = 'system'`），那是因为 `FLT_MIN` 那种数没法让人手写。-1 不一样：它好写，而且「下标是 -1 表示没有」是 JS 开发者本来就熟的写法（`indexOf`、`select.selectedIndex`）。所以这里直接用 -1。

删掉选中的段之后读到 -2 是 UIKit 内部状态漏了出来。桥上读的时候把所有负数归成 -1，写的时候只收 -1 到段数减一。

构造函数的参数是一个数组（`new UISegmentedControl(['日', '周'])`），照的是 `new UIStackView([a, b])` 的先例。过桥时每一项是一个参数：字符串进标量那一路，图进对象那一路，原生按下标把两路合回一个数组。

每段的图记在一条多值的所有权边 `segmentImages` 上，只增不减，`removeAllSegments` 时清空。段被删掉或者换成标题之后那张图会多留一阵。按原生的真相重建这条边要每次多过一趟桥读全部的段，而多留一个图片包装没有任何后果，所以没做。

### UIPageControl

| | 实测 |
| --- | --- |
| 默认 | 0 页，`currentPage` 0，`backgroundStyle` automatic，`direction` natural，`interactionState` none，`allowsContinuousInteraction` 是 `YES`，颜色和图全是 `nil` |
| `currentPage = 9`（5 页）、`-1` | 4、0 |
| `numberOfPages = 2`（`currentPage` 是 4） | `currentPage` 变成 1 |
| `numberOfPages = -3` | 变成 0 |
| `indicatorImageForPage:`、`setIndicatorImage:forPage:` 页码越界 | 抛 `NSInternalInconsistencyException`：`Page (3) must be within 0 and 3` |
| 合法的页码 | 0 到 `numberOfPages - 1`。头文件写的是「0..numberOfPages」，等于页数的那个值实际会抛 |
| 页数改小再改大 | 被去掉的那些页上单独设的图没有了 |
| `sizeForNumberOfPages:` | 3 页 73 × 25.67，10 页 196.67 × 25.67；0 页的宽是 1.4757 × 10²⁰；负数抛 `NSInvalidArgumentException` |

`sizeForNumberOfPages:0` 那个大数是 UIKit 自己算出来的，原样交出去了，API 文档里写了不要用。没有替它改成 0：那是替系统编一个答案。

### UIDatePicker

| | 实测 |
| --- | --- |
| 默认 | 模式 dateAndTime，`preferredDatePickerStyle` automatic，`datePickerStyle` compact，`minuteInterval` 1，`roundsToMinuteInterval` 是 `YES`，两个界限是 `nil` |
| 默认的 `locale` / `calendar` / `timeZone` | 读出来是当前地区（不是 `nil`）/ 当前日历 / `nil` |
| `date` 的精度 | 写 1700000000.123 秒，读回来一样。新建的选择器默认日期带着微秒 |
| `date` 超出界限 | 钉在界限上。`minimumDate` 晚于 `maximumDate` 时两个界限都不起作用 |
| `date = nil` | 不抛，变成当前时刻 |
| `minuteInterval = 15` | `date` 当场被取整：22:14:02.5 变成 22:00:02 |
| `minuteInterval = 7`、`0`、`60`、`-5` | 什么都不做 |
| 倒计时 / 年月模式 + automatic 样式 | 实际样式是 wheels |
| 倒计时 / 年月模式 + compact 或 inline | 抛 `NSInternalInconsistencyException`，先写模式还是先写样式都一样 |
| `countDownDuration`，不在倒计时模式 | 写 300，读回来 0；之后切到倒计时模式是 60，那个 300 找不回来 |
| `countDownDuration`，在倒计时模式 | 刚切过来是 60（头文件写的默认值是 0）；125 → 120；0、30、59 → 60；86399 → 86340；86400、90000、负数 → 60 |

模式和样式那一条，两个属性各拦一半：写模式时看现在的样式，写样式时看现在的模式。

`countDownDuration` 不在倒计时模式时写入，头文件说的是「ignored otherwise」。这是写明了的行为，按上面的原则本来该留着；但它的后果是「先写时长再切模式」这个很自然的顺序会悄悄丢值，所以还是拦了，报错里说清要先切模式。这一条是这个域里唯一一处拦了头文件写明的行为的地方。

## 日期怎么过桥

JS 那一侧是 `Date`，桥上是「1970 年以来的毫秒数」，一个 JSON 数字，就是 `getTime()` 那个量；可空的属性用 JSON 的 `null`。原生拿到之后除以 1000 建 `NSDate`，交回去时乘 1000 四舍五入到整毫秒。

写入只收 `Date`，不从字符串或时间戳转。原则 13 的转换表里没有「日期」这一行；照的是 Web 上同类的属性 `input.valueAsDate`：它的类型是对象，不是 `Date` 就抛 `TypeError`。识别用 `Date.prototype.getTime.call(value)`，它自己带类型检查，比 `instanceof` 可靠。无效的 `Date`（时间值是 `NaN`）也抛：`NaN` 过了 JSON 是 `null`，原生已经分不清它和「没给」。

读出来每次是一个新的 `Date`。`Date` 是可变的，共用一个对象的话，`picker.date.setHours(0)` 会改到缓存而不是选择器。这一点和结构体不一样（结构体的字段写入即抛），因为 `Date` 是 JS 自己的类型，没法让它只读。

## `NACRE_OBJECT_OR_NIL` 在登记域里用不了

写对象属性的通道，核心里的函数返回 `void`，登记域的函数返回 `bool`（「认不认领」）。`NACRE_OBJECT_OR_NIL` 这个宏失败时写的是 `return;`，放进返回 `bool` 的函数里编译不过。这个域里自己写了一个等价的小函数 `ObjectOrNil`。下一个要写对象属性的域会遇到同样的事，到时候把宏改成用 `NacreFail()` 返回就两边都能用，那要动 `NacreBridge.h`。

图片**参数**（方法的，不是属性的）比核心里可空的对象参数多查了一步：对象那一路是空的，但标量那一路里有东西（JS 给的是字符串、数字、普通对象），算给错了，报错。核心里可空的对象参数没有这一步（`typedArg` 只看对象那一路），照代码读，`button.setImage('star', …)` 会被当成 `null`；这一条没有实际跑。

## 验证

| | 怎么验的 | 结果 |
| --- | --- | --- |
| 默认值、边界行为 | 不带界面的原生小程序，直接调 UIKit | 上面各表 |
| 验收用例的每一条期望 | 同一个小程序里照用例的顺序走了一遍 | 全部对上 |
| 实现 | 一个链接了运行时的命令行程序，跑这一步验收打包出来的 JS。Debug 和 Release 各一遍 | 两边都是 353 条通过、6 条失败，断言集合一样 |
| 三边核对、类型检查 | `check-api.sh`、`npm run check` | 通过 |

那 6 条失败是六个控件各一条「收到主动触发的 `change`」。命令行程序里没有 `UIApplication`，`sendActionsForControlEvents:` 发不出去（原生小程序里量过：给控件加了 target，主动触发之后一次都没调到），所以事件这一段在这种程序里验不了。

**没验证的：**

- **整套验收没有在 App 里跑过。** 上面那个命令行程序没有窗口、没有 `UIApplication`。在 App 里的结果要等合并之后统一跑。
- **事件。** 「六个类都收得到 `change`」「程序改值不派发」这两条都只是期望。后一条是按 UIKit 的惯例写的，头文件只在 `setOn:animated:` 和 `setValue:animated:` 上写了 `does not send action`。
- **屏幕上的样子。** 颜色、图、样式这些写进去读得回来，画出来是不是那样没看过。
- **真机。**

## 没做的

| | 为什么 |
| --- | --- |
| `UISwitch` 的 `style` / `preferredStyle` / `title` | 只在 Mac 上有效，实测 iPhone 上不生效 |
| `UISwitch` 的 `onImage` / `offImage` | Apple 的文档写明 iOS 7 起无效 |
| `UIStepper` 的四组图 | 实测设进去读不回来 |
| `UISlider.trackConfiguration` | 要再接两个类（`UISliderTrackConfiguration`、`UISliderTick`）。而且这个属性是 `copy`：赋值之后再改配置对象不生效，读回来的也不是写进去的那个对象，要先定这种对象在 JS 那一侧怎么表示 |
| `UIPageControl.progress` | 要再接两个类。它的 delegate 里有一个要同步返回值的方法（每一页的初始进度），那要 M1b |
| `UISegmentedControl` 的 `UIAction` 那一组 | `UIAction` 带着一个回调，还没有这个类。`change` 加 `selectedSegmentIndex` 能做到同样的事 |
| `UISegmentedControl` 的 `setTitleTextAttributes:forState:` | 参数是一个「文字属性 → 值」的字典（字体、颜色、阴影）。这种字典在 JS 那一侧怎么写还没有规矩，富文本那一步会一起定 |
| `UISegmentedControl` 的底图、分隔线、内容位置微调 | 三组都带 `barMetrics:`，要一个新枚举；位置微调还要 `UIOffset`，结构体的类在核心的 part 里，从登记域里加不了 |
| `UIDatePicker` 的 `locale` / `calendar` / `timeZone` | 值是 `NSLocale` / `NSCalendar` / `NSTimeZone` 对象，这三种在桥上怎么表示没有规矩。倾向用字符串，词表和 `Intl` 一致（BCP 47 的地区标签、`Intl` 的日历名、IANA 的时区名），但 `Intl` 里那几张表和换算在它自己的文件里，要先划出来共用 |
| 各类里已废弃的成员 | `segmentedControlStyle`、`defersCurrentPageDisplay`、`updateCurrentPageDisplay` |
