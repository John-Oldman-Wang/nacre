# Keychain

令牌和密码放这里。它和[键值存储](storage.md)、[文件](filesystem.md)的区别是：**存进去的东西是加密的，而且安全语义是 API 的一部分**。

```js
const kc = application.keychain;
await kc.set('token', 'abc-123');
await kc.get('token');      // 'abc-123'，没有就是 null
```

**全是 Promise。** Keychain 读写走 `securityd` 的 XPC，是进程间通信不是内存读写，设备锁着时还会阻塞——而 JS 在主线程。

## 基本

| 成员 | 说明 |
| --- | --- |
| `get(key)` | 没有这个键给 `null`，**不 reject** |
| `set(key, value, options?)` | 值是字符串。覆盖写同一个键是正常操作 |
| `getBytes(key)` | → `ArrayBuffer \| null` |
| `setBytes(key, blob, options?)` | 收 [`Blob`](fetch.md#blob) |
| `remove(key)` | 本来就没有也算成功 |
| `has(key)` | |
| `keys()` | 这个 App 存过的全部键 |
| `clear()` | 删掉这个 App 的全部条目 |

值只能是字符串或字节，**不像 storage 能直接存数组和对象**——要存结构自己 `JSON.stringify`。

## `accessible`：这一步真正的决定

```js
await kc.set('token', 'abc', { accessible: 'afterFirstUnlockThisDeviceOnly' });
```

它决定**什么时候能读到**，以及**换新设备还在不在**。

| 值 | 什么时候能读 | 换新设备 |
| --- | --- | --- |
| `whenUnlocked` | 设备解锁时 | **会跟着备份迁移** |
| **`whenUnlockedThisDeviceOnly`**（默认） | 同上 | 不迁移 |
| `afterFirstUnlock` | 开机后第一次解锁之后一直能读，锁屏也能 | **会迁移** |
| `afterFirstUnlockThisDeviceOnly` | 同上 | 不迁移 |
| `whenPasscodeSetThisDeviceOnly` | 要求设备设了密码，没设就存不进去 | 不迁移 |

**两件要记住的：**

1. **这个属性存进去就改不了。** 要换得先 `remove` 再重新 `set`。
2. **默认是 `whenUnlockedThisDeviceOnly`**，也就是**不迁移**。用户换手机之后读不到，要重新登录。想让它跟着走就显式写 `whenUnlocked` 或 `afterFirstUnlock`。

> 这个默认比 expo-secure-store（`WHEN_UNLOCKED`）和 react-native-keychain（`AFTER_FIRST_UNLOCK`）都保守——那两家的默认都**会迁移**。理由见[实现原理](../internals/keychain.md)。

**后台任务要读就得用 `afterFirstUnlock*`**：`whenUnlocked` 在锁屏时读不到。

`kSecAttrAccessibleAlways` 和 `AlwaysThisDeviceOnly` **不提供**——iOS 12 起已废弃。写它们会被当成不认识的值拒掉，错误信息里会列出能用的五个。

## 出错

```js
try {
  await kc.set('token', v);
} catch (err) {
  err.name;      // 'NotAllowedError'
  err.code;      // OSStatus 的原值
  err.domain;    // 'NSOSStatusErrorDomain'
}
```

| `name` | 什么时候 |
| --- | --- |
| `NotAllowedError` | 设备锁着读不到（`errSecInteractionNotAllowed`）、认证失败 |
| `SecurityError` | 缺 entitlement |
| `TypeMismatchError` | 参数不对，包括 `accessible` 给了不认识的值 |
| `InvalidModificationError` | 条目冲突 |
| `KeychainError` | 其余 |

**「没有这一条」不是错误**：`get` 给 `null`、`has` 给 `false`、`remove` 照样成功。

参数写错是**同步抛**，不是 reject：

```js
kc.get(42);   // 立刻 TypeError: get: key must be a non-empty string
```

## 条目怎么分组

全部存成 `kSecClassGenericPassword`，`service` 是 App 的 bundle identifier，`account` 是你给的 key。所以 `keys()` 和 `clear()` 只看得到这个 App 自己的条目。

## 和原生的对照

| ObjC | JS |
| --- | --- |
| `SecItemCopyMatching` + `kSecReturnData` | `await kc.get(key)` |
| `SecItemUpdate` / `SecItemAdd` | `await kc.set(key, value)` |
| `SecItemDelete` | `await kc.remove(key)` |
| `kSecMatchLimitAll` + `kSecReturnAttributes` | `await kc.keys()` |
| `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` | `{ accessible: 'whenUnlockedThisDeviceOnly' }` |
| `OSStatus` | reject，`err.code` 是原值 |

> `set` 内部**先试 `SecItemUpdate`，没有再 `SecItemAdd`**，所以 `errSecDuplicateItem` 对你完全透明——覆盖写就是正常操作。

## 还没做

| | |
| --- | --- |
| **生物识别门禁** | `SecAccessControlCreateWithFlags` + `kSecAccessControlBiometryCurrentSet`，要先有 LocalAuthentication |
| `kSecClassInternetPassword` | 按网站存的凭证 |
| 证书和密钥 | |
| 访问组共享 | `kSecAttrAccessGroup`，要 entitlement |
| iCloud 钥匙串同步 | `kSecAttrSynchronizable` |

> **别依赖「卸载 App 之后数据还在」。** iOS 上确实常常还在，但 Apple 没承诺过，expo-secure-store 的文档也写着「you should never rely on this implementation detail」。

---

← 返回 [API 文档](README.md) ・ [本地存储](storage.md) ・ [文件读写](filesystem.md) ・ [实现原理](../internals/keychain.md)
