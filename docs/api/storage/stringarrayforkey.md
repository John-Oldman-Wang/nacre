---
type: reference
native: "-[NSUserDefaults stringArrayForKey:]"
---

# `NSUserDefaults`：`stringArrayForKey()` 方法

**`stringArrayForKey()`** 方法读存储里的一个键，并把值转换成字符串数组。转换不了时返回一个固定的值，不抛异常。

## 语法

```
stringArrayForKey(key)
```

### 参数

**`key`**

键名，字符串。

### 返回值

字符串数组，或者 `null`。

- 没有这个键时返回 `null`（**未在模拟器验证**）。
- 数组里有不是字符串的元素时返回 `null`。

### 异常

**`TypeError`**

`key` 不是字符串：`stringArrayForKey: key must be a string`。

## 示例

```js
const storage = application.storage;
storage.set('tags', ['vip', 'new']);
storage.set('mixed', ['vip', 3]);
console.log(JSON.stringify(storage.stringArrayForKey('tags')), storage.stringArrayForKey('mixed'));
```

**结果**：输出 `["vip","new"] null`。

## 对应的 iOS API

`-[NSUserDefaults stringArrayForKey:]`。

## 参见

- [`get()`](get.md)：原样读出存进去的值，不转换类型
- [`has()`](has.md)：判断有没有这个键
