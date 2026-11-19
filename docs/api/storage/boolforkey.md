---
type: reference
native: "-[NSUserDefaults boolForKey:]"
---

# `NSUserDefaults`：`boolForKey()` 方法

**`boolForKey()`** 方法读存储里的一个键，并把值转换成布尔值。转换不了时返回一个固定的值，不抛异常。

## 语法

```
boolForKey(key)
```

### 参数

**`key`**

键名，字符串。

### 返回值

布尔值。没有这个键时返回 `false`，不是 `null`。

只有少数几种写法被当成真。对各种值的结果（实测）：

| 存进去的值 | `boolForKey()` 的结果 |
| --- | --- |
| `true` | `true` |
| 字符串 `'1'` | `true` |
| 字符串 `'YES'` | `true` |
| 字符串 `'42'` | `false` |
| 没有这个键 | `false` |

判断一个值的真假用 [`get()`](get.md) 读出来自己判断，不用 `boolForKey()`。

### 异常

**`TypeError`**

`key` 不是字符串：`boolForKey: key must be a string`。

## 示例

```js
const storage = application.storage;
storage.set('flag', 'YES');
storage.set('count', '42');
console.log(storage.boolForKey('flag'), storage.boolForKey('count'));
```

**结果**：输出 `true false`。

## 对应的 iOS API

`-[NSUserDefaults boolForKey:]`。

## 参见

- [`get()`](get.md)：原样读出存进去的值，不转换类型
- [`has()`](has.md)：判断有没有这个键
