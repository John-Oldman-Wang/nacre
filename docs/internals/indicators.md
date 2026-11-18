# 转圈和进度条

← [实现原理](README.md)

`UIActivityIndicatorView` 和 `UIProgressView`。两个表示「正在进行」的视图，都是 `UIView` 的子类，不是控件，没有事件。一个域（`indicators`），照[接入一组类](adding-classes.md)做的：`NacreIndicators.mm`、`50-indicators.js`、`indicators.d.ts`、验收的 `indicators.js`，共享文件一个没碰。

使用说明在 [`UIActivityIndicatorView`](../api/ui-activity-indicator-view.md) 和 [`UIProgressView`](../api/ui-progress-view.md)。

## 量到的事实

动手前写了三个不带界面的原生小程序，在 iPhone Air 模拟器（iOS 27.2）上用 `simctl spawn` 跑的。验收用例里的期望值都来自这里，不是照头文件的注释写的。

### 转圈

| 量什么 | 结果 |
| --- | --- |
| `init` 之后 | `frame` 0 × 0，样式 medium，`hidesWhenStopped` 是 YES，没在转，**`hidden` 是 YES** |
| `intrinsicContentSize` / `sizeThatFits:` | medium 20 × 20，large 37 × 37 |
| `initWithActivityIndicatorStyle:` | `frame` 直接是 20 × 20 / 37 × 37 |
| `init` 之后写样式 | 只改 `intrinsicContentSize`，`frame` 不动；`sizeToFit` 之后才是 37 × 37 |
| 默认颜色 | `UIColor.secondaryLabelColor`，**指针就是那个单例** |
| `color = nil` | 读回来是 `secondaryLabelColor`（`null_resettable`） |
| 写颜色再换样式 | 颜色不变 |
| 写进去的颜色读回来 | 同一个指针 |
| `startAnimating`（不在窗口里） | `isAnimating` YES，`hidden` NO |
| `stopAnimating` | `isAnimating` NO，`hidden` YES |
| 没在转时 `hidesWhenStopped = NO` | `hidden` **当场**变 NO；写回 YES 当场变 YES |
| 在转时手工 `hidden = YES` | `hidden` YES，`isAnimating` 仍然 YES |
| 写废弃的样式值（2，gray） | 写得进去，**连颜色一起改**成 45% 的黑 |

「新建的转圈是隐藏的」是这里最容易让人摔一跤的一条：`new` 出来、加到页面上、屏幕上什么都没有，而原因不是大小也不是位置。API 文档把它放在了最前面。

默认颜色是单例这一条让读回来的字符串有了确定的答案：颜色反查是按指针认常量的（见[颜色](ui-color.md)），所以 `spinner.color` 读出来是 `'secondaryLabel'`，不是一个 `native(n)` 的代号。

### 进度条

| 量什么 | 结果 |
| --- | --- |
| `init` 之后 | `frame` 宽 0、高 4；样式 default；`progress` 0；两个着色、两张图片都是 nil |
| `intrinsicContentSize` | (-1, 4)。-1 是 `UIViewNoIntrinsicMetric` |
| `initWithProgressViewStyle:` | 宽 160；default 高 4，bar 高 2.667（3 倍屏） |
| bar 样式的 `intrinsicContentSize` | 高 1.667，而 `frame` 的高是 2.667。两个数不一样，原因没查 |
| 写 `frame` / `bounds`，高给 30 | 宽写进去了，**高被改回 4** |
| 高度约束 12 | 布局之后 `frame` 高 12 |
| `progress = 0.3` | 读回来 0.30000001192092896（float） |
| `progress = 1.5` / `-0.5` | 1 / 0（头文件写明 pinned） |
| `progress = NAN` / `INFINITY` | 1。JS 那一侧 `toNumber` 已经拦了，到不了原生 |
| `setProgress:animated:YES` | 属性当场就是目标值，在不在窗口里都一样 |
| 先写着色再写图片 | 着色读回来 nil |
| 先写图片再写着色 | 图片读回来 nil |
| 写图片之后 `tint = nil` | 图片还在 |
| 写样式 7 | 控制台一行 `A UIProgressViewStyle of 7 is not supported`，值不变 |

着色和图片互相清掉这一条头文件里没有写。

## 定下来的几条

### 构造只有 `new X()`，带样式的初始化器没接

`initWithActivityIndicatorStyle:` 和 `initWithProgressViewStyle:` 都没接。量出来它们和「`init` 之后写样式」的差别只在初始的 `frame`（转圈 20 × 20 对 0 × 0，进度条宽 160 对 0），而 JS 那边 `sizeToFit()` 或者约束拿得到同样的结果，所以没有丢能力。

没有顺手做成 `new UIActivityIndicatorView({ activityIndicatorStyle: 'large' })`，是因为「初始化器怎么映射成构造函数的参数」在 [project.md](../project.md#7-还要做的) 里还是没确认的设计点，现有的类各有各的写法（`UIStackView` 收一个数组，`UIBarButtonItem` 收一个 options）。照规矩，规矩里没有答案的不自己定。

### 颜色走对象通道

三个颜色属性在 JS 那一侧是字符串，但过桥的是 `UIColor` 对象：字符串在 JS 里解析并池化（`colorArg` / `colorString`，见[颜色](ui-color.md)），原生这边只是普通的对象属性读写。和 `UIView.backgroundColor`、`UILabel.textColor` 同一条路。

`color` 是 `null_resettable`：类型上取值器返回 `string`（不含 `null`），设值器收 `ColorValue | null`。和 `UIImageView.tintColor` 一样的写法。

### 写对象属性的通道返回 `bool`，核心的宏用不了

核心里写对象属性用 `NACRE_OBJECT_OR_NIL(value, UIColor, name)` 取值，类型不对时它 `return;`——那是给核心里返回 `void` 的 `Write<域>ObjectProperty` 写的。登记进来的域这条通道返回 `bool`（要说认不认领），宏在这里编译不过。

所以文件里自己写了一个四行的 `TypedOrNil`，报错文案仍然走核心的 `ObjectTypeError`，和别处一致（`progressImage needs a UIImage or null`）。以后登记进来的域多了，这个助手该进内部头；这一次不许往里加声明，就留在了自己文件里。

### `progress` 先转成 `double` 再交出去

原生的 `progress` 是 `float`。读的时候写的是 `@((double)bar.progress)`：JS 读到的就是那个 32 位数的精确值，等于 `Math.fround(写进去的值)`。验收里就是按这个断言的。

不在桥上把它「修」回 0.3：那要猜用户原来写的是什么。

### 超出 0 到 1 不抛

project.md 第 13 条把「类型对、但超出范围」留给各 API 自己拒。这里不拒：头文件写明 `values outside are pinned`，量出来也是。平台自己定义了范围外的行为，照它的。对比触感反馈的 `intensity`：那边头文件没写范围外是什么效果，所以拦了。

### 二选一的那一侧，所有权镜像跟着清

`progressImage` 走 `nativeSetOwned`，JS 这边记着一条所有权边。写着色时系统把同一侧的图片清掉了，这条边就过期了。读的时候 `nativeGetOwned` 会按原生的真相重写一遍，所以不清也不会读错；但不读的话，那张图的包装会被多留一阵。设值器里顺手 `own(this, 'progressImage', null)` 把它清掉，四个设值器各一行。

### 废弃的样式值不接

`UIActivityIndicatorViewStyleWhiteLarge` / `White` / `Gray` 从 iOS 13 起废弃，而最低版本是 iOS 26。量出来它们还有一个副作用：写进去会连颜色一起改。读样式时万一读到表外的值，给 `'medium'`——从 JS 写不进去，所以这条分支走不到。

## 没做的

| | 为什么 |
| --- | --- |
| `UIProgressView.observedProgress` | 要先有 `NSProgress`，那是另一组类。顺手量了一下：给一个完成了 4/10 的 `NSProgress`，当场读 `progress` 不是 0.4（更新不是同步的），细节没查 |
| 两个带样式的初始化器 | 见上 |
| 废弃的三个转圈样式 | 见上 |

## 没验证的

- **验收不是这个对话跑的。** 模拟器只有一台，由合并的对话统一跑。它报回来的结果（iPhone Air 模拟器，五组合并后的完整验收，Debug 和 Release 相同）：这个域只有 5 条布局断言不过，其余都过。那 5 条是用例取布局的写法错了，不是实现的问题——用例里写的是 `vc.view.layoutIfNeeded()`，而这一步运行时窗口的根页面已经被导航那一步换成了 `UINavigationController`，`ctx.vc.view` 不在窗口里，对它排不到新建的区块。改成对区块自己排（`host.layoutIfNeeded()`）之后，合并的对话在临时副本里跑过，5 条全过。改完之后的这一版，这个对话没有再跑。
- **`writeObject` 这条通道第一次有域在用。** [接入一组类](adding-classes.md#没验证的)里记着它「接了线但没有域在用」。这个域的五个可写对象属性都走它。颜色和图片读写的断言在上面那次验收里都过了。
- 画面：转圈转不转、颜色对不对、进度条的动画、图片怎么铺，都要看屏幕。
- JS 长时间占着主线程时转圈还转不转，没量。
- 真机没跑。

## 要合并的人知道的

- **`check-api.sh` 的枚举核对表是写死的**（第 4 节那张 `(宏名, 类型名)` 的表）。这个域的两个枚举 `ActivityIndicatorStyle` ↔ `UIActivityIndicatorViewStyle`、`ProgressViewStyle` ↔ `UIProgressViewStyle` 不在表里，原生和 d.ts 的取值现在没人盯。脚本不许碰，所以没加。属性和类那几节是按签名收的，这个域已经在里面了（标量读写 236 / 160，对象读写 74 / 31）。
- 验收步骤里每一组断言包了一层 `group()`：某一组中途抛了只报这一组，不连累后面的步骤。只合测试时看到的是每组一条「这一组中断了」。
