---
type: reference
native: PHPickerConfiguration.mode
---

# `PHPickerConfiguration`：`mode` 属性

**`mode`** 属性表示选图界面的样子。

## 值

字符串，下面两个之一：

| 取值 | 效果 |
| --- | --- |
| `'default'` | 完整的选图界面 |
| `'compact'` | 只有一行缩略图。给嵌在页面里的选择器用 |

- 可读，可写。
- 默认值是 `'default'`。
- `'compact'` 在屏幕上的样子**未在模拟器验证**。
- 只有 App 自己能改它，没有变化通知。

### 写错时

写入表里没有的值：不抛异常，属性保持原来的值，控制台输出一条警告，列出可选的值：

```
[Nacre] mode has no value "full"; expected one of: default / compact, ignored
```

## 示例

```js
const config = new PHPickerConfiguration();
config.mode = 'compact';
console.log(config.mode);
```

**结果**：输出 `compact`。

## 对应的 iOS API

`PHPickerConfiguration.mode`。`PHPickerModeCompact` 写成 `'compact'`。

## 参见

- [枚举](../enums.md)
- 这个类属于 `@nacrejs/photos` 包，装法见[要先安装](../photos.md#要先安装)
