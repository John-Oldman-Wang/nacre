---
type: reference
native: UIBarButtonItem.style
---

# `UIBarButtonItem`：`style` 属性

**`style`** 属性是导航条按钮的样式。

## 值

字符串：

| 取值 | 效果 |
| --- | --- |
| `'plain'` | 普通样式 |
| `'prominent'` | 强调样式，用于这个页面最主要的操作，比如「保存」「完成」 |
| `'done'` | 可以写入，和 `'prominent'` 是同一个值。读出来是 `'prominent'` |

- 可读，可写。
- 默认值是 `'plain'`。
- 写入 `'done'` 之后读到的是 `'prominent'`，所以判断样式时和 `'prominent'` 比较。
- 两种样式画出来的样子**未在模拟器验证**。
- 变化时不派发事件：它只会被代码改变。

### 写错时

写入表里没有的值：不抛异常，属性保持原来的值，控制台输出一条警告 `[Nacre] style has no value "bordered"; expected one of: plain / prominent / done, ignored`。

## 示例

```js
const item = new UIBarButtonItem({ title: '完成' });
item.style = 'done';
console.log(item.style);
```

**结果**：控制台输出 `prominent`。

## 对应的 iOS API

`UIBarButtonItem.style`。`UIBarButtonItemStyleProminent` 写成 `'prominent'`；`UIBarButtonItemStyleDone` 和它是同一个值。`UIBarButtonItemStyleBordered` 已被 Apple 废弃，没有提供。

## 参见

- [枚举](../enums.md)：一个值两个名字时为什么读出主名
