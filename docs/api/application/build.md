---
type: reference
native: CFBundleVersion
---

# `Application`：`build` 属性

**`build`** 属性是 App 的构建号。同一个版本可以有多个构建。

## 值

字符串，比如 `'1'`。

- 只读。给它赋值抛 `TypeError`。
- 等于 `info.CFBundleVersion`，值来自项目的 [`nacre.config.json`](../../guides/project-config.md)。
- 运行期间不变，所以没有变化事件。

## 示例

```js
console.log(application.build);
```

**结果**：比如输出 `1`。

## 对应的 iOS API

Info.plist 的 `CFBundleVersion`。

## 参见

- [`version`](version.md)
