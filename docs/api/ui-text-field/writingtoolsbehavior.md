---
type: reference
native: UITextField.writingToolsBehavior
---

# `UITextField`：`writingToolsBehavior` 属性

**`writingToolsBehavior`** 属性决定系统的写作工具（改写、校对、总结）在这个输入框里能做到哪一步。

## 值

字符串，下面四个之一：

| 取值 | 效果 |
| --- | --- |
| `'none'` | 不提供写作工具 |
| `'default'` | 由系统决定 |
| `'complete'` | 提供完整的写作工具，结果可以直接写回框里 |
| `'limited'` | 只提供有限的写作工具，结果在单独的面板里显示 |

- 可读，可写。
- 这个属性是按 iOS 的头文件补上的。验收用例验证过它读得出来、类型对、写回原值读到的不变；默认值和各取值的效果**未在模拟器验证**，用法照 Apple 的文档。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

写入不在取值表里的值：不抛异常，控制台输出一条警告，列出全部可用的值，属性保持原来的值。

```
[Nacre] writingToolsBehavior has no value "x"; expected one of: …, ignored
```

## 示例

```js
const field = new UITextField();
field.writingToolsBehavior = 'none';
```

**效果**：选中文字后，编辑菜单里没有写作工具。**未在模拟器验证。**

## 对应的 iOS API

`UITextField.writingToolsBehavior`。`UIWritingToolsBehaviorNone` 写成 `'none'`，其余同理。

## 参见

- [`allowedWritingToolsResultOptions`](allowedwritingtoolsresultoptions.md)
