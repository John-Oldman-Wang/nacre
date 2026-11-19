---
type: reference
native: "-[NSUserDefaults dictionaryForKey:]"
---

# `NSUserDefaults`：`dictionaryForKey()` 方法

**`dictionaryForKey()`** 方法读存储里的一个键，并把值转换成普通对象。转换不了时返回一个固定的值，不抛异常。

## 语法

```
dictionaryForKey(key)
```

### 参数

**`key`**

键名，字符串。

### 返回值

普通对象，或者 `null`。

- 没有这个键时返回 `null`（**未在模拟器验证**）。
- 存的值不是对象时返回 `null`（**未在模拟器验证**）。
- 返回的对象是一份副本。修改它不会保存，要把改好的对象再 [`set()`](set.md) 一次。

### 异常

**`TypeError`**

`key` 不是字符串：`dictionaryForKey: key must be a string`。

## 示例

```js
const storage = application.storage;
storage.set('profile', { name: '小王', level: 3, tags: ['vip'] });

const profile = storage.dictionaryForKey('profile');
if (profile) {
  console.log(profile.name, profile.level);
}
```

**结果**：输出 `小王 3`。

## 对应的 iOS API

`-[NSUserDefaults dictionaryForKey:]`。

## 参见

- [`get()`](get.md)：原样读出存进去的值，不转换类型
- [`has()`](has.md)：判断有没有这个键
