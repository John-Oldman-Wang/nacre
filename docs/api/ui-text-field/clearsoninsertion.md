---
type: reference
native: UITextField.clearsOnInsertion
---

# `UITextField`：`clearsOnInsertion` 属性

**`clearsOnInsertion`** 属性表示插入文字时是否先换掉框里的全部内容。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 插入文字时换掉全部内容 |
| `false` | 插在光标处 |

- 可读，可写。
- 这个属性是按 iOS 的头文件补上的。验收用例验证过它读得出来、类型对、写回原值读到的不变；默认值和各取值的效果**未在模拟器验证**，用法照 Apple 的文档。
- 写别的类型的值时按真假转成布尔：`0` 是 `false`，`'false'` 是 `true`。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const field = new UITextField();
field.clearsOnInsertion = true;
```

**效果**：用户打第一个字时，原来的内容被换掉。**未在模拟器验证。**

## 对应的 iOS API

`UITextField.clearsOnInsertion`。

## 参见

- [`clearsOnBeginEditing`](clearsonbeginediting.md)
