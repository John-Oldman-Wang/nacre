---
type: reference
native: CFBundleShortVersionString
---

# `Application`：`version` 属性

**`version`** 属性是给用户看的版本号。

## 值

字符串，比如 `'0.1.0'`。

- 只读。给它赋值抛 `TypeError`。
- 等于 `info.CFBundleShortVersionString`，值来自项目的 [`nacre.config.json`](../../guides/project-config.md)。
- 运行期间不变，所以没有变化事件。

同一个版本可以有多个构建，构建号见 [`build`](build.md)。

## 示例

```js
console.log(application.version, application.build);
```

**结果**：比如输出 `0.1.0 1`。

## 对应的 iOS API

Info.plist 的 `CFBundleShortVersionString`。

## 参见

- [`build`](build.md)
