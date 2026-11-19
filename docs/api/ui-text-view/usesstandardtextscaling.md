---
type: reference
native: UITextView.usesStandardTextScaling
---

# `UITextView`：`usesStandardTextScaling` 属性

**`usesStandardTextScaling`** 属性表示是否按系统标准的比例缩放文字。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 按标准的比例缩放文字 |
| `false` | 不缩放 |

- 可读，可写。
- 这个属性是按 iOS 的头文件补上的。验收用例验证过它读得出来、类型对、写回原值读到的不变；默认值和各取值的效果**未在模拟器验证**，用法照 Apple 的文档。
- 写别的类型的值时按真假转成布尔：`0` 是 `false`，`'false'` 是 `true`。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const input = new UITextView();
input.usesStandardTextScaling = true;
console.log(input.usesStandardTextScaling);
```

**效果**：控制台输出 `true`。按标准的比例缩放文字，**未在模拟器验证**。

## 对应的 iOS API

`UITextView.usesStandardTextScaling`。
