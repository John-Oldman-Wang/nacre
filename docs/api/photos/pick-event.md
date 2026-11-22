---
type: reference
native: "-[PHPickerViewControllerDelegate picker:didFinishPicking:]"
---

# `PHPickerViewController`：`pick` 事件

**`pick`** 事件在用户选好了、或者点了取消时派发。事件对象的 `results` 是选中的那几项。

## 语法

```
picker.addEventListener('pick', (event) => { })
```

## 事件对象

[`PHPickerViewControllerFinishEvent`](../ph-picker-view-controller-finish-event.md)，多一个只读字段：

**[`results`](../ph-picker-view-controller-finish-event/results.md)**

[`PHPickerResult`](../ph-picker-result.md) 的数组，只读（冻结的）。用户点了取消时是空数组。`selection` 是 `'ordered'` 或 `'continuousAndOrdered'` 时，按用户选的先后排。

不可取消。回调在事件发生之后的下一轮执行。

## 什么时候派发

选图界面有三种结束方式：

| 用户做了什么 | 派发什么 |
| --- | --- |
| 选好了，点右上角的「添加」。只允许选一项时，点中那一项就算选好 | `pick`，`results` 是选中的项 |
| 点左上角的「取消」 | `pick`，`results` 是空数组 |
| 把界面向下拖走 | 页面的 [`dismiss`](../ui-view-controller/dismiss-event.md) 事件。会不会同时派发一次 `results` 为空的 `pick`，**未在模拟器验证** |

- **选图界面不会自己关掉。** 派发 `pick` 之后它还在屏幕上，要在监听器里调 [`dismissViewController()`](../ui-view-controller/dismissviewcontroller.md)。对已经被拖走的选择器再调一次 `dismissViewController()` 会怎样，**未在模拟器验证**。
- **[`selection`](../ph-picker-configuration/selection.md) 是 `'continuous'` 或 `'continuousAndOrdered'` 时，每选中或取消一项就派发一次**，`results` 是当时选中的全部。这种方式下不要在监听器里关界面。
- 自己派发 `pick` 试监听器时，用 [`new PHPickerViewControllerFinishEvent()`](../ph-picker-view-controller-finish-event/constructor.md) 建事件，`results` 不给是空数组。派发普通的 `Event` 时，监听器读到的 `results` 是 `undefined`。

## 示例

```js
const page = new UIViewController();
const picker = new PHPickerViewController(new PHPickerConfiguration());
picker.addEventListener('pick', (event) => {
  const { results } = event;
  picker.dismissViewController({ animated: true });
  console.log(results.length === 0 ? '取消了' : '选了 ' + results.length + ' 项');
});
page.presentViewController(picker, { animated: true });
```

**效果**（**未在模拟器验证**）：用户选一项，选图界面消失，控制台输出 `选了 1 项`。点「取消」，输出 `取消了`。

## 对应的 iOS API

委托方法 `picker:didFinishPicking:`。JS 里不设委托，监听这个事件；参数 `results` 在事件对象上。

## 参见

- [`PHPickerResult`](../ph-picker-result.md)：`results` 里每一项的类型
- [`NSItemProvider`](../ns-item-provider.md)：从选中的项上取图片
- [从相册选图、把图存进相册](../../guides/pick-photos.md)
- 这个类属于 `@nacrejs/photos` 包，装法见[要先安装](../photos.md#要先安装)
