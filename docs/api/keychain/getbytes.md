---
type: reference
native: SecItemCopyMatching
---

# `application.keychain`：`getBytes()` 函数

**`getBytes()`** 函数读一个条目的值，得到原始的字节。

## 语法

```
getBytes(key)
```

### 参数

**`key`**

键，非空字符串。

### 返回值

Promise，兑现为：

- `ArrayBuffer`：这个键的值的字节。
- `null`：没有这个键。Promise 不被拒绝。

读取失败时 Promise 被拒绝，拒绝的值见[出错时得到什么](../keychain.md#出错时得到什么)。

### 异常

**`TypeError`**（当场抛出，不返回 Promise）

- `key` 不是字符串，或是空字符串：`getBytes: key must be a non-empty string`。

## 示例

```js
async function readSecret() {
  const buffer = await application.keychain.getBytes('secret');
  if (buffer !== null) {
    console.log(new Uint8Array(buffer).length);
  }
}
readSecret();
```

**结果**：存过 32 字节的 `secret` 时输出 `32`。读回来的字节和写入的相同。

## 对应的 iOS API

`SecItemCopyMatching` 加 `kSecReturnData`，得到的 `NSData` 交成 `ArrayBuffer`。

## 参见

- [`setBytes()`](setbytes.md)
- [安装 `@nacrejs/keychain`](../keychain.md#先装上)
