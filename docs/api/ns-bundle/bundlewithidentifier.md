---
type: reference
native: "+[NSBundle bundleWithIdentifier:]"
---

# `NSBundle.bundleWithIdentifier()` 静态方法

**`bundleWithIdentifier()`** 静态方法按包名拿一个已经加载的包。

## 语法

```
NSBundle.bundleWithIdentifier(identifier)
```

## 参数

**`identifier`**

包名，字符串，形如 `com.example.shop`。照字符串转换：数会转成字符串，`null` 和 `undefined` 当空串。

## 返回值

[`NSBundle`](../ns-bundle.md)，或者 `null`：没有这个包名的包。

## 异常

无。

## 示例

```js
const main = NSBundle.mainBundle;
const found = NSBundle.bundleWithIdentifier(String(main.bundleIdentifier));
console.log(found !== null && found.bundlePath === main.bundlePath);
```

**结果**：输出 `true`。

## 对应的 iOS API

`+[NSBundle bundleWithIdentifier:]`。

## 参见

- [`NSBundle`](../ns-bundle.md)
