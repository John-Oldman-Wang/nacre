# Keychain 怎么搭的

## 默认访问级别：为什么比两家主流都保守

`accessible` 不写时用 `whenUnlockedThisDeviceOnly`——**不跟着备份迁移到新设备**。

两家主流的默认都更宽松，而且彼此还不一致：

| | 默认值 | 锁屏时能读 | **会不会迁移** |
| --- | --- | --- | --- |
| expo-secure-store | `WHEN_UNLOCKED` | 否 | **会** |
| react-native-keychain | `AFTER_FIRST_UNLOCK` | 是 | **会** |
| **Nacre** | `whenUnlockedThisDeviceOnly` | 否 | **不会** |

它们在第二列分歧，但**第三列一致：都允许迁移**。只有我们不允许。

选保守的理由是**代价不对称**：

- 这个属性**存进去就改不了**（要删掉重存）
- 默认保守，最坏结果是「需要同步的人得多写一行」
- 默认宽松，最坏结果是「所有人的令牌都悄悄跟着备份走到了新设备」，而且没人会发现

反驳也要写下来：强制或保守的安全默认，实践中可能导致开发者**照抄**搜到的第一个答案，抄来的未必更好。两家给宽松默认多半就是这个考虑。这条反驳没有数据能压倒，是取舍不是定论。

> 还讨论过第三条路：**不给默认，不写就抛**。理由是[原则 7](../project.md)——「运行时提供事实，JS 做判断，原生层不替 JS 做决策」，而一个默认的访问级别就是运行时替 JS 做了一个安全决策。最后没选它，因为照抄的风险比多一道坎更实在。

## 名字和形状

`application.keychain` 的形状和 [`storage`](storage.md) 一样（`get` / `set` / `remove` / `has` / `keys` / `clear`），但**全是 Promise**：Keychain 读写走 `securityd` 的 XPC，是进程间通信不是内存读写，设备锁着时还会阻塞，而 JS 在主线程。

和 [`fileSystem`](filesystem.md) 一样，这是**我们自己的上层对象**——Keychain 的能力散在 `SecItemAdd` / `SecItemCopyMatching` / `SecItemUpdate` / `SecItemDelete` 四个 C 函数加一堆 `CFDictionary` 魔法键上，没有一个原生对象能直接当它用。iOS 上也**没有**「钥匙串对象」这种东西，所以自己给了一个 `NacreKeychain` 单例当包装表里的那个指针。

## 枚举为什么绕了一道序号

`kSecAttrAccessible*` 是 `CFStringRef` 常量，而 `NACRE_ENUM_MAP` 的值必须是数字。所以：

```
'whenUnlockedThisDeviceOnly'  →  序号 1  →  kSecAttrAccessibleWhenUnlockedThisDeviceOnly
         （NACRE_ENUM_MAP）              （NacreKeychain.mm 的 switch）
```

绕这一道**是为了让 `check-api.sh` 核对得到**：枚举那一节是一张硬编码的「宏名 ↔ d.ts 类型名」对照表，加进去之后 d.ts 的五个值和原生层的五个值就不会各漂各的。直接在 `NacreKeychain.mm` 里写一张字符串表更短，但那张表没人盯着。

**废弃的两个不进表**：`kSecAttrAccessibleAlways` 和 `AlwaysThisDeviceOnly` 从 iOS 12 起 `API_DEPRECATED`，头文件原话是「Use an accessibility level that provides some user protection」。不在表里，所以写它们会被当成不认识的值拒掉，错误信息自动列出能用的五个。

> expo-secure-store **仍然暴露 `ALWAYS`**，只加了一条 deprecated 注释。这一点我们比它严格。

## `set` 先 update 再 add

```objc
OSStatus status = SecItemUpdate(query, changes);
if (status == errSecItemNotFound) {
  query[kSecValueData] = data;
  query[kSecAttrAccessible] = AccessibleConstant(accessible);
  status = SecItemAdd(query, NULL);
}
```

`errSecDuplicateItem` 对调用方**完全透明**——覆盖写同一个键就是正常操作，不该让 JS 去处理一个 `OSStatus`。

注意 `kSecAttrAccessible` **只在 add 那一支设**：已有条目的访问级别改不了，这是 Keychain 的事实，不是我们的省略。

## 结果类是和文件读写共用的

7b 建的 `NacreFileResult` 在这一步改名成 **`NacreAsyncResult`**——两个域都是「派到后台做完再兑现」，用四个互斥字段表示四种兑现（reject / 零拷贝字节 / JSON / bool）。`NacreRuntime.mm` 里那段回主线程的逻辑也抽成了一个 `settle` 块：

```objc
NacreAsyncDone settle = ^(NacreAsyncResult* r) { … };
if (FileSystemCallAsync(object, name, argsJSON, argPtrs, settle)) return;
if (KeychainCallAsync(object, name, argsJSON, argPtrs, settle)) return;
```

两条链都按[已定的规矩](bridge.md)返回「认不认领」。

## 实测

**五个访问级别在模拟器上全部写得进去**，包括 `whenPasscodeSetThisDeviceOnly`——说明那台模拟器设了密码。验收用例写成「打印实测个数 + 断言至少四个」，而不是假定五个都行，因为那一条在没设密码的设备上会失败。

**跨进程验过**：第一次运行存一个计数，第二次启动读到 2。`run-sim.sh` 只做 `simctl install`，不抹容器。

## 编译期踩的两个坑

都是 ObjC++ 的常见摩擦，编译器抓得住，但一次只报一条，所以会一轮一轮地冒：

1. **类型用在定义之前**：`NACRE_ENUM_DECL(KeychainAccessible, NacreKeychainAccessible)` 在前，`typedef NS_ENUM` 在后。C 的头文件顺序读。
2. **`std::string` 不能直接赋给 `NSString*`**：`EnumError()` 返回的是前者，要 `@(….c_str())`。同一个文件里两套字符串并存，跨边界要显式转。

---

← 返回[实现原理](README.md) ・ [本地存储](storage.md) ・ [文件读写](filesystem.md) ・ [API 文档](../api/keychain.md)
