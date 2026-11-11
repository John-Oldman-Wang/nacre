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
