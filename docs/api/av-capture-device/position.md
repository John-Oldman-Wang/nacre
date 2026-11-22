---
type: reference
native: AVCaptureDevice.position
---

# `AVCaptureDevice`：`position` 属性

**`position`** 属性表示这个摄像头在机身的哪一面。

## 值

字符串，下面三个之一：

| 取值 | 含义 |
| --- | --- |
| `'back'` | 背面的摄像头 |
| `'front'` | 屏幕这一面的摄像头 |
| `'unspecified'` | 不分面，比如外接的摄像头 |

- 只读。给它赋值抛 `TypeError`。
- 一个摄像头的这个值不会变，所以没有变化事件。
- [`defaultDeviceWithMediaType('video')`](defaultdevicewithmediatype.md) 给的摄像头是 `'back'`（实测）。

## 示例

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null && device.position === 'back') {
  console.log('这是后置摄像头');
}
```

**效果**：iPhone 上输出 `这是后置摄像头`。

## 对应的 iOS API

`AVCaptureDevice.position`。`AVCaptureDevicePositionBack` 写成 `'back'`，其余同理。

## 参见

- [`defaultDeviceWithDeviceType()`](defaultdevicewithdevicetype.md)：按朝向找摄像头
