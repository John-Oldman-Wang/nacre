---
type: reference
native: "+[UIButton buttonWithType:]"
---

# `UIButton.buttonWithType()` 静态方法

**`UIButton.buttonWithType()`** 静态方法创建一个指定类型的按钮。类型决定按钮的默认外观，创建之后不能改。

## 语法

```
UIButton.buttonWithType(type)
```

### 参数

**`type`**

按钮类型，下面几个字符串之一：

| 取值 | 效果 |
| --- | --- |
| `'system'` | 系统外观的文字按钮：文字是蓝色，手指按住时变淡，禁用时变灰（禁用时变灰**未在模拟器验证**） |
| `'custom'` | 系统不画任何东西。和 [`new UIButton()`](constructor.md) 相同 |
| `'close'` | 一个圆形的关闭图标（×） |
| `'contactAdd'` | 一个加号图标 |
| `'detailDisclosure'`、`'infoLight'`、`'infoDark'` | 一个圆圈里带 i 的信息图标 |

`'close'`、`'contactAdd'`、`'detailDisclosure'`、`'infoLight'`、`'infoDark'` 画出来的样子**未在模拟器验证**。

### 返回值

新建的 `UIButton`。

### 异常

**`TypeError`**

`type` 不是上表里的值。报错信息里列出全部可用的值。

## 示例

```js
const button = UIButton.buttonWithType('system');
button.setTitle('提交', { forState: ['normal'] });
console.log(button.buttonType);
```

**结果**

- 得到一个蓝色文字「提交」的按钮。
- 控制台输出 `system`。

## 对应的 iOS API

`+[UIButton buttonWithType:]`。`UIButtonTypeSystem` 写成 `'system'`，其余同理。`UIButtonTypePlain`（只用于 tvOS）和 `UIButtonTypeRoundedRect`（`system` 的旧名）没有提供。

## 参见

- [`buttonType`](buttontype.md)：读按钮的类型
- [`UIButton()`](constructor.md)：创建 `custom` 按钮
