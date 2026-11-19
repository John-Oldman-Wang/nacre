---
type: reference
native: UITextView.allowedWritingToolsResultOptions
---

# `UITextView`：`allowedWritingToolsResultOptions` 属性

**`allowedWritingToolsResultOptions`** 属性决定写作工具可以往多行输入里写回哪几种内容。

## 值

字符串的数组，每个元素是下面之一：

| 取值 | 含义 |
| --- | --- |
| `'plainText'` | 纯文字 |
| `'richText'` | 带样式的文字 |
| `'list'` | 列表 |
| `'table'` | 表格 |
| `'presentationIntent'` | 带段落结构的文字 |

- 可读，可写。读出来是名字的数组。
- 这个属性是按 iOS 的头文件补上的。验收用例验证过它读得出来、类型对、写回原值读到的不变；默认值和各取值的效果**未在模拟器验证**，用法照 Apple 的文档。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

数组里有一个不认识的名字时，整次赋值不生效，控制台输出一条警告，列出全部可用的值，见[枚举](../enums.md)。

## 示例

```js
const input = new UITextView();
input.allowedWritingToolsResultOptions = ['plainText', 'list'];
console.log(input.allowedWritingToolsResultOptions.join(','));
```

**效果**：控制台输出 `plainText,list`。**未在模拟器验证。**

## 对应的 iOS API

`UITextView.allowedWritingToolsResultOptions`。位掩码写成名字的数组。

## 参见

- [`writingToolsBehavior`](writingtoolsbehavior.md)
