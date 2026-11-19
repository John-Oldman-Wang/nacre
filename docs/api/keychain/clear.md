---
type: reference
native: SecItemDelete
---

# `application.keychain`：`clear()` 函数

**`clear()`** 函数删除这个 App 在钥匙串里的全部条目。

## 语法

```
clear()
```

### 参数

无。

### 返回值

Promise，删好后兑现为 `undefined`。删除失败时被拒绝，见[出错时得到什么](../keychain.md#出错时得到什么)。

只删除这个 App 自己的条目。

### 异常

无。

## 示例

```js
async function logoutAll() {
  await application.keychain.clear();
  console.log((await application.keychain.keys()).length);
}
logoutAll();
```

**结果**：输出 `0`。

## 对应的 iOS API

`SecItemDelete`，只按条目类别和 `kSecAttrService`（App 的包名）匹配，不指定 `kSecAttrAccount`。

## 参见

- [`remove()`](remove.md)：删除一个键
- [安装 `@nacrejs/keychain`](../keychain.md#先装上)
