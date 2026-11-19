---
type: reference
native: application.fileSystem
---

# `Application`：`fileSystem` 属性

**`fileSystem`** 属性是文件读写的入口。

## 值

`FileSystem`。它的方法全部返回 Promise，用法见[文件读写](../filesystem.md)。

- 只读。给它赋值抛 `TypeError`。
- 每次读到的都是同一个对象。

## 示例

```js
console.log(application.fileSystem === application.fileSystem);
```

**结果**：控制台输出 `true`。

## 对应的 iOS API

见[文件读写](../filesystem.md)。

## 参见

- [文件读写](../filesystem.md)
