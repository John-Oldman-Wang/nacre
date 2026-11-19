---
type: reference
native: "-[NSUserDefaults objectForKey:]"
---

# `NSUserDefaults`：`get()` 方法

**`get()`** 方法读存储里的一个键，原样返回存进去的值。

## 语法

```
get(key)
```

### 参数

**`key`**

键名，字符串。

### 返回值

存进去的值：字符串、数字、布尔、数组或普通对象，类型和存进去时一样。

- 没有这个键时返回 `null`，不抛异常。
- 键没写过、但用 [`registerDefaults()`](registerdefaults.md) 登记过默认值时，返回默认值。
- 返回的数组和对象是一份副本。修改它不会改变存储里的值，要再调一次 [`set()`](set.md) 才会保存。

### 异常

**`TypeError`**

`key` 不是字符串：`get: key must be a string`。

## 示例

```js
const storage = application.storage;
storage.set('n', '42');
console.log(storage.get('n'), storage.get('neverWritten'));
```

**结果**：输出 `42 null`。前一个是字符串 `'42'`。

## 对应的 iOS API

`-[NSUserDefaults objectForKey:]`。

## 参见

- [`set()`](set.md)：写入
- [`has()`](has.md)：只判断有没有
- [带类型的读取](../storage.md#函数)：读取时转换类型的七个函数
