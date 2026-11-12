# 系统能力：设备、剪贴板、触感反馈

← [实现原理](README.md)

几个互不相干的小能力，共同点是都在底层（按 ObjC 原名裸暴露）、都不需要新机制。放在一页里记。

## `UIDevice`

### 只做了不会变的那几项

`UIDevice` 上的成员分两类：

| | 成员 | 这一步 |
| --- | --- | --- |
| 静态信息 | `name`、`model`、`localizedModel`、`systemName`、`systemVersion`、`userInterfaceIdiom`、`identifierForVendor` | 做了 |
| 带监控开关和通知的状态 | 电量（`isBatteryMonitoringEnabled` + 两个通知）、设备朝向（`begin/endGeneratingDeviceOrientationNotifications` + 通知）、距离感应（开关 + 通知） | 没做 |

第二类每一样都是「先打开监控、再读值、变了发通知」三件事，按原则 10 要做齐。它们和静态信息没有共用的代码，夹在一步里只会把这一步撑大。

### 为什么现在要它

第二份试用报告里 `textContentType` 在 iOS 26.x 上崩，根因修掉了，但暴露出一个事实：**JS 读不到系统版本，连「只在某个版本以上才开某个能力」这种降级都写不出来**。`systemVersion` 就是补这个的。

### `systemVersion` 是字符串，没有替 JS 拆开

原生是 `NSString`，我们原样给。没有另外提供「主版本号」这种数字属性：那是在上层发明 API，而拆一个字符串 JS 一行就够。文档里给了比较的写法，并且点明了直接比字符串会错（`'9.0' > '26.0'`）。

### `identifierForVendor` 给字符串

原生是 `NSUUID`。没有为它暴露一个 `NSUUID` 类——那个类对 JS 唯一的用处就是 `.UUIDString`。头文件标着 `nullable`（设备重启后第一次解锁之前读不到），所以类型是 `string | null`，那种情况给 `null` 不给空串。

### 实测

| | 结果（iPhone Air 模拟器） |
| --- | --- |
| `name` | **`iPhone Air`**，是模拟器的名字；`model` 是 `iPhone`。头文件那句「Synonym for model」在模拟器上不成立——验收用例照着头文件写的那条断言第一次跑就挂了。**真机（iPhone 14、iOS 27.0.1）上是 `iPhone`**，和 `model` 相同，头文件那句在真机上属实 |
| `systemVersion` | `27.2` |
| `localizedModel` | `iPhone`（系统语言是英文） |
| `UIDevice.currentDevice` 读两次 | 同一个包装 |

## `UIPasteboard`

### 读写是同步属性，没有做成 Promise

Web 的 `navigator.clipboard.readText()` 是 Promise，原因是浏览器要在中间插一道权限判断。iOS 上 `string` 就是个同步属性——系统要问用户的时候，是它自己把调用卡住。原则 4 说的是「异步 API 返回 Promise」，不是「把同步的东西包成异步」；原则 9 说 iOS 独有的机制按 iOS 的事实来。所以原样暴露成属性。

代价要写在明处：**读 `string` 可能卡住主线程等用户点提示**。文档里的建议是只在用户明确要粘贴时读，另外给了两个不取内容的查询（`hasStrings`、`changeCount`）。

### 写 `null` 原样交给 UIKit

ObjC 的 `string` 是 `nullable`，写 nil 是什么效果头文件没说。没有替它发明「清空」的语义，原样传下去再量：实测是**清空**（`string` 读到 nil、`hasStrings` 变 NO、`changeCount` 加了）。验收用例把它固化成了断言。

### `change` 事件

监听的是 `UIPasteboardChangedNotification`，按发送者过滤（`object:` 传这个剪贴板）。惰性订阅：有监听器时才往通知中心登记，观察者通过关联对象挂在剪贴板上。

事件**不带数据**：变了之后的内容在 `string` 上读得到，计数在 `changeCount` 上读得到，判据还是「回头读不读得到」。

### 验收用例只在模拟器上自动读写

自动的读写断言在真机上不跑，两个原因：会把用户剪贴板里的东西冲掉；读别的 App 复制的内容可能弹系统提示，卡住启动。分清模拟器和真机用的是 `application.info.DTPlatformName`（`iphonesimulator` / `iphoneos`）——这是 Xcode 打进 Info.plist 的事实，不用为此加任何能力。真机上靠屏幕右上面板里的「复制」「粘贴」两个按钮手动触发。

### 实测

| | 结果（iPhone Air 模拟器） |
| --- | --- |
| 写进去读出来 | 同一段文字 |
| 写 `null` | 清空 |
| 自己写，收不收得到 `change` | 收得到 |
| 连续写两次（一次字符串、一次 `null`） | 收到 **4** 次 `change`，不是 2 次。四次回调里读到的 `changeCount` 是同一个值——事件延后一轮才到，那时两次写入都已经完成 |

真机（iPhone 14）上用面板里的两个按钮点出来的：

| | 结果 |
| --- | --- |
| 写一次 `string` | 收到 **2** 次 `change`。和模拟器上「写两次收到 4 次」对得上：一次写入就是两条通知 |
| 切到别的 App 复制一段文字再回来 | `changeCount` 从 24 变成 25，**没有** `change` 事件。所以这条通知只管本进程造成的变化 |
| 读别的 App 复制的内容 | **这一次读取 6613 ms 才返回。** 日志里紧跟着场景的 `inactive` → `active`，也就是系统弹了提示、等用户点完才把值交回来 |

最后一条是这一步最要紧的实测：**同步读真的会卡住主线程，而且卡多久取决于用户什么时候点**。这段时间里定时器、事件、动画回调全都不走。「原样暴露成同步属性」的决定不变（把它包成 Promise 也改变不了主线程被系统占着这件事），但文档里的提示从「可能」改成了有数字的结论。

没验的：复制之后到别的 App 里粘贴（操作了，但日志里看不到那一侧）。

## 触感反馈

### 只给和视图绑定的工厂，不给 `new`

动手前以为是 `new UIImpactFeedbackGenerator('medium')`。查头文件才发现：

```objc
- (instancetype)init API_DEPRECATED_WITH_REPLACEMENT("+feedbackGeneratorForView:", ios(10.0, API_TO_BE_DEPRECATED));
- (instancetype)initWithStyle:(UIImpactFeedbackStyle)style API_DEPRECATED_WITH_REPLACEMENT("+feedbackGeneratorWithStyle:forView:", ios(10.0, API_TO_BE_DEPRECATED));
```

两个初始化方法都标成了将废弃，替代品是 iOS 17.5 加的、和视图绑定的类方法。我们的最低版本是 iOS 26，替代品恒可用，所以**只暴露替代品**。给一个 Apple 已经宣布要废弃的入口，等于让 JS 开发者写出将来要改的代码。

落到 JS 上就是「类方法 + options」那条已定的映射，没有发明东西：

```js
UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('medium', { forView: view })   // +feedbackGeneratorWithStyle:forView:
UISelectionFeedbackGenerator.feedbackGeneratorForView(view)                         // +feedbackGeneratorForView:
```

`new` 的报错信息里直接写出该用哪个工厂。那条隐规则（`finalCheck` 先于「不可构造」）照旧：继承它先报继承。

### 带位置的变体没做

`impactOccurredAtLocation:` 这一组（同样是 17.5 加的）是给 iPad 上的触控笔和触控板用的——让反馈落在输入设备上。只支持 iPhone 的现在用不上。

### `intensity` 拦在 0 到 1

头文件没写范围，Apple 的文档写的是 0 到 1。范围外的值系统怎么处理没有承诺，所以原生层拦掉并抛，不交给系统去猜。

### 验证

模拟器没有触感引擎，能自动验的只有：四个类都不能 `new`、工厂给出正确的类、五种力度都建得出来、十一次调用都不抛、三种写错都抛。验收用例在屏幕右上的面板里放了两排按钮（轻 / 中 / 重，选择 / 成功 / 失败）。

真机（iPhone 14）上六个按钮各点了一次，日志里六次调用都执行了、没有报错。**震感本身日志里看不到**——力度分不分得出来、成功和失败的节奏一不一样，只有拿着手机的人知道，所以 API 文档里描述震感的句子仍然标着未验证。

当时顺带看到一个问题：面板是按 iPhone Air 的宽度（420 pt）用固定 `frame` 摆的，iPhone 14 只有 390 pt 宽，最右边被切掉一截。后来验收界面整理成了区块（见[项目说明](../project.md#版面一步一个区块从上往下排)），面板改成横向铺满区块，不再写死宽度。
