---
type: reference
native: "-[UIImagePickerControllerDelegate imagePickerControllerDidCancel:]"
---

# `UIImagePickerController`：`cancel` 事件

**`cancel`** 事件在用户点了拍照界面上的「取消」时派发。

## 语法

```
picker.addEventListener('cancel', (event) => { })
```

## 事件对象

`Event`，没有多出的字段。`target` 是这个拍照界面。不能取消，`preventDefault()` 不起作用。

## 什么时候派发

- 用户点了「取消」之后。一次弹出只会收到 [`pick`](pick-event.md) 和 `cancel` 中的一个。
- 派发之后拍照界面还在屏幕上。系统不会自己关掉它，要在监听器里调 `dismissViewController()`。只监听 `pick` 的话，用户点「取消」之后界面关不掉。
- 自己用 `dispatchEvent(new Event('cancel'))` 派发时，只有 JS 的监听器收到，拍照界面不受影响。

用户点「取消」时的实际派发**未验证**：模拟器拍不了照，真机上也还没有验证。

## 示例

```js
const picker = new UIImagePickerController();
picker.addEventListener('cancel', () => {
  console.log('没有拍');
  picker.dismissViewController({ animated: true });
});
```

**效果**（**未验证**）：用户点「取消」之后，控制台输出 `没有拍`，拍照界面降下去。

## 对应的 iOS API

委托方法 `imagePickerControllerDidCancel:`。

## 参见

- [`pick`](pick-event.md)：用户拍完
- [安装 `@nacrejs/camera`](../ui-image-picker-controller.md#先装上)
