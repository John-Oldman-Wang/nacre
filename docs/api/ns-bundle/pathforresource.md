---
type: reference
native: "-[NSBundle pathForResource:ofType:inDirectory:forLocalization:]"
---

# `NSBundle`：`pathForResource()` 方法

**`pathForResource()`** 方法按名字找包里一个资源的绝对路径。

## 语法

```
pathForResource(name[, { ofType, inDirectory, forLocalization }])
```

## 参数

**`name`**

资源的名字，字符串或 `null`。照字符串转换；`null` 和 `undefined` 表示不指定。名字可以带扩展名（`'data.json'`），这时不用给 `ofType`。

**`options.ofType`**

扩展名，不带点，形如 `'json'`。

**`options.inDirectory`**

在包里哪个目录下找，相对包的根，形如 `'JS/assets/web'`。不给时在包的根和各语言的目录里找。

**`options.forLocalization`**

按哪种语言的目录找，形如 `'en'`。

## 返回值

字符串：资源的绝对路径；找不到时是 `null`。

## 异常

无。

## 说明

项目的 `assets/` 在包里是 `JS/assets`。读那里的文件，直接用 [`application.fileSystem.assets`](../filesystem/assets.md) 拼路径更简单；`pathForResource()` 适合不知道文件在哪个目录、或者要按语言找的时候。

`forLocalization` 找到的是哪个文件**未在模拟器验证**：验收 App 的包里没有按语言放的资源。

## 示例

```js
const main = NSBundle.mainBundle;
console.log(main.pathForResource('data', { ofType: 'json', inDirectory: 'JS/assets/web' }) === application.fileSystem.assets + '/web/data.json');
console.log(main.pathForResource('no-such-file', { ofType: 'json' }));
```

**结果**：依次输出 `true`、`null`。

## 对应的 iOS API

按带了哪几个选项调：`pathForResource:ofType:`、`pathForResource:ofType:inDirectory:`、`pathForResource:ofType:inDirectory:forLocalization:`。

## 参见

- [`NSBundle`](../ns-bundle.md)
- [`pathsForResourcesOfType()`](pathsforresourcesoftype.md)
