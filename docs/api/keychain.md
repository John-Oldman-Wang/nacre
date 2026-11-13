---
type: reference
status: partial
---

# Keychain

**`application.keychain`** 表示 App 在钥匙串里的条目。钥匙串（Keychain）是 iOS 提供的加密存储，专门用来保存密码、登录令牌、密钥这类不能泄露的小数据。数据由系统加密后保存，每个 App 只能读写自己的条目。

每个条目有一个键和一个值。键是非空字符串。值是字符串或一段字节，不能直接是数字、数组或对象。

`application.keychain` 在整个 App 里只有一个，任何时候都能用，包括脚本顶层。它的类是 `Keychain`，这个类不能用 `new` 创建。

所有方法都返回 Promise。读写在后台进行，期间界面照常响应，定时器照常执行。

## 三种存储怎么选

| 要保存的数据 | 用哪个 | 原因 |
| --- | --- | --- |
| 用户设置、开关、上次看到哪 | [`application.storage`](storage.md) | 同步读写，值可以直接是数字、布尔、数组、对象 |
| 登录令牌、密码、密钥 | `application.keychain`（本页） | 由系统加密保存，可以规定设备锁定时能否读取、换新手机后是否还在 |
| 下载的文件、图片缓存、大量的业务数据 | [`application.fileSystem`](filesystem.md) | 按文件保存，可以选择放进哪个目录 |

钥匙串只放需要保密的小数据。设置和业务数据放在另外两处：它们能同步读取或按文件管理，钥匙串不能。钥匙串单个值的大小上限**未在模拟器验证**。

## 读一个没有的键

「没有这个键」不算错误：

| 方法 | 没有这个键时 |
| --- | --- |
| `get(key)`、`getBytes(key)` | 得到 `null`，Promise 不被拒绝 |
| `has(key)` | 得到 `false` |
| `remove(key)` | 照常完成，不报错 |

写一个已经存在的键是覆盖，不报错。

## 访问级别：什么时候能读、换手机后还在不在

写入时可以用 `accessible` 选项给条目指定访问级别。访问级别决定两件事：设备处在什么状态时能读到这个条目，以及用户换新手机并从备份恢复之后这个条目还在不在。

| `accessible` 的取值 | 什么时候能读 | 换新手机后 |
| --- | --- | --- |
| `'whenUnlockedThisDeviceOnly'`（默认） | 设备处于解锁状态时 | 不在 |
| `'whenUnlocked'` | 设备处于解锁状态时 | 在 |
| `'afterFirstUnlockThisDeviceOnly'` | 设备开机后用户解锁过一次，之后一直能读，包括锁屏时 | 不在 |
| `'afterFirstUnlock'` | 同上 | 在 |
| `'whenPasscodeSetThisDeviceOnly'` | 设备处于解锁状态时。要求设备设置了锁屏密码，没设置时写入失败 | 不在 |

五个取值在模拟器上都能写入并读回。「什么时候能读」和「换新手机后」两列的内容来自 iOS 的定义，**未在模拟器验证**：验证它们需要锁定真机和更换设备。

关于访问级别还有三点：

- **不写 `accessible` 时是 `'whenUnlockedThisDeviceOnly'`。** 用户换新手机后读不到这个条目，App 要让用户重新登录。
- **访问级别在条目第一次写入时确定，之后不能修改。** 对一个已经存在的键再次 `set` 并带上不同的 `accessible`，值会更新，访问级别保持原样，也不报错（读代码得出，**未在模拟器验证**）。要改访问级别，先 `remove` 再 `set`。
- **设备锁定时读一个要求解锁的条目**，Promise 被拒绝，`name` 是 `'NotAllowedError'`（来自代码里的对应关系，**未在模拟器验证**）。

`accessible` 写了表里没有的值时，Promise 被拒绝，`name` 是 `'TypeMismatchError'`，`message` 里列出全部可用的取值，这个键不会被写入。

## 数据保留到什么时候

| 情况 | 数据还在吗 |
| --- | --- |
| App 进程结束后重新启动 | 在。验收里第一次运行存一个计数，第二次启动读到了它 |
| 设备重启、系统升级 | **未在模拟器验证** |
| 用户卸载 App 再重装 | **未在模拟器验证**。不要依赖它还在，也不要假设它已经被删除 |
| 换新手机并从备份恢复 | 取决于访问级别，见上表 |

## 多个操作的先后

对钥匙串的操作按调用的先后依次执行。连续调用两次 `set` 写同一个键而不等待，最后留下的是后一次的值（读代码得出，**未在模拟器验证**）。

钥匙串里的条目变化时没有事件。只有 App 自己的代码能改这些条目，写入的 Promise 完成就表示已经改好。

## 推荐的做法

**登录令牌用默认的访问级别。** 默认值 `'whenUnlockedThisDeviceOnly'` 只在设备解锁时可读，不会随备份到别的设备上。代价是用户换手机后要重新登录。

**App 在后台也要读的令牌用 `'afterFirstUnlockThisDeviceOnly'`。** 比如收到推送后在后台刷新数据，这时设备可能处于锁定状态。默认级别在锁屏时读不到。

**希望换手机后免登录时用 `'whenUnlocked'` 或 `'afterFirstUnlock'`。** 代价是令牌会进入设备的备份，并出现在恢复了这份备份的设备上。

**访问级别在第一次写入前想好。** 之后改它要先删除再重写。

**结构化的数据先转成 JSON 文本再存。** 值只能是字符串或字节。

**退出登录时删除令牌。** 用 `remove(key)` 删一个，或者用 `clear()` 删掉 App 的全部条目。

## 完整例子

下面的代码保存一个登录令牌，读回来，再删除。钥匙串不涉及界面，这段代码直接写在 `main.js` 顶层就能运行。

```js
const kc = application.keychain;

async function main() {
  // 1. 读令牌。没有时得到 null
  const saved = await kc.get('token');
  console.log('已有的令牌:', saved);

  // 2. 保存令牌。不写 accessible 时用默认的访问级别
  await kc.set('token', 'abc-123');

  // 3. 读回来
  console.log('读到:', await kc.get('token'));

  // 4. 退出登录时删除
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

## 常见用法

以下例子都写在一个 `async` 函数里，并沿用上面的 `kc`。

### 保存登录令牌，启动时取出

```js
await kc.set('token', 'abc-123');

const token = await kc.get('token');
if (token === null) {
  console.log('没有登录');
} else {
  console.log('已登录，令牌:', token);
}
```

**结果**：输出 `已登录，令牌: abc-123`。App 重新启动后只执行后半段，仍然读得到。

### 指定访问级别

```js
await kc.set('refreshToken', 'r-456', { accessible: 'afterFirstUnlockThisDeviceOnly' });
```

**结果**：条目被保存。设备开机后用户解锁过一次，之后锁屏时也能读到它（**未在模拟器验证**）。

### 修改一个条目的访问级别

```js
const current = await kc.get('refreshToken');
if (current !== null) {
  await kc.remove('refreshToken');
  await kc.set('refreshToken', current, { accessible: 'afterFirstUnlock' });
}
```

**结果**：条目被删除后按新的访问级别重新写入，值不变。

### 保存一组数据

```js
const account = { userId: 42, token: 'abc-123', expires: 1800000000000 };
await kc.set('account', JSON.stringify(account));

const text = await kc.get('account');
if (text !== null) {
  /** @type {{ userId: number, token: string, expires: number }} */
  const restored = JSON.parse(text);
  console.log(restored.userId, restored.token);
}
```

**结果**：输出 `42 abc-123`。

### 保存二进制密钥

`setBytes` 的第二个参数是 [`Blob`](fetch.md)。`getBytes` 得到 `ArrayBuffer`，没有这个键时得到 `null`。

```js
const secret = crypto.getRandomValues(new Uint8Array(32));
await kc.setBytes('secret', new Blob([secret]));

const buffer = await kc.getBytes('secret');
if (buffer !== null) {
  console.log(new Uint8Array(buffer).length);
}
```

**结果**：输出 `32`。读回来的字节和写入的相同。

用 `setBytes` 存的条目要用 `getBytes` 读。用 `get` 读它时，字节不是合法的 UTF-8 文本就得到 `null`，和「没有这个键」分不开（读代码得出，**未在模拟器验证**）。

### 退出登录时清空

```js
console.log((await kc.keys()).join(','));
await kc.clear();
console.log((await kc.keys()).length);
```

**结果**：先输出 App 存过的全部键，用逗号分隔。清空之后输出 `0`。

`keys()` 和 `clear()` 只涉及这个 App 自己的条目。

### 处理写入失败

```js
try {
  await kc.set('pin', '1234', { accessible: 'whenPasscodeSetThisDeviceOnly' });
} catch (err) {
  const e = /** @type {KeychainError} */ (err);
  console.log('写入失败:', e.name, e.code);
}
```

**结果**：设备设置了锁屏密码时写入成功，不输出。没设置时 Promise 被拒绝，输出错误的类别和错误码（**未在模拟器验证**：验收用的模拟器上这个级别写入成功）。

## 出错时得到什么

操作失败时 Promise 被拒绝，拒绝的值是一个 `Error` 对象，多带两个属性：

| 属性 | 类型 | 含义 |
| --- | --- | --- |
| `name` | `string` | 错误的类别，取值见下表。用它判断出了什么错 |
| `message` | `string` | 说明文字 |
| `code` | `number` | 系统的错误码原值（`OSStatus`）。`accessible` 取值不认识时是 `0` |
| `domain` | `string` | `'NSOSStatusErrorDomain'`。`accessible` 取值不认识时是空字符串 |

`name` 的取值：

| `name` | 什么时候 |
| --- | --- |
| `'NotAllowedError'` | 设备锁定时读写要求解锁的条目；认证失败 |
| `'SecurityError'` | App 缺少访问钥匙串所需的权限声明 |
| `'TypeMismatchError'` | 参数不对，包括 `accessible` 写了不认识的值 |
| `'InvalidModificationError'` | 条目冲突 |
| `'KeychainError'` | 以上都不是。这时用 `code` 区分 |

这张表里只有「`accessible` 写了不认识的值得到 `'TypeMismatchError'`」在模拟器验证过，其余各行来自代码里的对应关系，**未在模拟器验证**。

## 成员说明

### 方法

| 方法 | Promise 完成时的值 | 说明 |
| --- | --- | --- |
| `get(key)` | `string \| null` | 读字符串值。没有这个键时是 `null` |
| `getBytes(key)` | `ArrayBuffer \| null` | 读字节值。没有这个键时是 `null` |
| `set(key, value, options?)` | 无 | 写入字符串。键已存在时覆盖值 |
| `setBytes(key, blob, options?)` | 无 | 写入 `Blob` 里的字节。键已存在时覆盖值 |
| `remove(key)` | 无 | 删除。没有这个键时照常完成 |
| `has(key)` | `boolean` | 有这个键时为 `true` |
| `keys()` | `string[]` | App 存过的全部键。一个都没有时是空数组。顺序**未在模拟器验证** |
| `clear()` | 无 | 删除 App 的全部条目 |

`set` 和 `setBytes` 的 `options`：

| 成员 | 类型 | 默认值 | 含义 |
| --- | --- | --- | --- |
| `accessible` | 五个字符串之一 | `'whenUnlockedThisDeviceOnly'` | 访问级别，各取值的效果见[访问级别](#访问级别什么时候能读换手机后还在不在)。只在条目第一次写入时生效 |

参数类型不对时，方法当场抛 `TypeError`，不返回 Promise：

| 情况 | 报错信息 |
| --- | --- |
| 键不是字符串，或是空字符串 | `<方法名>: key must be a non-empty string`，如 `get: key must be a non-empty string` |
| `set` 的值不是字符串 | `set: value must be a string; use setBytes for binary` |
| `setBytes` 的第二个参数不是 `Blob` | `setBytes: the second argument must be a Blob` |
| `accessible` 不是字符串 | `set: accessible must be a string` |

`accessible` 是字符串但不是五个取值之一时，方法返回的 Promise 被拒绝，`name` 是 `'TypeMismatchError'`，`message` 是 `accessible has no value "always"; expected one of: ` 加上可用的取值。

用 `new Keychain()` 创建时抛 `TypeError`，信息是 `Illegal constructor: Keychain is created by the runtime, not by new`。

### 事件

没有事件，原因见[多个操作的先后](#多个操作的先后)。

## 与 iOS 原生写法的对照

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

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 读取前要求用户通过面容或指纹验证 | `SecAccessControlCreateWithFlags`、LocalAuthentication |
| 按网站保存账号密码 | `kSecClassInternetPassword` |
| 保存证书和密钥对 | `kSecClassCertificate`、`kSecClassKey` |
| 和同一开发者的其他 App 共用条目 | `kSecAttrAccessGroup` |
| 通过 iCloud 钥匙串在用户的多台设备之间同步 | `kSecAttrSynchronizable` |
| 读出一个条目的访问级别 | `kSecAttrAccessible` 的读取 |

## 参见

- [`application`](application.md)：`keychain` 是它的属性
- [本地存储](storage.md)：设置和少量状态放那里
- [文件读写](filesystem.md)：文件和大量数据放那里
- [`fetch`](fetch.md)：`Blob` 的说明在那一页
- [`crypto`](crypto.md)：生成随机密钥
- [实现原理](../internals/keychain.md)：默认访问级别的选择理由
