---
type: reference
native: "-[NSUserDefaults removeObjectForKey:]"
---

# `NSUserDefaults`：`remove()` 方法

**`remove()`** 方法从存储里删除一个键。

## 语法

```
remove(key)
```

### 参数

**`key`**

键名，字符串。

### 返回值

无（`undefined`）。

删除之后 [`get()`](get.md) 得到 `null`；这个键登记过默认值时，得到默认值。删除一个本来就没有的键不报错。

### 异常

**`TypeError`**

`key` 不是字符串：`remove: key must be a string`。

## 示例

```js
const storage = application.storage;
storage.set('draft', '写到一半的内容');
storage.remove('draft');
console.log(storage.get('draft'), storage.has('draft'));
```

**结果**：输出 `null false`。

`storage.set('draft', null)` 的效果相同。

## 对应的 iOS API

`-[NSUserDefaults removeObjectForKey:]`。

## 参见

- [`set()`](set.md)：传 `null` 也是删除
- [`registerDefaults()`](registerdefaults.md)：删除之后读到默认值
