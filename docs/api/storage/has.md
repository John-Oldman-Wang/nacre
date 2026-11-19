---
type: reference
native: "-[NSUserDefaults objectForKey:]"
---

# `NSUserDefaults`：`has()` 方法

**`has()`** 方法判断一个键读不读得到值。

## 语法

```
has(key)
```

### 参数

**`key`**

键名，字符串。

### 返回值

布尔值。

- `true`：这个键读得到值，包括没写过、只用 [`registerDefaults()`](registerdefaults.md) 登记了默认值的键。
- `false`：没写过，也没登记默认值。

### 异常

**`TypeError`**

`key` 不是字符串：`has: key must be a string`。

## 示例

```js
const storage = application.storage;
storage.registerDefaults({ pageSize: 20 });
console.log(storage.has('pageSize'), storage.has('neverWritten'));
```

**结果**：输出 `true false`。

## 对应的 iOS API

没有单独的方法。ObjC 里写 `[d objectForKey:@"k"] != nil`。

## 参见

- [`get()`](get.md)
- [`integerForKey()`](integerforkey.md)：没有键时返回 `0`，要区分「没有」和「是 0」时先用 `has()`
