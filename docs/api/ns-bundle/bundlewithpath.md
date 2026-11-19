---
type: reference
native: "+[NSBundle bundleWithPath:]"
---

# `NSBundle.bundleWithPath()` 静态方法

**`bundleWithPath()`** 静态方法按目录的路径拿一个包。

## 语法

```
NSBundle.bundleWithPath(path)
```

## 参数

**`path`**

包的绝对路径，字符串。照字符串转换：数会转成字符串，`null` 和 `undefined` 当空串。

## 返回值

[`NSBundle`](../ns-bundle.md)，或者 `null`：路径上不是一个包。

## 异常

无。

## 说明

传 App 自己的包的路径，得到的包和 [`mainBundle`](mainbundle.md) 的内容相同（`bundleIdentifier` 相同），是不是同一个对象没有验证。

## 示例

```js
console.log(NSBundle.bundleWithPath('/no/such/bundle'));
```

**结果**：输出 `null`。

## 对应的 iOS API

`+[NSBundle bundleWithPath:]`。

## 参见

- [`NSBundle`](../ns-bundle.md)
