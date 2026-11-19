---
type: reference
native: UITextView.writingToolsActive
---

# `UITextView`：`isWritingToolsActive` 属性

**`isWritingToolsActive`** 属性表示系统的写作工具此刻是否正在处理这块多行输入里的文字。

## 值

布尔。

| 取值 | 含义 |
| --- | --- |
| `true` | 写作工具正在工作 |
| `false` | 没有在工作 |

- 只读。给它赋值抛 `TypeError`。
- 验收用例验证过它读得出来、是布尔。什么时候变成 `true` **未在模拟器验证**。
- 没有变化事件。

## 示例

```js
const input = new UITextView();
console.log(input.isWritingToolsActive);
```

**结果**：输出 `false`。**未在模拟器验证。**

## 对应的 iOS API

`UITextView.writingToolsActive`（getter 是 `isWritingToolsActive`）。

## 参见

- [`writingToolsBehavior`](writingtoolsbehavior.md)
