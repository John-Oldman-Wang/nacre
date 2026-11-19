---
type: reference
native: SecItemCopyMatching
---

# `application.keychain`：`has()` 函数

**`has()`** 函数判断有没有这个键。

## 语法

```
has(key)
```

### 参数

**`key`**

键，非空字符串。

### 返回值

Promise，兑现为布尔：有这个键时是 `true`，没有时是 `false`。查询失败时被拒绝，见[出错时得到什么](../keychain.md#出错时得到什么)。

### 异常

**`TypeError`**（当场抛出，不返回 Promise）

- `key` 不是字符串，或是空字符串：`has: key must be a non-empty string`。

## 示例

```js
async function check() {
  await application.keychain.set('token', 'abc-123');
  console.log(await application.keychain.has('token'));
}
check();
```

**结果**：输出 `true`。

## 对应的 iOS API

`SecItemCopyMatching`，只看条目在不在。

## 参见

- [`get()`](get.md)
- [安装 `@nacrejs/keychain`](../keychain.md#先装上)
