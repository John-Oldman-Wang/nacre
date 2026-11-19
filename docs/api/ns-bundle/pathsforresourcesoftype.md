---
type: reference
native: "-[NSBundle pathsForResourcesOfType:inDirectory:forLocalization:]"
---

# `NSBundle`：`pathsForResourcesOfType()` 方法

**`pathsForResourcesOfType()`** 方法列出包里一种扩展名的全部资源的绝对路径。

## 语法

```
pathsForResourcesOfType(ext[, { inDirectory, forLocalization }])
```

## 参数

**`ext`**

扩展名，不带点，字符串或 `null`。照字符串转换；`null` 和 `undefined` 表示不指定。

**`options.inDirectory`**

在包里哪个目录下找，相对包的根。不往子目录里找。

**`options.forLocalization`**

按哪种语言的目录找。

## 返回值

字符串数组，没有时是空数组。

## 异常

无。

## 说明

「不往子目录里找」来自 Apple 的说明，**未在模拟器验证**。

## 示例

```js
const pngs = NSBundle.mainBundle.pathsForResourcesOfType('png', { inDirectory: 'JS/assets' });
console.log(pngs.includes(application.fileSystem.assets + '/dot.png'));
```

**结果**：项目的 `assets/` 里有 `dot.png` 时，输出 `true`。

## 对应的 iOS API

按带没带 `forLocalization` 调：`pathsForResourcesOfType:inDirectory:`、`pathsForResourcesOfType:inDirectory:forLocalization:`。

## 参见

- [`NSBundle`](../ns-bundle.md)
