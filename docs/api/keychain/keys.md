---
type: reference
native: SecItemCopyMatching
---

# `application.keychain`：`keys()` 函数

**`keys()`** 函数列出这个 App 存过的全部键。

## 语法

```
keys()
```

### 参数

无。

### 返回值

Promise，兑现为字符串数组。一个键都没有时是空数组。顺序**未在模拟器验证**。

只包含这个 App 自己的条目。查询失败时被拒绝，见[出错时得到什么](../keychain.md#出错时得到什么)。

### 异常

无。

## 示例

```js
async function listKeys() {
  const keys = await application.keychain.keys();
  console.log(keys.join(','));
}
listKeys();
```

**结果**：输出 App 存过的全部键，用逗号分隔。

## 对应的 iOS API

`SecItemCopyMatching` 加 `kSecMatchLimitAll` 和 `kSecReturnAttributes`，取每个条目的 `kSecAttrAccount`。

## 参见

- [`clear()`](clear.md)
- [安装 `@nacrejs/keychain`](../keychain.md#先装上)
