---
type: reference
native: UITextView.dataDetectorTypes
---

# `UITextView`：`dataDetectorTypes` 属性

**`dataDetectorTypes`** 属性决定把文字里的哪几类内容变成可以点的链接，比如电话号码和网址。

## 值

字符串的数组，每个元素是下面之一：

| 取值 | 识别什么 |
| --- | --- |
| `'phoneNumber'` | 电话号码 |
| `'link'` | 网址 |
| `'address'` | 地址 |
| `'calendarEvent'` | 日期和时间 |
| `'shipmentTrackingNumber'` | 快递单号 |
| `'flightNumber'` | 航班号 |
| `'lookupSuggestion'` | 可以查询的词 |
| `'money'` | 金额 |
| `'physicalValue'` | 带单位的量 |

- 可读，可写。读出来是名字的数组。
- 按 Apple 的文档，只有 [`isEditable`](iseditable.md) 是 `false` 时识别出来的内容才能点。**未在模拟器验证。**
- 这个属性是按 iOS 的头文件补上的。验收用例验证过它读得出来、类型对、写回原值读到的不变；默认值和各取值的效果**未在模拟器验证**，用法照 Apple 的文档。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

数组里有一个不认识的名字时，整次赋值不生效，控制台输出一条警告，列出全部可用的值，见[枚举](../enums.md)。

## 示例

```js
const input = new UITextView();
input.isEditable = false;
input.dataDetectorTypes = ['phoneNumber', 'link'];
input.text = '电话 010-12345678，网址 https://example.com';
```

**效果**：电话号码和网址显示成可以点的链接。**未在模拟器验证。**

## 对应的 iOS API

`UITextView.dataDetectorTypes`。位掩码写成名字的数组：`UIDataDetectorTypePhoneNumber | UIDataDetectorTypeLink` 写成 `['phoneNumber', 'link']`。

## 参见

- [`isEditable`](iseditable.md)
