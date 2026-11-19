---
type: reference
native: UITextField.inlinePredictionType
---

# `UITextField`：`inlinePredictionType` 属性

**`inlinePredictionType`** 属性决定是否在光标后面用灰字显示系统预测的下文。

## 值

字符串，下面三个之一：

| 取值 | 效果 |
| --- | --- |
| `'default'` | 由系统决定 |
| `'no'` | 不显示 |
| `'yes'` | 显示预测的下文 |

- 可读，可写。
- 写回原值读到的不变（实测）。
- 这个属性是按 iOS 的头文件补上的。验收用例验证过它读得出来、类型对、写回原值读到的不变；默认值和各取值的效果**未在模拟器验证**，用法照 Apple 的文档。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

写入不在取值表里的值：不抛异常，控制台输出一条警告，列出全部可用的值，属性保持原来的值。

```
[Nacre] inlinePredictionType has no value "x"; expected one of: …, ignored
```

## 示例

```js
const field = new UITextField();
field.inlinePredictionType = 'no';
console.log(field.inlinePredictionType);
```

**效果**：控制台输出 `no`。不显示，**未在模拟器验证**。

## 对应的 iOS API

`UITextField.inlinePredictionType`。取值去掉类型前缀、首字母小写：`…TypeNo` 写成 `'no'`。

## 参见

- [`UITextView` 上的同名属性](../ui-text-view/inlinepredictiontype.md)
