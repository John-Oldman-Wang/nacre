---
type: reference
native: "-[NSUserDefaults registerDefaults:]"
---

# `NSUserDefaults`：`registerDefaults()` 方法

**`registerDefaults()`** 方法登记一组默认值：键没被写过时，读它得到登记的值。

## 语法

```
registerDefaults(table)
```

### 参数

**`table`**

普通对象。属性名是键，属性值是默认值。属性值能用的类型和 [`set()`](set.md) 相同。

### 返回值

无（`undefined`）。

登记的值只在这个键没被写过时生效。用 [`set()`](set.md) 写入之后读到写入的值；用 [`remove()`](remove.md) 删除写入的值之后，又读到登记的默认值。

登记的值不写入磁盘，所以每次启动都要登记一次。登记过默认值的键，[`has()`](has.md) 得到 `true`，即使从没写过。

### 异常

**`TypeError`**

- `table` 不是普通对象：`registerDefaults: needs a plain object`。
- `table` 里有不能存的值：报错和 [`set()`](set.md#异常) 相同，开头是 `registerDefaults`。

## 示例

```js
const storage = application.storage;
storage.registerDefaults({ theme: 'auto', pageSize: 20 });
console.log(storage.get('theme'));

storage.set('theme', 'dark');
console.log(storage.get('theme'));

storage.remove('theme');
console.log(storage.get('theme'));
```

**结果**：依次输出 `auto`、`dark`、`auto`。

## 对应的 iOS API

`-[NSUserDefaults registerDefaults:]`。

## 参见

- [给设置登记默认值](../../guides/save-settings.md#给设置登记默认值)
