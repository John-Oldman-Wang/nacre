---
type: reference
native: NSUserDefaults
status: partial
---

# `application.storage`

**`application.storage`** 表示 App 的键值存储。每个键是一个字符串，对应一个值；值保存在设备上，App 退出后再启动还能读到。它用来保存用户设置和少量状态，比如主题、上次打开的页面、启动次数。

`application.storage` 在整个 App 里只有一个，任何时候都能用，包括脚本顶层。它的类是 `NSUserDefaults`。

读和写都是同步的：[`get()`](storage/get.md) 直接返回值，[`set()`](storage/set.md) 返回时新值已经生效，紧接着读就能读到。

令牌和密码不放在这里，放在 [`application.keychain`](keychain.md)；文件和大量数据放在 [`application.fileSystem`](filesystem.md)。怎么选、怎么用，见指南[保存用户设置](../guides/save-settings.md)。

**继承关系**：`EventTarget` → `NSObject` → `NSUserDefaults`

## 构造函数

不能用 `new` 创建：`new NSUserDefaults()` 抛 `TypeError`，信息是 `Illegal constructor: NSUserDefaults is created by the runtime, not by new`。唯一的实例从 [`application`](application.md) 的 `storage` 属性拿到。

## 函数

所有函数的第一个参数 `key` 必须是字符串。传别的类型时抛 `TypeError`，信息是 `<函数名>: key must be a string`，如 `get: key must be a string`。

读写和删除：

| 函数 | 说明 |
| --- | --- |
| [`get()`](storage/get.md) | 读一个键，原样返回存进去的值；没有时返回 `null` |
| [`set()`](storage/set.md) | 写一个键；值是 `null` 时删除 |
| [`remove()`](storage/remove.md) | 删除一个键 |
| [`has()`](storage/has.md) | 这个键读不读得到值 |
| [`registerDefaults()`](storage/registerdefaults.md) | 登记没写过的键读到什么 |

带类型的读取。这七个函数在读取时把值转换成指定的类型，转换不了时返回一个固定的值，不抛异常：

| 函数 | 说明 |
| --- | --- |
| [`stringForKey()`](storage/stringforkey.md) | 读成字符串 |
| [`integerForKey()`](storage/integerforkey.md) | 读成整数，没有时是 `0` |
| [`doubleForKey()`](storage/doubleforkey.md) | 读成数字，没有时是 `0` |
| [`boolForKey()`](storage/boolforkey.md) | 读成布尔，没有时是 `false` |
| [`arrayForKey()`](storage/arrayforkey.md) | 读成数组 |
| [`dictionaryForKey()`](storage/dictionaryforkey.md) | 读成对象 |
| [`stringArrayForKey()`](storage/stringarrayforkey.md) | 读成字符串数组 |

监听事件用继承来的 `addEventListener()` 和 `removeEventListener()`。

## 事件

| 事件 | 什么时候派发 |
| --- | --- |
| [`change`](storage/change-event.md) | 存储里任何一个键被写入或删除之后。App 自己的写入和系统的写入都会触发 |

`application.storage` 会派发的只有 `change` 这一个事件。监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

## 能存哪些值

| 能存 | 不能存 |
| --- | --- |
| 字符串 | `undefined`、函数、Symbol |
| 有限的数字 | `NaN`、`Infinity` |
| 布尔值 | `Date`、`Blob`、原生对象（如颜色、视图） |
| 数组，元素也是能存的值 | 数组或对象里面的 `null` |
| 普通对象，属性值也是能存的值 | 自己引用自己的结构 |

存一个不能存的值时，[`set()`](storage/set.md) 当场抛 `TypeError`，这个键原来的值不变。

读出来的值类型和存进去时一样：存数字读到数字，存布尔读到布尔，存对象读到对象。读到的数组和对象是一份副本，修改它不会改变存储里的值，要再调一次 `set()` 才会保存。对象的属性超过两个时，读回来的属性顺序是否和写入时一致，**未在模拟器验证**。

运行时不限制单个值的大小和键的数量。系统对这种存储的容量上限**未在模拟器验证**。这里的值不加密（来自 iOS 的定义，**未在模拟器验证**）。

## 数据什么时候保存、保留到什么时候

`set()` 返回时新值立刻可读。写入磁盘由系统随后自动完成，App 不需要也不能主动触发。

| 情况 | 数据还在吗 |
| --- | --- |
| App 退到后台再回来 | 在 |
| App 进程结束后重新启动 | 在。验收里用启动计数器验证过：第二次启动读到 2 |
| `set()` 之后 App 立刻被强制结束 | **未在模拟器验证** |
| 系统升级 | **未在模拟器验证** |
| 用户卸载 App | 不在。数据随 App 一起删除（来自 iOS 的定义，**未在模拟器验证**） |
| 换新手机并从备份恢复 | **未在模拟器验证** |

## 示例

存储不涉及界面，这段代码直接写在 `main.js` 顶层就能运行。

```js
const storage = application.storage;

// 登记默认值。只在键没被写过时生效，每次启动都要登记
storage.registerDefaults({ theme: 'auto' });
console.log('主题:', storage.get('theme'));

// 统计启动次数。没有这个键时 integerForKey 得到 0
const launches = storage.integerForKey('launchCount') + 1;
storage.set('launchCount', launches);
console.log('第', launches, '次启动');
```

**结果**

- 第一次启动，控制台依次输出 `主题: auto`、`第 1 次启动`。
- 第二次启动，输出 `主题: auto`、`第 2 次启动`。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[NSUserDefaults standardUserDefaults]` | `application.storage` |
| `[d objectForKey:@"k"]` | `storage.get('k')` |
| `[d setObject:v forKey:@"k"]` | `storage.set('k', v)` |
| `[d removeObjectForKey:@"k"]` | `storage.remove('k')` 或 `storage.set('k', null)` |
| `[d registerDefaults:@{…}]` | `storage.registerDefaults({…})` |
| `[d stringForKey:@"k"]` | `storage.stringForKey('k')` |
| `[d integerForKey:@"k"]` | `storage.integerForKey('k')` |
| `[d doubleForKey:@"k"]` | `storage.doubleForKey('k')` |
| `[d boolForKey:@"k"]` | `storage.boolForKey('k')` |
| `[d arrayForKey:@"k"]` | `storage.arrayForKey('k')` |
| `[d dictionaryForKey:@"k"]` | `storage.dictionaryForKey('k')` |
| `[d stringArrayForKey:@"k"]` | `storage.stringArrayForKey('k')` |
| `[d setInteger:n forKey:@"k"]` 等带类型的写入 | `storage.set('k', n)` |
| `NSUserDefaultsDidChangeNotification` | `storage.addEventListener('change', …)` |
| `[d synchronize]` | 没有。系统自动写入磁盘 |

## 还不能做的

| 想做的事 | 对应的原生能力 | 现在怎么办 |
| --- | --- | --- |
| 直接存 `Date` | `NSDate` | 存毫秒时间戳 |
| 存二进制数据 | `NSData` | 用[文件读写](filesystem.md) |
| 只监听某一个键的变化 | 键值观察（KVO） | 监听 `change`，在回调里比较新旧值 |
| 和同一开发者的其他 App、小组件共用一份存储 | `initWithSuiteName:`、App Group | 没有替代办法 |
| 在用户的多台设备之间同步 | `NSUbiquitousKeyValueStore` | 没有替代办法 |

## 参见

- [保存用户设置](../guides/save-settings.md)：三种存储怎么选、登记默认值、存对象和时间、监听变化
- [`application`](application.md)：`storage` 是它的属性
- [Keychain](keychain.md)：令牌和密码放那里
- [文件读写](filesystem.md)：文件和大量数据放那里
- [实现原理](../internals/storage.md)：这一页各条结论的实测记录
