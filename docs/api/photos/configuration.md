---
type: reference
native: PHPickerViewController.configuration
---

# `PHPickerViewController`：`configuration` 属性

**`configuration`** 属性是构造选择器时复制的那一份配置。

## 值

[`PHPickerConfiguration`](../ph-picker-configuration.md)。

- 只读。给它赋值抛 `TypeError`。
- 不是传给构造函数的那个对象，是它的副本。两次读是同一个对象。
- 构造之后改原来的配置对象，这里的值不变。
- 改这份副本的属性对已经建好的选择器有没有影响**未在模拟器验证**。

## 示例

```js
const config = new PHPickerConfiguration();
config.selection = 'ordered';
const picker = new PHPickerViewController(config);
console.log(picker.configuration === config);
console.log(picker.configuration.selection);
```

**结果**：先输出 `false`，再输出 `ordered`。

## 对应的 iOS API

`PHPickerViewController.configuration`。

## 参见

- [`PHPickerViewController()`](constructor.md)：配置在构造时被复制
- 这个类属于 `@nacrejs/photos` 包，装法见[要先安装](../photos.md#要先安装)
