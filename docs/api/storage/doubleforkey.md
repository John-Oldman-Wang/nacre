---
type: reference
native: "-[NSUserDefaults doubleForKey:]"
---

# `NSUserDefaults`：`doubleForKey()` 方法

**`doubleForKey()`** 方法读存储里的一个键，并把值转换成数字。转换不了时返回一个固定的值，不抛异常。

## 语法

```
doubleForKey(key)
```

### 参数

**`key`**

键名，字符串。

### 返回值

数字。

- 没有这个键时返回 `0`（**未在模拟器验证**），不是 `null`。
- 存的是字符串 `'42'` 时返回 `42`。

### 异常

**`TypeError`**

`key` 不是字符串：`doubleForKey: key must be a string`。

## 示例

```js
const storage = application.storage;
storage.set('ratio', '42');
console.log(storage.doubleForKey('ratio'));
```

**结果**：输出 `42`。

## 对应的 iOS API

`-[NSUserDefaults doubleForKey:]`。

## 参见

- [`get()`](get.md)：原样读出存进去的值，不转换类型
- [`has()`](has.md)：判断有没有这个键
