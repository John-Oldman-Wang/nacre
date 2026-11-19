---
type: reference
native: SecItemCopyMatching
---

# `application.keychain`：`get()` 函数

**`get()`** 函数读一个条目的字符串值。

## 语法

```
get(key)
```

### 参数

**`key`**

键，非空字符串。

### 返回值

Promise，兑现为：

- 字符串：这个键的值。
- `null`：没有这个键。「没有这个键」不算错误，Promise 不被拒绝。

用 [`setBytes()`](setbytes.md) 存的条目要用 [`getBytes()`](getbytes.md) 读。用 `get` 读它时，字节不是合法的 UTF-8 文本就得到 `null`，和「没有这个键」分不开（读代码得出，**未在模拟器验证**）。

读取失败时 Promise 被拒绝，拒绝的值见[出错时得到什么](../keychain.md#出错时得到什么)。比如设备锁定时读一个要求解锁的条目，`name` 是 `'NotAllowedError'`（**未在模拟器验证**）。

### 异常

**`TypeError`**（当场抛出，不返回 Promise）

- `key` 不是字符串，或是空字符串：`get: key must be a non-empty string`。

## 示例

```js
async function readToken() {
  const token = await application.keychain.get('token');
  if (token === null) {
    console.log('没有登录');
  } else {
    console.log('已登录，令牌:', token);
  }
}
readToken();
```

**结果**：存过 `token` 时输出 `已登录，令牌: …`，没存过时输出 `没有登录`。

## 对应的 iOS API

`SecItemCopyMatching` 加 `kSecReturnData`，条目类别是 `kSecClassGenericPassword`，`kSecAttrAccount` 是 `key`。`errSecItemNotFound` 兑现为 `null`。

## 参见

- [`set()`](set.md)
- [安装 `@nacrejs/keychain`](../keychain.md#先装上)
