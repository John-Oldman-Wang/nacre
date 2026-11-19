---
type: reference
native: UIFont.familyName
---

# `UIFont`：`familyName` 属性

**`familyName`** 属性是字体家族名。同一家族包含不同粗细和斜体的多个字体。

## 值

字符串，由字体决定。

- 只读。给它赋值抛 `TypeError`。
- 字体对象不可变，这个值在对象存在期间不会变，所以没有变化通知。
- 具体取值**未在模拟器验证**。

## 示例

```js
const font = UIFont.systemFontOfSize(17);
console.log(font.familyName);
```

**结果**：控制台输出系统字体的家族名。

## 对应的 iOS API

`UIFont.familyName`。

## 参见

- [字体度量](../ui-font.md#字体度量)
