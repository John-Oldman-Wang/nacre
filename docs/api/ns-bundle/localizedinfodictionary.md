---
type: reference
native: NSBundle.localizedInfoDictionary
---

# `NSBundle`：`localizedInfoDictionary` 属性

**`localizedInfoDictionary`** 属性是 Info.plist 里按 App 在用的语言翻译过的那几项。

## 值

对象或 `null`。

- 只读。给它赋值抛 `TypeError`。
- 只有翻译过的键在里面，比如 App 的名字和权限说明。在 `nacre.config.json` 里按语言写的内容，生成工程时会变成这些翻译。
- 验收 App 读到对象或 `null`，具体内容**未记录**。

## 示例

```js
console.log(NSBundle.mainBundle.localizedInfoDictionary);
```

**结果**：输出一个对象或 `null`。

## 对应的 iOS API

`NSBundle.localizedInfoDictionary`。

## 参见

- [`NSBundle`](../ns-bundle.md)
