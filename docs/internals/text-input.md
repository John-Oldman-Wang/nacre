# 输入框怎么搭的

## 最大的收获：这一步不卡 M1b

动手前以为会撞上「同步回调回 JS」那堵墙，核实之后发现不用：

**1. `UITextField : UIControl`**，所以 4a 做的 16 个控件事件直接可用。`focus` / `input` / `blur` / `return` 覆盖了 `UITextFieldDelegate` 里所有 `void` 的方法。**「文字变了」零新机制。**

**2. 键盘避让是纯 Auto Layout。** `UIView.keyboardLayoutGuide`（iOS 15+）是个 `UILayoutGuide`，而 3c 已经把 guide 和锚点做完了。头文件原话：

> The automatic behavior is to follow the keyboard while it is docked. **When offscreen or undocked, the topAnchor is tied to the bottomAnchor of the view's `safeAreaLayoutGuide`.**

所以一条约束管两种状态，不需要键盘通知，也不需要新的事件通道。

**3. 卡住的只有「要同步返回 BOOL」那几个 delegate**，而最常见的两个需求能绕：

| 卡住的 | 绕法 |
| --- | --- |
| `shouldChangeCharactersInRanges:`（输入过滤） | 听 `input` 事后截断，会有一帧闪 |
| `textFieldShouldReturn:`（回车收键盘） | 听 `return`，自己 `resignFirstResponder()` |

## 撤掉了 `usesBottomSafeArea`

头文件写着「Defaults to `YES`」，**实测默认是 `false`，而且写 `true` 读回来还是 `false`**。同一条通道上的另外两个开关都正常：

```
followsUndockedKeyboard  写 true → 读回 true   ✅
keyboardDismissPadding   写 20   → 读回 20     ✅
usesBottomSafeArea       写 true → 读回 false  ❌
```

所以不是桥的问题，是这个属性特殊。**写进去不生效又不报错是这个项目一路在消灭的那类错**，所以不暴露——缺口至少会报「no writable property」，静默失败什么都不说。

> 没查清原因。一个没验证的猜测：测的时候约束还没激活，而它可能要等 guide 真正参与布局之后才生效。要试的话把写入挪到 `activateConstraints` 之后。

### 连带的一条纪律：可写属性的验收不能只验默认值

这个问题是**加了写入断言才暴露的**。只看默认值的话，它和「头文件写错了」没有区别：

```js
guide.followsUndockedKeyboard = true;
assert('followsUndockedKeyboard 写得进去', guide.followsUndockedKeyboard, true);
```

## 三个踩到的坑

### 1. 枚举用宏铺开，`check-api.sh` 就看不见了

八个枚举属性形状一样，第一版用宏：

```objc
NACRE_FIELD_ENUM("keyboardType", KeyboardType, UIKeyboardType, keyboardType)
```

脚本当场报「原生层没有这八个属性」——它按 `isEqualToString:` 后面那个字符串字面量抽名字，宏把它藏成了 `@KEY`。

**展开写了 72 行。判据：能被检查看见比少写几行重要。**

> 小插曲：改完之后我在注释里写了 `isEqualToString:@"名字"` 举例，正则把「名字」当成真属性抽走了——Python 的 `\w` 匹配中文。

### 2. 标量属性的三边核对是按名字的并集，不分类

`textAlignment` 我只在 `UILabel` 分支接了原生，`UITextField` 漏了（**它不是 `UILabel` 的子类**）。`check-api.sh` **没报**——因为这个名字在 `UILabel` 上存在，名字集合里有，缺哪个类看不出来。

于是运行时抛 `UITextField has no writable property textAlignment`，异常从 `sceneconnect` 的监听器里出来，**后面所有步骤都没跑**，包括建窗口的那一步 → **黑屏**。

> **那套检查保证「名字不漂」，不保证「每个类都接了」。** 这是它的已知边界。
>
> 同一家的还有一条：对象属性走的是另一条通道（`ReadViewObjectProperty`），**标量接了不等于对象也接了**。`font` / `textColor` 就是这么漏的。

### 3. 一个脚本改多个文件，中途抛异常会留下半套改动

first responder 的方法分发写了两次——第一次那个脚本在第二个文件的断言上抛了，我重跑时只补了第二个文件。症状是：状态属性读得到（`isFirstResponder` 给 `false`），方法调不动（`becomeFirstResponder()` 返回 `null` 而不是布尔）。

**返回 `null` 就是「原生侧根本没接到」的签名**——分发表走到底，`EncodeJSON(nil)` 给 `"null"`。

## `textContentType` 在 iOS 26 上崩过

（2026-11-11，第二份试用报告查出来的。）

`NacreEnumsInput.mm` 的表里有三个 `API_AVAILABLE(ios(27.0))` 的常量（`cellularIMEI1` / `cellularIMEI2` / `cellularNAL`），低版本上弱链接成 nil，往字典字面量里插 nil 当场抛——而且发生在 `dispatch_once` 里，JS 既捕获不到也看不到输出。

**我们自己的验收永远碰不到它**：全跑在 iOS 27 的模拟器上。「支持 iOS 26+」这句话从来没被验证过。这是**验证方法的缺口**，不只是代码的。

> 后续（2026-11-12）：这个缺口补了两处。**编译期**：最低版本设的是 26.0，用了更新的接口而没加 `@available` 时编译器会给警告，但一次全量编译有两万多条别的警告（V8 头文件的可空性标注），它一直淹在里面。现在 `run-sim.sh` 把它单独捞出来。捞出来的第一批就是上面这三个常量——它们当时只做了「是 nil 就跳过」，两层保护一层都没写，已补上。**运行期**：装了 iOS 26.0 的模拟器系统，验收在 26 上跑过一段时间（2026-11-13 起暂停，原因见那条说明）。第一次跑就查出一个 26 特有的问题，见下面「iOS 26 上键盘第一次弹出时」那条（已修）。还没有的是 Xcode 26 本身，「用 26 的 SDK 能不能编过」仍然没验证过。

## 验收里两条「未验证」

都是前提不由我们控制，所以**不写成硬断言**：

| | 怎么处理 |
| --- | --- |
| 键盘弹出后内容被顶上去 | 模拟器连着硬件键盘时软键盘不弹。**先量 guide 的高度确认键盘真的出现了**，没出现就报未验证。实测 guide 高 34——正好是 home indicator 的安全区，反过来证明它确实贴在安全区底边 |
| 动画期间 scroll 发了不止一次 | 运行时把同一轮里的 scroll 合并成一个，而那段动画只有 30pt。主线程一忙就整段落在两次 JS 轮次之间，合并成一次。放宽到「至少发了一次」，次数打出来看趋势 |

## 选区：`selectedRange` 和 `selectionchange`

（2026-11-17。和[多行输入的 `selectionchange`](text-view.md#selectionchange委托槽位里的一方) 一起做的。写的时候只许编译，用例是按判断写的；合并后的验收在 iPhone Air 模拟器（iOS 27.2，Debug）上跑了一遍，推翻了其中一条，设计跟着改了，见[不在编辑时](#不在编辑时最初定错了)。哪些验到了、哪些没有，见最后的清单。）

### 文件

| | 在哪 |
| --- | --- |
| 原生：读、写、事件 | `ios/Runtime/Bridge/NacreTextFieldDelegate.mm`。它原来只管五个 `before…` 事件，是一个登记进来的域，现在多了 `read`、`write` 两条通道 |
| JS：取值器 | `12-control.js` 里 `UITextField` 的类体 |
| 取 `{ location, length }` | `NacreTextView.mm` 的 `TextInputRangeFromJSON`，和 `UITextView.selectedRange` 共用 |

取值器写在类体里、没有从新的 part 里挂：`check-api.sh` 对挂上去的属性要求类型那一侧是声明合并的 `interface`，而它认不出 `get` / `set` 类型不同的成员。

`NSRange` 定义在 `50-text-view.js`，排在 `12-control.js` 后面。取值器到被调用时才用它，那时它已经在全局上了。

### 换算

UIKit 给 `UITextField` 的选区是 `selectedTextRange`：一个 `UITextRange`，两头是 `UITextPosition`。这两个类都是不透明的，只能交回给输入框去问。JS 那一侧不暴露它们，过桥的是和 `UITextView` 一样的 `{ location, length }`：

| 方向 | 怎么换 |
| --- | --- |
| 读 | `offsetFromPosition:beginningOfDocument toPosition:range.start` 是起点，`offsetFromPosition:range.start toPosition:range.end` 是长度 |
| 写 | `positionFromPosition:beginningOfDocument offset:location` 得到起点，再从起点走 `length` 得到终点，`textRangeFromPosition:toPosition:` 拼成范围 |

`UITextField` 的偏移数的是 UTF-16 码元，和 `NSString` 的下标、JS 字符串的下标是同一个单位，所以不用再换一次。验收里验到了：内容是 `'a😀b'` 时写 `(1, 2)`，`text.slice(1, 3)` 取出来正好是那个表情。

### 不在编辑时：最初定错了

最初的设计是「只有正在编辑时才有选区」：不在编辑时读到 `null`，写会抛 `TypeError`。依据是一条没有量过的说法：输入框不是 first responder 时 `selectedTextRange` 是 nil。读给 `null` 是照「事实」给（不编一个位置出来），写抛是因为「写不进去又不报错」。

合并后的验收量出来那条说法不成立（iPhone Air 模拟器，iOS 27.2）：

| | 实测 |
| --- | --- |
| 新建的输入框，写了 10 个字符的 `text`，从没编辑过 | 读到 `(0, 0)`，不是 nil |
| 这时写 `(0, 3)` | 没有抛（实现只在原生是 nil 时才抛，所以原生不是 nil），读回来是 `(0, 3)` |
| 编辑过、内容清空、结束编辑之后 | 读到 `(0, 0)` |

也就是说不在编辑时选区照样存在，写了也照样生效。两条理由都站不住了，所以改成和 `UITextView.selectedRange` 同一个形状：

- **读永远是 `NSRange`**，类型里没有 `null`。
- **写不看是不是正在编辑**，照 UIKit 生效，不抛。

原生万一给 nil，读给 `(0, 0)`，写什么都不做、也不报错。**这是兜底，没有观察到过**：上面三种情况里原生都不是 nil。

和 `UITextView` 还有一处量到的不同，不是我们定的：用代码写 `text` 之后，`UITextView` 的光标在末尾，`UITextField`（不在编辑时）的选区还在 `(0, 0)`。

没有量的：不在编辑时写下的选区，到开始编辑之后还在不在；内容不空时结束编辑，选区停在哪里。API 文档里写的是不要依赖，要控制用户看到的光标就在开始编辑之后写。

这一条留下的和「探针里先设了缩放范围再读的数」是同一类：**没有量过的系统行为，不能拿来当设计的依据。** 这次是写的时候不许跑模拟器，只能先按判断定；该做的是把它明确列成要验证的假设，合并后的那一遍验收正是冲着这张清单跑的。

### 越界：照 `UITextView` 上量到的

`UITextView.selectedRange` 越界时 UIKit 自己处理，量到的是位置超了停在末尾、长度超了变成 0（[多行输入](text-view.md#nsrange)）。输入框这边位置是自己算的，`positionFromPosition:offset:` 越界返回 nil，所以要自己定规则。定的是和 `UITextView` 量到的一样：

```objc
if (range.location > total) {
  range = NSMakeRange(total, 0);
} else if (range.length > total - range.location) {
  range.length = 0;
}
```

「长度超了变成 0」不是一个讨人喜欢的规则（浏览器的 `setSelectionRange` 是截到末尾），照它只为了两个类写同一个越界的范围读回来一样。要改就两边一起改。

收过之后的位置按理一定换得成 `UITextPosition`。换不出来时（没有观察到过）什么都不做，不报错。

位置落在一个表情的两个码元中间，这里不拦也不纠正，交给 UIKit。验收里验到 `UITextField` 和 `UITextView` 一样不纠正：内容是 `'a😀b'` 时写 `(2, 0)`，读回来还是 `(2, 0)`。

### `selectionchange` 接在原有的委托上

`UITextFieldDelegate` 有 `textFieldDidChangeSelection:`（iOS 13 起）。五个 `before…` 事件已经有一个惰性安装的委托对象，这个方法加在它上面，事件名加进它认的名单，订阅的那段代码一行没改：六个名字里任何一个有监听器时委托在，一个都没有时摘掉。

它和那五个不一样的地方是系统不等答案，所以走 `NacreEmitEvent` 延后一轮，不可取消。委托对象只装着 `selectionchange` 一个名字时，那五个 `should…` 方法照旧直接答 `YES`，不过桥。

事件上不带选区、连着变几次不合并，理由和[多行输入那边](text-view.md#selectionchange委托槽位里的一方)一样。

### 验收排在哪

单行输入框的验收步骤在最早那一批里，同步跑完之后入口等 10 秒才开始跑排着队的步骤，那些步骤也要用焦点。选区的用例分两段：

- **不在编辑时的**用一个新建的、不在窗口里的输入框，同步跑，加在步骤的最后。
- **正在编辑时的**接在原有那一串异步断言的后面，再拿一次焦点。有两道闸：原有的断言跑完时离排队的步骤开始不到 4 秒就不做；做的话整轮限 3.5 秒，到点没做完报未验证并把焦点交回去。

合并后的那一遍里第二段跑到了，没有被闸拦下。只有这一遍的数据，机器忙的时候它会不会常被拦成未验证，还不知道。

### 验到的和没验到的

合并后的验收（iPhone Air 模拟器，iOS 27.2，Debug）验到的：

- 不在编辑时读到 `(0, 0)`，写 `(0, 3)` 读得回来（这两条是推翻原设计的那一遍量到的，改过的用例照它写，改完之后**还没有再跑**）。
- `becomeFirstResponder()` 返回 `true` 之后马上能读写选区。
- 正在编辑时写进去的范围原样读得回来；越界按上面的规则收；偏移的单位是 UTF-16 码元。
- 位置在表情中间时 UIKit 不纠正。
- 正在编辑时代码写 `selectedRange`，系统会调 `textFieldDidChangeSelection:`，`selectionchange` 到了。
- 委托装着的时候控件事件（`focus`）照常；`selectionchange` 退掉、`beforeblur` 还订着时委托没有被摘走。

没验到的：

- Release 配置下的验收、真机。
- 不在编辑时写选区派不派发 `selectionchange`；聚焦、失焦、写 `text` 时派不派发。没有断言，文档里写的是不要依赖。
- 不在编辑时写下的选区到开始编辑之后还在不在；内容不空时结束编辑之后选区在哪。
- 原生的选区是 nil 的情况（兜底的那两个分支没有执行过）。
- 用户真实地移动光标、拖动选区、打字时的派发，只有真实触摸能验。
- 输入法组字期间（拼音还没选字）选区读到什么。

## 键盘上方的工具条：`inputAccessoryView`

（2026-11-18。客户指出：搜索框有这个属性，两种输入框没有。）

`UITextField` 和 `UITextView` 各加一个 `inputAccessoryView`，可读可写，值是 `UIView` 或 `null`。形状照搜索框已有的那一个（[条](bars.md)）：对象通道，JS 那一侧 `nativeGetOwned` / `nativeSetOwned`，类型不对由原生填 `inputAccessoryView needs a UIView or null`。

| | 在哪 |
| --- | --- |
| 原生：单行 | `NacreTextFieldDelegate.mm` 的 `ReadTextFieldObjectProperty` / `WriteTextFieldObjectProperty` |
| 原生：多行 | `NacreTextView.mm` 的对象属性那两个函数 |
| 两边共用 | `TextInputAccessoryClassName`、`TextInputSetAccessoryView`，定义在 `NacreTextView.mm`，单行那边各声明一行（内部头不许动，和 `TextInputRangeFromJSON` 一样） |
| JS | `12-control.js` 里 `UITextField` 的类体、`50-text-view.js` 里 `UITextView` 的类体 |
| 验收 | 不要焦点的在 `textfield.js`、`text-view.js`；要焦点的在 `input-editing.js` |

### 定下来的四条边界

**写 `null` 是去掉，`undefined` 也是。** 对象通道本来就这么处理空值。

**写的不是视图抛 `TypeError`，原值不动。** 对象参数不转换（[参数转换](conversion.md)）。普通值在 JS 那一侧就拦下了，别的原生对象由原生拦。

**同一个视图可以给几个输入框。** 这是 UIKit 上常见的用法（一个表单共用一条工具条），原生每个输入框各自强持有它。JS 那一侧每个输入框各记一条单值的所有权边，互不影响：去掉其中一个的，另一个的还在。它不是父子关系，所以不像 `addSubview` 那样要从原来的持有者那里摘掉。

**正在编辑时换，当场生效。** UIKit 只在输入框成为 first responder 的那一刻读这个属性；之后再写，要调 `reloadInputViews` 才换。头文件的原话：

```objc
// If called while object is first responder, reloads inputView, inputAccessoryView, and textInputMode.  Otherwise ignored.
- (void)reloadInputViews;
```

JS 那一侧没有 `reloadInputViews`。两条路：把它也暴露出来，让写 App 的人自己调；或者写属性时在原生补这一下。选的是后一条：属性写进去了却要再调一个方法才生效，JS 开发者不会想到；而「写了新的工具条」之后想要的只有一种结果。`TextInputSetAccessoryView` 里写完属性之后，对象是 first responder 就调一次，不是就不调；写的和原来是同一个视图时什么都不做。

这算不算原生层在调度：它没有决定 App 做什么，只是让一次属性写入生效，和 UIKit 自己多数属性的写入是一回事。`reloadInputViews` 本身以后要暴露（换 `inputView` 也要它）时，这一下可以留着，重复调没有害处。

搜索框的同名属性没有补这一下（那个文件不在这一批能动的范围里），正在编辑时换搜索框的工具条会不会当场生效，没量。

### 读出来用哪个类包

平时用不到：JS 写进去的那个包装被输入框的所有权边留着，读回来就是它。只有包装不在了才按类名新建，这时认 `UIToolbar`，别的都按 `UIView`。搜索框里的那个输入框（`searchTextField`）也是 `UITextField`，从它读到的就是搜索框的那一个视图（原生探针量过是同一个指针，见[条](bars.md)）。

### 一条都没在模拟器上跑过

这一组的用例是先按判断写的，写的时候不许跑模拟器。押了 UIKit 的这几件事，验收里对应的断言名字都以「键盘上方：」开头：

- 输入框成为 first responder 之后，`inputAccessoryView` 会被系统放进一个窗口里（读它的 `window` 不是 `null`）；连着硬件键盘、软键盘不弹时也是。结束输入之后它离开窗口。
- 正在编辑时写新的视图，`reloadInputViews` 之后新的进窗口、旧的离开；写 `null` 之后离开。输入框不丢焦点。
- 两个输入框共用一个视图，焦点从一个换到另一个，它留在窗口里。
- 给的视图已经是别的视图的子视图：写得进去，不拒绝。键盘弹出时系统把它挪走之后，JS 那一侧原来父视图的 `subviews` 镜像里还留着它（多持有一个包装，不会悬空）。这一条没有断言，也没有量。

另外没验的：工具条在屏幕上的样子、宽度是不是被拉到和键盘一样宽、点工具条上的按钮；Release 配置和真机。

## `insertText()`、`deleteBackward()`、`hasText`

（2026-11-18。客户指出：多行输入框有这三个，单行的没有。）

三个都是 `UIKeyInput` 的成员，`UITextField` 遵循 `UITextInput` 所以本来就有。形状照 `UITextView` 上已有的那三个，一处不改：`hasText` 只读；`insertText(text)` 的参数在 JS 那一侧按字符串转（`null` / `undefined` 是空串），原生只校验；`deleteBackward()` 没有参数。

原生的分支在 `NacreTextFieldDelegate.mm`（那个登记进来的域多开了 `call` 一条通道），JS 在 `12-control.js` 里 `UITextField` 的类体。核心里 `UITextField` 按类写死的那一份（`NacrePropsControl.mm`）不在这一批能动的文件里，所以新成员都落在这个域里；这个文件的名字已经不能概括它装的东西了（委托、选区、工具条、这三个），以后收拾时该改名或者和核心那一份合并。

运行时在这三个上面什么都没有加：不在编辑时调会怎样、派不派发 `input`、问不问委托，都是 UIKit 的行为。

### 一条都没在模拟器上跑过

`UITextView` 上这三个的行为是动手前用探针量的（[多行输入](text-view.md#量到的事实)）。单行输入框上没有量，用例照 `UITextView` 量到的写，押了这几件事：

- **不在编辑、不在窗口里的输入框上，两个方法照样改得动。** 依据是 `UITextView` 这样，以及单行输入框不在编辑时选区读得到、写得进去（那一条是实测）。老系统上输入框只有在编辑时才有负责编辑的那个内部对象，这一条要是不成立，「不在编辑时」那一组会整组失败，「正在编辑时」那一组不受影响。
- **改的是 `selectedRange` 那一处**，做完选区收成光标、停在改动后面。用例里每次都先写 `selectedRange` 再插：代码写 `text` 之后选区在哪，两个类不一样（单行的留在原处，实测）。
- **两个方法派发 `input`**（控件事件 `UIControlEventEditingChanged`），代码写 `text` 不派发。
- **两个方法不经过 `beforeinput`。** 那个委托方法是键盘在把用户的输入交给输入框之前问的，直接调输入框的方法不经过键盘那一层。

没有断言、只打印的：光标在开头时什么都没删的 `deleteBackward()` 派不派发 `input`（`UITextView` 上量到的是不派发）；光标在表情后面时一次删几个码元；`isEnabled` 为假时改不改得动。

---

← 返回[实现原理](README.md) ・ [事件模型](events.md) ・ [API 文档](../api/ui-text-field.md)

## 输入法组字的范围：markedTextRange（2026-11-20）

两种输入框都接了只读的 `markedTextRange`：UIKit 给的是 `UITextRange`，换算成从开头数的 UTF-16 偏移，和 `selectedRange` 一样是 `NSRange`；没在组字时是 `null`。

- 变化通知不另做：组字的每一步 UIKit 都会让输入框报一次内容变了，我们照常派发 `input`（延后一轮），监听器里读它。实测组字中的文字算在 `text` 里。
- 验收用示例模块的 `simulateMarkedText` 调 `setMarkedText:selectedRange:` / `unmarkText`，就是输入法做的那两步。第一版用例连着同步设了三次，等 `input` 延后一轮到的时候组字已经结束，读到的是 `null`——那是用例写错了，真打字时每个键是单独的一轮。改成每一步等它的 `input` 到了再走下一步。
- 真的输入法、真的键盘没验。
