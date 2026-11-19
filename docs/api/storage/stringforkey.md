---
type: reference
native: "-[NSUserDefaults stringForKey:]"
---

# `NSUserDefaults`：`stringForKey()` 方法

**`stringForKey()`** 方法读存储里的一个键，并把值转换成字符串。转换不了时返回一个固定的值，不抛异常。

## 语法

```
stringForKey(key)
```

### 参数

**`key`**

键名，字符串。

### 返回值

字符串，或者 `null`。

- 没有这个键时返回 `null`。
- 存的值不是字符串时返回什么，**未在模拟器验证**。

### 异常

**`TypeError`**

`key` 不是字符串：`stringForKey: key must be a string`。

## 示例

```js
const storage = application.storage;
storage.set('name', '小王');
console.log(storage.stringForKey('name'), storage.stringForKey('neverWritten'));
```

**结果**：输出 `小王 null`。

## 对应的 iOS API

`-[NSUserDefaults stringForKey:]`。

## 参见

- [`get()`](get.md)：原样读出存进去的值，不转换类型
- [`has()`](has.md)：判断有没有这个键
