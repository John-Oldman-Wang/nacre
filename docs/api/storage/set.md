---
type: reference
native: "-[NSUserDefaults setObject:forKey:]"
---

# `NSUserDefaults`：`set()` 方法

**`set()`** 方法把一个值写进存储。返回时新值已经生效，紧接着读就能读到。

## 语法

```
set(key, value)
```

### 参数

**`key`**

键名，字符串。

**`value`**

要保存的值：字符串、有限的数字、布尔、数组或普通对象，数组的元素和对象的属性值也必须是这几种。能存哪些值见[能存哪些值](../storage.md#能存哪些值)。

传 `null` 删除这个键，和 [`remove()`](remove.md) 相同。

### 返回值

无（`undefined`）。

写入磁盘由系统随后自动完成，App 不需要也不能主动触发。写入之后，`application.storage` 派发 [`change`](change-event.md) 事件。

### 异常

**`TypeError`**

出错时不写入，这个键原来的值不变。

| 传入的值 | 报错信息 |
| --- | --- |
| `key` 不是字符串 | `set: key must be a string` |
| `undefined` | `set: value is undefined; pass null to remove the key` |
| `NaN`、`Infinity` | `set("x"): NaN and Infinity cannot be stored` |
| 函数（Symbol 等类似，开头的类型名不同） | `set("x"): function cannot be stored; only strings, finite numbers, booleans, arrays and plain objects of those` |
| `Date`、原生对象等不是普通对象的对象 | `set("x"): only plain objects can be stored, got Date` |
| 数组或对象里面的 `null` | `set("x")[1]: null cannot be stored; only strings, finite numbers, booleans, arrays and plain objects of those` |
| 自己引用自己的结构 | `set("x").self: circular structures cannot be stored` |

报错信息开头的 `set("x")` 是键名，后面的 `[1]`、`.self` 是出错的值在结构里的位置。

## 示例

### 写入一个对象

```js
const storage = application.storage;
storage.set('profile', { name: '小王', level: 3, tags: ['vip'] });
console.log(JSON.stringify(storage.get('profile')));
```

**结果**：输出 `{"name":"小王","level":3,"tags":["vip"]}`。

### 写入不能存的值

```js
try {
  application.storage.set('x', /** @type {any} */ ({ a: [1, { b: () => {} }] }));
} catch (err) {
  console.log(String(err));
}
```

**结果**：控制台输出 `TypeError: set("x").a[1].b: function cannot be stored; only strings, finite numbers, booleans, arrays and plain objects of those`。键 `x` 没有被写入。

## 对应的 iOS API

`-[NSUserDefaults setObject:forKey:]`。`setInteger:forKey:`、`setBool:forKey:` 等带类型的写入都写成 `set()`。

## 参见

- [`get()`](get.md)：读回来
- [`remove()`](remove.md)：删除
- [`change`](change-event.md)：写入之后派发的事件
