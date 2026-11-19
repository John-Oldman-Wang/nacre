---
type: reference
native: Keychain
status: partial
---

# `application.keychain`

**`application.keychain`** 表示 App 在钥匙串里的条目。钥匙串（Keychain）是 iOS 提供的加密存储，专门用来保存密码、登录令牌、密钥这类不能泄露的小数据。数据由系统加密后保存，每个 App 只能读写自己的条目。

每个条目有一个键和一个值。键是非空字符串。值是字符串或一段字节，不能直接是数字、数组或对象。

`application.keychain` 在整个 App 里只有一个，任何时候都能用，包括脚本顶层。它的类是 `Keychain`。所有函数都返回 Promise。读写在后台进行，期间界面照常响应，定时器照常执行。

设置和业务数据不放在这里：设置放在 [`application.storage`](storage.md)，文件和大量数据放在 [`application.fileSystem`](filesystem.md)。怎么保存和取出登录令牌，见指南[保存登录令牌](../guides/save-secrets.md)。

> **注意**：Keychain 不在核心里，要先装 `@nacrejs/keychain` 这个包才有。没装的时候 `application.keychain` 这个属性不存在（`'keychain' in application` 是 `false`），类型检查也会报它不存在。怎么装见下面「[先装上](#先装上)」。

**继承关系**：`EventTarget` → `NSObject` → `Keychain`

## 先装上

Keychain 是一个单独的能力包。在项目里装它：

```bash
npm install @nacrejs/keychain
```

**效果**：下次生成 `ios/` 时，工程里多嵌一个 `NacreKeychain.framework`；不装的项目，产物里没有它。

这个包不要求在 `nacre.config.json` 里写权限文案。

然后在入口文件顶上加一行，让类型进来：

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/keychain" />
```

**效果**：编辑器里 `application.keychain` 有了补全和检查。少了这一行，`tsc` 会报 `Property 'keychain' does not exist on type 'Application'`。

其他能力包的装法见[核心和能力包](capabilities.md)。

## 构造函数

不能用 `new` 创建：`new Keychain()` 抛 `TypeError`，信息是 `Illegal constructor: Keychain is created by the runtime, not by new`。唯一的实例从 [`application`](application.md) 的 `keychain` 属性拿到。

## 函数

所有函数返回 Promise。参数类型不对时当场抛 `TypeError`，不返回 Promise。键不是字符串或是空字符串时，信息是 `<函数名>: key must be a non-empty string`，如 `get: key must be a non-empty string`。

| 函数 | 说明 |
| --- | --- |
| [`get()`](keychain/get.md) | 读字符串值。没有这个键时得到 `null` |
| [`getBytes()`](keychain/getbytes.md) | 读字节值，得到 `ArrayBuffer`。没有这个键时得到 `null` |
| [`set()`](keychain/set.md) | 写入字符串。键已存在时覆盖值 |
| [`setBytes()`](keychain/setbytes.md) | 写入 `Blob` 里的字节。键已存在时覆盖值 |
| [`remove()`](keychain/remove.md) | 删除一个键。没有这个键时照常完成 |
| [`has()`](keychain/has.md) | 有没有这个键 |
| [`keys()`](keychain/keys.md) | App 存过的全部键 |
| [`clear()`](keychain/clear.md) | 删除 App 的全部条目 |

## 事件

没有事件。只有 App 自己的代码能改这些条目，写入的 Promise 完成就表示已经改好。

## 访问级别

写入时可以用 `accessible` 选项给条目指定访问级别。访问级别决定两件事：设备处在什么状态时能读到这个条目，以及用户换新手机并从备份恢复之后这个条目还在不在。

| `accessible` 的取值 | 什么时候能读 | 换新手机后 |
| --- | --- | --- |
| `'whenUnlockedThisDeviceOnly'`（默认） | 设备处于解锁状态时 | 不在 |
| `'whenUnlocked'` | 设备处于解锁状态时 | 在 |
| `'afterFirstUnlockThisDeviceOnly'` | 设备开机后用户解锁过一次，之后一直能读，包括锁屏时 | 不在 |
| `'afterFirstUnlock'` | 同上 | 在 |
| `'whenPasscodeSetThisDeviceOnly'` | 设备处于解锁状态时。要求设备设置了锁屏密码，没设置时写入失败 | 不在 |

五个取值在模拟器上都能写入并读回。「什么时候能读」和「换新手机后」两列的内容来自 iOS 的定义，**未在模拟器验证**：验证它们需要锁定真机和更换设备。

- **不写 `accessible` 时是 `'whenUnlockedThisDeviceOnly'`。** 用户换新手机后读不到这个条目，App 要让用户重新登录。
- **访问级别在条目第一次写入时确定，之后不能修改。** 对一个已经存在的键再次 `set` 并带上不同的 `accessible`，值会更新，访问级别保持原样，也不报错（读代码得出，**未在模拟器验证**）。要改访问级别，先 `remove` 再 `set`。
- **设备锁定时读一个要求解锁的条目**，Promise 被拒绝，`name` 是 `'NotAllowedError'`（来自代码里的对应关系，**未在模拟器验证**）。

## 数据保留到什么时候

| 情况 | 数据还在吗 |
| --- | --- |
| App 进程结束后重新启动 | 在。验收里第一次运行存一个计数，第二次启动读到了它 |
| 设备重启、系统升级 | **未在模拟器验证** |
| 用户卸载 App 再重装 | **未在模拟器验证**。不要依赖它还在，也不要假设它已经被删除 |
| 换新手机并从备份恢复 | 取决于[访问级别](#访问级别) |

钥匙串单个值的大小上限**未在模拟器验证**。

## 多个操作的先后

对钥匙串的操作按调用的先后依次执行。连续调用两次 `set` 写同一个键而不等待，最后留下的是后一次的值（读代码得出，**未在模拟器验证**）。

## 出错时得到什么

操作失败时 Promise 被拒绝，拒绝的值是一个 `Error` 对象（类型定义里叫 `KeychainError`），多带两个属性：

| 属性 | 类型 | 含义 |
| --- | --- | --- |
| `name` | `string` | 错误的类别，取值见下表。用它判断出了什么错 |
| `message` | `string` | 说明文字 |
| `code` | `number` | 系统的错误码原值（`OSStatus`）。`accessible` 取值不认识时是 `0` |
| `domain` | `string` | `'NSOSStatusErrorDomain'`。`accessible` 取值不认识时是空字符串 |

| `name` | 什么时候 |
| --- | --- |
| `'NotAllowedError'` | 设备锁定时读写要求解锁的条目；认证失败 |
| `'SecurityError'` | App 缺少访问钥匙串所需的权限声明 |
| `'TypeMismatchError'` | 参数不对，包括 `accessible` 写了不认识的值 |
| `'InvalidModificationError'` | 条目冲突 |
| `'KeychainError'` | 以上都不是。这时用 `code` 区分 |

这张表里只有「`accessible` 写了不认识的值得到 `'TypeMismatchError'`」在模拟器验证过，其余各行来自代码里的对应关系，**未在模拟器验证**。

## 示例

下面的代码保存一个登录令牌，读回来，再删除。钥匙串不涉及界面，这段代码直接写在 `main.js` 顶层就能运行。

```js
const kc = application.keychain;

async function main() {
  const saved = await kc.get('token');
  console.log('已有的令牌:', saved);

  await kc.set('token', 'abc-123');
  console.log('读到:', await kc.get('token'));

  await kc.remove('token');
  console.log('删除后:', await kc.has('token'));
}

main().catch((err) => {
  console.log('出错:', String(err));
});
```

**结果**

- 控制台输出 `已有的令牌: null`。
- 接着输出 `读到: abc-123`。
- 最后输出 `删除后: false`。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `SecItemCopyMatching` 加 `kSecReturnData` | `await kc.get(key)`、`await kc.getBytes(key)` |
| `SecItemUpdate`，条目不存在时 `SecItemAdd` | `await kc.set(key, value)`、`await kc.setBytes(key, blob)` |
| `SecItemDelete` | `await kc.remove(key)` |
| `SecItemCopyMatching` 加 `kSecMatchLimitAll` 和 `kSecReturnAttributes` | `await kc.keys()` |
| `kSecAttrAccessibleWhenUnlocked` | `{ accessible: 'whenUnlocked' }` |
| `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` | `{ accessible: 'whenUnlockedThisDeviceOnly' }` |
| `kSecAttrAccessibleAfterFirstUnlock` | `{ accessible: 'afterFirstUnlock' }` |
| `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly` | `{ accessible: 'afterFirstUnlockThisDeviceOnly' }` |
| `kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly` | `{ accessible: 'whenPasscodeSetThisDeviceOnly' }` |
| `kSecAttrAccessibleAlways`、`kSecAttrAccessibleAlwaysThisDeviceOnly` | 没有。iOS 12 起已废弃 |
| `kSecClassGenericPassword` 的 `kSecAttrService` | 固定为 App 的包名（bundle identifier） |
| `kSecAttrAccount` | `key` |
| `OSStatus` | Promise 被拒绝，`err.code` 是原值 |

## 参见

- [保存登录令牌](../guides/save-secrets.md)：选哪种存储、选哪个访问级别、退出登录
- [`application`](application.md)：`keychain` 是它的属性
- [`application.storage`](storage.md)：设置和少量状态放那里
- [`application.fileSystem`](filesystem.md)：文件和大量数据放那里
- [`crypto`](crypto.md)：生成随机密钥
- [核心和能力包](capabilities.md)
