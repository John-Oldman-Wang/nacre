---
type: reference
native: SecItemUpdate / SecItemAdd
---

# `application.keychain`：`setBytes()` 函数

**`setBytes()`** 函数把一个 `Blob` 里的字节写入一个条目。键已经存在时覆盖它的值。

## 语法

```
setBytes(key, blob[, { accessible }])
```

### 参数

**`key`**

键，非空字符串。

**`blob`**

要写入的字节，一个 [`Blob`](../fetch.md)。

**`options.accessible`**

可选。访问级别，和 [`set()`](set.md) 的相同，默认 `'whenUnlockedThisDeviceOnly'`。见[访问级别](../keychain.md#访问级别)。

### 返回值

Promise，写好后兑现为 `undefined`。`accessible` 不是五个取值之一时被拒绝，`name` 是 `'TypeMismatchError'`。其他失败见[出错时得到什么](../keychain.md#出错时得到什么)。

### 异常

**`TypeError`**（当场抛出，不返回 Promise）

- `key` 不是字符串，或是空字符串：`setBytes: key must be a non-empty string`。
- 第二个参数不是 `Blob`：`setBytes: the second argument must be a Blob`。
- `accessible` 不是字符串：`setBytes: accessible must be a string`。

## 说明

用 `setBytes` 存的条目要用 [`getBytes()`](getbytes.md) 读。

## 示例

```js
async function saveSecret() {
  const secret = crypto.getRandomValues(new Uint8Array(32));
  await application.keychain.setBytes('secret', new Blob([secret]));

  const buffer = await application.keychain.getBytes('secret');
  if (buffer !== null) {
    console.log(new Uint8Array(buffer).length);
  }
}
saveSecret();
```

**结果**：输出 `32`。读回来的字节和写入的相同。

## 对应的 iOS API

`SecItemUpdate`，条目不存在时 `SecItemAdd`，值是 `Blob` 的字节组成的 `NSData`。

## 参见

- [`getBytes()`](getbytes.md)
- [`crypto`](../crypto.md)：生成随机密钥
- [安装 `@nacrejs/keychain`](../keychain.md#先装上)
