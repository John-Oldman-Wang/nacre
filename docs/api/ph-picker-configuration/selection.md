---
type: reference
native: PHPickerConfiguration.selection
---

# `PHPickerConfiguration`：`selection` 属性

**`selection`** 属性表示选中的方式：选中的项上怎么标，以及什么时候派发 [`pick`](../photos/pick-event.md)。

## 值

字符串，下面四个之一：

| 取值 | 效果 |
| --- | --- |
| `'default'` | 选中的项上打一个勾 |
| `'ordered'` | 选中的项上显示它是第几个选的，`results` 按这个顺序给 |
| `'continuous'` | 每选中或取消一项就派发一次 `pick`，不等用户点「添加」 |
| `'continuousAndOrdered'` | `'continuous'` 加上编号 |

- 可读，可写。
- 默认值是 `'default'`。
- 各取值在屏幕上的效果**未在模拟器验证**。
- 只有 App 自己能改它，没有变化通知。

### 写错时

写入表里没有的值：不抛异常，控制台输出一条警告，列出全部可用的值，属性保持原来的值。写数字也一样。

## 示例

```js
const config = new PHPickerConfiguration();
config.selectionLimit = 0;
config.selection = 'ordered';
```

**效果**：用这份配置建的选图界面不限张数，每张选中的图上显示序号，`results` 按选的先后排。**未在模拟器验证。**

## 对应的 iOS API

`PHPickerConfiguration.selection`。`PHPickerConfigurationSelectionOrdered` 写成 `'ordered'`，其余同理。

## 参见

- [`pick`](../photos/pick-event.md)：连续的两种方式下什么时候派发
- [枚举](../enums.md)
- 这个类属于 `@nacrejs/photos` 包，装法见[要先安装](../photos.md#要先安装)
