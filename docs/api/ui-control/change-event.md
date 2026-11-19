---
type: reference
native: UIControlEventValueChanged
---

# `UIControl`：`change` 事件

**`change`** 事件在用户改了控件的值之后派发。

## 语法

```
addEventListener('change', (event) => { })
```

## 事件对象

普通的 `Event`，除了 `type` 和 `target` 不带别的字段。没有触点位置：读 `location` 得到 `undefined`。`change` 不一定来自触摸，代码调用 `sendActionsForControlEvents()` 也会派发它。

不能取消：`cancelable` 是 `false`，`preventDefault()` 没有效果。

## 什么时候派发

- 有值的控件派发：[`UISwitch`](../ui-switch.md)、[`UISlider`](../ui-slider.md)、[`UIStepper`](../ui-stepper.md)、[`UISegmentedControl`](../ui-segmented-control.md)、[`UIPageControl`](../ui-page-control.md)、[`UIDatePicker`](../ui-date-picker.md)、[`UIColorWell`](../system-controls.md)。回调里读控件的值，得到的是改过之后的值。
- 代码写值不派发：写 `isOn`、`value`、`selectedSegmentIndex`、`currentPage`、`date`，调 `setOn()`、`setValue()`、`setDate()`，都不派发（验收用例断言过：六个控件在写值之后都没有收到 `change`）。所以按保存的设置恢复界面时可以直接写，不会触发自己的监听器。
- 滑块和步进器在拖动、按住途中连续派发。只要松手时派发一次，把它们的 `isContinuous` 设成 `false`。
- 对上面这些控件调用 `sendActionsForControlEvents(['change'])`，监听器会收到（实测）。
- 按钮、直接创建的 `UIControl`、输入框不派发。输入框的文字变了用 [`input`](input-event.md)。

## 示例

```js
const sw = new UISwitch();
sw.addEventListener('change', () => {
  console.log('开关', sw.isOn);
});
```

**效果**：用户拨动开关，控制台输出切换之后的值，比如 `开关 true`。代码写 `sw.isOn` 不输出。

## 对应的 iOS API

`UIControlEventValueChanged`。原生用 `addTarget:action:forControlEvents:` 登记，这里用 [`addEventListener()`](addeventlistener.md)。

## 参见

- [做开关、滑块和步进器](../../guides/switches-sliders-steppers.md)
- [回调的执行时机](../ui-control.md#回调的执行时机)
