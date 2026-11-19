---
type: reference
native: "-[NSBundle objectForInfoDictionaryKey:]"
---

# `NSBundle`：`objectForInfoDictionaryKey()` 方法

**`objectForInfoDictionaryKey()`** 方法读 Info.plist 里一个键的值，按 App 在用的语言翻译过的优先。

## 语法

```
objectForInfoDictionaryKey(key)
```

## 参数

**`key`**

键，字符串。照字符串转换：数会转成字符串，`null` 和 `undefined` 当空串。

## 返回值

这个键的值，转成 JS 的值；没有这个键时是 `null`。

## 异常

无。

## 示例

```js
const main = NSBundle.mainBundle;
console.log(main.objectForInfoDictionaryKey('CFBundleIdentifier') === main.bundleIdentifier);
console.log(main.objectForInfoDictionaryKey('NacreNoSuchKey'));
```

**结果**：依次输出 `true`、`null`。

## 对应的 iOS API

`-[NSBundle objectForInfoDictionaryKey:]`。

## 参见

- [`NSBundle`](../ns-bundle.md)
- [`infoDictionary`](infodictionary.md)
