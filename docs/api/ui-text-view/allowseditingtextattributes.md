---
type: reference
native: UITextView.allowsEditingTextAttributes
---

# `UITextView`：`allowsEditingTextAttributes` 属性

**`allowsEditingTextAttributes`** 属性表示是否允许用户在编辑菜单里改选中文字的样式，比如加粗。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 选中文字后，编辑菜单里有改样式的选项 |
| `false` | 没有这些选项 |

- 可读，可写。
- 这个属性是按 iOS 的头文件补上的。验收用例验证过它读得出来、类型对、写回原值读到的不变；默认值和各取值的效果**未在模拟器验证**，用法照 Apple 的文档。
- 写别的类型的值时按真假转成布尔：`0` 是 `false`，`'false'` 是 `true`。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const input = new UITextView();
input.allowsEditingTextAttributes = true;
console.log(input.allowsEditingTextAttributes);
```

**效果**：控制台输出 `true`。选中文字后，编辑菜单里有改样式的选项，**未在模拟器验证**。

## 对应的 iOS API

`UITextView.allowsEditingTextAttributes`。
