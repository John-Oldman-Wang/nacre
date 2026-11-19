---
type: reference
native: UIToolbar.barStyle
---

# `UIToolbar`：`barStyle` 属性

**`barStyle`** 属性是工具条的明暗样式。

## 值

字符串，下面两个之一：

| 取值 | 效果 |
| --- | --- |
| `'default'` | 跟随系统的浅色或深色 |
| `'black'` | 深色的条 |

- 可读，可写。
- 默认值是 `'default'`。
- 两个取值在画面上的差别**未在模拟器验证**。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

写入表里没有的值：不抛异常，控制台输出一条警告，`barStyle` 保持原来的值。

```
[Nacre] barStyle has no value "dark"; expected one of: default / black, ignored
```

## 示例

```js
const toolbar = new UIToolbar();
toolbar.barStyle = 'black';
console.log(toolbar.barStyle);
```

**结果**：输出 `black`。

## 对应的 iOS API

`UIToolbar.barStyle`。`UIBarStyleBlack` 写成 `'black'`。`UIBarStyleBlackOpaque` 和 `UIBarStyleBlackTranslucent` 从 iOS 13 起废弃，没有对应的取值。

## 参见

- [枚举](../enums.md)：属性写错时为什么是警告
