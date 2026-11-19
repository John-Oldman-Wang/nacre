---
type: reference
native: UIFont.familyNames
---

# `UIFont.familyNames` 静态属性

**`familyNames`** 静态属性是能用的全部字体家族的名字。

## 值

字符串数组，形如 `['Helvetica Neue', 'Menlo', …]`。

- 只读。给它赋值抛 `TypeError`。
- 每次读给一个新数组。
- 有系统自带的家族，也有 App 包里登记了的字体所在的家族。在 iPhone Air 模拟器（iOS 27.2）上有 86 个。
- 没有变化通知：App 运行期间它不变。

一个家族里有几个字体（常规、粗体、斜体……），用 [`fontNamesForFamilyName()`](fontnamesforfamilyname.md) 列出它们的名字，再交给 [`fontWithName()`](fontwithname.md)。

## 示例

```js
console.log(UIFont.familyNames.includes('Helvetica Neue'));
```

**结果**：输出 `true`。

## 对应的 iOS API

`UIFont.familyNames`（类属性）。

## 参见

- [`fontNamesForFamilyName()`](fontnamesforfamilyname.md)
- [`fontWithName()`](fontwithname.md)
