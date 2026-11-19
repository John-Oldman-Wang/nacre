---
type: reference
native: UITextField.returnKeyType
---

# `UITextField`：`returnKeyType` 属性

**`returnKeyType`** 属性决定键盘右下角的回车键上显示什么字。

## 值

字符串，下面 12 个之一。键上显示的字跟随系统语言，下表给出每个取值表示的意思：

| 取值 | 回车键表示 |
| --- | --- |
| `'default'` | 换行（键上是「换行」或 return） |
| `'go'` | 前往 |
| `'google'` | 搜索（旧的取值，显示为搜索） |
| `'join'` | 加入 |
| `'next'` | 下一项 |
| `'route'` | 路线 |
| `'search'` | 搜索 |
| `'send'` | 发送 |
| `'yahoo'` | 搜索（旧的取值，显示为搜索） |
| `'done'` | 完成 |
| `'emergencyCall'` | 紧急呼叫 |
| `'continue'` | 继续 |

- 可读，可写。
- 默认值是 `'default'`。
- 各取值显示的字**未在模拟器验证**。
- 它只改键上的字，不改行为。不管显示什么字，按下去都是派发 `return`。单行输入框里按回车不会插入换行。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

写入不在取值表里的值：不抛异常，控制台输出一条警告，列出全部可用的值，属性保持原来的值。

```
[Nacre] returnKeyType has no value "x"; expected one of: …, ignored
```

## 示例

```js
const field = new UITextField();
field.returnKeyType = 'search';
```

**效果**：键盘右下角的回车键上显示「搜索」。**未在模拟器验证。**

## 对应的 iOS API

`UITextField.returnKeyType`。`UIReturnKeyDone` 写成 `'done'`，其余同理。

## 参见

- [`enablesReturnKeyAutomatically`](enablesreturnkeyautomatically.md)
- [`beforereturn`](beforereturn-event.md) 事件
