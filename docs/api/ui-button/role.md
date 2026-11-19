---
type: reference
native: UIButton.role
---

# `UIButton`：`role` 属性

**`role`** 属性表示按钮的用途。系统根据它调整按钮的外观。各取值在屏幕上的样子**未在模拟器验证**。

## 值

字符串，下面四个之一：

| 取值 | 含义 |
| --- | --- |
| `'normal'` | 普通按钮 |
| `'primary'` | 当前界面里最主要的操作 |
| `'cancel'` | 取消操作 |
| `'destructive'` | 删除一类不可恢复的操作。文字显示为红色（**未在模拟器验证**） |

- 可读，可写。
- 默认值是 `'normal'`。
- 各取值在屏幕上的效果**未在模拟器验证**。

### 写错时

写入表里没有的值：不抛异常，控制台输出一条警告，列出全部可用的值，`role` 保持原来的值。

## 示例

```js
const remove = UIButton.buttonWithType('system');
remove.setTitle('删除', { forState: ['normal'] });
remove.role = 'destructive';
```

**效果**：「删除」两个字显示为红色。**未在模拟器验证。**

## 对应的 iOS API

`UIButton.role`。`UIButtonRoleDestructive` 写成 `'destructive'`，其余同理。

## 参见

- [枚举](../enums.md)：属性写错时为什么是警告而不是抛异常
