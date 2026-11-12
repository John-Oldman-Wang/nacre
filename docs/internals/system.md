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
| `name` | **`iPhone Air`**，是模拟器的名字；`model` 是 `iPhone`。头文件那句「Synonym for model」在模拟器上不成立——验收用例照着头文件写的那条断言第一次跑就挂了。真机上是什么值还没看 |
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

没验的（要真机）：复制之后到别的 App 里粘贴；读别的 App 复制的内容时系统弹不弹提示；别的 App 改剪贴板时发不发 `change`。
