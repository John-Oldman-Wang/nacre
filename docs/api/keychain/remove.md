---
type: reference
native: SecItemDelete
---

# `application.keychain`：`remove()` 函数

**`remove()`** 函数删除一个条目。没有这个键时照常完成，不报错。

## 语法

```
remove(key)
```

### 参数

**`key`**

键，非空字符串。

### 返回值

Promise，删好后兑现为 `undefined`。删除失败时被拒绝，见[出错时得到什么](../keychain.md#出错时得到什么)。

### 异常

**`TypeError`**（当场抛出，不返回 Promise）

- `key` 不是字符串，或是空字符串：`remove: key must be a non-empty string`。

## 示例

```js
async function logout() {
  await application.keychain.remove('token');
  console.log(await application.keychain.has('token'));
}
logout();
```

**结果**：输出 `false`。

## 对应的 iOS API

`SecItemDelete`。`errSecItemNotFound` 当作成功。

## 参见

- [`clear()`](clear.md)：删除全部条目
- [安装 `@nacrejs/keychain`](../keychain.md#先装上)
