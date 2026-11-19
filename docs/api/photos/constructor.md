---
type: reference
native: "-[PHPickerViewController initWithConfiguration:]"
---

# `PHPickerViewController()` 构造函数

**`PHPickerViewController()`** 构造函数用一份配置创建一个选图界面。建出来不弹出任何东西，要用页面的 [`presentViewController()`](../ui-view-controller/presentviewcontroller.md) 弹出来。

## 语法

```
new PHPickerViewController(configuration)
```

### 参数

**`configuration`**

一个 [`PHPickerConfiguration`](../ph-picker-configuration.md)，必填。配置在这里被复制一份：之后再改这个配置对象，建好的选择器不受影响。复制的那一份从 [`configuration`](configuration.md) 读。

### 返回值

新建的 `PHPickerViewController`。它还没有被呈现，`presentingViewController` 是 `null`。

### 异常

**`TypeError`**

不给配置，或者给的不是 `PHPickerConfiguration`：

```
new PHPickerViewController needs a PHPickerConfiguration, got undefined
```

## 说明

每次选图新建一个选择器。同一个选择器弹第二次会怎样**未在模拟器验证**。

## 示例

```js
const config = new PHPickerConfiguration();
config.selectionLimit = 3;
const picker = new PHPickerViewController(config);
config.selectionLimit = 5;
console.log(picker.configuration.selectionLimit);
```

**结果**：输出 `3`。构造之后改原来的配置，选择器里的那一份不变。

## 对应的 iOS API

`-[PHPickerViewController initWithConfiguration:]`。

## 参见

- [`PHPickerConfiguration`](../ph-picker-configuration.md)：配置里有什么
- [`pick`](pick-event.md)：用户选完时派发
- 这个类属于 `@nacrejs/photos` 包，装法见[要先安装](../photos.md#要先安装)
