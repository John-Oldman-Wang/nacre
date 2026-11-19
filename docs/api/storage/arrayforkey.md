---
type: reference
native: "-[NSUserDefaults arrayForKey:]"
---

# `NSUserDefaults`：`arrayForKey()` 方法

**`arrayForKey()`** 方法读存储里的一个键，并把值转换成数组。转换不了时返回一个固定的值，不抛异常。

## 语法

```
arrayForKey(key)
```

### 参数

**`key`**

键名，字符串。

### 返回值

数组，或者 `null`。

- 没有这个键时返回 `null`（**未在模拟器验证**）。
- 存的值不是数组时返回 `null`。
- 返回的数组是一份副本，修改它不会改变存储里的值。

### 异常

**`TypeError`**

`key` 不是字符串：`arrayForKey: key must be a string`。

## 示例

```js
const storage = application.storage;
storage.set('recent', ['AAPL', 'TSLA']);
storage.set('name', '小王');
console.log(JSON.stringify(storage.arrayForKey('recent')), storage.arrayForKey('name'));
```

**结果**：输出 `["AAPL","TSLA"] null`。

## 对应的 iOS API

`-[NSUserDefaults arrayForKey:]`。

## 参见

- [`get()`](get.md)：原样读出存进去的值，不转换类型
- [`has()`](has.md)：判断有没有这个键
