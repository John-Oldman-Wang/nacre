---
type: reference
native: SecItemUpdate / SecItemAdd
---

# `application.keychain`：`set()` 函数

**`set()`** 函数写入一个字符串值。键已经存在时覆盖它的值，不报错。

## 语法

```
set(key, value[, { accessible }])
```

### 参数

**`key`**

键，非空字符串。

**`value`**

值，字符串。数字、数组、对象要先转成文本，比如用 `JSON.stringify()`。二进制数据用 [`setBytes()`](setbytes.md)。

**`options.accessible`**

可选。条目的访问级别，五个字符串之一，默认 `'whenUnlockedThisDeviceOnly'`。各取值的效果见[访问级别](../keychain.md#访问级别)。

只在条目第一次写入时生效：对一个已经存在的键再次写入并带上不同的 `accessible`，值会更新，访问级别保持原样，也不报错（读代码得出，**未在模拟器验证**）。要改访问级别，先 [`remove()`](remove.md) 再 `set()`。

### 返回值

Promise，写好后兑现为 `undefined`。

拒绝的情况：

- `accessible` 是字符串但不是五个取值之一：`name` 是 `'TypeMismatchError'`，`message` 是 `accessible has no value "always"; expected one of: ` 加上可用的取值。这个键不会被写入。
- `accessible` 是 `'whenPasscodeSetThisDeviceOnly'` 而设备没有设锁屏密码：写入失败（**未在模拟器验证**）。
- 其他失败，见[出错时得到什么](../keychain.md#出错时得到什么)。

### 异常

**`TypeError`**（当场抛出，不返回 Promise）

- `key` 不是字符串，或是空字符串：`set: key must be a non-empty string`。
- `value` 不是字符串：`set: value must be a string; use setBytes for binary`。
- `accessible` 不是字符串：`set: accessible must be a string`。

## 说明

连续调用两次 `set` 写同一个键而不等待，最后留下的是后一次的值（读代码得出，**未在模拟器验证**）。

## 示例

```js
async function saveRefreshToken() {
  await application.keychain.set('refreshToken', 'r-456', {
    accessible: 'afterFirstUnlockThisDeviceOnly',
  });
  console.log(await application.keychain.get('refreshToken'));
}
saveRefreshToken();
```

**结果**：输出 `r-456`。设备开机后用户解锁过一次，之后锁屏时也能读到它（**未在模拟器验证**）。

## 对应的 iOS API

`SecItemUpdate`，条目不存在时 `SecItemAdd`。`accessible` 对应 `kSecAttrAccessible`，`kSecAttrAccessibleWhenUnlocked` 写成 `'whenUnlocked'`，其余同理。

## 参见

- [`get()`](get.md)
- [`setBytes()`](setbytes.md)
- [安装 `@nacrejs/keychain`](../keychain.md#先装上)
