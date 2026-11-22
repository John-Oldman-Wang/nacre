---
type: reference
native: UIImagePickerControllerMediaEvent()
---

# `UIImagePickerControllerMediaEvent()` 构造函数

**`UIImagePickerControllerMediaEvent()`** 构造函数创建一个 `UIImagePickerControllerMediaEvent`。

## 语法

```
new UIImagePickerControllerMediaEvent(type)
new UIImagePickerControllerMediaEvent(type, { originalImage, editedImage, cropRect, cancelable })
```

### 参数

**`type`**

事件名，字符串。

**`options.originalImage`**

可选，对应 [`originalImage`](originalimage.md) 属性。要是一个 `UIImage`，也可以是 `null`，不转；别的抛 `TypeError`。不传是 `null`。

**`options.editedImage`**

可选，对应 [`editedImage`](editedimage.md) 属性。要是一个 `UIImage`，也可以是 `null`，不转；别的抛 `TypeError`。不传是 `null`。

**`options.cropRect`**

可选，对应 [`cropRect`](croprect.md) 属性。一个 `CGRect`，或者带 `x`、`y`、`width`、`height` 的普通对象（照结构体的规则转成 `CGRect`），也可以是 `null`；别的抛 `TypeError`。不传是 `null`。

**`options.cancelable`**

布尔值，可选，默认 `false`。

### 返回值

新建的 `UIImagePickerControllerMediaEvent`。

### 异常

**`TypeError`**

- 某个字段的值转换不了，见上面各个参数。
- 没传事件名：`Failed to construct 'UIImagePickerControllerMediaEvent': 1 argument required, but only 0 present.`
- 不带 `new`，当成函数调用。

## 示例

```js
const event = new UIImagePickerControllerMediaEvent('pick');
console.log(event.originalImage, event.editedImage, event.cropRect);
```

**结果**：控制台输出 `null null null`。

## 对应的 iOS API

没有对应的系统 API。系统的通知到来时，运行时把通知带的值放进事件对象。

## 参见

- [`UIImagePickerControllerMediaEvent`](../ui-image-picker-controller-media-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md)：把自己建的事件派发出去
