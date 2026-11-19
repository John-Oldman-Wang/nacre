---
type: reference
native: "-[NSUserDefaults integerForKey:]"
---

# `NSUserDefaults`：`integerForKey()` 方法

**`integerForKey()`** 方法读存储里的一个键，并把值转换成整数。转换不了时返回一个固定的值，不抛异常。

## 语法

```
integerForKey(key)
```

### 参数

**`key`**

键名，字符串。

### 返回值

数字，是一个整数。

- 没有这个键时返回 `0`，不是 `null`。要区分「没有这个键」和「值是 0」，用 [`has()`](has.md) 或 [`get()`](get.md)。
- 存的是字符串 `'42'` 时返回 `42`。
- 存的值转不成数字时返回什么，**未在模拟器验证**。

### 异常

**`TypeError`**

`key` 不是字符串：`integerForKey: key must be a string`。

## 示例

```js
const storage = application.storage;
storage.set('n', '42');
console.log(storage.get('n'), storage.integerForKey('n'));
console.log(storage.integerForKey('neverWritten'));
```

**结果**：先输出 `42 42`，前一个是字符串 `'42'`，后一个是数字 `42`。然后输出 `0`。

## 对应的 iOS API

`-[NSUserDefaults integerForKey:]`。

## 参见

- [`get()`](get.md)：原样读出存进去的值，不转换类型
- [`has()`](has.md)：判断有没有这个键
